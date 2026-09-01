import { afterEach, beforeEach, describe, expect, test, vi } from 'bun:test';

import { getAuthenticatedUser, getBearerToken } from './auth';
import * as logger from './logger';

const originalFetch = globalThis.fetch;
const originalConsoleError = console.error;
const originalFirebaseWebApiKey = process.env.FIREBASE_WEB_API_KEY;

beforeEach(() => {
  process.env.FIREBASE_WEB_API_KEY = 'test-api-key';
  console.error = () => undefined;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  console.error = originalConsoleError;
  vi.restoreAllMocks();
  if (originalFirebaseWebApiKey === undefined) delete process.env.FIREBASE_WEB_API_KEY;
  else process.env.FIREBASE_WEB_API_KEY = originalFirebaseWebApiKey;
});

describe('getBearerToken', () => {
  test('Bearerトークンだけを取り出す', () => {
    expect(getBearerToken('Bearer token')).toBe('token');
    expect(getBearerToken('bearer token')).toBe('token');
  });

  test('形式が不正なAuthorizationヘッダーを拒否する', () => {
    expect(getBearerToken(undefined)).toBeNull();
    expect(getBearerToken('Basic token')).toBeNull();
    expect(getBearerToken('Bearer token extra')).toBeNull();
  });
});

describe('getAuthenticatedUser', () => {
  test('Firebase APIキーがない場合はサービスエラーとして記録する', async () => {
    delete process.env.FIREBASE_WEB_API_KEY;
    const scheduleStripeLog = vi.spyOn(logger, 'scheduleStripeLog').mockImplementation(() => undefined);

    expect(await getAuthenticatedUser('Bearer token', 'checkout')).toBeNull();
    expect(scheduleStripeLog).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'error', eventType: 'checkout', error: expect.any(Error) }),
    );
  });

  test('Firebase APIキーが無効な場合はサービスエラーとして記録する', async () => {
    globalThis.fetch = (async () =>
      Response.json(
        { error: { message: 'API key not valid. Please pass a valid API key.' } },
        { status: 400 },
      )) as unknown as typeof fetch;
    const scheduleStripeLog = vi.spyOn(logger, 'scheduleStripeLog').mockImplementation(() => undefined);

    expect(await getAuthenticatedUser('Bearer token', 'checkout')).toBeNull();
    expect(scheduleStripeLog).toHaveBeenCalledWith(expect.objectContaining({ level: 'error', eventType: 'checkout' }));
  });

  test('Firebase APIキーの制限違反はサービスエラーとして記録する', async () => {
    globalThis.fetch = (async () =>
      Response.json(
        {
          error: {
            message: 'Requests from referer <empty> are blocked.',
            details: [{ reason: 'API_KEY_HTTP_REFERRER_BLOCKED' }],
          },
        },
        { status: 403 },
      )) as unknown as typeof fetch;
    const scheduleStripeLog = vi.spyOn(logger, 'scheduleStripeLog').mockImplementation(() => undefined);

    expect(await getAuthenticatedUser('Bearer token', 'checkout')).toBeNull();
    expect(scheduleStripeLog).toHaveBeenCalledWith(expect.objectContaining({ level: 'error', eventType: 'checkout' }));
  });

  test('IDトークンが無効な場合は利用者エラーとして記録する', async () => {
    globalThis.fetch = (async () =>
      Response.json({ error: { message: 'INVALID_ID_TOKEN' } }, { status: 400 })) as unknown as typeof fetch;
    const scheduleStripeLog = vi.spyOn(logger, 'scheduleStripeLog').mockImplementation(() => undefined);

    expect(await getAuthenticatedUser('Bearer token', 'checkout')).toBeNull();
    expect(scheduleStripeLog).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'warning', eventType: 'checkout' }),
    );
  });

  test('エラーレスポンスの本文を読めない場合はサービスエラーとして記録する', async () => {
    const body = new ReadableStream({
      start(controller) {
        controller.error(new Error('body read failed'));
      },
    });
    globalThis.fetch = (async () => new Response(body, { status: 500 })) as unknown as typeof fetch;
    const scheduleStripeLog = vi.spyOn(logger, 'scheduleStripeLog').mockImplementation(() => undefined);

    expect(await getAuthenticatedUser('Bearer token', 'checkout')).toBeNull();
    expect(scheduleStripeLog).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'error', eventType: 'checkout', error: expect.any(Error) }),
    );
  });

  test('成功レスポンスのJSONを解析できない場合はサービスエラーとして記録する', async () => {
    globalThis.fetch = (async () => new Response('{', { status: 200 })) as unknown as typeof fetch;
    const scheduleStripeLog = vi.spyOn(logger, 'scheduleStripeLog').mockImplementation(() => undefined);

    expect(await getAuthenticatedUser('Bearer token', 'checkout')).toBeNull();
    expect(scheduleStripeLog).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'error', eventType: 'checkout', error: expect.any(Error) }),
    );
  });
});
