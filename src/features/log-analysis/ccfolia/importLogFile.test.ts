import { readFileSync } from 'node:fs';

import { strToU8, zipSync } from 'fflate';

import { detectSystem } from './detector';
import { parseHtmlLog } from './htmlParser';
import { importLogFile, MAX_LOG_FILE_BYTES } from './importLogFile';
import { analyzeCcfoliaLog } from './index';
import { parseJsonLog } from './jsonParser';
import { mergeStructuredLogs } from './structuredLog';

const fixture = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');
const oldHtml = fixture('old.html');
const newHtml = fixture('new.html');
const json = fixture('new.json');
const archive = (entries: Record<string, string>) =>
  new File(
    [zipSync(Object.fromEntries(Object.entries(entries).map(([name, content]) => [name, strToU8(content)])))],
    'session.zip',
  );

// v1.37.3の公式出力テンプレートに合わせ、画像・編集表示・本文・結果を別要素にしている。
// https://docs.ccfolia.com/update/v1.37
// https://docs.ccfolia.com/developer-api/message-logs-json
for (const [name, content] of [
  ['old.html', oldHtml],
  ['new.html', newHtml],
  ['new.json', json],
]) {
  test(`${name}から同じ判定・技能・集計結果を取得する`, async () => {
    const { logs } = await importLogFile(new File([content], name));
    expect(detectSystem(logs)).toBe('CoC7th');
    const [all] = analyzeCcfoliaLog('CoC7th', logs);
    expect(all.summary.diceRollCount).toBe(2);
    expect(all.summary.successRate).toBe(50);
    expect(all.results.map((r) => r.skillName)).toEqual(['聞き耳', '図書館']);
    expect(analyzeCcfoliaLog('CoC7th', logs, ['[info]'])[0].summary.diceRollCount).toBe(1);
    expect(logs).toHaveLength(2);
    expect(logs[0].message).not.toContain('編集済');
  });
}

test('HTML ZIPは全タブの分割ファイルだけを読み込む', async () => {
  const doc = new DOMParser().parseFromString(newHtml, 'text/html');
  const channelHtml = (index: number) =>
    `<main class="message-list"><h1 class="log-title">卓 [タブ]</h1>${doc.querySelectorAll('article')[index].outerHTML}</main>`;
  const result = await importLogFile(
    archive({
      '卓[すべて]_1.html': channelHtml(0),
      '卓[すべて]_2.html': channelHtml(1),
      '卓[メイン].html': channelHtml(0),
      '卓[情報].html': channelHtml(1),
      '__MACOSX/._log.html': 'metadata',
      'image.png': 'unused',
    }),
  );
  expect(result.logs).toHaveLength(2);
  expect(result.duplicateCount).toBe(0);
});

test('旧HTML ZIPも「すべて」があれば各タブを読み込まない', async () => {
  const result = await importLogFile(
    archive({
      '卓[すべて].html': oldHtml,
      '卓[メイン].html': oldHtml,
      '卓[情報].html': 'invalid',
    }),
  );
  expect(result.logs).toEqual(parseHtmlLog(oldHtml));
});

test('「すべて」がなければ各タブを読み込む', async () => {
  const result = await importLogFile(archive({ '卓[メイン].html': oldHtml, '卓[情報].html': oldHtml }));
  expect(result.logs).toEqual([...parseHtmlLog(oldHtml), ...parseHtmlLog(oldHtml)]);
});

test('分割JSON ZIPと旧HTML ZIPを読み込む', async () => {
  const { messages } = JSON.parse(json);
  const result = await importLogFile(
    archive({
      'session_log_1.json': JSON.stringify({ messages: [messages[0]] }),
      'session_log_2.json': JSON.stringify({ messages: [messages[1]] }),
    }),
  );
  expect(result.logs).toEqual(parseJsonLog(json));
  expect((await importLogFile(archive({ 'old.html': oldHtml }))).logs).toEqual(parseHtmlLog(oldHtml));
});

test('新HTMLとJSONの重複を除き、同一ファイル内の繰り返しと異なる日時の同じ出目を残す', () => {
  const logs = parseJsonLog(json);
  const repeated = [logs[0], logs[0], { ...logs[0], createdAt: logs[0].createdAt! + 1 }];
  expect(mergeStructuredLogs([parseHtmlLog(newHtml), logs])).toMatchObject({ logs, duplicateCount: 2 });
  const merged = mergeStructuredLogs([repeated, repeated]);
  expect(merged.logs).toHaveLength(3);
  expect(merged.duplicateCount).toBe(3);
});

test('タブ別HTMLはタイトルから独自タブ名を読み、システム発言と改行を扱う', () => {
  const html = `<main class="message-list"><h1 class="log-title">卓 [相談]</h1>
    <article class="message" data-channel="custom-id"><span class="speaker">探索者</span><div class="message-text">1行目\n2行目 &lt;test&gt;</div></article>
    <article class="message system" data-channel="main"><div class="message-text">HP : 10 → 9</div></article></main>`;
  expect(parseHtmlLog(html)).toMatchObject([
    { tab: '[相談]', message: '1行目\n2行目 <test>' },
    { character: 'system', message: 'HP : 10 → 9' },
  ]);
});

test('JSONの秒タイムスタンプ、通常発言、シークレット連続ロールを処理する', () => {
  const message = JSON.parse(json).messages[0];
  const logs = parseJsonLog(
    JSON.stringify({
      messages: [
        { ...message, createdAt: 1788754800, text: '会話', extend: {} },
        {
          ...message,
          text: 'sx2 CC<=70 【聞き耳】',
          extend: {
            roll: {
              secret: true,
              result:
                '#1 (1D100<=70) ボーナス・ペナルティダイス[0] ＞ 20 ＞ 20 ＞ ハード成功\n#2 (1D100<=70) ボーナス・ペナルティダイス[0] ＞ 80 ＞ 80 ＞ 失敗',
            },
          },
        },
      ],
    }),
  );
  expect(logs[0].createdAt).toBe(1788754800000);
  expect(detectSystem(logs)).toBe('CoC7th');
  expect(analyzeCcfoliaLog('CoC7th', logs)[0].summary.diceRollCount).toBe(2);
});

for (const [file, code] of [
  [new File(['x'], 'notes.txt'), 'unsupported'],
  [new File(['x'], 'broken.json'), 'invalid'],
  [new File(['{"messages":[{}]}'], 'broken.json'), 'invalid'],
  [new File(['<p>not a log</p>'], 'broken.html'), 'invalid'],
  [new File(['broken zip'], 'broken.zip'), 'invalid'],
  [new File(['{"messages":[]}'], 'empty.json'), 'empty'],
  [archive({ 'readme.txt': 'empty archive' }), 'empty'],
  [archive({ 'good.html': oldHtml, 'bad.json': '{}' }), 'invalid'],
] as const) {
  test(`${file.name}の${code}エラーを通知する`, async () => {
    await expect(importLogFile(file)).rejects.toMatchObject({ code });
  });
}

test('大きすぎるファイルとZIP展開サイズを読み込み前に拒否する', async () => {
  const file = new File(['x'], 'large.json');
  Object.defineProperty(file, 'size', { value: MAX_LOG_FILE_BYTES + 1 });
  await expect(importLogFile(file)).rejects.toMatchObject({ code: 'too-large' });
  const data = zipSync({ 'large.json': strToU8('{}') });
  const view = new DataView(data.buffer);
  for (let i = 0; i < data.length - 4; i++) {
    if (view.getUint32(i, true) === 0x02014b50) view.setUint32(i + 24, MAX_LOG_FILE_BYTES + 1, true);
  }
  await expect(importLogFile(new File([data], 'large.zip'))).rejects.toMatchObject({ code: 'too-large' });
});
