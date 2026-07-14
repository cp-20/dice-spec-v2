import { describe, expect, test } from 'bun:test';

import { planForSubscriptionStatus } from './subscriptionState';

describe('planForSubscriptionStatus', () => {
  test('利用可能な契約状態だけをProとして扱う', () => {
    expect(planForSubscriptionStatus('active')).toBe('pro');
    expect(planForSubscriptionStatus('trialing')).toBe('pro');
    expect(planForSubscriptionStatus('past_due')).toBe('free');
    expect(planForSubscriptionStatus('canceled')).toBe('free');
  });
});
