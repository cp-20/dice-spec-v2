import { hc } from 'hono/client';
import type { AppType } from '@/app/api/stripe/[...path]/route';
import type { BillingInterval } from '@/shared/lib/stripe/config';

// -------------------------------

interface CreateCustomerParams {
  userId: string;
  email: string;
  name: string;
}

interface CreateCustomerResponse {
  customerId: string;
}

const getClient = () => hc<AppType>(typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

export async function createCustomer(params: CreateCustomerParams): Promise<CreateCustomerResponse> {
  const client = getClient();
  const res = await client.api.stripe['create-customer'].$post({ json: params });
  if (!res.ok) {
    throw new Error('Failed to create customer', { cause: await res.json() });
  }

  const data = await res.json();
  return data;
}

// -------------------------------

interface CreateCheckoutSessionParams {
  interval: BillingInterval;
  userId: string;
}

interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export async function createCheckoutSession(
  params: CreateCheckoutSessionParams,
): Promise<CreateCheckoutSessionResponse> {
  const client = getClient();
  const res = await client.api.stripe['create-checkout-session'].$post({
    json: { ...params, type: 'subscription.pro' },
  });

  if (!res.ok) {
    throw new Error('Failed to create checkout session', { cause: await res.json() });
  }

  const data = await res.json();
  return data;
}

// -------------------------------

interface CreatePortalSessionParams {
  customerId: string;
}

interface CreatePortalSessionResponse {
  url: string;
}

export async function createPortalSession(params: CreatePortalSessionParams): Promise<CreatePortalSessionResponse> {
  const client = getClient();
  const res = await client.api.stripe['create-portal-session'].$post({ json: params });

  if (!res.ok) {
    throw new Error('Failed to create portal session', { cause: await res.json() });
  }

  const data = await res.json();
  return data;
}
