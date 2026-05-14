import type { Stripe } from 'stripe';
import * as v from 'valibot';

import type { BillingInterval } from '@/shared/lib/stripe/config';

import type { HandlerDeps, HandlerResult, SubscriptionPayload } from './types';
import { StripeWebhookHandlerError } from './types';

const checkoutMetadataSchema = v.object({
  type: v.literal('subscription.pro'),
  userId: v.string(),
  interval: v.picklist(['monthly', 'yearly']),
});

const getSubscriptionIdFromCheckoutSession = (session: Stripe.Checkout.Session): string | null => {
  if (!session.subscription) {
    return null;
  }

  return typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
};

type DiscountSummary = {
  discountId?: string;
  promotionCode?: string | null;
  couponId?: string;
  couponName?: string | null;
  percentOff?: number | null;
  amountOff?: number | null;
  duration?: string;
};

const getDiscountSummary = (subscription: SubscriptionPayload): DiscountSummary[] => {
  if (!Array.isArray(subscription.discounts)) {
    return [];
  }

  return subscription.discounts.map((discount) => {
    if (typeof discount === 'string') {
      return {
        discountId: discount,
      };
    }

    const coupon = discount.source.coupon;
    const couponId = typeof coupon === 'string' ? coupon : coupon?.id;

    const promotionCode =
      typeof discount.promotion_code === 'string' ? discount.promotion_code : (discount.promotion_code?.code ?? null);

    return {
      discountId: discount.id,
      promotionCode,
      couponId,
      couponName: typeof coupon === 'string' ? null : coupon?.name,
      percentOff: typeof coupon === 'string' ? null : coupon?.percent_off,
      amountOff: typeof coupon === 'string' ? null : coupon?.amount_off,
      duration: typeof coupon === 'string' ? undefined : coupon?.duration,
    };
  });
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

export const createCheckoutHandler = ({ updateUserById, getSubscriptionById }: HandlerDeps) => {
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

    const { userId, interval: billingInterval } = metadata.output;

    const subscriptionId = getSubscriptionIdFromCheckoutSession(session);
    let discounts: DiscountSummary[] = [];
    let subscriptionLookupError: string | null = null;

    if (subscriptionId) {
      try {
        const subscription = await getSubscriptionById(subscriptionId);
        discounts = getDiscountSummary(subscription);
      } catch (error) {
        subscriptionLookupError =
          error instanceof Error ? error.message : 'Failed to resolve subscription details from checkout session';
      }
    }

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
        message: getCheckoutMessage(billingInterval),
        userId,
        details: {
          action: 'subscription_started',
          sessionId: session.id,
          sessionStatus: session.status,
          paymentStatus: session.payment_status,
          subscriptionId,
          billingInterval,
          amountTotal: session.amount_total,
          currency: getCheckoutCurrency(session),
          discounts,
          subscriptionLookupError,
        },
      },
    };
  };
};
