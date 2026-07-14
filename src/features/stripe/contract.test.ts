import { describe, expect, test } from 'bun:test';
import * as v from 'valibot';

import { checkoutRequestSchema, subscriptionMetadataSchema } from './contract';

describe('Stripe contract', () => {
  test('契約周期は月額と年額だけを受け付ける', () => {
    expect(v.safeParse(checkoutRequestSchema, { type: 'subscription.pro', interval: 'monthly' }).success).toBe(true);
    expect(v.safeParse(checkoutRequestSchema, { type: 'subscription.pro', interval: 'weekly' }).success).toBe(false);
  });

  test('Webhook metadataにはユーザーIDを要求する', () => {
    expect(
      v.safeParse(subscriptionMetadataSchema, {
        type: 'subscription.pro',
        interval: 'yearly',
        userId: 'user-1',
      }).success,
    ).toBe(true);
    expect(v.safeParse(subscriptionMetadataSchema, { type: 'subscription.pro', interval: 'yearly' }).success).toBe(
      false,
    );
  });
});
