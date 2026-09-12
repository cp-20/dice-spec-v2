import { expect, test } from '@playwright/test';

test('負の修正値を逐次入力でき、未完了入力と上下限を扱える', async ({ page }) => {
  await page.goto('/expect');
  await page.getByRole('tab', { name: 'ダブルクロス3rd' }).click();

  const modifier = page.getByLabel('修正値', { exact: true });
  const mean = page.getByText('平均達成値', { exact: true }).locator('..');
  await expect(modifier).toHaveValue('0');
  const initialMean = await mean.textContent();
  await modifier.focus();
  await modifier.press('ControlOrMeta+a');
  await modifier.press('Backspace');
  await expect(modifier).toHaveValue('');
  await expect(mean).toHaveText(initialMean!);
  await modifier.press('-');
  await expect(modifier).toHaveValue('');
  await expect(mean).toHaveText(initialMean!);
  await modifier.press('3');
  await expect(modifier).toHaveValue('-3');
  await expect(mean).toContainText('8.339');

  for (const unfinished of ['', '-']) {
    await modifier.press('ControlOrMeta+a');
    await modifier.press('Backspace');
    if (unfinished) await modifier.press(unfinished);
    await expect(modifier).toHaveValue('');
    await expect(mean).toContainText('8.339');
    await modifier.press('Tab');
    await expect(modifier).toHaveValue('-3');
    await modifier.focus();
  }

  const diceCount = page.getByLabel('ダイス数', { exact: true });
  await diceCount.fill('0');
  await expect(diceCount).toHaveValue('1');
  await diceCount.fill('41');
  await expect(diceCount).toHaveValue('40');
});
