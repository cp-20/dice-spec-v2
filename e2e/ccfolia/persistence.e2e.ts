import { expect, test } from '../fixtures/firebase';

test('キャラクターを新規保存し、再読み込み後も編集できる', async ({ firebaseUser: _firebaseUser, page }) => {
  await page.goto('/ja/ccfolia');
  await expect(page.getByText('0 / 3件保存中')).toBeVisible();

  await page.getByLabel('名前').fill('E2E新規保存キャラクター');
  await page.getByLabel('メモ').fill('再読み込み後も残るメモ');
  await page.getByRole('button', { name: 'アカウントに新規保存' }).click();

  await expect(page.getByRole('article', { name: 'E2E新規保存キャラクター' })).toBeVisible();
  await expect(page.getByText('1 / 3件保存中')).toBeVisible();
  await page.reload();

  const savedCharacter = page.getByRole('article', { name: 'E2E新規保存キャラクター' });
  await expect(savedCharacter).toBeVisible();
  await savedCharacter.getByRole('button').first().click();
  await expect(page.getByLabel('メモ')).toHaveValue('再読み込み後も残るメモ');
});

test('無料プランの保存上限では新しいキャラクターを保存できない', async ({ firebaseUser, page }) => {
  await firebaseUser.seedCharacters([
    { id: 'limit-character-1', name: '保存上限キャラクター1' },
    { id: 'limit-character-2', name: '保存上限キャラクター2' },
    { id: 'limit-character-3', name: '保存上限キャラクター3' },
  ]);
  await page.goto('/ja/ccfolia');

  await expect(page.getByText('3 / 3件保存中')).toBeVisible();
  await expect(page.getByText('空のフォームから作成（アカウント保存は上限）')).toBeVisible();
  await expect(page.getByText('プロなら保存件数は無制限です。')).toBeVisible();

  await page.getByLabel('名前').fill('上限を超えるキャラクター');
  await expect(page.getByRole('button', { name: 'アカウントに新規保存' })).toBeDisabled();
  await expect(page.getByRole('article')).toHaveCount(3);
});

test('保存済みキャラクターの編集内容を新しいキャラクターとして保存できる', async ({ firebaseUser, page }) => {
  await firebaseUser.seedCharacters([
    { id: 'clone-source-character', name: '複製元キャラクター', memo: '複製元のメモ' },
  ]);
  await page.goto('/ja/ccfolia');

  await page.getByRole('article', { name: '複製元キャラクター' }).getByRole('button').first().click();
  await page.getByLabel('名前').fill('複製したキャラクター');
  await page.getByLabel('メモ').fill('複製後のメモ');
  await page.getByRole('button', { name: 'アカウントに新規保存' }).click();

  await expect(page.getByRole('article', { name: '複製元キャラクター' })).toBeVisible();
  await expect(page.getByRole('article', { name: '複製したキャラクター' })).toBeVisible();
  await expect(page.getByText('2 / 3件保存中')).toBeVisible();
  await page.reload();

  await expect(page.getByRole('article', { name: '複製元キャラクター' })).toBeVisible();
  const clonedCharacter = page.getByRole('article', { name: '複製したキャラクター' });
  await expect(clonedCharacter).toBeVisible();
  await clonedCharacter.getByRole('button').first().click();
  await expect(page.getByLabel('メモ')).toHaveValue('複製後のメモ');
});

test('削除確認をキャンセルすると保存済みキャラクターを削除しない', async ({ firebaseUser, page }) => {
  await firebaseUser.seedCharacters([{ id: 'delete-cancel-character', name: '削除キャンセル対象' }]);
  await page.goto('/ja/ccfolia');

  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toBe('削除キャンセル対象 をアカウントから削除しますか？');
    await dialog.dismiss();
  });
  await page.getByRole('button', { name: '削除: 削除キャンセル対象' }).click();

  await expect(page.getByRole('article', { name: '削除キャンセル対象' })).toBeVisible();
  await expect(page.getByText('1 / 3件保存中')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('article', { name: '削除キャンセル対象' })).toBeVisible();
});

test('保存済みキャラクターを上書き・出力・削除できる', async ({ context, firebaseUser, page }) => {
  await firebaseUser.seedCharacters([
    {
      id: 'seeded-character',
      name: '保存済みキャラクター',
      memo: '上書き前',
      commands: 'CC<=60 【聞き耳】',
    },
  ]);
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
    origin: 'http://127.0.0.1:3100',
  });
  await page.goto('/ja/ccfolia');

  await page.getByRole('article', { name: '保存済みキャラクター' }).getByRole('button').first().click();
  await page.getByLabel('名前').fill('上書き後キャラクター');
  await page.getByLabel('メモ').fill('上書き後');
  await page.getByRole('button', { name: '上書き保存' }).click();
  await expect(page.getByRole('article', { name: '上書き後キャラクター' })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('article', { name: '上書き後キャラクター' })).toBeVisible();
  await page.getByRole('button', { name: 'エクスポート: 上書き後キャラクター' }).click();
  await expect(page.getByRole('button', { name: 'コピーしました: 上書き後キャラクター' })).toBeVisible();
  // 成功表示は書き込み完了後に出るため、同じ完了条件を再度ポーリングしない。
  const exported = await page.evaluate(() => navigator.clipboard.readText());
  expect(JSON.parse(exported)).toMatchObject({
    kind: 'character',
    data: { name: '上書き後キャラクター', memo: '上書き後' },
  });

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: '削除: 上書き後キャラクター' }).click();
  await expect(page.getByRole('article', { name: '上書き後キャラクター' })).toHaveCount(0);
  await expect(page.getByText('0 / 3件保存中')).toBeVisible();
});
