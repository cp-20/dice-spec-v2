import { bindings, defineConfig, defineWorker } from 'cf/config';

// E2E の専用ビルドだけにローカル接続先を渡し、デプロイ用の設定には含めない。
const stripeE2eBindings =
  process.env.STRIPE_E2E === 'true'
    ? Object.fromEntries(
        [
          'STRIPE_SECRET_KEY',
          'STRIPE_WEBHOOK_SECRET',
          'FIRESTORE_EMULATOR_HOST',
          'STRIPE_DISCORD_WEBHOOK_URL',
          'STRIPE_AUDIT_DISCORD_WEBHOOK_URL',
        ].map((name) => [name, bindings.secret()]),
      )
    : {};

export default defineConfig({
  worker: defineWorker({
    name: 'dice-spec-v2',
    entrypoint: 'vinext/server/fetch-handler',
    compatibilityDate: '2026-07-14',
    compatibilityFlags: ['nodejs_compat', 'global_fetch_strictly_public'],
    // 事前レンダリング結果の保存先は Worker 経由でだけ配信し、直接取得させない。
    assets: { notFoundHandling: 'none', runWorkerFirst: ['/_vinext/static-cache/*'] },
    env: {
      ...stripeE2eBindings,
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),
    },
    observability: { enabled: true },
    cache: { enabled: true },
  }),
});
