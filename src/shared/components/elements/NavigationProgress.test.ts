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
    href: 'https://dicespec.test/dice',
    origin: 'https://dicespec.test',
    pathname: '/dice',
    search: '',
  });
};

test('内部の別URLへの通常クリックだけで進捗を開始する', () => {
  expect(navigationClick('/expect')).toBe(true);
  expect(navigationClick('/dice')).toBe(false);
  expect(navigationClick('https://example.com/')).toBe(false);
  expect(navigationClick('/expect', { metaKey: true })).toBe(false);
  expect(navigationClick('/expect', { button: 1 })).toBe(false);
});
