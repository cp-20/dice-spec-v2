import { expect, test } from '@playwright/test';

test.describe('未知URLからの復帰', () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 320, height: 640 } });

  for (const prefix of ['', '/en']) {
    test(`${prefix}/の未知URLは初期HTMLに404と復帰リンクを返す`, async ({ page }) => {
      const response = await page.goto(`${prefix}/no-such`);
      expect(response?.status()).toBe(404);
      await expect(page).toHaveTitle('404 | DiceSpec');
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
      await expect(page.getByRole('heading', { name: 'ページが見つかりません' })).toBeVisible();
      await expect(
        page.getByText('指定されたページは存在しないか、移動または削除された可能性があります。'),
      ).toBeVisible();
      await expect(page.getByRole('link', { name: 'トップへ' })).toHaveAttribute('href', '/');
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);

      for (const [name, pathname, catchphrase] of [
        ['トップへ', '/', 'ダイススペックはTRPGのちょっとしたツールを集めたサービスです。'],
      ]) {
        const link = page.getByRole('link', { name });
        const box = await link.boundingBox();
        expect(box?.height).toBeGreaterThanOrEqual(44);
        const [homeResponse] = await Promise.all([page.waitForNavigation(), link.click()]);
        expect(homeResponse?.status()).toBe(200);
        expect(new URL(page.url()).pathname).toBe(pathname);
        await expect(page.getByText(catchphrase)).toBeVisible();
        await page.goBack();
      }
    });
  }
});

for (const path of ['/en/dice', '/dice']) {
  test(`${path}は通常のダイス画面を表示する`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('button', { name: '1D6', exact: true })).toBeVisible();
  });
}
