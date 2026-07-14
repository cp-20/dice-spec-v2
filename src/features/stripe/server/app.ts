import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';

import { checkoutRequestSchema, portalRequestSchema } from '@/features/stripe/contract';
import { runtimeEnv } from '@/shared/lib/env';

import { getAuthenticatedUser } from './auth';
import { getPriceId, getStripeClient, getStripeCustomerIdByUserId, getUserById, updateUserById } from './clients';
import { StripeWebhookHandlerError } from './handlers/types';
import { scheduleStripeLog } from './logger';
import { appendEventContext, constructStripeEvent, processStripeEvent } from './webhook';

export const stripeApp = new Hono()
  .basePath('/api/stripe')
  .post('/create-customer', async (c) => {
    const user = await getAuthenticatedUser(c.req.header('authorization'), 'create-customer');
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { uid: userId, name, email } = user;
    try {
      const customerId = await getStripeCustomerIdByUserId(userId);
      if (customerId) return c.json({ customerId });

      const customer = await (
        await getStripeClient()
      ).customers.create({ email, name, metadata: { userId } }, { idempotencyKey: `firebase-user-${userId}` });
      await updateUserById(userId, { stripeCustomerId: customer.id });
      return c.json({ customerId: customer.id });
    } catch (error) {
      console.error('Error creating customer:', error);
      scheduleStripeLog({
        level: 'error',
        eventType: 'create-customer',
        message: 'Failed to create customer',
        userId,
        details: { userId },
        error,
      });
      return c.json({ error: 'Failed to create customer' }, 500);
    }
  })
  .post('/create-checkout-session', vValidator('json', checkoutRequestSchema), async (c) => {
    const payload = c.req.valid('json');
    const user = await getAuthenticatedUser(c.req.header('authorization'), 'create-checkout-session');
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const userId = user.uid;
    try {
      const userDoc = await getUserById(userId);
      if (userDoc?.plan === 'pro') return c.json({ error: 'User already has an active subscription' }, 409);

      const customerId =
        typeof userDoc?.stripeCustomerId === 'string' && userDoc.stripeCustomerId.length > 0
          ? userDoc.stripeCustomerId
          : undefined;
      if (!customerId) return c.json({ error: 'Stripe customer not found' }, 400);

      const metadata = { ...payload, userId };
      const session = await (
        await getStripeClient()
      ).checkout.sessions.create({
        mode: 'subscription',
        customer: customerId,
        line_items: [{ price: getPriceId(payload.interval), quantity: 1 }],
        success_url: `${runtimeEnv.appOrigin}/profile?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${runtimeEnv.appOrigin}/profile`,
        client_reference_id: userId,
        allow_promotion_codes: true,
        metadata,
        subscription_data: { metadata },
      });
      if (session.url === null) return c.json({ error: 'Failed to create checkout session' }, 500);
      return c.json({ sessionId: session.id, url: session.url });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      scheduleStripeLog({
        level: 'error',
        eventType: 'create-checkout-session',
        message: 'Failed to create checkout session',
        userId,
        details: { payload },
        error,
      });
      return c.json({ error: 'Failed to create checkout session' }, 500);
    }
  })
  .post('/create-portal-session', vValidator('json', portalRequestSchema), async (c) => {
    c.req.valid('json');
    const user = await getAuthenticatedUser(c.req.header('authorization'), 'create-portal-session');
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const userId = user.uid;
    try {
      const customerId = await getStripeCustomerIdByUserId(userId);
      if (!customerId) return c.json({ error: 'Stripe customer not found' }, 400);

      const session = await (
        await getStripeClient()
      ).billingPortal.sessions.create({
        customer: customerId,
        return_url: `${runtimeEnv.appOrigin}/profile`,
      });
      return c.json({ url: session.url });
    } catch (error) {
      console.error('Error creating portal session:', error);
      scheduleStripeLog({
        level: 'error',
        eventType: 'create-portal-session',
        message: 'Failed to create portal session',
        userId,
        details: { userId },
        error,
      });
      return c.json({ error: 'Failed to create portal session' }, 500);
    }
  })
  .post('/webhook', async (c) => {
    const body = await c.req.text();
    const signature = c.req.header('stripe-signature');
    if (!signature) {
      scheduleStripeLog({
        level: 'warning',
        eventType: 'webhook',
        message: 'Missing Stripe signature',
        error: new Error('Missing signature header'),
      });
      return c.json({ error: 'Missing signature' }, 400);
    }

    const event = await constructStripeEvent(body, signature);
    if (!event) return c.json({ error: 'Invalid signature' }, 400);

    try {
      await processStripeEvent(event);
      return c.json({ received: true });
    } catch (error) {
      if (!(error instanceof StripeWebhookHandlerError)) {
        console.error('Error processing webhook:', error);
        scheduleStripeLog({
          level: 'error',
          eventType: 'webhook',
          message: 'Webhook processing failed',
          details: appendEventContext({ eventType: event.type }, event),
          error,
        });
      }
      return c.json({ error: 'Webhook processing failed' }, 500);
    }
  });

export type StripeAppType = typeof stripeApp;
