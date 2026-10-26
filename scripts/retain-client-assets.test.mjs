import { createServer } from 'node:http';

import { expect, test } from 'vitest';

import { describeAsset, fetchPreviousAsset, retainClientAssets, retentionModuleName } from './retain-client-assets.mjs';

const day = 24 * 60 * 60 * 1000;
const file = (path, content) => ({ [path]: describeAsset(path, Buffer.from(content)) });
const version = (module) => ({ modules: [module] });
const history = (module) => JSON.parse(Buffer.from(module.content_base64, 'base64').toString('utf8'));

test('初回の旧JSと依存CSSを引き継ぎ、現役から外れた30日後にだけ削除する', async () => {
  const files = {
    '/_next/static/chunks/dialog-old.js': 'import "./shared.js"; export const version = "old";',
    '/_next/static/chunks/shared.js': 'export const shared = true;',
    '/_next/static/css/dialog-old.css': 'dialog { color: black; }',
  };
  const server = createServer((request, response) => {
    const content = files[request.url];
    response.writeHead(content === undefined ? 404 : 200, { 'content-type': 'text/plain' });
    response.end(content);
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  try {
    const old = {
      urls: [`http://127.0.0.1:${server.address().port}`],
      // ビルド済みWorkerと同じ形式の一覧を使い、実際のHTTP取得・ハッシュ計算を通す。
      modules: [
        {
          name: './vinext-client-assets.js',
          content_base64: Buffer.from(
            `export default ${JSON.stringify({ lazyChunks: ['_next/static/chunks/dialog-old.js', '_next/static/chunks/shared.js'] })};`,
          ).toString('base64'),
        },
        {
          name: './__vite_rsc_assets_manifest.js',
          content_base64: Buffer.from(
            `export default ${JSON.stringify({ css: ['/_next/static/css/dialog-old.css'] })};`,
          ).toString('base64'),
        },
      ],
    };
    const latest = {
      ...file('/_next/static/chunks/dialog-new.js', 'export const version = "new";'),
      ...file('/_next/static/chunks/shared.js', files['/_next/static/chunks/shared.js']),
      ...file('/index.html', '<html>new</html>'),
      ...file('/sw.js', '/* new */'),
      ...file('/_next/static/chunks/dialog-new.js.map', '{}'),
    };
    const first = await retainClientAssets(old, latest, 50 * day);
    expect(first.count).toBe(2);
    expect(first.manifest).toMatchObject(latest);
    for (const [path, content] of Object.entries(files)) {
      expect(first.manifest[path]).toEqual(describeAsset(path, Buffer.from(content)));
    }
    expect(history(first.module).retained['/_next/static/chunks/dialog-old.js'].expiresAt).toBe(80 * day);
    expect(history(first.module).current).not.toHaveProperty('/index.html');
    expect(history(first.module).current).not.toHaveProperty('/sw.js');
    expect(history(first.module).current).not.toHaveProperty('/_next/static/chunks/dialog-new.js.map');
    expect(first.module.name).toBe(retentionModuleName);

    // 以後のデプロイはバージョンURLも元ファイルも不要で、保存した一覧だけを再利用する。
    const next = file('/_next/static/chunks/dialog-next.js', 'export const version = "next";');
    const second = await retainClientAssets(version(first.module), next, 79 * day);
    expect(second.manifest['/_next/static/chunks/dialog-old.js']).toEqual(
      first.manifest['/_next/static/chunks/dialog-old.js'],
    );
    expect(history(second.module).retained['/_next/static/chunks/dialog-old.js'].expiresAt).toBe(80 * day);
    expect(second.manifest).not.toHaveProperty('/index.html');
    expect(second.manifest).not.toHaveProperty('/sw.js');
    expect(second.manifest).not.toHaveProperty('/_next/static/chunks/dialog-new.js.map');

    const third = await retainClientAssets(version(second.module), next, 80 * day);
    expect(third.manifest).not.toHaveProperty('/_next/static/chunks/dialog-old.js');
    expect(third.manifest).not.toHaveProperty('/_next/static/css/dialog-old.css');
    expect(third.manifest['/_next/static/chunks/dialog-new.js']).toEqual(latest['/_next/static/chunks/dialog-new.js']);
    expect(history(third.module).retained['/_next/static/chunks/dialog-new.js'].expiresAt).toBe(109 * day);

    await expect(fetchPreviousAsset(old, '/missing.js')).rejects.toThrow('404');
    await expect(retainClientAssets({ modules: [] }, latest)).rejects.toThrow('一覧が見つかりません');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
