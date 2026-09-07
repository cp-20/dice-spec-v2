import { afterEach, beforeEach, expect, mock, test } from 'bun:test';

import { render, screen } from '@testing-library/react';
import i18n from 'i18next';

import type { CustomLinkProps } from '@/shared/components/elements/CustomLink';

mock.module('@/shared/components/elements/CustomLink', () => ({
  CustomLink: ({ children, ...props }: CustomLinkProps) => <a {...props}>{children}</a>,
}));

const { BottomNavigation } = await import('./BottomNavigation');

let originalLanguage: string;
beforeEach(() => {
  originalLanguage = i18n.language;
});
afterEach(async () => {
  await i18n.changeLanguage(originalLanguage);
});

test('英語のラベルとlocale付きのリンク先を表示する', async () => {
  await i18n.changeLanguage('en');
  render(<BottomNavigation active="/expect" />);

  expect(screen.getAllByRole('link').map((link) => [link.textContent, link.getAttribute('href')])).toEqual([
    ['Dice Expecter', '/en/expect'],
    ['Dice Roll', '/en/dice'],
    ['Log Analyzer', '/en/analyze-logs'],
    ['CCFOLIA Export', '/en/ccfolia'],
  ]);
});

test('日本語のラベルとlocaleなしのリンク先を表示する', async () => {
  await i18n.changeLanguage('ja');
  render(<BottomNavigation active="/expect" />);

  expect(screen.getByRole('link', { name: 'ダイス予測' }).getAttribute('href')).toBe('/expect');
});
