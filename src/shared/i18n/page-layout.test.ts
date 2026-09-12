import { execFileSync } from 'node:child_process';

test('ルートレイアウトを読み込まずにページを開いても翻訳できる', () => {
  // 共通のテストセットアップによる初期化を引き継がず、コールドスタートを再現する。
  expect(() =>
    execFileSync(
      process.execPath,
      [
        '--import',
        'tsx',
        '--input-type=module',
        '-e',
        `
    import assert from 'node:assert/strict';
    import React from 'react';
    import { renderToStaticMarkup } from 'react-dom/server';
    import i18n from 'i18next';
    globalThis.React = React;
    assert.ok(!i18n.isInitialized);
    const { wrapPage } = await import('./src/shared/i18n/page-layout.tsx');
    const Page = wrapPage(() => React.createElement('h1', null, i18n.t('common:analyze-logs.title')));
    for (const [locale, title] of [['ja', 'ログ解析'], ['en', 'Log Analyzer'], ['ja', 'ログ解析']]) {
      const result = await Page({ params: Promise.resolve({ locale }) });
      assert.equal(renderToStaticMarkup(result), '<h1>' + title + '</h1>');
    }
  `,
      ],
      { cwd: process.cwd(), stdio: 'pipe' },
    ),
  ).not.toThrow();
});
