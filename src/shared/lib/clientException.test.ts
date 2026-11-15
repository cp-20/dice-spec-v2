import {
  clearChunkReloadGuard,
  clearChunkReloadGuardWhenDisplayed,
  reloadOnceOnChunkLoadError,
} from './chunkLoadRecovery';
import { clientExceptionFingerprint, isExpectedClipboardFailure, shouldReportClientException } from './clientException';

test('想定内のブラウザ失敗は送らず、別の例外は種類とメッセージで分ける', () => {
  const clipboard = new DOMException(
    "Failed to execute 'readText' on 'Clipboard': Read permission denied.",
    'NotAllowedError',
  );
  const database = new DOMException('Connection is closing because of: Internal inconsistency', 'UnknownError');
  const aborted = new DOMException('AbortError', 'AbortError');
  const chunk = new TypeError('Failed to fetch dynamically imported module: /_next/static/chunks/a.js');
  const binding = new SyntaxError("Importing binding name 'n' is not found.");
  const bug = new Error('評価失敗');

  expect(isExpectedClipboardFailure(new TypeError("Cannot read properties of undefined (reading 'readText')"))).toBe(
    true,
  );
  expect(shouldReportClientException(clipboard)).toBe(false);
  expect(shouldReportClientException(database)).toBe(false);
  expect(shouldReportClientException(aborted)).toBe(false);
  expect(shouldReportClientException(chunk)).toBe(false);
  expect(shouldReportClientException(binding)).toBe(false);
  expect(shouldReportClientException(bug)).toBe(true);
  expect(shouldReportClientException(new DOMException('geolocation denied', 'NotAllowedError'))).toBe(true);
  expect(shouldReportClientException(new DOMException('The operation was aborted.', 'AbortError'))).toBe(true);
  expect(clientExceptionFingerprint(database)).toEqual([
    '{{ default }}',
    'UnknownError: Connection is closing because of: Internal inconsistency',
  ]);
  expect(clientExceptionFingerprint(bug)).toEqual(['{{ default }}', 'Error: 評価失敗']);
});

test('LINE 内ブラウザの Invalid hook call だけ送らない', () => {
  const hook = new Error('Invalid hook call. Hooks can only be called inside of the body of a function component.');
  expect(shouldReportClientException(hook)).toBe(true);
  const userAgent = vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Line/26.16.1');
  try {
    expect(shouldReportClientException(hook)).toBe(false);
  } finally {
    userAgent.mockRestore();
  }
});

test('同じ URL のチャンク読み込み失敗は一度だけ再読み込みする', () => {
  vi.useFakeTimers();
  const reload = vi.fn<() => void>();
  vi.stubGlobal('location', { pathname: '/dice', search: '', reload });
  sessionStorage.clear();
  const error = new TypeError('Importing a module script failed.');
  try {
    expect(reloadOnceOnChunkLoadError(error)).toBe(true);
    expect(reloadOnceOnChunkLoadError(error)).toBe(true);
    expect(reload).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(reload).toHaveBeenCalledTimes(1);
    expect(reloadOnceOnChunkLoadError(new Error('評価失敗'))).toBe(false);
  } finally {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    sessionStorage.clear();
  }
});

test('表示を確認するまでは時間が経過しても再読み込みを繰り返さない', () => {
  vi.useFakeTimers();
  const reload = vi.fn<() => void>();
  vi.stubGlobal('location', { pathname: '/dice', search: '', reload });
  sessionStorage.setItem('dicespec-chunk-reload', '/dice');
  const error = new TypeError('Failed to fetch dynamically imported module: /a.js');
  try {
    vi.advanceTimersByTime(12_000);
    expect(sessionStorage.getItem('dicespec-chunk-reload')).toBe('/dice');
    expect(reloadOnceOnChunkLoadError(error)).toBe(true);
    vi.runAllTimers();
    expect(reload).not.toHaveBeenCalled();
    clearChunkReloadGuard();
    expect(sessionStorage.getItem('dicespec-chunk-reload')).toBe('/dice');
  } finally {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    sessionStorage.clear();
  }
});

test('表示を確認したあとは次のチャンク失敗で再び一度だけ再読み込みできる', () => {
  vi.useFakeTimers();
  const reload = vi.fn<() => void>();
  const view = window as Window & { __NEXT_HYDRATED?: boolean; __NEXT_HYDRATED_CB?: () => void };
  vi.stubGlobal('location', { pathname: '/expect', search: '', reload });
  sessionStorage.setItem('dicespec-chunk-reload', '/expect');
  view.__NEXT_HYDRATED = true;
  try {
    clearChunkReloadGuardWhenDisplayed();
    expect(sessionStorage.getItem('dicespec-chunk-reload')).toBeNull();
    expect(reloadOnceOnChunkLoadError(new TypeError('Failed to fetch dynamically imported module: /a.js'))).toBe(true);
    vi.runAllTimers();
    expect(reload).toHaveBeenCalledTimes(1);
  } finally {
    view.__NEXT_HYDRATED = false;
    view.__NEXT_HYDRATED_CB = undefined;
    vi.useRealTimers();
    vi.unstubAllGlobals();
    sessionStorage.clear();
  }
});
