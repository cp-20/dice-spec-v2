import { expect, test } from 'bun:test';

import { FirebaseError } from 'firebase/app';
import { AuthErrorCodes } from 'firebase/auth';

import { isExpectedSignInCancellation } from './useFirebaseAuth';

test('ログインポップアップの終了と競合を正常なキャンセルとして扱う', () => {
  expect(isExpectedSignInCancellation(new FirebaseError(AuthErrorCodes.POPUP_CLOSED_BY_USER, 'closed'))).toBe(true);
  expect(isExpectedSignInCancellation(new FirebaseError(AuthErrorCodes.EXPIRED_POPUP_REQUEST, 'cancelled'))).toBe(true);
  expect(isExpectedSignInCancellation(new FirebaseError('auth/network-request-failed', 'failed'))).toBe(false);
});
