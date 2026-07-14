export type PageProgress = {
  requestedPages: number;
  loadedPages: number;
  attemptedPages: number;
  hasMore: boolean;
};

export const initialPageProgress = (): PageProgress => ({
  requestedPages: 1,
  loadedPages: 0,
  attemptedPages: 0,
  hasMore: true,
});

export const shouldFetchPage = (progress: PageProgress) =>
  progress.hasMore && progress.attemptedPages < progress.requestedPages;

export const requestNextPage = (progress: PageProgress): PageProgress => ({
  ...progress,
  requestedPages: progress.requestedPages + 1,
});

export const markPageLoaded = (progress: PageProgress, hasMore: boolean): PageProgress => ({
  ...progress,
  loadedPages: progress.loadedPages + 1,
  attemptedPages: progress.loadedPages + 1,
  hasMore,
});

export const markPageFailed = (progress: PageProgress): PageProgress => ({
  ...progress,
  attemptedPages: progress.requestedPages,
});

export const retryPage = (progress: PageProgress): PageProgress => ({
  ...progress,
  attemptedPages: progress.loadedPages,
});

export const resetLoadedPages = (progress: PageProgress): PageProgress => ({
  ...progress,
  loadedPages: 0,
  attemptedPages: 0,
  hasMore: true,
});
