import * as v from 'valibot';

import type { BillingInterval } from '@/shared/lib/stripe/config';

import type { HandlerDeps, HandlerResult, SubscriptionPayload, SubscriptionUpdatedPayload } from './types';
import { StripeWebhookHandlerError } from './types';

const subscriptionMetadataSchema = v.object({
  type: v.literal('subscription.pro'),
  userId: v.string(),
  interval: v.picklist(['monthly', 'yearly']),
});

const PLAN_VALUES = ['free', 'pro'] as const;

const planForSubscriptionStatus = (status: SubscriptionPayload['status']) =>
  status === 'active' || status === 'trialing' ? 'pro' : 'free';

const currentSubscriptionIdOf = (userDoc: Record<string, unknown> | null) => {
  const value = userDoc?.stripeSubscriptionId;
  return typeof value === 'string' && value.length > 0 ? value : null;
};

export const isStaleSubscription = async (
  userDoc: Record<string, unknown> | null,
  candidate: SubscriptionPayload,
  getSubscriptionById: HandlerDeps['getSubscriptionById'],
) => {
  const currentSubscriptionId = currentSubscriptionIdOf(userDoc);
  if (!currentSubscriptionId || currentSubscriptionId === candidate.id) return false;

  const currentSubscription = await getSubscriptionById(currentSubscriptionId);
  return candidate.created <= currentSubscription.created;
};

const staleSubscriptionEventResult = (
  eventType: string,
  userId: string,
  subscriptionId: string,
  currentSubscriptionId: string,
): HandlerResult => ({
  ok: true,
  log: {
    level: 'warning',
    eventType,
    message: '現在の契約とは異なる古いサブスクリプションイベントを無視しました',
    userId,
    details: { action: 'stale_subscription_ignored', subscriptionId, currentSubscriptionId },
  },
});

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

const readPreviousBoolean = (
  previousAttributes: Record<string, unknown> | undefined,
  key: string,
): boolean | undefined => {
  if (!previousAttributes) {
    return undefined;
  }

  const value = previousAttributes[key];
  return typeof value === 'boolean' ? value : undefined;
};

const readPreviousString = (
  previousAttributes: Record<string, unknown> | undefined,
  key: string,
): string | undefined => {
  if (!previousAttributes) {
    return undefined;
  }

  const value = previousAttributes[key];
  return typeof value === 'string' ? value : undefined;
};

type SubscriptionUpdateAction =
  | 'cancellation_scheduled'
  | 'cancellation_resumed'
  | 'subscription_status_changed'
  | 'subscription_updated';

const resolveSubscriptionUpdateMessage = (
  action: SubscriptionUpdateAction,
  status: SubscriptionPayload['status'],
  previousStatus: string | undefined,
  cancelAt: string | null,
  remainingDays: number | null,
) => {
  switch (action) {
    case 'cancellation_scheduled': {
      const daysText = remainingDays === null ? '不明' : `${remainingDays}日`;
      const cancelAtText = cancelAt ?? '不明';
      return `サブスクリプションの解約が予約されました (終了予定: ${cancelAtText}, 残り ${daysText})`;
    }
    case 'cancellation_resumed':
      return 'サブスクリプションの解約予約が取り消されました (契約は継続されます)';
    case 'subscription_status_changed':
      return `サブスクリプションの状態が ${previousStatus ?? 'unknown'} から ${status} に更新されました`;
    case 'subscription_updated':
      return 'サブスクリプション情報が更新されました';
    default: {
      const _: never = action;
      return 'サブスクリプション情報が更新されました';
    }
  }
};

const resolveCreatedMessage = (billingInterval: BillingInterval): string => {
  switch (billingInterval) {
    case 'monthly':
      return 'プロプラン (月額) のサブスクリプションが作成されました';
    case 'yearly':
      return 'プロプラン (年額) のサブスクリプションが作成されました';
    default:
      const _: never = billingInterval;
      return 'プロプランのサブスクリプションが作成されました';
  }
};

export const createSubscriptionCreatedHandler = ({ getUserById, updateUserById, getSubscriptionById }: HandlerDeps) => {
  return async (subscription: SubscriptionPayload): Promise<HandlerResult> => {
    const metadata = v.safeParse(subscriptionMetadataSchema, subscription.metadata);
    if (!metadata.success) {
      return {
        ok: false,
        error: new StripeWebhookHandlerError({
          message: 'Invalid subscription metadata',
          eventType: 'customer.subscription.created',
          details: { subscriptionId: subscription.id, metadata: subscription.metadata, errors: metadata.issues },
          fatal: false,
        }),
      };
    }

    const { userId, interval } = metadata.output;

    try {
      const currentSubscription = await getSubscriptionById(subscription.id);
      const userDoc = await getUserById(userId);
      const currentSubscriptionId = currentSubscriptionIdOf(userDoc);
      if (currentSubscriptionId && (await isStaleSubscription(userDoc, currentSubscription, getSubscriptionById))) {
        return staleSubscriptionEventResult(
          'customer.subscription.created',
          userId,
          subscription.id,
          currentSubscriptionId,
        );
      }

      await updateUserById(userId, {
        plan: planForSubscriptionStatus(currentSubscription.status),
        stripeSubscriptionId: currentSubscription.id,
        updatedAt: new Date(),
      });

      subscription = currentSubscription;
    } catch (error) {
      return {
        ok: false,
        error: new StripeWebhookHandlerError({
          message: 'サブスクリプションの作成反映に失敗しました',
          eventType: 'customer.subscription.created',
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
        eventType: 'customer.subscription.created',
        message: resolveCreatedMessage(interval),
        userId,
        details: {
          action: 'subscription_created',
          subscriptionId: subscription.id,
          status: subscription.status,
          billingInterval: interval,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          cancelAt: formatUnixTimeToIso(subscription.cancel_at),
          canceledAt: formatUnixTimeToIso(subscription.canceled_at),
        },
      },
    };
  };
};

export const createSubscriptionUpdatedHandler = ({ getUserById, updateUserById, getSubscriptionById }: HandlerDeps) => {
  return async ({ subscription, previousAttributes }: SubscriptionUpdatedPayload): Promise<HandlerResult> => {
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

    const { userId, interval } = metadata.output;

    try {
      const userDoc = await getUserById(userId);
      const currentSubscription = await getSubscriptionById(subscription.id);
      const currentSubscriptionId = currentSubscriptionIdOf(userDoc);
      if (currentSubscriptionId && (await isStaleSubscription(userDoc, currentSubscription, getSubscriptionById))) {
        return staleSubscriptionEventResult(
          'customer.subscription.updated',
          userId,
          subscription.id,
          currentSubscriptionId,
        );
      }

      const status = currentSubscription.status;
      const nextPlan = planForSubscriptionStatus(status);
      const previousPlan = normalizePlan(userDoc?.plan);
      const remainingDays = calcRemainingDays(currentSubscription.cancel_at);
      const cancelAt = formatUnixTimeToIso(currentSubscription.cancel_at);
      const canceledAt = formatUnixTimeToIso(currentSubscription.canceled_at);
      const endedAt = formatUnixTimeToIso(currentSubscription.ended_at);
      const previousCancelAtPeriodEnd = readPreviousBoolean(previousAttributes, 'cancel_at_period_end');
      const previousStatus = readPreviousString(previousAttributes, 'status');

      const action: SubscriptionUpdateAction =
        previousCancelAtPeriodEnd === false && currentSubscription.cancel_at_period_end
          ? 'cancellation_scheduled'
          : previousCancelAtPeriodEnd === true && !currentSubscription.cancel_at_period_end
            ? 'cancellation_resumed'
            : previousStatus && previousStatus !== status
              ? 'subscription_status_changed'
              : 'subscription_updated';

      const message = resolveSubscriptionUpdateMessage(action, status, previousStatus, cancelAt, remainingDays);

      await updateUserById(userId, {
        plan: nextPlan,
        stripeSubscriptionId: currentSubscription.id,
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
            action,
            subscriptionId: subscription.id,
            status,
            previousStatus,
            billingInterval: interval,
            changes: {
              plan: {
                before: previousPlan,
                after: nextPlan,
              },
            },
            cancelAtPeriodEnd: currentSubscription.cancel_at_period_end,
            remainingDays,
            cancelAt,
            canceledAt,
            endedAt,
            cancellationReason: currentSubscription.cancellation_details?.reason,
            cancellationFeedback: currentSubscription.cancellation_details?.feedback,
            hasCancellationComment: Boolean(currentSubscription.cancellation_details?.comment),
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

export const createSubscriptionDeletedHandler = ({ getUserById, updateUserById, getSubscriptionById }: HandlerDeps) => {
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

    const { userId, interval } = metadata.output;

    try {
      const userDoc = await getUserById(userId);
      const currentSubscriptionId = currentSubscriptionIdOf(userDoc);
      if (currentSubscriptionId && (await isStaleSubscription(userDoc, subscription, getSubscriptionById))) {
        return staleSubscriptionEventResult(
          'customer.subscription.deleted',
          userId,
          subscription.id,
          currentSubscriptionId,
        );
      }

      const previousPlan = normalizePlan(userDoc?.plan);
      const endedAt = formatUnixTimeToIso(subscription.ended_at);
      const canceledAt = formatUnixTimeToIso(subscription.canceled_at);

      await updateUserById(userId, {
        plan: 'free',
        stripeSubscriptionId: subscription.id,
        updatedAt: new Date(),
      });

      return {
        ok: true,
        log: {
          level: 'success',
          eventType: 'customer.subscription.deleted',
          message: 'サブスクリプションが終了し、無料プランに移行しました',
          userId,
          details: {
            action: 'subscription_expired',
            subscriptionId: subscription.id,
            status: subscription.status,
            billingInterval: interval,
            changes: {
              plan: {
                before: previousPlan,
                after: 'free',
              },
            },
            endedAt,
            canceledAt,
            cancelAt: formatUnixTimeToIso(subscription.cancel_at),
            cancellationReason: subscription.cancellation_details?.reason,
            cancellationFeedback: subscription.cancellation_details?.feedback,
            hasCancellationComment: Boolean(subscription.cancellation_details?.comment),
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
