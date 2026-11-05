import { test as base, expect } from './fixtures/firebase';

type FailureMode = 'initialization' | 'polling' | 'heartbeat';

declare global {
  interface Window {
    __idbFailure: { enabled: boolean; count: number; errors: string[] };
  }
}

const test = base.extend<{ failureMode: FailureMode }>({
  failureMode: ['initialization', { option: true }],
  page: async ({ page, failureMode }, use) => {
    // 外部テレメトリへ障害注入のイベントを送らない。
    await page.route('https://*.ingest.*.sentry.io/**', (route) => route.fulfill({ status: 200, body: '{}' }));
    await page.addInitScript((mode) => {
      const failure = { enabled: mode !== 'polling', count: 0, errors: [] as string[] };
      window.__idbFailure = failure;
      window.addEventListener('unhandledrejection', (event) => failure.errors.push(String(event.reason)));
      // 端末のDB破損はエミュレータでは再現できないため、ブラウザのトランザクション境界だけで失敗させる。
      // 可用性チェックを通過した後の切断も検証し、実SDKの再試行・保存先選択は置き換えない。
      for (const method of ['get', 'getAll', 'put', 'delete'] as const) {
        const native = IDBObjectStore.prototype[method];
        Object.defineProperty(IDBObjectStore.prototype, method, {
          value: function (this: IDBObjectStore, ...args: unknown[]) {
            const request = Reflect.apply(native, this, args) as IDBRequest;
            const database = this.transaction.db.name;
            const key = typeof args[0] === 'string' ? args[0] : (args[0] as { fbase_key?: string })?.fbase_key;
            const target =
              mode === 'heartbeat'
                ? database === 'firebase-heartbeat-database'
                : database === 'firebaseLocalStorageDb' &&
                  (mode === 'polling' || key?.startsWith('firebase:authUser:'));
            if (!failure.enabled || !target) return request;
            const error = new DOMException('Connection is closing because of: Internal inconsistency', 'UnknownError');
            Object.defineProperty(request, 'error', { get: () => error });
            Object.defineProperty(this.transaction, 'error', { get: () => error });
            failure.count++;
            this.transaction.abort();
            return request;
          },
        });
      }
    }, failureMode);
    await use(page);
  },
});

test('可用性チェック後にDB接続が終了してもログイン・保存・ログアウトできる', async ({ page, firebaseUser: _user }) => {
  expect(await page.evaluate(() => window.__idbFailure.count)).toBeGreaterThan(0);
  await page.getByLabel('名前').fill('DB切断後のキャラクター');
  await page.getByRole('button', { name: 'アカウントに新規保存' }).click();
  await expect(page.getByRole('article', { name: 'DB切断後のキャラクター' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'ユーザーメニュー', exact: true })).toBeVisible();
  await expect(page.getByRole('article', { name: 'DB切断後のキャラクター' })).toBeVisible();
  expect(await page.evaluate(() => window.__idbFailure.errors)).toEqual([]);
  await page.getByRole('button', { name: 'ユーザーメニュー', exact: true }).click();
  await page.getByRole('button', { name: 'ログアウト', exact: true }).click();
  await expect(page.getByRole('button', { name: 'ユーザーメニュー', exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.getByText('Googleでログインすると、キャラクターをアカウントに保存できます。')).toBeVisible();
});

test.describe('ログイン後の接続終了', () => {
  test.use({ failureMode: 'polling' });
  test('認証を保持し、クラウドへ保存した内容を再読み込みできる', async ({ page, firebaseUser: _user }) => {
    await page.evaluate(() => (window.__idbFailure.enabled = true));
    await page.waitForFunction(() => window.__idbFailure.count > 0);
    await page.getByLabel('名前').fill('ポーリング失敗後の保存');
    await page.getByRole('button', { name: 'アカウントに新規保存' }).click();
    await expect(page.getByRole('article', { name: 'ポーリング失敗後の保存' })).toBeVisible();
    expect(await page.evaluate(() => window.__idbFailure.errors)).toEqual([]);
    await page.reload();
    await expect(page.getByRole('article', { name: 'ポーリング失敗後の保存' })).toBeVisible();
  });
});

test.describe('Firebase Heartbeatの接続終了', () => {
  test.use({ failureMode: 'heartbeat' });
  test('ログインとクラウド保存を継続できる', async ({ page, firebaseUser: _user }) => {
    expect(await page.evaluate(() => window.__idbFailure.count)).toBeGreaterThan(0);
    await page.getByLabel('名前').fill('Heartbeat失敗後の保存');
    await page.getByRole('button', { name: 'アカウントに新規保存' }).click();
    await expect(page.getByRole('article', { name: 'Heartbeat失敗後の保存' })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('article', { name: 'Heartbeat失敗後の保存' })).toBeVisible();
  });
});
