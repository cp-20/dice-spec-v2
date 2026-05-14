import type { Stripe } from 'stripe';
import * as v from 'valibot';

import type { BillingInterval } from '@/shared/lib/stripe/config';

import type { HandlerDeps, HandlerResult, InvoicePayload, SubscriptionPayload } from './types';
import { StripeWebhookHandlerError } from './types';

const subscriptionMetadataSchema = v.object({
  type: v.literal('subscription.pro'),
  userId: v.string(),
  interval: v.picklist(['monthly', 'yearly']),
});

const formatUnixTimeToIso = (unixTime: number | null | undefined): string | null => {
  if (typeof unixTime !== 'number') {
    return null;
  }

  return new Date(unixTime * 1000).toISOString();
};

const getSubscriptionIdFromInvoice = (invoice: InvoicePayload): string | null => {
  const subscription = invoice.parent?.subscription_details?.subscription;

  if (!subscription) {
    return null;
  }

  return typeof subscription === 'string' ? subscription : subscription.id;
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
  const discounts = subscription.discounts;

  if (!Array.isArray(discounts)) {
    return [];
  }

  return discounts.map((discount) => {
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

const getInvoiceCurrency = (invoice: InvoicePayload): string | null => {
  if (typeof invoice.currency !== 'string') {
    return null;
  }

  return invoice.currency.toUpperCase();
};

const loadSubscriptionContext = async (
  deps: HandlerDeps,
  eventType: 'invoice.paid' | 'invoice.payment_failed',
  invoice: InvoicePayload,
): Promise<
  | {
      ok: true;
      context: {
        userId: string;
        subscriptionId: string;
        billingInterval: BillingInterval;
        discounts: DiscountSummary[];
      };
    }
  | {
      ok: false;
      result: HandlerResult;
    }
> => {
  const subscriptionId = getSubscriptionIdFromInvoice(invoice);

  if (!subscriptionId) {
    return {
      ok: false,
      result: { ok: true },
    };
  }

  let subscription: SubscriptionPayload;

  try {
    subscription = await deps.getSubscriptionById(subscriptionId);
  } catch (error) {
    return {
      ok: false,
      result: {
        ok: false,
        error: new StripeWebhookHandlerError({
          message: 'Failed to retrieve subscription for invoice webhook',
          eventType,
          details: {
            invoiceId: invoice.id,
            subscriptionId,
          },
          fatal: false,
          cause: error,
        }),
      },
    };
  }

  const metadata = v.safeParse(subscriptionMetadataSchema, subscription.metadata);
  if (!metadata.success) {
    return {
      ok: false,
      result: {
        ok: false,
        error: new StripeWebhookHandlerError({
          message: 'Invalid subscription metadata in invoice webhook',
          eventType,
          details: {
            invoiceId: invoice.id,
            subscriptionId,
            metadata: subscription.metadata,
            errors: metadata.issues,
          },
          fatal: false,
        }),
      },
    };
  }

  const { userId, interval } = metadata.output;

  return {
    ok: true,
    context: {
      userId,
      subscriptionId,
      billingInterval: interval,
      discounts: getDiscountSummary(subscription),
    },
  };
};

const getPaidMessage = (billingReason: Stripe.Invoice.BillingReason | null): string => {
  switch (billingReason) {
    case 'subscription_cycle':
      return 'サブスクリプションが自動更新されました';
    case 'subscription_create':
      return 'サブスクリプションの初回請求が完了しました';
    default:
      return 'サブスクリプション請求の支払いが完了しました';
  }
};

const getPaymentFailedMessage = (billingReason: Stripe.Invoice.BillingReason | null): string => {
  if (billingReason === 'subscription_cycle') {
    return 'サブスクリプションの自動更新決済に失敗しました';
  }

  return 'サブスクリプション請求の決済に失敗しました';
};

export const createInvoicePaidHandler = (deps: HandlerDeps) => {
  return async (invoice: InvoicePayload): Promise<HandlerResult> => {
    const context = await loadSubscriptionContext(deps, 'invoice.paid', invoice);

    if (!context.ok) {
      return context.result;
    }

    const { userId, subscriptionId, billingInterval, discounts } = context.context;

    return {
      ok: true,
      log: {
        level: 'success',
        eventType: 'invoice.paid',
        message: getPaidMessage(invoice.billing_reason),
        userId,
        details: {
          action: invoice.billing_reason === 'subscription_cycle' ? 'subscription_renewal_succeeded' : 'invoice_paid',
          invoiceId: invoice.id,
          invoiceStatus: invoice.status,
          hostedInvoiceUrl: invoice.hosted_invoice_url,
          subscriptionId,
          billingInterval,
          amountPaid: invoice.amount_paid,
          currency: getInvoiceCurrency(invoice),
          billingReason: invoice.billing_reason,
          paidAt: formatUnixTimeToIso(invoice.status_transitions.paid_at),
          discounts,
        },
      },
    };
  };
};

export const createInvoicePaymentFailedHandler = (deps: HandlerDeps) => {
  return async (invoice: InvoicePayload): Promise<HandlerResult> => {
    const context = await loadSubscriptionContext(deps, 'invoice.payment_failed', invoice);

    if (!context.ok) {
      return context.result;
    }

    const { userId, subscriptionId, billingInterval, discounts } = context.context;

    return {
      ok: true,
      log: {
        level: 'warning',
        eventType: 'invoice.payment_failed',
        message: getPaymentFailedMessage(invoice.billing_reason),
        userId,
        details: {
          action: 'subscription_payment_failed',
          invoiceId: invoice.id,
          invoiceStatus: invoice.status,
          hostedInvoiceUrl: invoice.hosted_invoice_url,
          subscriptionId,
          billingInterval,
          amountDue: invoice.amount_due,
          currency: getInvoiceCurrency(invoice),
          attemptCount: invoice.attempt_count,
          billingReason: invoice.billing_reason,
          nextPaymentAttempt: formatUnixTimeToIso(invoice.next_payment_attempt),
          discounts,
        },
      },
    };
  };
};
