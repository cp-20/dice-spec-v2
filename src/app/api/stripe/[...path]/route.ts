import { vValidator } from '@hono/valibot-validator';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import Stripe from 'stripe';
import * as v from 'valibot';
import { getPriceId, stripeConfig } from '@/shared/lib/stripe/config';
import { createStripeHandlers } from './_handlers';
import { type HandlerResult, StripeWebhookHandlerError } from './_handlers/types';
import { sendStripeLog } from './logger';

const stripe = new Stripe(stripeConfig.secretKey, {
  apiVersion: '2026-01-28.clover',
});

const getFirestoreInstance = () => {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const databaseId = process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID;

    if (!projectId || !clientEmail || !privateKey || !databaseId) {
      const error = new Error('Missing Firebase Admin configuration in environment variables');
      console.error(error.message);
      throw error;
    }

    const existingApps = getApps();
    const app =
      existingApps.length > 0 && existingApps[0]
        ? existingApps[0]
        : initializeApp({
            credential: cert({
              projectId,
              clientEmail,
              privateKey: privateKey.replace(/\\n/g, '\n'),
            }),
          });

    return getFirestore(app, databaseId);
  } catch (error) {
    console.error('Failed to initialize Firestore:', error);
    throw error;
  }
};

const { handleCheckoutCompleted, handleSubscriptionUpdated, handleSubscriptionDeleted, handleCustomerCreated } =
  createStripeHandlers({
    stripe,
    getFirestoreInstance,
  });

const processHandlerResult = async (result: HandlerResult) => {
  if (result.ok) {
    if (result.log) {
      await sendStripeLog(result.log);
    }
    return;
  }

  await sendStripeLog({
    level: result.error.fatal ? 'error' : 'warning',
    eventType: result.error.eventType,
    message: result.error.message,
    userId: result.error.userId,
    details: result.error.details,
    error: result.error.cause ?? result.error,
  });

  if (result.error.fatal) {
    throw result.error;
  }
};

const constructStripeEvent = async (body: string, signature: string) => {
  try {
    return stripe.webhooks.constructEvent(body, signature, stripeConfig.webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    await sendStripeLog({
      level: 'warning',
      eventType: 'webhook',
      message: 'Webhook signature verification failed',
      error,
    });
    return null;
  }
};

const createCustomerSchema = v.object({
  userId: v.pipe(v.string(), v.minLength(1)),
  email: v.pipe(v.string(), v.email()),
  name: v.pipe(v.string(), v.minLength(1)),
});

const checkoutSchema = v.object({
  type: v.literal('subscription.pro'),
  interval: v.picklist(['monthly', 'yearly']),
  userId: v.pipe(v.string(), v.minLength(1)),
});

const portalSchema = v.object({
  customerId: v.pipe(v.string(), v.minLength(1)),
});

const app = new Hono()
  .basePath('/api/stripe')
  .post('/create-customer', vValidator('json', createCustomerSchema), async (c) => {
    const { userId, email, name } = c.req.valid('json');
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: { userId },
      });

      return c.json({ customerId: customer.id });
    } catch (error) {
      console.error('Error creating customer:', error);
      await sendStripeLog({
        level: 'error',
        eventType: 'create-customer',
        message: 'Failed to create customer',
        userId,
        details: { email, name },
        error,
      });
      return c.json({ error: 'Failed to create customer' }, 500);
    }
  })
  .post('/create-checkout-session', vValidator('json', checkoutSchema), async (c) => {
    const payload = c.req.valid('json');
    const { type, interval, userId } = payload;
    try {
      const priceId = getPriceId(interval);
      const origin = c.req.header('origin') || 'http://localhost:3000';

      const firestore = getFirestoreInstance();
      const userDoc = await firestore.collection('users').doc(userId).get();
      const userData = userDoc.data();
      const customerId = userData?.stripeCustomerId;

      if (!customerId) {
        return c.json({ error: 'Stripe customer not found' }, 400);
      }

      const metadata = { type, userId };

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${origin}/profile?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/profile`,
        client_reference_id: userId,
        metadata,
        subscription_data: { metadata },
      });

      if (session.url === null) {
        return c.json({ error: 'Failed to create checkout session' }, 500);
      }

      return c.json({ sessionId: session.id, url: session.url });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      await sendStripeLog({
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
  .post('/create-portal-session', vValidator('json', portalSchema), async (c) => {
    const { customerId } = c.req.valid('json');
    try {
      const origin = c.req.header('origin') || 'http://localhost:3000';

      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${origin}/profile`,
      });

      return c.json({ url: session.url });
    } catch (error) {
      console.error('Error creating portal session:', error);
      await sendStripeLog({
        level: 'error',
        eventType: 'create-portal-session',
        message: 'Failed to create portal session',
        details: { customerId },
        error,
      });
      return c.json({ error: 'Failed to create portal session' }, 500);
    }
  })
  .post('/webhook', async (c) => {
    const body = await c.req.text();
    const signature = c.req.header('stripe-signature');

    if (!signature) {
      await sendStripeLog({
        level: 'warning',
        eventType: 'webhook',
        message: 'Missing Stripe signature',
        error: new Error('Missing signature header'),
      });
      return c.json({ error: 'Missing signature' }, 400);
    }

    const event = await constructStripeEvent(body, signature);
    if (!event) {
      return c.json({ error: 'Invalid signature' }, 400);
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          await processHandlerResult(await handleCheckoutCompleted(event.data.object));
          break;
        }

        case 'customer.subscription.updated': {
          await processHandlerResult(await handleSubscriptionUpdated(event.data.object));
          break;
        }

        case 'customer.subscription.deleted': {
          await processHandlerResult(await handleSubscriptionDeleted(event.data.object));
          break;
        }

        case 'customer.created': {
          await processHandlerResult(await handleCustomerCreated(event.data.object));
          break;
        }

        // 明示的に無視する
        case 'billing_portal.session.created':
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
          await sendStripeLog({
            level: 'info',
            eventType: event.type,
            message: 'Unhandled webhook event type',
            details: { eventId: event.id, payload: event.data.object },
          });
      }

      return c.json({ received: true });
    } catch (error) {
      if (!(error instanceof StripeWebhookHandlerError)) {
        console.error('Error processing webhook:', error);
        await sendStripeLog({
          level: 'error',
          eventType: 'webhook',
          message: 'Webhook processing failed',
          details: { eventType: event?.type, eventId: event?.id, payload: event?.data?.object },
          error,
        });
      }
      return c.json({ error: 'Webhook processing failed' }, 500);
    }
  });

export const POST = handle(app);

export type AppType = typeof app;
