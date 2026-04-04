import type { Stripe } from 'stripe';
import * as v from 'valibot';
import type { HandlerDeps, HandlerResult } from './types';
import { StripeWebhookHandlerError } from './types';

const checkoutMetadataSchema = v.object({
  type: v.literal('subscription.pro'),
  userId: v.string(),
});

export const createCheckoutHandler = ({ updateUserById }: HandlerDeps) => {
  return async (session: Stripe.Checkout.Session): Promise<HandlerResult> => {
    const metadata = v.safeParse(checkoutMetadataSchema, session.metadata);
    if (!metadata.success) {
      return {
        ok: false,
        error: new StripeWebhookHandlerError({
          message: 'Invalid metadata in checkout session',
          eventType: 'checkout.session.completed',
          details: { sessionId: session.id, metadata: session.metadata, errors: metadata.issues },
          fatal: false,
        }),
      };
    }

    const { userId } = metadata.output;

    try {
      await updateUserById(userId, {
        plan: 'pro',
        updatedAt: new Date(),
      });
    } catch (error) {
      return {
        ok: false,
        error: new StripeWebhookHandlerError({
          message: 'ユーザーのアップグレードに失敗しました',
          eventType: 'checkout.session.completed',
          userId,
          fatal: true,
          cause: error,
        }),
      };
    }

    return {
      ok: true,
      log: {
        level: 'success',
        eventType: 'checkout.session.completed',
        message: 'ユーザーがプロプランにアップグレードしました',
        userId,
        details: { sessionId: session.id },
      },
    };
  };
};
