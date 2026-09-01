import { afterEach, beforeAll, mock, vi } from 'bun:test';

import { GlobalRegistrator } from '@happy-dom/global-registrator';
import i18n from 'i18next';

import { i18nextInitOptions } from '@/locales/i18next';

GlobalRegistrator.register();
mock.module('@/shared/lib/sentryClient', () => ({ captureClientException: vi.fn() }));

const { cleanup } = await import('@testing-library/react');
beforeAll(() => i18n.init(i18nextInitOptions));
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
