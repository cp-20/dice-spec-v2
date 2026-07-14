import { fireEvent, render, screen } from '@testing-library/react';
import i18n from 'i18next';

import { i18nextInitOptions } from '@/locales/i18next';

import { DiceLogListView } from './DiceLogListView';

beforeAll(() => i18n.init(i18nextInitOptions));

test('ダイスログを100件ずつ表示する', async () => {
  const results = Array.from({ length: 201 }, (_, index) => ({
    evaluationStatus: 'success',
    fullStr: `log-${index}`,
  }));

  render(<DiceLogListView results={results} />);
  expect(screen.getByText('log-99')).toBeTruthy();
  expect(screen.queryByText('log-100')).toBeNull();

  fireEvent.click(screen.getByRole('button', { name: 'もっと見る' }));
  expect(await screen.findByText('log-100')).toBeTruthy();
  expect(screen.queryByText('log-200')).toBeNull();
});
