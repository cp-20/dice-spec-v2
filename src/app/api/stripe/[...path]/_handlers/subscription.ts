import type { Stripe } from 'stripe';
import * as v from 'valibot';

import type { HandlerDeps, HandlerResult, SubscriptionPayload } from './types';
import { StripeWebhookHandlerError } from './types';

const subscriptionMetadataSchema = v.object({
  type: v.literal('subscription.pro'),
  userId: v.string(),
});

const PLAN_VALUES = ['free', 'pro'] as const;

const normalizePlan = (plan: unknown): (typeof PLAN_VALUES)[number] | 'unknown' => {
  if (typeof plan !== 'string') {
    return 'unknown';
  }

  return PLAN_VALUES.includes(plan as (typeof PLAN_VALUES)[number])
    ? (plan as (typeof PLAN_VALUES)[number])
    : 'unknown';
};

const formatUnixTimeToIso = (unixTime: number | null | undefined): string | null => {
  if (typeof unixTime !== 'number') {
    return null;
  }

  return new Date(unixTime * 1000).toISOString();
};

const calcRemainingDays = (unixTime: number | null | undefined): number | null => {
  if (typeof unixTime !== 'number') {
    return null;
  }

  const millisPerDay = 1000 * 60 * 60 * 24;
  const remainingMillis = unixTime * 1000 - Date.now();

  return Math.max(0, Math.ceil(remainingMillis / millisPerDay));
};

export const createSubscriptionUpdatedHandler = ({ getUserById, updateUserById }: HandlerDeps) => {
  return async (subscription: Stripe.Subscription): Promise<HandlerResult> => {
    const metadata = v.safeParse(subscriptionMetadataSchema, subscription.metadata);
    if (!metadata.success) {
      return {
        ok: false,
        error: new StripeWebhookHandlerError({
          message: 'Invalid subscription metadata',
          eventType: 'customer.subscription.updated',
          details: { subscriptionId: subscription.id, metadata: subscription.metadata, errors: metadata.issues },
          fatal: false,
        }),
      };
    }

    const { userId } = metadata.output;

    try {
      const status = subscription.status;
      const isActive = status === 'active';
      const nextPlan = isActive ? 'pro' : 'free';
      const userDoc = await getUserById(userId);
      const previousPlan = normalizePlan(userDoc?.plan);
      const remainingDays = calcRemainingDays(subscription.cancel_at);
      const cancelAt = formatUnixTimeToIso(subscription.cancel_at);
      const canceledAt = formatUnixTimeToIso(subscription.canceled_at);

      const message = subscription.cancel_at_period_end
        ? `サブスクリプションは解約予約されました（あと${remainingDays ?? '-'}日で終了予定）`
        : 'サブスクリプションが更新されました';

      await updateUserById(userId, {
        plan: nextPlan,
        updatedAt: new Date(),
      });

      return {
        ok: true,
        log: {
          level: 'success',
          eventType: 'customer.subscription.updated',
          message,
          userId,
          details: {
            subscriptionId: subscription.id,
            status,
            changes: {
              plan: {
                before: previousPlan,
                after: nextPlan,
              },
            },
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            remainingDays,
            cancelAt,
            canceledAt,
          },
        },
      };
    } catch (error) {
      return {
        ok: false,
        error: new StripeWebhookHandlerError({
          message: 'サブスクリプションの更新に失敗しました',
          eventType: 'customer.subscription.updated',
          userId,
          fatal: true,
          cause: error,
        }),
      };
    }
  };
};

export const createSubscriptionDeletedHandler = ({ getUserById, updateUserById }: HandlerDeps) => {
  return async (subscription: SubscriptionPayload): Promise<HandlerResult> => {
    const metadata = v.safeParse(subscriptionMetadataSchema, subscription.metadata);
    if (!metadata.success) {
      return {
        ok: false,
        error: new StripeWebhookHandlerError({
          message: 'Invalid subscription metadata',
          eventType: 'customer.subscription.deleted',
          details: { subscriptionId: subscription.id, metadata: subscription.metadata, errors: metadata.issues },
          fatal: false,
        }),
      };
    }

    const { userId } = metadata.output;

    try {
      const userDoc = await getUserById(userId);
      const previousPlan = normalizePlan(userDoc?.plan);
      const endedAt = formatUnixTimeToIso(subscription.ended_at);
      const canceledAt = formatUnixTimeToIso(subscription.canceled_at);

      await updateUserById(userId, {
        plan: 'free',
        updatedAt: new Date(),
      });

      return {
        ok: true,
        log: {
          level: 'success',
          eventType: 'customer.subscription.deleted',
          message: 'サブスクリプションが解除されました',
          userId,
          details: {
            subscriptionId: subscription.id,
            changes: {
              plan: {
                before: previousPlan,
                after: 'free',
              },
            },
            endedAt,
            canceledAt,
            cancelAt: formatUnixTimeToIso(subscription.cancel_at),
          },
        },
      };
    } catch (error) {
      return {
        ok: false,
        error: new StripeWebhookHandlerError({
          message: 'サブスクリプションの解除に失敗しました',
          eventType: 'customer.subscription.deleted',
          userId,
          fatal: true,
          cause: error,
        }),
      };
    }
  };
};
