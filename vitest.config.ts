import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
      // next パッケージは持たないため、vinext がビルド時に割り当てる互換実装をテストでも使う。
      { find: /^next\/([\w-]+)$/, replacement: 'vinext/shims/$1' },
    ],
  },
  test: {
    globals: true,
    include: ['src/**/*.test.{ts,tsx}', 'firebase/*.rules.test.ts'],
    setupFiles: ['./src/test/happy-dom.ts'],
  },
});
