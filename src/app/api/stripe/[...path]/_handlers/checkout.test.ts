import { describe, expect, test } from 'bun:test';

import type Stripe from 'stripe';

import { createCheckoutHandler } from './checkout';
import type { HandlerDeps } from './types';

const checkoutSession = {
  id: 'cs_1',
  subscription: 'sub_1',
  metadata: { type: 'subscription.pro', userId: 'user_1', interval: 'monthly' },
  status: 'complete',
  payment_status: 'paid',
  amount_total: 500,
  currency: 'jpy',
} as unknown as Stripe.Checkout.Session;

const stripeSubscription = (status: Stripe.Subscription.Status) =>
  ({
    id: 'sub_1',
    created: 200,
    status,
    metadata: checkoutSession.metadata,
    discounts: [],
  }) as unknown as Stripe.Subscription;

describe('checkout.session.completed handler', () => {
  test('trialing を Pro として subscription ID と一緒に保存する', async () => {
    const updates: Record<string, unknown>[] = [];
    const deps: HandlerDeps = {
      getUserById: async () => null,
      updateUserById: async (_userId, data) => {
        updates.push(data);
      },
      getSubscriptionById: async () => stripeSubscription('trialing'),
    };

    const result = await createCheckoutHandler(deps)(checkoutSession);

    expect(result.ok).toBe(true);
    expect(updates[0]).toMatchObject({ plan: 'pro', stripeSubscriptionId: 'sub_1' });
  });

  test('Subscription の最新状態を取得できない場合は Pro に更新しない', async () => {
    const updates: Record<string, unknown>[] = [];
    const deps: HandlerDeps = {
      getUserById: async () => null,
      updateUserById: async (_userId, data) => {
        updates.push(data);
      },
      getSubscriptionById: async () => {
        throw new Error('Stripe unavailable');
      },
    };

    const result = await createCheckoutHandler(deps)(checkoutSession);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.fatal).toBe(true);
    expect(updates).toHaveLength(0);
  });

  test('現在の契約より古い Checkout イベントを無視する', async () => {
    const updates: Record<string, unknown>[] = [];
    const deps: HandlerDeps = {
      getUserById: async () => ({ stripeSubscriptionId: 'sub_new' }),
      updateUserById: async (_userId, data) => {
        updates.push(data);
      },
      getSubscriptionById: async (id) =>
        id === 'sub_new'
          ? ({ ...stripeSubscription('active'), id, created: 300 } as Stripe.Subscription)
          : ({ ...stripeSubscription('active'), id, created: 200 } as Stripe.Subscription),
    };

    const result = await createCheckoutHandler(deps)(checkoutSession);

    expect(result.ok).toBe(true);
    expect(updates).toHaveLength(0);
    if (result.ok) expect(result.log?.details?.action).toBe('stale_subscription_ignored');
  });
});
