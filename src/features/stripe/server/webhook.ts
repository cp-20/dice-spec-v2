import type Stripe from 'stripe';

import { runtimeEnv } from '@/shared/lib/env';

import { getStripeClient, getSubscriptionById, getUserById, updateUserById } from './clients';
import { createStripeHandlers } from './handlers';
import type { HandlerResult } from './handlers/types';
import { scheduleStripeLog } from './logger';

const handlers = createStripeHandlers({ getUserById, updateUserById, getSubscriptionById });

export const appendEventContext = (details: Record<string, unknown> | undefined, event: Stripe.Event) => ({
  ...details,
  eventId: event.id,
  eventCreatedAt: new Date(event.created * 1000).toISOString(),
  livemode: event.livemode,
});

const processHandlerResult = async (result: HandlerResult, event: Stripe.Event) => {
  if (result.ok) {
    if (result.log) {
      scheduleStripeLog({ ...result.log, details: appendEventContext(result.log.details, event) });
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
  if (result.error.fatal) throw result.error;
};

export const constructStripeEvent = async (body: string, signature: string) => {
  try {
    return (await getStripeClient()).webhooks.constructEvent(body, signature, runtimeEnv.stripe.webhookSecret);
  } catch (error) {
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

export const processStripeEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    case 'checkout.session.completed':
      return processHandlerResult(await handlers.handleCheckoutCompleted(event.data.object), event);
    case 'customer.subscription.created':
      return processHandlerResult(await handlers.handleSubscriptionCreated(event.data.object), event);
    case 'customer.subscription.updated':
      return processHandlerResult(
        await handlers.handleSubscriptionUpdated({
          subscription: event.data.object,
          previousAttributes: event.data.previous_attributes as Record<string, unknown> | undefined,
        }),
        event,
      );
    case 'customer.subscription.deleted':
      return processHandlerResult(await handlers.handleSubscriptionDeleted(event.data.object), event);
    case 'customer.created':
      return processHandlerResult(await handlers.handleCustomerCreated(event.data.object), event);
    case 'invoice.paid':
      return processHandlerResult(await handlers.handleInvoicePaid(event.data.object), event);
    case 'invoice.payment_failed':
      return processHandlerResult(await handlers.handleInvoicePaymentFailed(event.data.object), event);
    case 'billing_portal.session.created':
      return;
    default:
      console.log(`Unhandled event type: ${event.type}`);
      scheduleStripeLog({
        level: 'info',
        eventType: event.type,
        message: 'Unhandled webhook event type',
        details: appendEventContext(undefined, event),
      });
  }
};
