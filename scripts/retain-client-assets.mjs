import { createRequire } from 'node:module';
import { extname } from 'node:path';

const { hash } = createRequire(import.meta.resolve('cf/package.json'))('blake3-wasm');
export const retentionModuleName = 'client-assets-retention.json';
const retentionMs = 30 * 24 * 60 * 60 * 1000;
const isClientAsset = (path) => path.startsWith('/_next/static/') && !path.endsWith('.map');

export const describeAsset = (path, content) => ({
  hash: hash(content.toString('base64') + extname(path).slice(1))
    .toString('hex')
    .slice(0, 32),
  size: content.length,
});

export async function fetchPreviousAsset(version, path) {
  if (!version.urls?.[0]) throw new Error('旧アセットの取得に必要なバージョンURLがありません。');
  const response = await fetch(new URL(path, version.urls[0]), {
    redirect: 'error',
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`旧アセットを取得できません (${response.status}): ${path}`);
  return { content: Buffer.from(await response.arrayBuffer()), contentType: response.headers.get('content-type') };
}

async function bootstrapAssets(version) {
  // 初回も稼働中の画面を保護するため、生成済みのクライアント一覧から旧JS・CSSを復元する。
  const modules = ['./vinext-client-assets.js', './__vite_rsc_assets_manifest.js'].map((name) => {
    const entry = version.modules.find((module) => module.name === name);
    if (!entry) throw new Error(`旧アセットの一覧が見つかりません: ${name}`);
    return Buffer.from(entry.content_base64, 'base64').toString('utf8');
  });
  const paths = [...new Set([...modules.join('\n').matchAll(/"\/?(_next\/static\/[^"\\]+)"/g)].map((m) => `/${m[1]}`))];
  if (paths.length === 0) throw new Error('旧アセットの一覧が空のため、デプロイを中止しました。');
  const current = {};
  // 同時取得数を制限し、初回の移行で配信先へ集中アクセスしない。
  const pending = paths.filter(isClientAsset).values();
  await Promise.all(
    Array.from({ length: 8 }, async () => {
      for (const path of pending) {
        const { content } = await fetchPreviousAsset(version, path);
        current[path] = describeAsset(path, content);
      }
    }),
  );
  return { current, retained: {} };
}

export async function retainClientAssets(previous, manifest, now = Date.now()) {
  const stored = previous.modules.find((module) => module.name === retentionModuleName);
  const history = stored
    ? JSON.parse(Buffer.from(stored.content_base64, 'base64').toString('utf8'))
    : await bootstrapAssets(previous);
  const current = Object.fromEntries(Object.entries(manifest).filter(([path]) => isClientAsset(path)));
  const retained = { ...history.retained };
  // 公開からの日数ではなく、現役の一覧から外れた時点を保持期間の起点にする。
  for (const [path, asset] of Object.entries(history.current)) {
    retained[path] = { ...asset, expiresAt: now + retentionMs };
  }
  for (const [path, asset] of Object.entries(retained)) {
    if (!isClientAsset(path) || path in current || asset.expiresAt <= now) delete retained[path];
  }
  return {
    manifest: {
      ...Object.fromEntries(Object.entries(retained).map(([path, { hash, size }]) => [path, { hash, size }])),
      ...manifest,
    },
    module: {
      name: retentionModuleName,
      content_type: 'text/plain',
      content_base64: Buffer.from(JSON.stringify({ current, retained })).toString('base64'),
    },
    count: Object.keys(retained).length,
  };
}
