import { expect, test } from '@playwright/test';

test.use({ serviceWorkers: 'block' });

for (const target of ['レイアウト', '認証UI', '予測画面'] as const) {
  for (const failure of ['404', '通信切断'] as const) {
    test(`${target}の${failure}からページを再読み込みして操作に戻れる`, async ({ page }) => {
      // Service Worker に通信制御を迂回させず、取得失敗と復旧の順序を固定する。
      test.setTimeout(60_000);
      // 障害再現のイベントを本番の監視サービスへ送信しない。
      const captured: {
        contexts?: {
          module_loading?: { online: boolean; serviceWorkerControlled: boolean; failedRequests: string[] };
        };
      }[] = [];
      await page.route('https://*.ingest.*.sentry.io/**', async (route) => {
        const lines = (route.request().postData() ?? '').split('\n');
        for (let i = 1; i < lines.length - 1; i++) {
          try {
            if (JSON.parse(lines[i]).type === 'event') captured.push(JSON.parse(lines[i + 1]));
          } catch {
            // Replayなどのバイナリデータは、この検証の対象にしない。
          }
        }
        await route.fulfill({ status: 200, body: '{}' });
      });
      if (failure === '通信切断') await page.setViewportSize({ width: 320, height: 640 });
      let failing = true;
      let failedChunk = '';
      await page.route('**/_next/static/chunks/*.js', async (route) => {
        const response = await route.fetch();
        // ハッシュ付きファイル名に依存せず、表示内容から障害対象を特定する。
        const body = await response.text();
        const matches =
          target === 'レイアウト'
            ? body.includes('max-w-6xl')
            : target === '認証UI'
              ? body.length < 10_000 && body.includes('authUser') && body.includes('signOut') && body.includes('.email')
              : body.includes('信頼区間 (P95):');
        if (failing && matches) {
          failedChunk = route.request().url();
          if (failure === '404') await route.fulfill({ status: 404, body: 'Not Found', contentType: 'text/plain' });
          else await route.abort('internetdisconnected');
        } else {
          await route.fulfill({ response });
        }
      });

      await page.goto(target === '予測画面' ? '/expect' : '/dice');
      if (target === '予測画面') {
        await page.waitForFunction(() => window.__NEXT_HYDRATED === true);
        await page.getByRole('checkbox', { name: '変更時に自動で再計算' }).uncheck();
        await page.getByPlaceholder('計算式を入力してください').fill('1D6');
        await page.getByRole('button', { name: '計算', exact: true }).click();
      }
      await expect.poll(() => failedChunk).not.toBe('');
      const reload = page.getByRole('button', {
        name: target === 'レイアウト' ? 'ページを再読み込み' : '再読み込み',
        exact: true,
      });
      await expect(reload).toBeVisible();

      const diagnostics = () =>
        captured
          .map((event) => event.contexts?.module_loading)
          .find((context) =>
            context?.failedRequests.some((request) => request.endsWith(` ${new URL(failedChunk).pathname}`)),
          );
      await expect.poll(diagnostics).toMatchObject({ online: true, serviceWorkerControlled: false });

      failing = false;
      const [documentResponse, chunkResponse] = await Promise.all([
        page.waitForResponse((response) => response.request().isNavigationRequest()),
        page.waitForResponse(failedChunk),
        reload.click(),
      ]);
      expect(documentResponse.ok()).toBe(true);
      expect(chunkResponse.ok()).toBe(true);
      await page.waitForFunction(() => window.__NEXT_HYDRATED === true);
      if (target === '予測画面') {
        await page.getByPlaceholder('計算式を入力してください').fill('1D6');
        await page.getByRole('button', { name: '計算', exact: true }).click();
        await expect(page.getByRole('img', { name: '確率分布', exact: true })).toBeVisible();
        return;
      }
      await page.getByRole('tab', { name: 'アドバンスド' }).click();
      await expect(page.getByRole('button', { name: 'DiceBot', exact: true })).toHaveAttribute('aria-busy', 'false');
      await page.getByPlaceholder('コマンドを入力してください').fill('1D6');
      await page.getByRole('button', { name: 'ダイスを振る', exact: true }).click();
      await expect(page.getByText(/^\(1D6\).*＞/)).toHaveCount(1);
    });
  }
}
