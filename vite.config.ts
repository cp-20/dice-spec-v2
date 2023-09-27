import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom', // jsdomの代わりにhappy-domを設定した
    setupFiles: [],
    coverage: {
      provider: 'v8',
    },
    restoreMocks: true, // restore mocks before every tests run
  },
});
