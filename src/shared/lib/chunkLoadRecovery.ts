import { isChunkLoadError } from './clientException';

const storageKey = 'dicespec-chunk-reload';

type HydrationWindow = Window & {
  __NEXT_HYDRATED?: boolean;
  __NEXT_HYDRATED_CB?: () => void;
};

const pageKey = () => `${location.pathname}${location.search}`;

let failedThisLoad = false;

// 失敗した import() は再描画では取れない。同じ URL では一度だけ読み直す。
export const reloadOnceOnChunkLoadError = (error: unknown) => {
  if (!isChunkLoadError(error)) return false;
  failedThisLoad = true;
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

// この読み込みでチャンク取得に失敗したあとは、水和完了でも記録を消さない。
export const clearChunkReloadGuard = () => {
  if (failedThisLoad) return;
  try {
    sessionStorage.removeItem(storageKey);
  } catch {
    // ストレージを使えない環境では再読み込みの記録も残らない。
  }
};

export const clearChunkReloadGuardWhenDisplayed = () => {
  failedThisLoad = false;
  const view = window as HydrationWindow;
  const previous = view.__NEXT_HYDRATED_CB;
  view.__NEXT_HYDRATED_CB = () => {
    previous?.();
    clearChunkReloadGuard();
  };
  if (view.__NEXT_HYDRATED) clearChunkReloadGuard();
};
