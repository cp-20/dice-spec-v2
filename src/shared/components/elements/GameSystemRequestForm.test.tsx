import { render, screen } from '@testing-library/react';
import i18n from 'i18next';

import { GameSystemRequestForm } from './GameSystemRequestForm';

test('ラベルからゲームシステム名とログファイルの入力欄を操作できる', () => {
  render(<GameSystemRequestForm />);

  const systemInput = screen.getByLabelText(i18n.t('analyze-logs:game-system-request:system'));
  expect((systemInput as HTMLInputElement).type).toBe('text');
  expect((screen.getByText(i18n.t('analyze-logs:game-system-request:system')) as HTMLLabelElement).htmlFor).toBe(
    systemInput.id,
  );
  expect(screen.getByLabelText(i18n.t('analyze-logs:game-system-request:logs')).getAttribute('type')).toBe('file');
});
