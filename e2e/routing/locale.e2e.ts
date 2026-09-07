import { expect, test } from '@playwright/test';

const invalidPaths = ['/xx/dice', '/no-such', '/xx/blogs', '/api/dice'];

for (const path of invalidPaths) {
  test(`${path} は初期 HTML に復帰導線のある 404 を返す`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
    const page = await context.newPage();
    try {
      const response = await page.goto(path);
      expect(response?.status()).toBe(404);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
      await expect(page).toHaveTitle(/404/);
      await expect(page.getByRole('heading', { name: 'ページが見つかりません / Page not found' })).toBeVisible();
      await page.getByRole('link', { name: '日本語トップへ' }).click();
      await expect(page).toHaveURL(`${baseURL}/`);
      await expect(page.locator('body')).not.toContainText('ページが見つかりません / Page not found');
    } finally {
      await context.close();
    }
  });
}

for (const path of ['/ja/blogs', '/en/blogs', '/blogs']) {
  test(`${path} は正常に開ける`, async ({ page }) => {
    expect((await page.goto(path))?.status()).toBe(200);
    await expect(page.locator('main')).toBeVisible();
  });
}

for (const prefix of ['', '/ja', '/en']) {
  test(`${prefix}/analyze-logs の ID は実行時に解決する`, async ({ page }) => {
    const response = await page.goto(`${prefix}/analyze-logs/routing-test-${Date.now()}`, { waitUntil: 'commit' });
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('link', { name: /解析一覧に戻る|Back to analysis list/ })).toBeVisible();
    await expect(page.locator('body')).not.toContainText('ページが見つかりません / Page not found');
  });
}

test('アプリ内遷移で未対応 locale に移動した後もトップへ復帰できる', async ({ page }) => {
  await page.goto('/dice');
  // Next.js が公開するルーターで、document navigation を経由せずに遷移する。
  await page.evaluate(() => {
    const appWindow = window as typeof window & { next: { router: { push: (href: string) => void } } };
    appWindow.next.router.push('/xx/dice');
  });
  await expect(page.getByRole('heading', { name: 'ページが見つかりません / Page not found' })).toBeVisible();
  await page.getByRole('link', { name: '日本語トップへ' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('body')).not.toContainText('ページが見つかりません / Page not found');
});

test('API の動的ルートを locale として拒否しない', async ({ request }) => {
  const response = await request.post('/api/stripe/routing-test');
  expect(response.status()).toBe(404);
  expect(await response.text()).toBe('404 Not Found');
});
