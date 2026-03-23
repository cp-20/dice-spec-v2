import { hc } from 'hono/client';
import type { AppType } from '@/app/api/stripe/[...path]/route';
import { useFirebase } from '@/shared/lib/firebase/useFirebase';
import type { BillingInterval } from '@/shared/lib/stripe/config';

// -------------------------------

interface CreateCustomerResponse {
  customerId: string;
}

const getClient = () => hc<AppType>(typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

const getAuthHeader = async () => {
  const { auth } = useFirebase();
  const idToken = await auth.currentUser?.getIdToken();

  if (!idToken) {
    throw new Error('Missing Firebase authentication token');
  }

  return { authorization: `Bearer ${idToken}` };
};

export async function createCustomer(): Promise<CreateCustomerResponse> {
  const client = getClient();
  const res = await client.api.stripe['create-customer'].$post({ json: {} }, { headers: await getAuthHeader() });
  if (!res.ok) {
    throw new Error('Failed to create customer', { cause: await res.json() });
  }

  const data = await res.json();
  return data;
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
