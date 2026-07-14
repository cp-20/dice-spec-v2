import type { Stripe } from 'stripe';
import * as v from 'valibot';

import { customerMetadataSchema } from '@/features/stripe/contract';

import { type HandlerDeps, type HandlerResult, StripeWebhookHandlerError } from './types';

export const createCustomerCreatedHandler = (_: HandlerDeps) => {
  return async (customer: Stripe.Customer): Promise<HandlerResult> => {
    const metadata = v.safeParse(customerMetadataSchema, customer.metadata);
    if (!metadata.success) {
      return {
        ok: false,
        error: new StripeWebhookHandlerError({
          message: 'Invalid customer metadata',
          eventType: 'customer.created',
          details: { customerId: customer.id, metadata: customer.metadata, errors: metadata.issues },
          fatal: false,
        }),
      };
    }

    const { userId } = metadata.output;

    return {
      ok: true,
      log: {
        level: 'success',
        eventType: 'customer.created',
        message: 'Stripeユーザーが作成されました',
        userId,
        details: {
          action: 'customer_created',
          customerId: customer.id,
        },
      },
    };
  };
};
