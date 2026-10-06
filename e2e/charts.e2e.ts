import { readFileSync } from 'node:fs';

import { expect, test } from './fixtures/app';

test('確率分布は離散的な出目でも目標範囲を塗り分け、再計算で更新する', async ({ page }) => {
  await page.goto('/expect');
  const input = page.getByPlaceholder('計算式を入力してください');
  const chart = page.getByRole('img', { name: '確率分布', exact: true });
  await input.fill('1D6*2>=8');
  await page.getByRole('button', { name: '計算', exact: true }).click();

  await expect(chart).toBeVisible();
  await expect(chart.locator('circle[fill="rgba(51, 65, 85, 0.5)"]')).toHaveCount(3);
  await expect(chart.locator('text').filter({ hasText: /^12$/ })).toBeVisible();

  await input.fill('1D6*2<=8');
  await page.getByRole('button', { name: '計算', exact: true }).click();
  await expect(chart.locator('circle[fill="rgba(51, 65, 85, 0.5)"]')).toHaveCount(4);

  await input.fill('10D6');
  await page.getByRole('button', { name: '計算', exact: true }).click();
  await expect(chart.locator('path[fill="rgba(100, 116, 139, 0.2)"]')).toHaveCount(2);
  await expect(chart.locator('path[fill="rgba(100, 116, 139, 0.5)"]')).toHaveCount(1);

  await input.fill('7');
  await page.getByRole('button', { name: '計算', exact: true }).click();
  await expect(chart.locator('circle')).toHaveCount(1);
  await expect(chart.locator('text').filter({ hasText: /^7$/ })).toBeVisible();
});

test('密な確率分布は点マーカーを増やさず、狭い画面でもコンテナ内に収まる', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/expect');
  await page.getByPlaceholder('計算式を入力してください').fill('1D1000');
  await page.getByRole('button', { name: '計算', exact: true }).click();
  const chart = page.getByRole('img', { name: '確率分布', exact: true });

  await expect(chart).toBeVisible();
  await expect(chart.locator('circle')).toHaveCount(0);
  await expect(chart.locator('path[fill="rgba(100, 116, 139, 0.5)"]')).toHaveCount(1);
  const bounds = await chart.boundingBox();
  expect(bounds?.height).toBe(300);
  expect(bounds?.width).toBeLessThan(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('ログの読み込みと絞り込みに合わせて縦・横の棒グラフを更新する', async ({ page }) => {
  await page.goto('/analyze-logs');
  const distribution = page.getByRole('img', { name: '出目の分布', exact: true });
  const evaluation = page.getByRole('img', { name: '判定結果の内訳', exact: true });
  await expect(distribution).toBeVisible();
  await expect(evaluation).toBeVisible();

  await page.locator('#log-file-uploader').setInputFiles({
    name: 'new.html',
    mimeType: 'text/html',
    buffer: readFileSync(new URL('../src/features/log-analysis/ccfolia/fixtures/new.html', import.meta.url)),
  });
  await expect(page.getByText('ダイスを振った回数', { exact: true }).first().locator('..')).toContainText('2回');
  const bars = (chart: typeof distribution) => chart.locator('rect[fill="rgba(100, 116, 139, 0.5)"]');
  await expect(bars(distribution)).toHaveCount(10);
  await expect(bars(evaluation)).toHaveCount(7);
  await expect(bars(distribution).nth(1)).toHaveAttribute('height', /^(?!0$)\d/);
  await expect(bars(distribution).nth(5)).toHaveAttribute('height', /^(?!0$)\d/);
  await expect(bars(evaluation).nth(1)).toHaveAttribute('width', /^(?!0$)\d/);
  await expect(bars(evaluation).nth(4)).toHaveAttribute('width', /^(?!0$)\d/);
  const fumble = await evaluation.getByText('ファンブル', { exact: true }).boundingBox();
  const critical = await evaluation.getByText('クリティカル', { exact: true }).boundingBox();
  expect(fumble!.y).toBeLessThan(critical!.y);

  await page.getByRole('checkbox', { name: '[情報]' }).click();
  await expect(bars(distribution).nth(5)).toHaveAttribute('height', '0');
  await expect(bars(evaluation).nth(1)).toHaveAttribute('width', '0');
  await expect(bars(evaluation).nth(4)).toHaveAttribute('width', /^(?!0$)\d/);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(async () => {
      const distributionBounds = await distribution.boundingBox();
      const evaluationBounds = await evaluation.boundingBox();
      return evaluationBounds!.y >= distributionBounds!.y + distributionBounds!.height;
    })
    .toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

  await page.getByRole('button', { name: '解析結果をシェア', exact: true }).click();
  await expect(page.getByRole('img', { name: '解析結果シェア画像のプレビュー' })).toBeVisible();
});
