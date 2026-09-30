import { createHmac } from 'node:crypto';

// 本番と同じ Web Crypto を使う Stripe SDK で署名検証を通す。
vi.doMock('stripe', async () => {
  const workerEntry = new URL('stripe.esm.worker.js', import.meta.resolve('stripe')).href;
  return import(/* @vite-ignore */ workerEntry);
});
// 検証対象外の監査ログを外部へ送信しない。
vi.doMock('./logger', () => ({ scheduleStripeLog: vi.fn<typeof import('./logger').scheduleStripeLog>() }));

afterEach(() => vi.unstubAllEnvs());

test('Web Crypto で正しい署名を受理し、本文の改変と署名の欠落を拒否する', async () => {
  const secret = 'whsec_webhook_test';
  vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_webhook');
  vi.stubEnv('STRIPE_WEBHOOK_SECRET', secret);
  const { stripeApp } = await import('./app');
  const body = JSON.stringify({
    id: 'evt_webhook_test',
    object: 'event',
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    type: 'billing_portal.session.created',
    data: { object: {} },
  });
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = `t=${timestamp},v1=${createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex')}`;

  const accepted = await stripeApp.request('/api/stripe/webhook', {
    method: 'POST',
    body,
    headers: { 'stripe-signature': signature },
  });
  expect(accepted.status).toBe(200);
  expect(await accepted.json()).toEqual({ received: true });

  const tampered = await stripeApp.request('/api/stripe/webhook', {
    method: 'POST',
    body: body.replace('evt_webhook_test', 'evt_tampered'),
    headers: { 'stripe-signature': signature },
  });
  expect(tampered.status).toBe(400);
  expect(await tampered.json()).toEqual({ error: 'Invalid signature' });

  const unsigned = await stripeApp.request('/api/stripe/webhook', { method: 'POST', body });
  expect(unsigned.status).toBe(400);
  expect(await unsigned.json()).toEqual({ error: 'Missing signature' });
});
