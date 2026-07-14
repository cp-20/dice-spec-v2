import { describe, expect, test } from 'bun:test';

import { getBearerToken } from './auth';

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
