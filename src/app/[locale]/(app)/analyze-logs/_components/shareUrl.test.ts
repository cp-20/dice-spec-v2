import { expect, test } from 'bun:test';

import { getShareUrl } from './shareUrl';

test('各SNSへ日本語・改行・ハッシュタグと画像リンクを欠落なく渡す', () => {
  const text = '解析結果 & 成功率: 50%\n#ダイススペック';
  const url = 'https://dicespec.app/analyze-logs?ogp=abc-123';
  const x = new URL(getShareUrl('X', text, url));
  expect(x.origin + x.pathname).toBe('https://twitter.com/intent/tweet');
  expect(x.searchParams.get('text')).toBe(text);
  expect(x.searchParams.get('url')).toBe(url);
  const bluesky = new URL(getShareUrl('Bluesky', text, url));
  expect(bluesky.origin + bluesky.pathname).toBe('https://bsky.app/intent/compose');
  expect(bluesky.searchParams.get('text')).toBe(`${text}\n${url}`);
});
