import { describe, expect, test } from 'bun:test';

import type Stripe from 'stripe';

import {
  createSubscriptionCreatedHandler,
  createSubscriptionDeletedHandler,
  createSubscriptionUpdatedHandler,
} from './subscription';
import type { HandlerDeps } from './types';

const subscription = (overrides: Partial<Stripe.Subscription> = {}) =>
  ({
    id: 'sub_current',
    created: 200,
    status: 'active',
    metadata: { type: 'subscription.pro', userId: 'user_1', interval: 'monthly' },
    cancel_at: null,
    canceled_at: null,
    ended_at: null,
    cancel_at_period_end: false,
    cancellation_details: null,
    discounts: [],
    ...overrides,
  }) as Stripe.Subscription;

describe('subscription webhook handlers', () => {
  test('遅延した updated イベントではなく Stripe 上の最新状態を反映する', async () => {
    const updates: Record<string, unknown>[] = [];
    const deps: HandlerDeps = {
      getUserById: async () => ({ plan: 'free', stripeSubscriptionId: 'sub_current' }),
      updateUserById: async (_userId, data) => {
        updates.push(data);
      },
      getSubscriptionById: async () => subscription({ status: 'active' }),
    };

    const result = await createSubscriptionUpdatedHandler(deps)({
      subscription: subscription({ status: 'canceled' }),
      previousAttributes: { status: 'active' },
    });

    expect(result.ok).toBe(true);
    expect(updates).toHaveLength(1);
    expect(updates[0]).toMatchObject({ plan: 'pro', stripeSubscriptionId: 'sub_current' });
  });

  test('現在の契約とは異なる古い subscription のイベントを無視する', async () => {
    const updates: Record<string, unknown>[] = [];
    const deps: HandlerDeps = {
      getUserById: async () => ({ plan: 'pro', stripeSubscriptionId: 'sub_new' }),
      updateUserById: async (_userId, data) => {
        updates.push(data);
      },
      getSubscriptionById: async (id) =>
        id === 'sub_new'
          ? subscription({ id: 'sub_new', created: 200 })
          : subscription({ id: 'sub_old', created: 100 }),
    };

    const result = await createSubscriptionUpdatedHandler(deps)({ subscription: subscription({ id: 'sub_old' }) });

    expect(result.ok).toBe(true);
    expect(updates).toHaveLength(0);
    if (result.ok) expect(result.log?.details?.action).toBe('stale_subscription_ignored');
  });

  test('古い subscription の deleted イベントで現契約を free に戻さない', async () => {
    const updates: Record<string, unknown>[] = [];
    const deps: HandlerDeps = {
      getUserById: async () => ({ plan: 'pro', stripeSubscriptionId: 'sub_new' }),
      updateUserById: async (_userId, data) => {
        updates.push(data);
      },
      getSubscriptionById: async () => subscription({ id: 'sub_new', created: 200 }),
    };

    const result = await createSubscriptionDeletedHandler(deps)(
      subscription({ id: 'sub_old', created: 100, status: 'canceled' }),
    );

    expect(result.ok).toBe(true);
    expect(updates).toHaveLength(0);
  });

  test('現在の保存値より新しい subscription.created は新規契約として反映する', async () => {
    const updates: Record<string, unknown>[] = [];
    const deps: HandlerDeps = {
      getUserById: async () => ({ plan: 'free', stripeSubscriptionId: 'sub_old' }),
      updateUserById: async (_userId, data) => {
        updates.push(data);
      },
      getSubscriptionById: async (id) =>
        id === 'sub_old' ? subscription({ id, created: 100, status: 'canceled' }) : subscription({ id, created: 200 }),
    };

    const result = await createSubscriptionCreatedHandler(deps)(subscription({ id: 'sub_new', created: 200 }));

    expect(result.ok).toBe(true);
    expect(updates[0]).toMatchObject({ plan: 'pro', stripeSubscriptionId: 'sub_new' });
  });
});
