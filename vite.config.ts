import { createHash } from 'node:crypto';
import path from 'node:path';

import { cloudflare } from '@cloudflare/vite-plugin';
import mdx from '@mdx-js/rollup';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { staticAssetsAdapter } from '@vinext/cloudflare/cache/static-assets-adapter';
import { imagesOptimizer } from '@vinext/cloudflare/images/images-optimizer';
import vinext from 'vinext';
import { defineConfig } from 'vite';
import { patchCssModules } from 'vite-css-modules';
import svgr from 'vite-plugin-svgr';

import { buildEnv } from './src/shared/lib/env';

const sentryAuthToken = buildEnv.sentryAuthToken;

export default defineConfig({
  plugins: [
    patchCssModules({ exportMode: 'default' }),
    // vinext が自動登録する MDX プラグインは mdx-components.tsx を読まないため、明示的に登録する。
    { enforce: 'pre', ...mdx({ providerImportSource: '@/mdx-components' }) },
    svgr(),
    vinext({
      cache: { cdn: staticAssetsAdapter() },
      prerender: { routes: '*' },
      images: { optimizer: imagesOptimizer() },
    }),
    cloudflare({
      viteEnvironment: {
        name: 'rsc',
        childEnvironments: ['ssr'],
      },
    }),
    sentryVitePlugin({
      org: 'cp20',
      project: 'javascript-nextjs',
      authToken: sentryAuthToken,
      silent: !buildEnv.ci,
      sourcemaps: { filesToDeleteAfterUpload: ['dist/**/*.map'] },
      bundleSizeOptimizations: { excludeDebugStatements: true },
    }),
  ],
  build: {
    // bcdice のゲームシステムは可変パスの import() で読み込むため、node_modules の中でも bcdice だけは展開対象にする。
    dynamicImportVarsOptions: { exclude: [/node_modules\/(?!(\.pnpm\/bcdice@[^/]+\/node_modules\/)?bcdice\/)/] },
    // ソースマップは Sentry へアップロードする場合だけ生成し、アップロード後に削除する。
    sourcemap: sentryAuthToken ? 'hidden' : false,
  },
  css: {
    modules: {
      generateScopedName(name: string, filename: string) {
        const relativePath = path.relative(import.meta.dirname, filename.replace(/\?.*$/, '')).replaceAll('\\', '/');
        return `_${name}_${createHash('sha256').update(relativePath).digest('hex').slice(0, 7)}`;
      },
    },
  },
});
