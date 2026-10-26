import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describeAsset, fetchPreviousAsset, retainClientAssets, retentionModuleName } from './retain-client-assets.mjs';

const cf = fileURLToPath(new URL('./bin/cf', import.meta.resolve('cf/package.json')));
const args = process.argv.slice(2);
const run = (command, capture = false) => {
  const result = spawnSync(process.execPath, command, {
    stdio: ['ignore', capture ? 'pipe' : 'inherit', capture === 'all' ? 'pipe' : 'inherit'],
    encoding: 'utf8',
  });
  if (capture === 'all') {
    process.stdout.write(result.stdout ?? '');
    process.stderr.write(result.stderr ?? '');
  }
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`コマンドが失敗しました: ${command[0]} (${result.status})`);
  return capture === 'all' ? result.stdout + result.stderr : result.stdout;
};

if (!args.includes('--prebuilt')) {
  const vite = fileURLToPath(new URL('./bin/vite.js', import.meta.resolve('vite/package.json')));
  run([vite, 'build']);
}

const directory = '.cloudflare/output/v0/workers/default';
const config = JSON.parse(readFileSync(join(directory, 'worker.config.json'), 'utf8'));
const deployments = JSON.parse(run([cf, 'workers', 'deployments', 'list', '--worker', config.name], true));
const versions = deployments.deployments[0]?.versions;
if (versions?.length !== 1 || versions[0].percentage !== 100) {
  throw new Error('シークレットの継承元には、トラフィックが100%の本番バージョンが必要です。');
}
const versionId = process.env.CLOUDFLARE_SECRETS_VERSION_ID ?? versions[0].version_id;
const version = JSON.parse(run([cf, 'workers', 'versions', 'get', versionId, '--worker-id', config.name], true));
const secrets = version.bindings.filter((binding) => binding.type === 'secret_text' || binding.type === 'secret_key');
if (secrets.length === 0) throw new Error('本番シークレットが見つからないため、デプロイを中止しました。');

const token = process.env.CLOUDFLARE_API_TOKEN;
const account = process.env.CLOUDFLARE_ACCOUNT_ID;
if (!token || !account) throw new Error('CLOUDFLARE_API_TOKEN と CLOUDFLARE_ACCOUNT_ID を設定してください。');
const api = async (path, body) => {
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': `cf-cli/${JSON.parse(readFileSync(fileURLToPath(import.meta.resolve('cf/package.json')), 'utf8')).version}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(
      `Cloudflare API が失敗しました (${response.status}, ${result.errors?.map((error) => `${error.code}: ${String(error.message).replace(/https?:\/\/\S+|[A-Za-z0-9_./+=-]{24,}/g, '[伏せ字]')}`).join(';')})`,
    );
  }
  return result.result;
};

// アセットのアップロードを CLI に任せ、シークレットを検証するまで本番へ切り替えない。
// cf のアップロードログは stderr に出るため、両方の出力からバージョンを確認する。
const uploadOutput = run(
  [
    cf,
    'workers',
    'versions',
    'create',
    '--mode',
    'production',
    '--prebuilt',
    ...args.filter((arg) => !['--prebuilt', '--no-promote'].includes(arg)),
  ],
  'all',
);
if (!args.includes('--dry-run')) {
  const stagedId = uploadOutput.match(/Version ID:\s*([a-f0-9-]{36})/)?.[1];
  if (!stagedId) throw new Error('アップロードしたバージョンを確認できません。');
  const staged = await api(`/workers/workers/${config.name}/versions/${stagedId}?include=modules`);
  const previous = await api(`/workers/workers/${config.name}/versions/${versions[0].version_id}?include=modules`);
  const manifest = {};
  for (const name of readdirSync(join(directory, 'assets'), { recursive: true })) {
    const path = join(directory, 'assets', name);
    if (
      !statSync(path).isFile() ||
      name.startsWith('.vite/') ||
      ['.assetsignore', '_headers', '_redirects'].includes(name)
    )
      continue;
    manifest[`/${name.replaceAll('\\', '/')}`] = describeAsset(path, readFileSync(path));
  }
  const retained = await retainClientAssets(previous, manifest);
  const assets = await api(`/workers/scripts/${config.name}/assets-upload-session`, { manifest: retained.manifest });
  // Cloudflare が再アップロードを要求した旧ファイルだけ、固定バージョンURLから取得する。
  for (const bucket of assets.buckets) {
    const form = new FormData();
    for (const assetHash of bucket) {
      const [path, expected] = Object.entries(retained.manifest).find(([, asset]) => asset.hash === assetHash) ?? [];
      if (!path || path in manifest) throw new Error('CLI でアップロードしたアセットと一致しません。');
      const { content, contentType } = await fetchPreviousAsset(previous, path);
      const actual = describeAsset(path, content);
      if (actual.hash !== expected.hash || actual.size !== expected.size) {
        throw new Error(`旧アセットの内容が一致しません: ${path}`);
      }
      form.append(
        assetHash,
        new Blob([content.toString('base64')], { type: contentType ?? 'application/octet-stream' }),
        assetHash,
      );
    }
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${account}/workers/assets/upload?base64=true`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${assets.jwt}` },
        body: form,
      },
    );
    const result = await response.json();
    if (!response.ok || !result.success)
      throw new Error(`旧アセットのアップロードに失敗しました (${response.status})。`);
    if (result.result.jwt) assets.jwt = result.result.jwt;
  }
  const uploaded = await api(`/workers/workers/${config.name}/versions?deploy=false`, {
    main_module: staged.main_module,
    modules: [...staged.modules.filter((module) => module.name !== retentionModuleName), retained.module],
    assets: { ...staged.assets, jwt: assets.jwt },
    compatibility_date: staged.compatibility_date,
    compatibility_flags: staged.compatibility_flags,
    cache_options: staged.cache_options,
    // 旧 API は latest 以外から継承できないため、新 API で稼働中の本番シークレットを指定する。
    bindings: [
      ...staged.bindings.filter((binding) => !['secret_text', 'secret_key'].includes(binding.type)),
      ...secrets.map(({ name }) => ({ name, type: 'inherit', version_id: versionId })),
    ],
  });
  if (
    secrets.some(
      (secret) => !uploaded.bindings.some((binding) => binding.name === secret.name && binding.type === secret.type),
    )
  ) {
    throw new Error('本番シークレットの継承を確認できないため、公開を中止しました。');
  }
  console.log(`本番シークレット${secrets.length}個の継承を確認しました。Version ID: ${uploaded.id}`);
  console.log(`旧クライアントアセット${retained.count}個を30日間保持します。`);
  if (!args.includes('--no-promote')) {
    const current = JSON.parse(run([cf, 'workers', 'deployments', 'list', '--worker', config.name], true));
    if (current.deployments[0]?.id !== deployments.deployments[0].id) {
      throw new Error('本番デプロイが変更されたため、公開を中止しました。');
    }
    run([
      cf,
      'workers',
      'deployments',
      'create',
      '--worker',
      config.name,
      '--strategy',
      'percentage',
      '--versions',
      JSON.stringify([{ version_id: uploaded.id, percentage: 100 }]),
    ]);
  }
}
