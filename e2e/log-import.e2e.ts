import { readFileSync } from 'node:fs';

import { strToU8, zipSync } from 'fflate';

import { expect, test } from './fixtures/firebase';

const fixture = (name: string) =>
  readFileSync(new URL(`../src/features/log-analysis/ccfolia/fixtures/${name}`, import.meta.url));
const json = fixture('new.json');
const html = fixture('new.html');
const zip = Buffer.from(zipSync({ '卓[すべて].html': html, '同じ卓.json': json }));
const jsonData = JSON.parse(json.toString());
const splitZip = Buffer.from(
  zipSync(
    Object.fromEntries(
      jsonData.messages.map((message: unknown, index: number) => [
        `session_log_${index + 1}.json`,
        strToU8(JSON.stringify({ messages: [message] })),
      ]),
    ),
  ),
);

for (const [name, buffer] of [
  ['new.html', html],
  ['new.json', json],
  ['session.zip', zip],
  ['split.zip', splitZip],
] as const) {
  test(`${name}を読み込み、重複せず集計してタブで絞り込める`, async ({ page }) => {
    await page.goto('/ja/analyze-logs');
    await page.locator('#log-file-uploader').setInputFiles({ name, mimeType: 'application/octet-stream', buffer });
    const count = page.getByText('ダイスを振った回数', { exact: true }).first().locator('..');
    await expect(count).toContainText('2回');
    await expect(page.getByRole('combobox', { name: 'ゲームシステムを選択' })).toContainText('新クトゥルフ神話TRPG');
    await expect(page.getByText('成功率', { exact: true }).first().locator('..')).toContainText('50%');
    await expect(page.getByText(/\[メイン\].*聞き耳/)).toBeVisible();
    await page.getByRole('checkbox', { name: '[情報]' }).click();
    await expect(count).toContainText('1回');
    await page.getByRole('button', { name: '選択したログを削除', exact: true }).click();
    await expect(
      page.getByText('クリックしてアップロード、あるいはドラッグアンドドロップしてアップロード', { exact: true }),
    ).toBeVisible();
  });
}

test('ドラッグ＆ドロップで読み込み、失敗したファイルを示して既存の結果を維持する', async ({ page }) => {
  await page.goto('/ja/analyze-logs');
  const transfer = await page.evaluateHandle((text) => {
    const data = new DataTransfer();
    data.items.add(new File([text], 'first.json', { type: 'application/json' }));
    return data;
  }, json.toString());
  await page.locator('[aria-busy]').dispatchEvent('drop', { dataTransfer: transfer });
  const count = page.getByText('ダイスを振った回数', { exact: true }).first().locator('..');
  await expect(count).toContainText('2回');
  await page.locator('#log-file-uploader').setInputFiles([
    { name: 'broken.zip', mimeType: 'application/zip', buffer: Buffer.from('broken') },
    { name: 'new.html', mimeType: 'text/html', buffer: html },
  ]);
  await expect(page.getByText('broken.zip:', { exact: false })).toContainText('broken.zip');
  await expect(count).toContainText('2回');
  await page
    .locator('#log-file-uploader')
    .setInputFiles({ name: 'fixed.json', mimeType: 'application/json', buffer: json });
  await expect(count).toContainText('2回');
});

test('ZIPの解析結果を保存して再読み込みできる', async ({ firebaseUser: _firebaseUser, page }) => {
  test.slow();
  await page.goto('/ja/analyze-logs');
  await page
    .locator('#log-file-uploader')
    .setInputFiles({ name: 'session.zip', mimeType: 'application/zip', buffer: zip });
  await page.getByPlaceholder('シナリオ名など').fill('ZIP保存テスト');
  await page.getByRole('button', { name: '保存する' }).click();
  await expect(page).toHaveURL(/\/analyze-logs\/[^/]+$/, { timeout: 20_000 });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'ZIP保存テスト' })).toBeVisible();
  await expect(page.getByText('ダイスを振った回数', { exact: true }).first().locator('..')).toContainText('2回');
});
