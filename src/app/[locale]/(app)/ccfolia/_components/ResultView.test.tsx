import { expect, mock, test } from 'bun:test';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const sendEvent = mock();
mock.module('@/shared/lib/useGoogleAnalytics', () => ({ useGoogleAnalytics: () => ({ sendEvent }) }));
mock.module('./hooks/useFormResult', () => ({ useFormResult: () => ({ formResult: 'character data' }) }));

test('クリップボードへのコピー結果を成功・失敗とも計測する', async () => {
  const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
  let shouldFail = false;
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText: async () => {
        if (shouldFail) throw new Error('copy failed');
      },
    },
  });

  try {
    const { ResultView } = await import('./ResultView');
    render(<ResultView />);

    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(sendEvent).toHaveBeenCalledWith('copy_ccfolia_character', { success: true }));

    shouldFail = true;
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(sendEvent).toHaveBeenCalledWith('copy_ccfolia_character', { success: false }));
  } finally {
    if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard);
    else delete (navigator as { clipboard?: Clipboard }).clipboard;
  }
});
