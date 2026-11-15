const named = (error: unknown) => {
  if (typeof error === 'string') return { name: '', message: error };
  if (error !== null && typeof error === 'object' && 'message' in error) {
    const record = error as { name?: unknown; message?: unknown };
    return {
      name: typeof record.name === 'string' ? record.name : '',
      message: typeof record.message === 'string' ? record.message : '',
    };
  }
  return { name: '', message: '' };
};

// デプロイをまたいだ古いチャンクと、LINE 内ブラウザがモジュールを解釈できない失敗。
const chunkLoadMessages = [
  'Failed to fetch dynamically imported module',
  'Importing a module script failed',
  'error loading dynamically imported module',
  'Importing binding name',
];

export const isChunkLoadError = (error: unknown) => {
  const { message } = named(error);
  return chunkLoadMessages.some((part) => message.includes(part)) || /Loading chunk [\w-]+ failed/.test(message);
};

// クリップボードの許可拒否・非対応・フォーカス喪失。呼び出し元が利用者へ案内する。
export const isExpectedClipboardFailure = (error: unknown) => {
  const { name, message } = named(error);
  if (name === 'TypeError') return /clipboard|readText|writeText/i.test(message);
  if (name !== 'NotAllowedError' && name !== 'SecurityError' && name !== 'NotSupportedError') return false;
  return /clipboard|readText|writeText|not allowed by the user agent|not supported/i.test(message);
};

// Chromium 系が IndexedDB を閉じる・削除できないときのブラウザ内部エラー。
export const isEnvironmentalIndexedDbError = (error: unknown) => {
  const { name, message } = named(error);
  if (name === 'AbortError' && message === 'AbortError') return true;
  if (name !== 'UnknownError') return false;
  return /Internal inconsistency|deleting database|Connection is closing/i.test(message);
};

// LINE 内ブラウザはモジュール束縛が壊れると、無関係な関数から Invalid hook call になる。
export const isLineInAppInvalidHookCall = (error: unknown) => {
  const { message } = named(error);
  if (!message.startsWith('Invalid hook call')) return false;
  return typeof navigator !== 'undefined' && /Line\//i.test(navigator.userAgent);
};

export const shouldReportClientException = (error: unknown) =>
  !isChunkLoadError(error) &&
  !isExpectedClipboardFailure(error) &&
  !isEnvironmentalIndexedDbError(error) &&
  !isLineInAppInvalidHookCall(error);

// stack がない例外は捕捉箇所にまとまるため、メッセージを分類キーに加える。
export const clientExceptionFingerprint = (error: unknown): string[] => {
  const { name, message } = named(error);
  const label = name ? `${name}: ${message}` : message || String(error);
  return ['{{ default }}', label];
};

export const hasExceptionStack = (error: unknown) =>
  error instanceof Error && error.stack !== undefined && error.stack !== '';
