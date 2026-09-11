import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    globals: true,
    include: ['src/**/*.test.{ts,tsx}', 'firebase/*.rules.test.ts'],
    setupFiles: ['./src/test/happy-dom.ts'],
  },
});
