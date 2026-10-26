import { spawnSync } from 'node:child_process';

import { afterEach, expect, test, vi } from 'vitest';

// 本番へのアップロードは実行せず、CLI と Cloudflare API の外部境界を再現する。
vi.mock('node:child_process', () => ({ spawnSync: vi.fn() }));
vi.mock('node:fs', async (importOriginal) => {
  const fs = await importOriginal();
  return {
    ...fs,
    readFileSync: (path, ...args) =>
      String(path).endsWith('worker.config.json') ? '{"name":"dice-spec-test"}' : fs.readFileSync(path, ...args),
  };
});

const argv = process.argv;
const versionId = 'c7e92dda-12c0-4871-8403-6bf7b2bc5e16';
afterEach(() => {
  process.argv = argv;
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

test.each(['stdout', 'stderr'])(
  '%s のアップロード結果からバージョンを検証し、検証失敗時は公開しない',
  async (stream) => {
    vi.resetModules();
    process.argv = [...argv.slice(0, 2), '--prebuilt'];
    vi.stubEnv('CLOUDFLARE_API_TOKEN', 'test-token');
    vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
    const stdout = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const stderr = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    const result = (value) => ({ status: 0, stdout: JSON.stringify(value), stderr: '' });
    spawnSync
      .mockReturnValueOnce(result({ deployments: [{ versions: [{ version_id: versionId, percentage: 100 }] }] }))
      .mockReturnValueOnce(result({ bindings: [{ name: 'SECRET', type: 'secret_text' }] }))
      .mockReturnValueOnce({ status: 0, stdout: '', stderr: '', [stream]: `│  Worker Version ID: ${versionId}\n` });
    const fetch = vi.fn().mockRejectedValue(new Error('検証APIの接続失敗'));
    vi.stubGlobal('fetch', fetch);

    await expect(import('./deploy.mjs')).rejects.toThrow('検証APIの接続失敗');
    expect(fetch).toHaveBeenCalledWith(
      `https://api.cloudflare.com/client/v4/accounts/test-account/workers/workers/dice-spec-test/versions/${versionId}?include=modules`,
      expect.objectContaining({ method: 'GET' }),
    );
    expect(spawnSync).toHaveBeenCalledTimes(3);
    expect(stream === 'stdout' ? stdout : stderr).toHaveBeenCalledWith(`│  Worker Version ID: ${versionId}\n`);
  },
);
