import * as v from 'valibot';

export const billingIntervalSchema = v.picklist(['monthly', 'yearly']);
export type BillingInterval = v.InferOutput<typeof billingIntervalSchema>;

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
