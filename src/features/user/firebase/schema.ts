import { type FieldValue, Timestamp } from 'firebase/firestore';
import * as v from 'valibot';

const userPlanSchema = v.union([v.literal('free'), v.literal('pro')]);

const publicUserSchema = v.object({
  id: v.string(),
  name: v.string(),
  avatarUrl: v.optional(v.string()),
  plan: userPlanSchema,
  createdAt: v.instance(Timestamp),
  updatedAt: v.instance(Timestamp),
});

export const userDocumentSchema = v.object({
  ...publicUserSchema.entries,
  stripeCustomerId: v.string(),
  stripeSubscriptionId: v.optional(v.string(), ''),
  analysisCount: v.number(),
  analysisCountSyncAnalysisId: v.nullable(v.string()),
});

export type UserDocument = v.InferOutput<typeof userDocumentSchema>;

export type NewUserDocument = Omit<UserDocument, 'createdAt' | 'updatedAt'> & {
  createdAt: FieldValue;
  updatedAt: FieldValue;
};
