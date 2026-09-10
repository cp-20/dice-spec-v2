import { expect, test } from '@playwright/test';

test('期待値一覧から手動・自動再計算で分布を確認できる', async ({ page }) => {
  await page.goto('/expect');
  await expect(page).toHaveTitle('ダイス予測 - ダイススペック');
  await page.getByRole('checkbox', { name: '変更時に自動で再計算' }).uncheck();
  await page.getByRole('button', { name: '3d6を計算', exact: true }).click();
  await expect(page.getByPlaceholder('計算式を入力してください')).toHaveValue('3d6');
  await expect(page.getByText('平均値', { exact: true }).locator('..')).toContainText('10.5');
  await expect(page.getByText('範囲', { exact: true }).locator('..')).toContainText('3 - 18');
  await page.getByRole('button', { name: '3d6>=11を計算', exact: true }).click();
  await expect(page.getByText('確率', { exact: true }).locator('..')).toContainText('50%');
  await page.getByRole('checkbox', { name: '変更時に自動で再計算' }).check();
  await page.getByRole('button', { name: '3d10を計算', exact: true }).click();
  await expect(page.getByText('平均値', { exact: true }).locator('..')).toContainText('16.5');
  await page.getByPlaceholder('計算式を入力してください').fill('1d6');
  await expect(page.getByText('平均値', { exact: true }).locator('..')).toContainText('3.5');
});

test('説明が初期HTMLに含まれ、英語の関連リンクで言語を維持する', async ({ page, request }) => {
  const response = await request.get('/expect');
  expect(response.ok()).toBe(true);
  expect(await response.text()).toContain('3d6の期待値は10.5');
  const analysis = await request.get('/analyze-logs');
  expect(analysis.ok()).toBe(true);
  expect(await analysis.text()).toContain('ココフォリアのログから出目を集計する方法');
  await page.goto('/analyze-logs');
  await expect(page).toHaveTitle('ココフォリアのログ解析・出目集計 - ダイススペック');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('ココフォリアのログ解析・出目集計');
  await page.goto('/en/analyze-logs');
  await page.getByRole('link', { name: 'Calculate probabilities and expected values for future rolls' }).click();
  await expect(page).toHaveURL(/\/en\/expect$/);
  await expect(page.getByRole('heading', { name: 'The expected value of 3d6 is 10.5' })).toBeVisible();
});
