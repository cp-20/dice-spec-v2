import { expect, test } from 'bun:test';

import type { MouseEvent } from 'react';

import { shouldStartNavigation } from './NavigationProgress';

const navigationClick = (href: string, overrides: Record<string, unknown> = {}) => {
  const link = document.createElement('a');
  link.href = new URL(href, 'https://dicespec.test').href;
  const event = {
    currentTarget: link,
    defaultPrevented: false,
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    ...overrides,
  } as MouseEvent<HTMLAnchorElement>;
  return shouldStartNavigation(event, {
    href: 'https://dicespec.test/ja/dice',
    origin: 'https://dicespec.test',
    pathname: '/ja/dice',
    search: '',
  });
};

test('内部の別URLへの通常クリックだけで進捗を開始する', () => {
  expect(navigationClick('/ja/expect')).toBe(true);
  expect(navigationClick('/ja/dice')).toBe(false);
  expect(navigationClick('https://example.com/')).toBe(false);
  expect(navigationClick('/ja/expect', { metaKey: true })).toBe(false);
  expect(navigationClick('/ja/expect', { button: 1 })).toBe(false);
});
