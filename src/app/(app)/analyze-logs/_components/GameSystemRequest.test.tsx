import { fireEvent, render, screen } from '@testing-library/react';

import { useGameSystemRequestDialog } from './GameSystemRequest';

const Harness = () => {
  const dialog = useGameSystemRequestDialog();
  return (
    <>
      <button onClick={dialog.open}>開く</button>
      {dialog.render()}
    </>
  );
};

test('ダイアログのラベルからゲームシステム名の入力欄を操作できる', () => {
  render(<Harness />);
  fireEvent.click(screen.getByRole('button', { name: '開く' }));

  const systemLabel = screen.getByText('ゲームシステム名');
  const systemInput = screen.getByLabelText('ゲームシステム名');
  expect((systemInput as HTMLInputElement).type).toBe('text');
  expect((systemLabel as HTMLLabelElement).htmlFor).toBe(systemInput.id);
});
