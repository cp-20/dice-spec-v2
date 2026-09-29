import { bindings, defineConfig, defineWorker } from 'cf/config';

export default defineConfig({
  worker: defineWorker({
    name: 'dice-spec-v2',
    entrypoint: 'vinext/server/fetch-handler',
    compatibilityDate: '2026-07-14',
    compatibilityFlags: ['nodejs_compat', 'global_fetch_strictly_public'],
    // 事前レンダリング結果の保存先は Worker 経由でだけ配信し、直接取得させない。
    assets: { notFoundHandling: 'none', runWorkerFirst: ['/_vinext/static-cache/*'] },
    env: {
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),
    },
    observability: { enabled: true },
    cache: { enabled: true },
  }),
});
