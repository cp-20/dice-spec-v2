import { vValidator } from '@hono/valibot-validator';
import { createFirestoreClient } from 'firebase-rest-firestore';
import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { after } from 'next/server';
import Stripe from 'stripe';
import * as v from 'valibot';

import { runtimeEnv } from '@/shared/lib/env';
import type { BillingInterval } from '@/shared/lib/stripe/config';

import { createStripeHandlers } from './_handlers';
import { type HandlerResult, StripeWebhookHandlerError } from './_handlers/types';
import { sendStripeLog } from './logger';

const scheduleStripeLog = (...params: Parameters<typeof sendStripeLog>) => {
  after(async () => {
    await sendStripeLog(...params);
  });
};

let stripe: Stripe | null = null;

const getStripeClient = () => {
  if (!stripe) {
    stripe = new Stripe(runtimeEnv.stripe.secretKey, {
      httpClient: Stripe.createFetchHttpClient(),
      apiVersion: '2026-04-22.dahlia',
    });
  }
  return stripe;
};

let firestoreClient: ReturnType<typeof createFirestoreClient> | null = null;

const getFirestoreClient = () => {
  if (firestoreClient) {
    return firestoreClient;
  }

  const projectId = runtimeEnv.firebase.projectId;
  const databaseId = runtimeEnv.firebase.firestoreDatabaseId;
  const clientEmail = runtimeEnv.firebase.clientEmail;
  const privateKey = runtimeEnv.firebase.privateKey;

  if (!projectId || !clientEmail || !privateKey) {
    const error = new Error('Missing Firestore REST configuration in environment variables');
    console.error(error.message);
    throw error;
  }

  firestoreClient = createFirestoreClient({
    projectId,
    databaseId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, '\n'),
  });

  return firestoreClient;
};

const getUserById = async (userId: string) => {
  return getFirestoreClient().get('users', userId);
};

const updateUserById = async (userId: string, data: Record<string, unknown>) => {
  await getFirestoreClient().update('users', userId, data);
};

const getSubscriptionById = async (subscriptionId: string) => {
  return getStripeClient().subscriptions.retrieve(subscriptionId, {
    expand: ['discounts'],
  });
};

type IdentityToolkitLookupResponse = {
  users?: Array<{
    localId?: string;
    email?: string;
    displayName?: string;
  }>;
};

const lookupFirebaseUserByIdToken = async (idToken: string) => {
  const apiKey = runtimeEnv.firebase.webApiKey;

  if (!apiKey) {
    const error = new Error('Missing Firebase API key in environment variables');
    console.error(error.message);
    throw error;
  }

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Firebase ID token verification failed with status ${response.status}: ${body}`);
  }

  const payload = (await response.json()) as IdentityToolkitLookupResponse;
  return payload.users?.[0] ?? null;
};

const {
  handleCheckoutCompleted,
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleCustomerCreated,
  handleInvoicePaid,
  handleInvoicePaymentFailed,
} = createStripeHandlers({ getUserById, updateUserById, getSubscriptionById });

const appendEventContext = (details: Record<string, unknown> | undefined, event: Stripe.Event | undefined) => {
  if (!event) {
    return details;
  }

  return {
    ...details,
    eventId: event.id,
    eventCreatedAt: new Date(event.created * 1000).toISOString(),
    livemode: event.livemode,
  };
};

const processHandlerResult = async (result: HandlerResult, event: Stripe.Event | undefined) => {
  if (result.ok) {
    if (result.log) {
      scheduleStripeLog({
        ...result.log,
        details: appendEventContext(result.log.details, event),
      });
    }
    return;
  }

  scheduleStripeLog({
    level: result.error.fatal ? 'error' : 'warning',
    eventType: result.error.eventType,
    message: result.error.message,
    userId: result.error.userId,
    details: appendEventContext(result.error.details, event),
    error: result.error.cause ?? result.error,
  });

  if (result.error.fatal) {
    throw result.error;
  }
};

const constructStripeEvent = async (body: string, signature: string) => {
  try {
    return getStripeClient().webhooks.constructEvent(body, signature, runtimeEnv.stripe.webhookSecret);
  } catch (error) {
    // FIXME: Invalid Signature とそれ以外を区別する
    console.error('Webhook signature verification failed:', error);
    scheduleStripeLog({
      level: 'warning',
      eventType: 'webhook',
      message: 'Webhook signature verification failed',
      error,
    });
    return null;
  }
};

const getBearerToken = (authorizationHeader: string | undefined) => {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');
  if (!scheme || !token || scheme.toLowerCase() !== 'bearer') {
    return null;
  }

  return token;
};

const getAuthenticatedUser = async (authorizationHeader: string | undefined, eventType: string) => {
  const idToken = getBearerToken(authorizationHeader);
  if (!idToken) {
    scheduleStripeLog({
      level: 'warning',
      eventType,
      message: 'Missing or invalid authorization header',
    });
    return null;
  }

  try {
    const user = await lookupFirebaseUserByIdToken(idToken);

    if (!user?.localId) {
      scheduleStripeLog({
        level: 'warning',
        eventType,
        message: 'No Firebase user was resolved from ID token',
      });
      return null;
    }

    if (!user.email || !user.displayName) {
      scheduleStripeLog({
        level: 'warning',
        eventType,
        message: 'Authenticated user is missing email or name',
      });
    }

    const uid = user.localId;
    const email = user.email ?? 'unknown@dicespec.app';
    const name = user.displayName ?? 'unknown';

    return { uid, email, name };
  } catch (error) {
    console.error('Failed to verify Firebase ID token:', error);
    scheduleStripeLog({
      level: 'warning',
      eventType,
      message: 'Firebase ID token verification failed',
      error,
    });
    return null;
  }
};

const getStripeCustomerIdByUserId = async (userId: string) => {
  const userDoc = await getUserById(userId);
  const stripeCustomerId = userDoc?.stripeCustomerId;

  return typeof stripeCustomerId === 'string' && stripeCustomerId.length > 0 ? stripeCustomerId : undefined;
};

const getPriceId = (interval: BillingInterval) => {
  switch (interval) {
    case 'monthly':
      return runtimeEnv.stripe.priceIdProMonthly;
    case 'yearly':
      return runtimeEnv.stripe.priceIdProYearly;
    default: {
      const _: never = interval;
      throw new Error(`Invalid interval: ${interval}`);
    }
  }
};

const checkoutSchema = v.object({
  type: v.literal('subscription.pro'),
  interval: v.picklist(['monthly', 'yearly']),
});

const portalSchema = v.object({});

const app = new Hono()
  .basePath('/api/stripe')
  // FIXME: レースコンディションで複数の stripe customer を作成できる
  .post('/create-customer', async (c) => {
    const user = await getAuthenticatedUser(c.req.header('authorization'), 'create-customer');
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const userId = user.uid;
    const name = user.name;
    const email = user.email;

    try {
      const customerId = await getStripeCustomerIdByUserId(userId);
      if (customerId) {
        return c.json({ customerId });
      }

      const customer = await getStripeClient().customers.create({
        email,
        name,
        metadata: { userId },
      });

      await updateUserById(userId, {
        stripeCustomerId: customer.id,
      });

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
  .post('/create-checkout-session', vValidator('json', checkoutSchema), async (c) => {
    const payload = c.req.valid('json');
    const { type, interval } = payload;
    const user = await getAuthenticatedUser(c.req.header('authorization'), 'create-checkout-session');
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const userId = user.uid;

    try {
      const priceId = getPriceId(interval);
      const customerId = await getStripeCustomerIdByUserId(userId);

      if (!customerId) {
        return c.json({ error: 'Stripe customer not found' }, 400);
      }

      const metadata = { type, userId, interval };

      const session = await getStripeClient().checkout.sessions.create({
        mode: 'subscription',
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${runtimeEnv.appOrigin}/profile?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${runtimeEnv.appOrigin}/profile`,
        client_reference_id: userId,
        allow_promotion_codes: true,
        metadata,
        subscription_data: { metadata },
      });

      if (session.url === null) {
        return c.json({ error: 'Failed to create checkout session' }, 500);
      }

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
  .post('/create-portal-session', vValidator('json', portalSchema), async (c) => {
    c.req.valid('json');
    const user = await getAuthenticatedUser(c.req.header('authorization'), 'create-portal-session');
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const userId = user.uid;

    try {
      const customerId = await getStripeCustomerIdByUserId(userId);

      if (!customerId) {
        return c.json({ error: 'Stripe customer not found' }, 400);
      }

      const session = await getStripeClient().billingPortal.sessions.create({
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
    if (!event) {
      return c.json({ error: 'Invalid signature' }, 400);
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          await processHandlerResult(await handleCheckoutCompleted(event.data.object), event);
          break;
        }

        case 'customer.subscription.created': {
          await processHandlerResult(await handleSubscriptionCreated(event.data.object), event);
          break;
        }

        case 'customer.subscription.updated': {
          await processHandlerResult(
            await handleSubscriptionUpdated({
              subscription: event.data.object,
              previousAttributes: event.data.previous_attributes as Record<string, unknown> | undefined,
            }),
            event,
          );
          break;
        }

        case 'customer.subscription.deleted': {
          await processHandlerResult(await handleSubscriptionDeleted(event.data.object), event);
          break;
        }

        case 'customer.created': {
          await processHandlerResult(await handleCustomerCreated(event.data.object), event);
          break;
        }

        case 'invoice.paid': {
          await processHandlerResult(await handleInvoicePaid(event.data.object), event);
          break;
        }

        case 'invoice.payment_failed': {
          await processHandlerResult(await handleInvoicePaymentFailed(event.data.object), event);
          break;
        }

        // 明示的に無視する
        case 'billing_portal.session.created':
          break;

        default: {
          console.log(`Unhandled event type: ${event.type}`);
          scheduleStripeLog({
            level: 'info',
            eventType: event.type,
            message: 'Unhandled webhook event type',
            details: appendEventContext(undefined, event),
          });
        }
      }

      return c.json({ received: true });
    } catch (error) {
      if (!(error instanceof StripeWebhookHandlerError)) {
        console.error('Error processing webhook:', error);
        scheduleStripeLog({
          level: 'error',
          eventType: 'webhook',
          message: 'Webhook processing failed',
          details: appendEventContext({ eventType: event?.type }, event),
          error,
        });
      }
      return c.json({ error: 'Webhook processing failed' }, 500);
    }
  });

export const POST = handle(app);

export const stripeApp = app;
export type AppType = typeof app;
