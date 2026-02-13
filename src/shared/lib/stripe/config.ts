export const stripeConfig = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
  secretKey: process.env.STRIPE_SECRET_KEY ?? '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  priceIds: {
    proMonthly: process.env.STRIPE_PRICE_ID_PRO_MONTHLY ?? '',
    proYearly: process.env.STRIPE_PRICE_ID_PRO_YEARLY ?? '',
  },
} as const;

export type BillingInterval = 'monthly' | 'yearly';

const priceIdMap: Record<BillingInterval, string> = {
  monthly: stripeConfig.priceIds.proMonthly,
  yearly: stripeConfig.priceIds.proYearly,
};

export const getPriceId = (interval: BillingInterval): string => priceIdMap[interval];
