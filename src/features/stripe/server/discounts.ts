import type { SubscriptionPayload } from './handlers/types';

export type DiscountSummary = {
  discountId?: string;
  promotionCode?: string | null;
  couponId?: string;
  couponName?: string | null;
  percentOff?: number | null;
  amountOff?: number | null;
  duration?: string;
};

export const summarizeSubscriptionDiscounts = (subscription: SubscriptionPayload): DiscountSummary[] => {
  if (!Array.isArray(subscription.discounts)) return [];

  return subscription.discounts.map((discount) => {
    if (typeof discount === 'string') return { discountId: discount };

    const coupon = discount.source.coupon;
    const promotionCode =
      typeof discount.promotion_code === 'string' ? discount.promotion_code : (discount.promotion_code?.code ?? null);

    return {
      discountId: discount.id,
      promotionCode,
      couponId: typeof coupon === 'string' ? coupon : coupon?.id,
      couponName: typeof coupon === 'string' ? null : coupon?.name,
      percentOff: typeof coupon === 'string' ? null : coupon?.percent_off,
      amountOff: typeof coupon === 'string' ? null : coupon?.amount_off,
      duration: typeof coupon === 'string' ? undefined : coupon?.duration,
    };
  });
};
