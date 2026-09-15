import { fireEvent, render, screen } from '@testing-library/react';
import i18n from 'i18next';

import { sendGameSystemRequest } from '@/shared/lib/webhook';

import { useGameSystemRequestDialog } from './GameSystemRequest';

vi.mock('@/shared/lib/webhook', () => ({ sendGameSystemRequest: vi.fn<typeof sendGameSystemRequest>() }));

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

  const systemLabel = screen.getByText(i18n.t('analyze-logs:game-system-request:system'));
  const systemInput = screen.getByLabelText(i18n.t('analyze-logs:game-system-request:system'));
  expect((systemInput as HTMLInputElement).type).toBe('text');
  expect((systemLabel as HTMLLabelElement).htmlFor).toBe(systemInput.id);
  expect(sendGameSystemRequest).not.toHaveBeenCalled();
});
