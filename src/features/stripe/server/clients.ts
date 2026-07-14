import { createFirestoreClient } from 'firebase-rest-firestore';
import type Stripe from 'stripe';

import type { BillingInterval } from '@/features/stripe/contract';
import { runtimeEnv } from '@/shared/lib/env';
import { FIREBASE_COLLECTIONS } from '@/shared/lib/firebase/collections';

let stripePromise: Promise<Stripe> | null = null;

export const getStripeClient = () => {
  stripePromise ??= import('stripe').then(
    ({ default: Stripe }) =>
      new Stripe(runtimeEnv.stripe.secretKey, {
        httpClient: Stripe.createFetchHttpClient(),
        apiVersion: '2026-06-24.dahlia',
      }),
  );
  return stripePromise;
};

let firestoreClient: ReturnType<typeof createFirestoreClient> | null = null;

const getFirestoreClient = () => {
  if (firestoreClient) return firestoreClient;

  const { projectId, firestoreDatabaseId: databaseId, clientEmail, privateKey } = runtimeEnv.firebase;
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firestore REST configuration in environment variables');
  }

  firestoreClient = createFirestoreClient({
    projectId,
    databaseId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, '\n'),
  });
  return firestoreClient;
};

export const getUserById = async (userId: string) => getFirestoreClient().get(FIREBASE_COLLECTIONS.users, userId);

export const updateExistingUserById = async (
  client: Pick<ReturnType<typeof createFirestoreClient>, 'get' | 'update'>,
  userId: string,
  data: Record<string, unknown>,
) => {
  if (!(await client.get(FIREBASE_COLLECTIONS.users, userId))) throw new Error('User not found');
  await client.update(FIREBASE_COLLECTIONS.users, userId, data);
};

export const updateUserById = async (userId: string, data: Record<string, unknown>) => {
  await updateExistingUserById(getFirestoreClient(), userId, data);
};

export const getSubscriptionById = async (subscriptionId: string) =>
  (await getStripeClient()).subscriptions.retrieve(subscriptionId, { expand: ['discounts'] });

export const getStripeCustomerIdByUserId = async (userId: string) => {
  const value = (await getUserById(userId))?.stripeCustomerId;
  return typeof value === 'string' && value.length > 0 ? value : undefined;
};

export const getPriceId = (interval: BillingInterval) => {
  switch (interval) {
    case 'monthly':
      return runtimeEnv.stripe.priceIdProMonthly;
    case 'yearly':
      return runtimeEnv.stripe.priceIdProYearly;
    default: {
      const _: never = interval;
      throw new Error(`Invalid interval: ${interval}`);
    }
  }
};
