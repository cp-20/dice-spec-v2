import { render, screen } from '@testing-library/react';

import { BottomNavigation } from './BottomNavigation';

test('日本語のラベルとリンク先を表示する', () => {
  render(<BottomNavigation active="/expect" />);

  expect(screen.getAllByRole('link').map((link) => [link.textContent, link.getAttribute('href')])).toEqual([
    ['ダイス予測', '/expect'],
    ['ダイスロール', '/dice'],
    ['ログ解析', '/analyze-logs'],
    ['ココフォリア出力', '/ccfolia'],
  ]);
});
