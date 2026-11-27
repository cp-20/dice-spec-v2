import { expect, test } from './fixtures/firebase';

test.describe('認証UIの初期表示', () => {
  // Service Worker経由の通信はpage.routeで待機させられない。
  test.use({ serviceWorkers: 'block' });

  test('JavaScriptの読み込み前からスケルトンを表示し、未ログインなら読み込み後に消える', async ({ page }) => {
    const scripts = Promise.withResolvers<void>();
    await page.route('**/*.js', async (route) => {
      await scripts.promise;
      await route.continue();
    });
    const navigation = page.goto('/dice');
    const skeleton = page.getByRole('banner').locator('.animate-pulse');
    try {
      await expect(skeleton).toBeVisible();
      expect(await page.evaluate(() => window.__NEXT_HYDRATED)).not.toBe(true);
    } finally {
      scripts.resolve();
      await navigation;
    }
    await expect(skeleton).toHaveCount(0);
  });
});

test('ログイン済みのユーザーメニューがホバーせずに表示され、再読み込み後も利用できる', async ({
  page,
  firebaseUser,
}) => {
  for (const path of ['/dice', '/blogs']) {
    await page.goto(path);
    const menu = page.getByRole('button', { name: 'ユーザーメニュー', exact: true });
    await expect(menu).toBeVisible({ timeout: 5_000 });
    await menu.click();
    await expect(page.getByText(firebaseUser.email, { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'プロフィール', exact: true })).toBeVisible();

    await page.mouse.move(0, 0);
    await page.reload();
    await expect(menu).toBeVisible({ timeout: 5_000 });
  }
});
