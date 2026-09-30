import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = mkdtempSync(join(tmpdir(), 'dice-spec-deploy-'));
const secretsFile = join(directory, 'secrets.json');
const cf = fileURLToPath(new URL('./bin/cf', import.meta.resolve('cf/package.json')));

try {
  // cf は --secrets-file を指定した場合だけ、通常のデプロイでも既存シークレットを引き継ぐ。
  writeFileSync(secretsFile, '{}', { mode: 0o600 });
  const result = spawnSync(
    process.execPath,
    [cf, 'deploy', '--mode', 'production', '--secrets-file', secretsFile, ...process.argv.slice(2)],
    { stdio: 'inherit' },
  );
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  rmSync(directory, { recursive: true, force: true });
}
