import { expect, test } from '@playwright/test';

const clipboardCharacter = {
  kind: 'character',
  data: {
    name: '読み込み元の探索者',
    memo: '読み込みテスト',
    initiative: 12,
    externalUrl: 'https://dicespec.test/character',
    status: [{ label: 'HP', value: 8, max: 10 }],
    params: [{ label: 'STR', value: '13' }],
    color: '#123abc',
    commands: 'CC<=70 【目星】',
  },
};

test('クリップボードから読み込み、編集結果をココフォリア形式でコピーできる', async ({ context, page }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
    origin: 'http://127.0.0.1:3100',
  });
  await page.goto('/ja/ccfolia');
  await page.waitForFunction(() => typeof window.__diceSpecFirebaseEmulatorSignIn === 'function');
  await expect(page.getByText('Googleでログインすると、キャラクターをアカウントに保存できます。')).toBeVisible();

  await page.evaluate(
    async (character) => navigator.clipboard.writeText(JSON.stringify(character)),
    clipboardCharacter,
  );
  await page.getByRole('button', { name: 'クリップボードから読み込む' }).click();

  await expect(page.getByLabel('名前')).toHaveValue('読み込み元の探索者');
  await expect(page.getByLabel('メモ')).toHaveValue('読み込みテスト');
  await expect(page.getByLabel('イニシアティブ')).toHaveValue('12');

  await page.getByLabel('名前').fill('編集後の探索者');
  await page.getByLabel('メモ').fill('編集後のメモ');

  const output = page.getByRole('textbox', { name: '出力結果' });
  await expect(output).toHaveValue(/"name":"編集後の探索者"/);
  await expect(output).toHaveValue(/"memo":"編集後のメモ"/);

  await page.getByRole('button', { name: 'クリップボードにコピー' }).click();
  await expect(page.getByRole('button', { name: 'コピーしました' })).toBeVisible();
  // 成功表示は書き込み完了後に出るため、同じ完了条件を再度ポーリングしない。
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await output.inputValue());
});
