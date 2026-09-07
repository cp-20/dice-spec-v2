import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';

const directory = process.argv[2] ?? '/tmp/406-benchmark-final';
const reports = await Promise.all(
  ['api', 'static', 'dynamic'].map(async (variant) => {
    let data;
    try {
      data = await readFile(`${directory}/${variant}.json`, 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      data = gunzipSync(await readFile(`${directory}/${variant}.json.gz`)).toString();
    }
    const report = JSON.parse(data);
    assert.ok(report.runs.length > 0 && report.runs.every((run) => run.errors.length === 0));
    return report;
  }),
);
const sum = (values) => values.reduce((total, value) => total + value, 0);
const quantile = (values, fraction) => [...values].sort((a, b) => a - b)[Math.ceil(values.length * fraction) - 1];
const stats = (values) => `${quantile(values, 0.5).toFixed(1)} / ${quantile(values, 0.95).toFixed(1)}`;
const kib = (bytes) => (bytes / 1024).toFixed(1);
const stages = ['navigation', 'open', 'select-first', 'roll-first'];
const chunksByStage = (report) => {
  const seen = new Set();
  return stages.map((name) => {
    const phase = report.runs[0].phases.find((p) => p.name === name);
    const paths = [...new Set(phase.requests.map((request) => new URL(request.url).pathname))].filter(
      (path) => report.sizes[path] && !seen.has(path),
    );
    paths.forEach((path) => seen.add(path));
    return {
      name,
      paths,
      ...Object.fromEntries(
        ['raw', 'gzip', 'brotli'].map((key) => [key, sum(paths.map((path) => report.sizes[path][key]))]),
      ),
    };
  });
};
const baseline = chunksByStage(reports[0]);
console.log('### 配信 JS（KiB、共有チャンクは URL で重複除外）\n');
console.log('| 構成 | 段階 | raw | gzip | Brotli | JS数 | gzip現行比 |');
console.log('|---|---|---:|---:|---:|---:|---:|');
for (const report of reports) {
  const rows = chunksByStage(report);
  rows.push({
    name: '初回ロールまで累積',
    paths: rows.flatMap((row) => row.paths),
    ...Object.fromEntries(['raw', 'gzip', 'brotli'].map((key) => [key, sum(rows.map((row) => row[key]))])),
  });
  for (const [index, row] of rows.entries()) {
    const base = baseline[index]?.gzip ?? sum(baseline.map((b) => b.gzip));
    console.log(
      `| ${report.variant} | ${row.name} | ${kib(row.raw)} | ${kib(row.gzip)} | ${kib(row.brotli)} | ${row.paths.length} | ${base ? `${(row.gzip / base).toFixed(3)}×` : '—'} |`,
    );
  }
}
console.log('\n### 全生成 JS（未取得チャンクを含む、KiB）\n');
console.log('| 構成 | チャンク数 | raw | gzip | Brotli |');
console.log('|---|---:|---:|---:|---:|');
for (const report of reports)
  console.log(
    `| ${report.variant} | ${Object.keys(report.sizes).length} | ${['raw', 'gzip', 'brotli'].map((key) => kib(sum(Object.values(report.sizes).map((size) => size[key])))).join(' | ')} |`,
  );
console.log(`\n### 読み込みとロール（ms、中央値 / p95、各条件${reports[0].runs.length / 4}回）\n`);
console.log(
  '| 条件 | 構成 | 遷移開始→一覧操作可 | 開く→一覧操作可 | 初選択→ロール可 | 初回ロール→表示 | 2回目→表示 | 別システム初切替 | 別システム初ロール | 読込済み再切替 |',
);
console.log('|---|---|---:|---:|---:|---:|---:|---:|---:|---:|');
for (const profile of ['normal', 'mobile'])
  for (const cache of ['cold', 'warm'])
    for (const report of reports) {
      const runs = report.runs.filter((run) => run.profile === profile && run.cache === cache);
      const values = (name, key = 'operationMs') =>
        runs.map((run) => run.phases.find((phase) => phase.name === name)[key]);
      const navigation = runs.map((run) => sum(run.phases.slice(0, 2).map((phase) => phase.ms)));
      console.log(
        `| ${profile}/${cache} | ${report.variant} | ${[navigation, values('open', 'ms'), ...['select-first', 'roll-first', 'roll-repeat', 'switch-new', 'roll-other', 'switch-back'].map((name) => values(name))].map(stats).join(' | ')} |`,
      );
    }
console.log('\n### 初回ロール完了まで（操作シナリオの合計 ms、中央値 / p95）\n');
console.log('| 条件 | 構成 | 遷移から初回表示 | 現行比（中央値） |');
console.log('|---|---|---:|---:|');
for (const profile of ['normal', 'mobile'])
  for (const cache of ['cold', 'warm']) {
    const totals = reports.map((report) =>
      report.runs
        .filter((run) => run.profile === profile && run.cache === cache)
        .map((run) => sum(run.phases.slice(0, 4).map((phase) => phase.ms))),
    );
    for (const [index, report] of reports.entries())
      console.log(
        `| ${profile}/${cache} | ${report.variant} | ${stats(totals[index])} | ${(quantile(totals[index], 0.5) / quantile(totals[0], 0.5)).toFixed(3)}× |`,
      );
  }
console.log('\n### 初回ロールまでの実受信（CDP、全リソース、中央値）\n');
console.log('| 条件 | 構成 | KiB | ネットワーク受信ありのリクエスト数 |');
console.log('|---|---|---:|---:|');
for (const profile of ['normal', 'mobile'])
  for (const cache of ['cold', 'warm'])
    for (const report of reports) {
      const requests = report.runs
        .filter((run) => run.profile === profile && run.cache === cache)
        .map((run) =>
          run.phases
            .slice(0, 4)
            .flatMap((phase) => phase.requests)
            .filter((request) => request.bytes > 0),
        );
      console.log(
        `| ${profile}/${cache} | ${report.variant} | ${kib(
          quantile(
            requests.map((items) => sum(items.map((item) => item.bytes))),
            0.5,
          ),
        )} | ${quantile(
          requests.map((items) => items.length),
          0.5,
        )} |`,
      );
    }
console.log('\n### ネットワーク区間と JS 実行（開く操作、ms、中央値 / p95）\n');
console.log('| 条件 | 構成 | 最初の取得開始→最後の取得完了 | ScriptDuration | TaskDuration |');
console.log('|---|---|---:|---:|---:|');
for (const profile of ['normal', 'mobile'])
  for (const cache of ['cold', 'warm'])
    for (const report of reports) {
      const phases = report.runs
        .filter((run) => run.profile === profile && run.cache === cache)
        .map((run) => run.phases.find((phase) => phase.name === 'open'));
      const spans = phases.map((phase) => {
        const requests = phase.requests.filter((request) => request.bytes > 0);
        return requests.length
          ? (Math.max(...requests.map((request) => request.end)) -
              Math.min(...requests.map((request) => request.start))) *
              1000
          : 0;
      });
      console.log(
        `| ${profile}/${cache} | ${report.variant} | ${stats(spans)} | ${stats(phases.map((phase) => phase.scriptMs))} | ${stats(phases.map((phase) => phase.taskMs))} |`,
      );
    }
