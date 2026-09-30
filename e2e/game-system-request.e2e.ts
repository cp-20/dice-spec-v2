import { expect, test } from './fixtures/app';

test('ブログのゲームシステム名ラベルをクリックすると入力欄にフォーカスする', async ({ page }) => {
  await page.goto('/blogs/stats-for-trpg/6-tool-introduction');
  await page.getByText('ゲームシステム名', { exact: true }).click();
  const input = page.getByRole('textbox', { name: 'ゲームシステム名', exact: true });
  await expect(input).toBeFocused();
  await input.fill('テストシステム');
  await expect(input).toHaveValue('テストシステム');
  await expect(page.getByLabel('ログファイル (任意)')).toHaveAttribute('type', 'file');
});

test('解析画面のゲームシステム名ラベルをクリックすると入力欄にフォーカスする', async ({ page }) => {
  await page.goto('/analyze-logs');
  await page.getByRole('combobox', { name: 'ゲームシステムを選択' }).click();
  await page.getByRole('button', { name: '他ゲームシステム対応をリクエスト' }).click();
  const dialog = page.getByRole('dialog', { name: '他ゲームシステム対応をリクエスト' });
  await dialog.getByLabel('ログファイル (任意)').focus();
  await dialog.getByText('ゲームシステム名', { exact: true }).click();
  const input = dialog.getByRole('textbox', { name: 'ゲームシステム名', exact: true });
  await expect(input).toBeFocused();
  await input.fill('テストシステム');
  await expect(input).toHaveValue('テストシステム');
});
