import type { BillingInterval } from '@/shared/lib/stripe/config';
import * as v from 'valibot';

const stripeConfigSchema = v.object({
  secretKey: v.string(),
  webhookSecret: v.string(),
  priceIds: v.object({
    proMonthly: v.string(),
    proYearly: v.string(),
  }),
});

export const stripeConfig = v.parse(stripeConfigSchema, {
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  priceIds: {
    proMonthly: process.env.STRIPE_PRICE_ID_PRO_MONTHLY,
    proYearly: process.env.STRIPE_PRICE_ID_PRO_YEARLY,
  },
});

export const getPriceId = (interval: BillingInterval): string => priceIdMap[interval];

const priceIdMap: Record<BillingInterval, string> = {
  monthly: stripeConfig.priceIds.proMonthly,
  yearly: stripeConfig.priceIds.proYearly,
};
