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
  test('監査ログは embed を使わず1行の JSON inline code で送る', async () => {
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
    const content = String(requests[0]?.body.content);
    expect(content.startsWith('`')).toBe(true);
    expect(content.endsWith('`')).toBe(true);
    expect(content).not.toContain('\n');
    expect(content).toContain('"customerId":"cus_1"');
  });

  test('通知対象の決済ログだけを簡潔な embed として通常ログへ送る', async () => {
    await sendStripeLog({
      level: 'success',
      eventType: 'invoice.paid',
      message: 'サブスクリプションが自動更新されました',
      notify: true,
      userId: 'user_1',
      details: { amountPaid: 500, currency: 'USD', billingInterval: 'monthly' },
    });

    expect(requests).toHaveLength(2);
    const notification = requests.find(({ url }) => url === 'https://discord.test/notification');
    const embeds = notification?.body.embeds as { title: string; description: string; fields?: unknown[] }[];
    expect(embeds[0]?.title).toContain('サブスクリプションが自動更新されました');
    expect(embeds[0]?.description).toContain('USD');
    expect(embeds[0]?.description).toContain('5.00');
    expect(embeds[0]?.fields).toBeUndefined();
  });

  test('0桁通貨は金額を割らずに表示する', async () => {
    await sendStripeLog({
      level: 'success',
      eventType: 'checkout.session.completed',
      message: 'ユーザーがプロプランを契約しました',
      notify: true,
      details: { amountTotal: 500, currency: 'JPY' },
    });

    const notification = requests.find(({ url }) => url === 'https://discord.test/notification');
    const embeds = notification?.body.embeds as { description: string }[];
    expect(embeds[0]?.description).toContain('JPY');
    expect(embeds[0]?.description).toContain('500');
  });

  test('Stripe が2桁で扱う ISK を正しい金額で表示する', async () => {
    await sendStripeLog({
      level: 'success',
      eventType: 'invoice.paid',
      message: '支払いが完了しました',
      notify: true,
      details: { amountPaid: 500, currency: 'ISK' },
    });

    const notification = requests.find(({ url }) => url === 'https://discord.test/notification');
    const embeds = notification?.body.embeds as { description: string }[];
    expect(embeds[0]?.description).toContain('ISK');
    expect(embeds[0]?.description).toContain('5');
    expect(embeds[0]?.description).not.toContain('500');
  });

  test('追加認証通知には請求書へのリンクを表示する', async () => {
    await sendStripeLog({
      level: 'warning',
      eventType: 'invoice.payment_action_required',
      message: '追加認証が必要です',
      notify: true,
      details: { hostedInvoiceUrl: 'https://invoice.stripe.test/i/acct_1/inv_1' },
    });

    const notification = requests.find(({ url }) => url === 'https://discord.test/notification');
    const embeds = notification?.body.embeds as { description: string }[];
    expect(embeds[0]?.description).toContain('[請求書を開く](https://invoice.stripe.test/i/acct_1/inv_1)');
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
      eventType: `test.large.${'\\'.repeat(400)}`,
      message: `\`\`\`${'\\'.repeat(400)}`,
      userId: '\\'.repeat(400),
      details: { value: '\\'.repeat(4000) },
      error: new Error('\\'.repeat(400)),
    });

    const content = String(requests[0]?.body.content);
    expect(content.length).toBeLessThanOrEqual(2000);
    expect(content.match(/`/g)).toHaveLength(2);
    expect(content).toContain('\\u0060\\u0060\\u0060');
    expect(content).toContain('Discord の文字数制限により省略');
  });

  test('エラー名を監査ログの文字数制限内に収める', async () => {
    const error = new Error('テストエラー');
    error.name = 'a'.repeat(4000);

    await sendStripeLog({ level: 'info', eventType: 'test.error-name', message: 'エラー名テスト', error });

    const content = String(requests[0]?.body.content);
    expect(content.length).toBeLessThanOrEqual(2000);
    expect(content).toContain(`"name":"${'a'.repeat(237)}..."`);
  });

  test('Error 以外のオブジェクトも監査ログに残す', async () => {
    await sendStripeLog({
      level: 'error',
      eventType: 'test.object-error',
      message: 'オブジェクトエラーのテスト',
      error: { code: 'service_unavailable', message: '一時的に利用できません' },
    });

    const content = String(requests[0]?.body.content);
    expect(content).toContain('service_unavailable');
    expect(content).toContain('一時的に利用できません');
  });

  test('JSONに変換できないエラーも監査ログに残す', async () => {
    await sendStripeLog({
      level: 'error',
      eventType: 'test.undefined-json',
      message: 'JSON変換エラーのテスト',
      error: { toJSON: () => undefined },
    });

    const content = String(requests[0]?.body.content);
    const auditLog = JSON.parse(content.slice(1, -1)) as { error: { message: string } };
    expect(JSON.parse(auditLog.error.message)).toEqual({ serializationError: 'undefined' });
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
