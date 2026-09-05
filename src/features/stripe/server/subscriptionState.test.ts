import { describe, expect, test } from 'bun:test';

import { planForSubscriptionStatus } from './subscriptionState';

describe('planForSubscriptionStatus', () => {
  test('決済リトライ中を含む利用可能な契約状態だけをProとして扱う', () => {
    expect(planForSubscriptionStatus('active')).toBe('pro');
    expect(planForSubscriptionStatus('trialing')).toBe('pro');
    expect(planForSubscriptionStatus('past_due')).toBe('pro');
    expect(planForSubscriptionStatus('canceled')).toBe('free');
    expect(planForSubscriptionStatus('unpaid')).toBe('free');
  });
});
