import Stripe from 'stripe';

import { testEnv } from '@/shared/lib/env';

import { test, expect } from './fixtures/firebase';

const key = process.env.STRIPE_E2E_SECRET_KEY;
if (!key || (!key.startsWith('sk_test_') && !key.startsWith('rk_test_'))) {
  throw new Error('専用 Sandbox の STRIPE_E2E_SECRET_KEY が必要です');
}
const stripe = new Stripe(key);

test('Sandbox の契約・解約が Webhook と Firestore を通って画面に反映される', async ({
  page,
  firebaseUser,
  request,
}) => {
  const customer = await stripe.customers.create({ email: firebaseUser.email, metadata: { userId: firebaseUser.uid } });
  expect(customer.livemode).toBe(false);
  let price: Stripe.Price | undefined;
  let subscription: Stripe.Subscription | undefined;
  const firebase = testEnv!.firebase;
  const userUrl = `http://${firebase.emulators.firestore.host}:${firebase.emulators.firestore.e2ePort}/v1/projects/${firebase.projectId}/databases/${firebase.firestoreDatabaseId}/documents/users/${firebaseUser.uid}`;
  const readUser = async () => {
    const response = await request.get(userUrl, { headers: { Authorization: 'Bearer owner' } });
    expect(response.ok()).toBe(true);
    return (await response.json()).fields;
  };
  try {
    price = await stripe.prices.create({
      currency: 'jpy',
      unit_amount: 300,
      recurring: { interval: 'month' },
      product_data: { name: `E2E ${firebaseUser.uid}` },
    });
    await page.goto('/profile');
    await expect(page.getByText('フリー', { exact: true })).toBeVisible();
    // 実際の Stripe イベントを CLI が転送する。署名や API 応答をテストで作らない。
    subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      trial_period_days: 1,
      trial_settings: { end_behavior: { missing_payment_method: 'cancel' } },
      metadata: { type: 'subscription.pro', interval: 'monthly', userId: firebaseUser.uid },
    });
    await expect(page.getByText('プロ', { exact: true })).toBeVisible({ timeout: 60_000 });
    expect(await readUser()).toMatchObject({
      plan: { stringValue: 'pro' },
      stripeSubscriptionId: { stringValue: subscription.id },
    });
    await page.reload();
    await expect(page.getByRole('button', { name: 'Stripeでサブスクリプションを管理する' })).toBeVisible();

    // 署名のないリクエストで解約できず、既存の契約状態も維持される。
    const forged = await request.post('/api/stripe/webhook', {
      data: { type: 'customer.subscription.deleted', data: { object: subscription } },
    });
    expect(forged.status()).toBe(400);
    const invalidSignature = await request.post('/api/stripe/webhook', {
      data: { type: 'customer.subscription.deleted', data: { object: subscription } },
      headers: { 'stripe-signature': `t=${Math.floor(Date.now() / 1000)},v1=${'0'.repeat(64)}` },
    });
    expect(invalidSignature.status()).toBe(400);
    expect(await readUser()).toMatchObject({ plan: { stringValue: 'pro' } });
    await page.reload();
    await expect(page.getByText('プロ', { exact: true })).toBeVisible();

    await stripe.subscriptions.cancel(subscription.id);
    await expect(page.getByText('フリー', { exact: true })).toBeVisible({ timeout: 60_000 });
    expect(await readUser()).toMatchObject({
      plan: { stringValue: 'free' },
      stripeSubscriptionId: { stringValue: subscription.id },
    });
    await expect(page.getByRole('button', { name: 'Stripeでサブスクリプションを管理する' })).toHaveCount(0);
    await page.reload();
    await expect(page.getByText('フリー', { exact: true })).toBeVisible();
  } finally {
    // 顧客削除で途中失敗時も契約を終了する。価格・商品はアーカイブする。
    await stripe.customers.del(customer.id);
    if (price) {
      await stripe.products.update(String(price.product), { default_price: '', active: false });
      await stripe.prices.update(price.id, { active: false });
    }
  }
});
