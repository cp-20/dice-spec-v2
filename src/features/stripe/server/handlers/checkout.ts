import type { Stripe } from 'stripe';
import * as v from 'valibot';

import { type BillingInterval, subscriptionMetadataSchema } from '@/features/stripe/contract';

import { summarizeSubscriptionDiscounts } from '../discounts';
import { isStaleSubscription, planForSubscriptionStatus } from '../subscriptionState';
import type { HandlerDeps, HandlerResult } from './types';
import { StripeWebhookHandlerError } from './types';

const getSubscriptionIdFromCheckoutSession = (session: Stripe.Checkout.Session): string | null => {
  if (!session.subscription) {
    return null;
  }

  return typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
};

const getCheckoutMessage = (billingInterval: BillingInterval): string => {
  switch (billingInterval) {
    case 'monthly':
      return 'ユーザーがプロプラン (月額) を契約しました';
    case 'yearly':
      return 'ユーザーがプロプラン (年額) を契約しました';
    default:
      const _: never = billingInterval;
      return 'ユーザーがプロプランを契約しました';
  }
};

const getCheckoutCurrency = (session: Stripe.Checkout.Session): string | null => {
  if (typeof session.currency !== 'string') {
    return null;
  }

  return session.currency.toUpperCase();
};

export const createCheckoutHandler = ({ getUserById, updateUserById, getSubscriptionById }: HandlerDeps) => {
  return async (session: Stripe.Checkout.Session): Promise<HandlerResult> => {
    const metadata = v.safeParse(subscriptionMetadataSchema, session.metadata);
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

    const { userId, interval: billingInterval } = metadata.output;

    const subscriptionId = getSubscriptionIdFromCheckoutSession(session);
    if (!subscriptionId) {
      return {
        ok: false,
        error: new StripeWebhookHandlerError({
          message: 'Checkout session is missing a subscription',
          eventType: 'checkout.session.completed',
          userId,
          fatal: true,
        }),
      };
    }

    try {
      const [subscription, userDoc] = await Promise.all([getSubscriptionById(subscriptionId), getUserById(userId)]);
      if (await isStaleSubscription(userDoc, subscription, getSubscriptionById)) {
        return {
          ok: true,
          log: {
            level: 'warning',
            eventType: 'checkout.session.completed',
            message: '現在の契約より古い Checkout イベントを無視しました',
            userId,
            details: {
              action: 'stale_subscription_ignored',
              subscriptionId,
              currentSubscriptionId: userDoc?.stripeSubscriptionId,
            },
          },
        };
      }

      const plan = planForSubscriptionStatus(subscription.status);
      await updateUserById(userId, {
        plan,
        stripeSubscriptionId: subscription.id,
        updatedAt: new Date(),
      });

      return {
        ok: true,
        log: {
          level: 'success',
          eventType: 'checkout.session.completed',
          message: getCheckoutMessage(billingInterval),
          userId,
          details: {
            action: 'subscription_started',
            sessionId: session.id,
            sessionStatus: session.status,
            paymentStatus: session.payment_status,
            subscriptionId,
            subscriptionStatus: subscription.status,
            billingInterval,
            amountTotal: session.amount_total,
            currency: getCheckoutCurrency(session),
            discounts: summarizeSubscriptionDiscounts(subscription),
          },
        },
      };
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
  };
};
