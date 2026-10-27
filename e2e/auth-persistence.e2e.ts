import { test as base, expect } from './fixtures/firebase';

declare global {
  interface Window {
    __authPersistenceErrors: string[];
  }
}

type DatabaseFailure = 'none' | 'delete' | 'reopen';

const test = base.extend<{ databaseFailure: DatabaseFailure }>({
  databaseFailure: ['none', { option: true }],
  page: async ({ page, baseURL, databaseFailure }, use) => {
    // 障害注入によるエラーを本番の計測先へ送らない。
    await page.route('https://*.ingest.*.sentry.io/**', (route) => route.fulfill({ status: 200, body: '{}' }));
    // アプリを起動する前に、オブジェクトストアが欠けた認証DBを同じオリジンに用意する。
    const setup = await page.context().newPage();
    await setup.goto(`${baseURL}/robots.txt`);
    await setup.evaluate(
      () =>
        new Promise<void>((resolve, reject) => {
          const request = indexedDB.open('firebaseLocalStorageDb', 1);
          request.onsuccess = () => {
            request.result.close();
            resolve();
          };
          request.onerror = () => reject(request.error);
        }),
    );
    await setup.close();

    await page.addInitScript((failure) => {
      const failures: string[] = [];
      Object.assign(window, { __authPersistenceErrors: failures });
      window.addEventListener('unhandledrejection', (event) => {
        failures.push(String(event.reason));
      });
      if (failure === 'none') return;

      // OSの保存領域障害はエミュレータで再現できないため、DB要求の失敗だけを注入する。
      const failedRequest = (name: string, message: string) => {
        const request = new EventTarget();
        Object.assign(request, { error: new DOMException(message, name) });
        setTimeout(() => request.dispatchEvent(new Event('error')), 0);
        return request as IDBOpenDBRequest;
      };
      let deleted = false;
      const nativeDelete = indexedDB.deleteDatabase.bind(indexedDB);
      indexedDB.deleteDatabase = (name) => {
        if (name === 'firebaseLocalStorageDb' && failure === 'delete') {
          return failedRequest('UnknownError', 'Internal error deleting database.');
        }
        const request = nativeDelete(name);
        if (name === 'firebaseLocalStorageDb') request.addEventListener('success', () => (deleted = true));
        return request;
      };
      const nativeOpen = indexedDB.open.bind(indexedDB);
      indexedDB.open = (name, version) =>
        name === 'firebaseLocalStorageDb' && deleted
          ? failedRequest('AbortError', 'The connection was closed.')
          : nativeOpen(name, version);
    }, databaseFailure);
    await use(page);
  },
});

for (const [databaseFailure, label] of [
  ['none', '認証DBを修復できる場合'],
  ['delete', '認証DBを削除できない場合'],
  ['reopen', '認証DBを作り直せない場合'],
] as const) {
  test.describe(label, () => {
    test.use({ databaseFailure });

    test('ログインでき、再読み込み後もログイン状態を維持する', async ({ page, firebaseUser }) => {
      const menu = page.getByRole('button', { name: 'ユーザーメニュー', exact: true });
      for (const reload of [false, true]) {
        if (reload) await page.reload();
        await expect(menu).toBeVisible();
        await menu.click();
        await expect(page.getByText(firebaseUser.email, { exact: true })).toBeVisible();
        expect(await page.evaluate(() => window.__authPersistenceErrors)).toEqual([]);
      }
    });
  });
}
