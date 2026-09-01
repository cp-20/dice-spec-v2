import { expect, test } from 'bun:test';

import { BEFORE_SIGN_OUT_EVENT, signOutWithGuard } from './signOut';

test('ログアウト前イベントをキャンセルすると Firebase からログアウトしない', async () => {
  const preventSignOut = (event: Event) => event.preventDefault();
  window.addEventListener(BEFORE_SIGN_OUT_EVENT, preventSignOut);

  expect(await signOutWithGuard({} as never)).toBe(false);

  window.removeEventListener(BEFORE_SIGN_OUT_EVENT, preventSignOut);
});
