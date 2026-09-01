import { expect, test } from '@playwright/test';

const logHtml = `<!DOCTYPE html>
<html lang="ja">
  <body>
    <p style="color:#4caf50;">
      <span> [main]</span>
      <span>E2E探索者</span> :
      <span>CC&lt;=60 【聞き耳】 (1D100&lt;=60) ボーナス・ペナルティダイス[0] ＞ 45 ＞ 45 ＞ レギュラー成功</span>
    </p>
    <p style="color:#4caf50;">
      <span> [main]</span>
      <span>E2E探索者</span> :
      <span>CC&lt;=30 【目星】 (1D100&lt;=30) ボーナス・ペナルティダイス[0] ＞ 95 ＞ 95 ＞ 失敗</span>
    </p>
  </body>
</html>`;

test('シンプルダイスを振ると結果を表示する', async ({ page }) => {
  await page.goto('/ja/dice');
  await page.getByRole('button', { name: '1D6', exact: true }).click();

  await expect(page.getByText(/^1D6 => [1-6]\[[1-6]\] => [1-6]$/)).toBeVisible();
});

test('ダイス式の確率と統計を計算する', async ({ page }) => {
  await page.goto('/ja/expect');
  await page.getByPlaceholder('計算式を入力してください').fill('1D100<=25');
  await page.getByRole('button', { name: '計算', exact: true }).click();

  await expect(page.getByText('確率', { exact: true }).locator('..')).toContainText('25%');
  await expect(page.getByText('平均値', { exact: true }).locator('..')).toContainText('50.5');
  await expect(page.getByText('範囲', { exact: true }).locator('..')).toContainText('1 - 100');
});

test('ログをアップロードするとゲームシステムを判定して集計する', async ({ page }) => {
  await page.goto('/ja/analyze-logs');
  await page.locator('#log-file-uploader').setInputFiles({
    name: 'e2e-session.html',
    mimeType: 'text/html',
    buffer: Buffer.from(logHtml),
  });

  await expect(page.getByText('e2e-session.html')).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'ゲームシステムを選択' })).toContainText('新クトゥルフ神話TRPG');
  await expect(page.getByText('成功率', { exact: true }).first().locator('..')).toContainText('50%');
  await expect(page.getByText('ダイスを振った回数', { exact: true }).locator('..')).toContainText('2回');
  await expect(page.getByText(/\[メイン\].*聞き耳/)).toBeVisible();
  await expect(page.getByText(/\[メイン\].*目星/)).toBeVisible();
});
