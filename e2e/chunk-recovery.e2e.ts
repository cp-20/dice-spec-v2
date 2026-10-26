import { expect, test } from '@playwright/test';

test.use({ serviceWorkers: 'block' });

for (const failure of ['404', '通信切断'] as const) {
  test(`レイアウトの${failure}からページを再読み込みしてダイス操作に戻れる`, async ({ page }) => {
    // Service Worker に通信制御を迂回させず、取得失敗と復旧の順序を固定する。
    test.setTimeout(60_000);
    // 障害再現のイベントを本番の監視サービスへ送信しない。
    await page.route('https://*.ingest.*.sentry.io/**', (route) => route.fulfill({ status: 200, body: '{}' }));
    if (failure === '通信切断') await page.setViewportSize({ width: 320, height: 640 });
    let failing = true;
    let failedChunk = '';
    await page.route('**/_next/static/chunks/*.js', async (route) => {
      const response = await route.fetch();
      // ハッシュ付きファイル名に依存せず、本文を包むレイアウトを特定する。
      if (failing && (await response.text()).includes('max-w-6xl')) {
        failedChunk = route.request().url();
        if (failure === '404') await route.fulfill({ status: 404, body: 'Not Found', contentType: 'text/plain' });
        else await route.abort('internetdisconnected');
      } else {
        await route.fulfill({ response });
      }
    });

    await page.goto('/dice');
    await expect.poll(() => failedChunk).not.toBe('');
    const reload = page.getByRole('button', { name: 'ページを再読み込み', exact: true });
    await expect(reload).toBeVisible();

    failing = false;
    const [documentResponse, chunkResponse] = await Promise.all([
      page.waitForResponse((response) => response.request().isNavigationRequest()),
      page.waitForResponse(failedChunk),
      reload.click(),
    ]);
    expect(documentResponse.ok()).toBe(true);
    expect(chunkResponse.ok()).toBe(true);
    await page.waitForFunction(() => window.__NEXT_HYDRATED === true);
    await page.getByRole('tab', { name: 'アドバンスド' }).click();
    await expect(page.getByRole('button', { name: 'DiceBot', exact: true })).toHaveAttribute('aria-busy', 'false');
    await page.getByPlaceholder('コマンドを入力してください').fill('1D6');
    await page.getByRole('button', { name: 'ダイスを振る', exact: true }).click();
    await expect(page.getByText(/^\(1D6\).*＞/)).toHaveCount(1);
  });
}
