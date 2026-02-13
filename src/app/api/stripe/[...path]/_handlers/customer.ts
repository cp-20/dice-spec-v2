import type { Stripe } from 'stripe';
import * as v from 'valibot';
import { type HandlerDeps, type HandlerResult, StripeWebhookHandlerError } from './types';

const subscriptionMetadataSchema = v.object({
  userId: v.string(),
});

export const createCustomerCreatedHandler = (_: HandlerDeps) => {
  return async (customer: Stripe.Customer): Promise<HandlerResult> => {
    const metadata = v.safeParse(subscriptionMetadataSchema, customer.metadata);
    if (!metadata.success) {
      return {
        ok: false,
        error: new StripeWebhookHandlerError({
          message: 'Invalid customer metadata',
          eventType: 'customer.created',
          details: { subscriptionId: customer.id, metadata: customer.metadata, errors: metadata.issues },
          fatal: false,
        }),
      };
    }

    const { userId } = metadata.output;

    return {
      ok: true,
      log: {
        level: 'info',
        eventType: 'customer.created',
        message: 'Stripeユーザーが作成されました',
        userId,
        details: { customerId: customer.id },
      },
    };
  };
};
