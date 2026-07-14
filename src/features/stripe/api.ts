import { hc } from 'hono/client';

import type { BillingInterval } from '@/features/stripe/contract';
import type { StripeAppType } from '@/features/stripe/server/app';
import { getFirebaseAuth } from '@/shared/lib/firebase/client';

// -------------------------------

interface CreateCustomerResponse {
  customerId: string;
}

const getClient = () =>
  hc<StripeAppType>(typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

const getAuthHeader = async () => {
  const auth = getFirebaseAuth();
  const idToken = await auth.currentUser?.getIdToken();

  if (!idToken) {
    throw new Error('Missing Firebase authentication token');
  }

  return { authorization: `Bearer ${idToken}` };
};

let createCustomerPromise: Promise<CreateCustomerResponse> | null = null;

export async function createCustomer(): Promise<CreateCustomerResponse> {
  if (createCustomerPromise) {
    return createCustomerPromise;
  }

  createCustomerPromise = (async () => {
    const client = getClient();
    const res = await client.api.stripe['create-customer'].$post({ json: {} }, { headers: await getAuthHeader() });
    if (!res.ok) {
      throw new Error('Failed to create customer', { cause: await res.json() });
    }

    const data = await res.json();
    return data;
  })().finally(() => {
    createCustomerPromise = null;
  });

  return createCustomerPromise;
}

// -------------------------------

interface CreateCheckoutSessionParams {
  interval: BillingInterval;
}

interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export async function createCheckoutSession(
  params: CreateCheckoutSessionParams,
): Promise<CreateCheckoutSessionResponse> {
  const client = getClient();
  const res = await client.api.stripe['create-checkout-session'].$post(
    { json: { ...params, type: 'subscription.pro' } },
    { headers: await getAuthHeader() },
  );

  if (!res.ok) {
    throw new Error('Failed to create checkout session', { cause: await res.json() });
  }

  const data = await res.json();
  return data;
}

// -------------------------------

interface CreatePortalSessionResponse {
  url: string;
}

export async function createPortalSession(): Promise<CreatePortalSessionResponse> {
  const client = getClient();
  const res = await client.api.stripe['create-portal-session'].$post({ json: {} }, { headers: await getAuthHeader() });

  if (!res.ok) {
    throw new Error('Failed to create portal session', { cause: await res.json() });
  }

  const data = await res.json();
  return data;
}
