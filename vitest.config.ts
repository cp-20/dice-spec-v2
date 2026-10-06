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
    projects: [
      {
        test: {
          name: 'app',
          include: ['src/**/*.test.{ts,tsx}'],
          setupFiles: ['./src/test/happy-dom.ts'],
        },
      },
      {
        // Rules テストは DOM を必要とせず、Firebase SDK の Node 向け通信を使う。
        test: { name: 'firebase-rules', include: ['firebase/*.rules.test.ts'] },
      },
    ],
  },
});
