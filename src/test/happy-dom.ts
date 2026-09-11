import { GlobalRegistrator } from '@happy-dom/global-registrator';
import i18n from 'i18next';

import { i18nextInitOptions } from '@/locales/i18next';

GlobalRegistrator.register();
window.confirm = vi.fn();
// エラー経路の検証で本番の監視サービスへ送信しないよう、テレメトリの境界を置き換える。
vi.doMock('@/shared/lib/sentryClient', () => ({ captureClientException: vi.fn() }));

const { cleanup } = await import('@testing-library/react');
beforeAll(() => i18n.init(i18nextInitOptions));
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
