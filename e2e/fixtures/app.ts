import { test as base } from '@playwright/test';

declare global {
  interface Window {
    __NEXT_HYDRATED?: boolean;
  }
}

// 水和前の入力は React に届かず失われるため、正常に開けたページは vinext が水和完了時に立てる
// __NEXT_HYDRATED を待ってから操作する。
export const test = base.extend({
  page: async ({ page }, use) => {
    const waitForHydration = async (response: Awaited<ReturnType<typeof page.goto>>) => {
      if (response?.ok()) await page.waitForFunction(() => window.__NEXT_HYDRATED === true);
      return response;
    };
    const goto = page.goto.bind(page);
    const reload = page.reload.bind(page);
    page.goto = async (...args) => waitForHydration(await goto(...args));
    page.reload = async (...args) => waitForHydration(await reload(...args));
    await use(page);
  },
});

export { expect } from '@playwright/test';
