import { isChunkLoadError } from './clientException';

const storageKey = 'dicespec-chunk-reload';

const pageKey = () => `${location.pathname}${location.search}`;

// 失敗した import() は再描画では取れない。同じ URL では一度だけ読み直す。
export const reloadOnceOnChunkLoadError = (error: unknown) => {
  if (!isChunkLoadError(error)) return false;
  try {
    if (sessionStorage.getItem(storageKey) === pageKey()) return true;
    sessionStorage.setItem(storageKey, pageKey());
  } catch {
    return true;
  }
  // 進行中の読み込みを中断しないよう、現在のターンが終わってから再読み込みする。
  window.setTimeout(() => window.location.reload(), 0);
  return true;
};

export const clearChunkReloadGuard = () => {
  window.setTimeout(() => {
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      // ストレージを使えない環境では再読み込みの記録も残らない。
    }
  }, 10_000);
};
