import { createRequire } from 'node:module';

const require = createRequire(import.meta.resolve('stylelint'));
const braces = createRequire(require.resolve('micromatch'))('braces');

test.each(['{', '('])('braces は %s の深いネストをスタック枯渇前に拒否する', (open) => {
  const close = open === '{' ? '}' : ')';
  // 既存の文字数上限（10,000文字）では防げないネストを検証する。
  const pattern = open.repeat(3_000) + 'a' + close.repeat(3_000);

  for (const method of ['parse', 'compile', 'expand', 'stringify']) {
    expect(() => braces[method](pattern)).toThrow(SyntaxError);
    expect(() => braces[method](open.repeat(3_000))).toThrow(SyntaxError);
  }
});

test('braces の通常の展開・正規表現化・文字列化を維持する', () => {
  expect(braces.expand('src/{a,{b,c}}.ts')).toEqual(['src/a.ts', 'src/b.ts', 'src/c.ts']);
  expect(new RegExp(`^${braces.compile('src/{a,{b,c}}.ts')}$`).test('src/c.ts')).toBe(true);
  expect(braces.stringify(braces.parse('src/{a,{b,c}}.ts'))).toBe('src/{a,{b,c}}.ts');
  expect(braces.stringify('{'.repeat(127) + 'a' + '}'.repeat(127))).toBe('{'.repeat(127) + 'a' + '}'.repeat(127));
});
