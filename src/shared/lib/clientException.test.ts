import { clearChunkReloadGuard, reloadOnceOnChunkLoadError } from './chunkLoadRecovery';
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

test('ページ表示後は次のチャンク失敗で再び一度だけ再読み込みできる', () => {
  vi.useFakeTimers();
  const reload = vi.fn<() => void>();
  vi.stubGlobal('location', { pathname: '/expect', search: '', reload });
  sessionStorage.setItem('dicespec-chunk-reload', '/expect');
  try {
    clearChunkReloadGuard();
    vi.advanceTimersByTime(10_000);
    expect(sessionStorage.getItem('dicespec-chunk-reload')).toBeNull();
    expect(reloadOnceOnChunkLoadError(new TypeError('Failed to fetch dynamically imported module: /a.js'))).toBe(true);
    vi.runAllTimers();
    expect(reload).toHaveBeenCalledTimes(1);
  } finally {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    sessionStorage.clear();
  }
});
