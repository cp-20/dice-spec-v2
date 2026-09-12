import { GlobalRegistrator } from '@happy-dom/global-registrator';

GlobalRegistrator.register();
window.confirm = vi.fn();
// エラー経路の検証で本番の監視サービスへ送信しないよう、テレメトリの境界を置き換える。
vi.doMock('@/shared/lib/sentryClient', () => ({ captureClientException: vi.fn() }));

const { cleanup } = await import('@testing-library/react');
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
