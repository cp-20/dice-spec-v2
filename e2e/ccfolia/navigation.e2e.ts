import { expect, test } from '@playwright/test';

test('未保存の変更がある場合はページ離脱を確認し、キャンセルすると編集を保持する', async ({ context, page }) => {
  await page.goto('/ja/ccfolia');
  await page.getByLabel('名前').fill('ページ離脱前の未保存キャラクター');

  const diceLink = page.getByRole('link', { name: 'ダイスロール' }).first();
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toBe('未保存の変更を破棄しますか？');
    await dialog.dismiss();
  });
  await diceLink.click();

  await expect(page).toHaveURL('/ja/ccfolia');
  await expect(page.getByLabel('名前')).toHaveValue('ページ離脱前の未保存キャラクター');

  const leavingPage = await context.newPage();
  await leavingPage.goto('/ja/ccfolia');
  await leavingPage.getByLabel('名前').fill('破棄してページ離脱するキャラクター');
  leavingPage.once('dialog', async (dialog) => {
    expect(dialog.message()).toBe('未保存の変更を破棄しますか？');
    await dialog.accept();
  });
  await leavingPage.getByRole('link', { name: 'ダイスロール' }).first().click();
  await expect(leavingPage).toHaveURL('/dice');
});
