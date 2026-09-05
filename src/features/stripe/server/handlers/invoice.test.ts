import { describe, expect, test } from 'bun:test';

import type Stripe from 'stripe';

import {
  createInvoiceFinalizationFailedHandler,
  createInvoicePaidHandler,
  createInvoicePaymentActionRequiredHandler,
} from './invoice';
import type { HandlerDeps } from './types';

const invoice = (overrides: Partial<Stripe.Invoice> = {}) =>
  ({
    id: 'in_1',
    parent: { subscription_details: { subscription: 'sub_1' } },
    billing_reason: 'subscription_cycle',
    status: 'open',
    hosted_invoice_url: 'https://invoice.test/in_1',
    amount_due: 500,
    amount_paid: 0,
    currency: 'jpy',
    attempt_count: 1,
    next_payment_attempt: null,
    last_finalization_error: null,
    automatic_tax: { status: null },
    status_transitions: { paid_at: null },
    ...overrides,
  }) as unknown as Stripe.Invoice;

const updates: Record<string, unknown>[] = [];
const deps: HandlerDeps = {
  getUserById: async () => ({ plan: 'pro' }),
  updateUserById: async (_userId, data) => {
    updates.push(data);
  },
  getSubscriptionById: async () =>
    ({
      id: 'sub_1',
      status: 'active',
      metadata: { type: 'subscription.pro', userId: 'user_1', interval: 'monthly' },
      discounts: [],
    }) as unknown as Stripe.Subscription,
};

describe('invoice webhook handlers', () => {
  test('継続決済だけを通常ログへ通知する', async () => {
    const renewal = await createInvoicePaidHandler(deps)(invoice({ billing_reason: 'subscription_cycle' }));
    const initial = await createInvoicePaidHandler(deps)(invoice({ billing_reason: 'subscription_create' }));

    expect(renewal.ok && renewal.log?.notify).toBe(true);
    expect(initial.ok && initial.log?.notify).toBe(false);
  });

  test('追加認証が必要な請求を通知し、plan は変更しない', async () => {
    updates.length = 0;

    const result = await createInvoicePaymentActionRequiredHandler(deps)(invoice());

    expect(result.ok).toBe(true);
    expect(updates).toHaveLength(0);
    if (result.ok) {
      expect(result.log?.notify).toBe(true);
      expect(result.log?.details?.action).toBe('payment_action_required');
    }
  });

  test('請求書の確定失敗を理由付きで通知し、plan は変更しない', async () => {
    updates.length = 0;

    const result = await createInvoiceFinalizationFailedHandler(deps)(
      invoice({
        last_finalization_error: {
          type: 'invalid_request_error',
          code: 'tax_id_invalid',
          message: 'Tax ID is invalid',
        },
      }),
    );

    expect(result.ok).toBe(true);
    expect(updates).toHaveLength(0);
    if (result.ok) {
      expect(result.log?.notify).toBe(true);
      expect(result.log?.details).toMatchObject({
        action: 'invoice_finalization_failed',
        failureCode: 'tax_id_invalid',
        failureMessage: 'Tax ID is invalid',
      });
    }
  });
});
