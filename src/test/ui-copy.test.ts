import { globSync, readFileSync } from 'node:fs';

// UI 文言の表記ゆれを機械的に防ぐ。ルールの正本は docs/ui-style-guide.md。
const files = globSync('src/**/*.{ts,tsx}', { exclude: (path) => /\.test\.tsx?$/.test(path) });

const rules = [
  { name: '有料プランは「PROプラン」と書く', pattern: /プロプラン|プロなら/ },
  { name: '日本語の文の疑問符は全角の「？」を使う', pattern: /[ぁ-んァ-ヶ一-龠][?](?![.:[(])/ },
];

test.each(rules)('$name', ({ pattern }) => {
  const violations = files.flatMap((file) =>
    readFileSync(file, 'utf8')
      .split('\n')
      .flatMap((line, index) => (pattern.test(line) ? [`${file}:${index + 1}: ${line.trim()}`] : [])),
  );
  expect(violations).toEqual([]);
});
