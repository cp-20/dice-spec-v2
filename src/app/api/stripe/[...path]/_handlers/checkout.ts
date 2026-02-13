import { FieldValue } from 'firebase-admin/firestore';
import type { Stripe } from 'stripe';
import * as v from 'valibot';
import { COLLECTIONS } from '@/shared/lib/firebase/stores/collections';
import type { HandlerDeps, HandlerResult } from './types';
import { StripeWebhookHandlerError } from './types';

const checkoutMetadataSchema = v.object({
  type: v.literal('subscription.pro'),
  userId: v.string(),
});

export const createCheckoutHandler = ({ getFirestoreInstance }: HandlerDeps) => {
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

    if (userId === null) {
      return {
        ok: false,
        error: new StripeWebhookHandlerError({
          message: 'Missing userId',
          eventType: 'checkout.session.completed',
          details: { sessionId: session.id },
          fatal: false,
        }),
      };
    }

    try {
      const firestore = getFirestoreInstance();
      const userRef = firestore.collection(COLLECTIONS.users).doc(userId);

      await userRef.update({
        plan: 'pro',
        updatedAt: FieldValue.serverTimestamp(),
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
