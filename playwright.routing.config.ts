import { defineConfig } from '@playwright/test';

const appOrigin = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3100';

export default defineConfig({
  testDir: './e2e/routing',
  testMatch: '**/*.e2e.ts',
  timeout: 60_000,
  forbidOnly: Boolean(process.env.CI),
  use: {
    baseURL: appOrigin,
    trace: 'retain-on-failure',
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'bun run start --hostname 127.0.0.1 --port 3100',
        url: appOrigin,
        reuseExistingServer: false,
        timeout: 60_000,
      },
});
