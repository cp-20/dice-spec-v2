import * as v from 'valibot';

const billingIntervalSchema = v.picklist(['monthly', 'yearly']);
export type BillingInterval = v.InferOutput<typeof billingIntervalSchema>;
export const isBillingInterval = (value: unknown): value is BillingInterval => v.is(billingIntervalSchema, value);

// Stripe の価格と一致させる表示・計測用の金額 (円)
export const PRO_PRICE_JPY: Record<BillingInterval, number> = { monthly: 300, yearly: 3000 };

export const checkoutRequestSchema = v.object({
  type: v.literal('subscription.pro'),
  interval: billingIntervalSchema,
});

export const subscriptionMetadataSchema = v.object({
  ...checkoutRequestSchema.entries,
  userId: v.string(),
});

export const customerMetadataSchema = v.object({ userId: v.string() });
export const portalRequestSchema = v.object({});
