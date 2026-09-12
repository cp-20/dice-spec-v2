import { expect, test } from '@playwright/test';

test('他のタブからログ未読込のログ解析画面へ繰り返し移動できる', async ({ page }) => {
  const errors: Error[] = [];
  page.on('pageerror', (error) => errors.push(error));
  await page.goto('/ccfolia');

  for (const path of [
    '/analyze-logs',
    '/dice',
    '/analyze-logs',
    '/expect',
    '/analyze-logs',
    '/ccfolia',
    '/analyze-logs',
  ]) {
    await page.locator(`nav a[href="${path}"]:visible`).first().click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.locator('main h1')).toBeVisible();
    if (path === '/analyze-logs') {
      await expect(page.getByRole('combobox', { name: 'ゲームシステムを選択' })).toBeVisible();
      await expect(page.getByText('ログは保存されていません')).toBeVisible();
    }
  }
  expect(errors).toEqual([]);
});
