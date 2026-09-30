import { render, screen } from '@testing-library/react';

import { GameSystemRequestForm } from './GameSystemRequestForm';

test('ラベルからゲームシステム名とログファイルの入力欄を操作できる', () => {
  render(<GameSystemRequestForm />);

  const systemInput = screen.getByLabelText('ゲームシステム名');
  expect((systemInput as HTMLInputElement).type).toBe('text');
  expect((screen.getByText('ゲームシステム名') as HTMLLabelElement).htmlFor).toBe(systemInput.id);
  expect(screen.getByLabelText('ログファイル (任意)').getAttribute('type')).toBe('file');
});
