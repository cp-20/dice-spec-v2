import type { FirebaseStorage } from 'firebase/storage';

import { AvatarPreparationError, uploadAvatarFromUrlToStorage } from './avatars';

test('取得できない外部アバターは画像エラーにする', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
  try {
    const error = await uploadAvatarFromUrlToStorage(
      {} as FirebaseStorage,
      'user',
      'https://cdn.dicespec.test/avatar.png',
    ).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(AvatarPreparationError);
    expect(error).toMatchObject({ code: 'INVALID_IMAGE' });
  } finally {
    vi.unstubAllGlobals();
  }
});
