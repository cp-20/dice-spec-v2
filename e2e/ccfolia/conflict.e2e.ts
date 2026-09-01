import { expect, test } from '../fixtures/firebase';

test('別タブで更新されても編集中の内容を保ち、最新内容へ切り替えられる', async ({ firebaseUser, page }) => {
  await firebaseUser.seedCharacters([{ id: 'conflict-character', name: '競合テストキャラクター' }]);
  const otherPage = await page.context().newPage();

  await Promise.all([page.goto('/ja/ccfolia'), otherPage.goto('/ja/ccfolia')]);
  await page.getByRole('article', { name: '競合テストキャラクター' }).getByRole('button').first().click();
  await otherPage.getByRole('article', { name: '競合テストキャラクター' }).getByRole('button').first().click();

  await otherPage.getByLabel('名前').fill('別タブ側の未保存編集');
  await page.getByLabel('名前').fill('先に保存された最新内容');
  await page.getByRole('button', { name: '上書き保存' }).click();
  await expect(page.getByRole('article', { name: '先に保存された最新内容' })).toBeVisible();

  await expect(
    otherPage.getByText('このキャラクターは別のタブまたは端末で更新されました。現在の内容はまだ失われていません。'),
  ).toBeVisible();
  await expect(otherPage.getByLabel('名前')).toHaveValue('別タブ側の未保存編集');
  otherPage.once('dialog', (dialog) => dialog.accept());
  await otherPage.getByRole('button', { name: '現在の編集を破棄して最新を読み込む' }).click();
  await expect(otherPage.getByLabel('名前')).toHaveValue('先に保存された最新内容');
});
