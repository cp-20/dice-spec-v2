import { expect, test } from 'bun:test';

import { updateExistingUserById } from './clients';

test('存在しないユーザーを部分文書として作成しない', async () => {
  let updated = false;
  const client = {
    get: async () => null,
    update: async () => {
      updated = true;
      return { id: 'user_1' };
    },
  };

  await expect(updateExistingUserById(client, 'user_1', { stripeCustomerId: 'cus_1' })).rejects.toThrow(
    'User not found',
  );
  expect(updated).toBe(false);
});
