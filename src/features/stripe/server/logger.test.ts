import { afterEach, beforeEach, describe, expect, test } from 'bun:test';

import { runtimeEnv } from '@/shared/lib/env';

import { sendStripeLog } from './logger';

const originalFetch = globalThis.fetch;
const originalConsoleLog = console.log;
const originalNotificationUrl = process.env.STRIPE_DISCORD_WEBHOOK_URL;
const originalAuditUrl = process.env.STRIPE_AUDIT_DISCORD_WEBHOOK_URL;

let requests: { url: string; body: Record<string, unknown> }[] = [];

beforeEach(() => {
  requests = [];
  process.env.STRIPE_DISCORD_WEBHOOK_URL = 'https://discord.test/notification';
  process.env.STRIPE_AUDIT_DISCORD_WEBHOOK_URL = 'https://discord.test/audit';
  console.log = () => undefined;
  globalThis.fetch = (async (input, init) => {
    requests.push({
      url: String(input),
      body: JSON.parse(String(init?.body)) as Record<string, unknown>,
    });
    return new Response(null, { status: 204 });
  }) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  console.log = originalConsoleLog;
  if (originalNotificationUrl === undefined) delete process.env.STRIPE_DISCORD_WEBHOOK_URL;
  else process.env.STRIPE_DISCORD_WEBHOOK_URL = originalNotificationUrl;
  if (originalAuditUrl === undefined) delete process.env.STRIPE_AUDIT_DISCORD_WEBHOOK_URL;
  else process.env.STRIPE_AUDIT_DISCORD_WEBHOOK_URL = originalAuditUrl;
});

describe('sendStripeLog', () => {
  test('監査ログは embed を使わず JSON コードブロックで送る', async () => {
    await sendStripeLog({
      level: 'info',
      eventType: 'customer.created',
      message: 'Stripeユーザーが作成されました',
      userId: 'user_1',
      details: { customerId: 'cus_1' },
    });

    expect(requests).toHaveLength(1);
    expect(requests[0]?.url).toBe('https://discord.test/audit');
    expect(requests[0]?.body.embeds).toBeUndefined();
    expect(requests[0]?.body.content).toContain('```json');
    expect(requests[0]?.body.content).toContain('"customerId": "cus_1"');
  });

  test('通知対象の決済ログだけを簡潔な embed として通常ログへ送る', async () => {
    await sendStripeLog({
      level: 'success',
      eventType: 'invoice.paid',
      message: 'サブスクリプションが自動更新されました',
      notify: true,
      userId: 'user_1',
      details: { amountPaid: 500, currency: 'JPY', billingInterval: 'monthly' },
    });

    expect(requests).toHaveLength(2);
    const notification = requests.find(({ url }) => url === 'https://discord.test/notification');
    const embeds = notification?.body.embeds as { title: string; description: string; fields?: unknown[] }[];
    expect(embeds[0]?.title).toContain('サブスクリプションが自動更新されました');
    expect(embeds[0]?.description).toContain('500 JPY');
    expect(embeds[0]?.fields).toBeUndefined();
  });

  test('エラーログは明示指定なしでも通常ログへ送る', async () => {
    await sendStripeLog({
      level: 'error',
      eventType: 'webhook',
      message: 'Webhook processing failed',
      error: new Error('Stripe unavailable'),
    });

    expect(requests.map(({ url }) => url)).toEqual(['https://discord.test/audit', 'https://discord.test/notification']);
  });

  test('長い監査ログも Discord の文字数制限内に収める', async () => {
    await sendStripeLog({
      level: 'info',
      eventType: 'test.large',
      message: '長い監査ログ',
      details: { value: `\`\`\`${'a'.repeat(4000)}` },
    });

    expect(String(requests[0]?.body.content).length).toBeLessThanOrEqual(2000);
    expect(String(requests[0]?.body.content).match(/```/g)).toHaveLength(2);
  });

  test('エラー名を監査ログの文字数制限内に収める', async () => {
    const error = new Error('テストエラー');
    error.name = 'a'.repeat(4000);

    await sendStripeLog({ level: 'info', eventType: 'test.error-name', message: 'エラー名テスト', error });

    const content = String(requests[0]?.body.content);
    expect(content.length).toBeLessThanOrEqual(2000);
    expect(content).toContain(`"name": "${'a'.repeat(237)}..."`);
  });

  test('通知タイトルを Discord の文字数制限内に収める', async () => {
    await sendStripeLog({
      level: 'success',
      eventType: 'test.long-title',
      message: 'a'.repeat(400),
      notify: true,
    });

    const notification = requests.find(({ url }) => url === 'https://discord.test/notification');
    const embeds = notification?.body.embeds as { title: string }[];
    expect(embeds[0]?.title.length).toBe(256);
    expect(embeds[0]?.title.endsWith('...')).toBe(true);
  });

  test('監査ログ URL は HTTPS のみ許可する', () => {
    process.env.STRIPE_AUDIT_DISCORD_WEBHOOK_URL = 'http://discord.test/audit';

    expect(() => runtimeEnv.stripe.auditDiscordWebhookUrl).toThrow('must use HTTPS');
  });
});
