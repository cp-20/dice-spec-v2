import { expect, test } from 'bun:test';

import { fireEvent, render, screen } from '@testing-library/react';
import i18n from 'i18next';

import { i18nextInitOptions } from '@/locales/i18next';
import { Toaster } from '@/shared/components/ui/toaster';

import { UploadLogFileButton } from './UploadLogFileButton';

test('ファイルを読み込めない場合は未処理にせずエラーを表示する', async () => {
  await i18n.init(i18nextInitOptions);
  const OriginalFileReader = globalThis.FileReader;
  const originalConsoleError = console.error;

  class FailingFileReader extends EventTarget {
    error = new DOMException('File not found', 'NotFoundError');

    readAsText() {
      this.dispatchEvent(new ProgressEvent('error'));
    }
  }

  globalThis.FileReader = FailingFileReader as unknown as typeof FileReader;
  console.error = () => undefined;

  try {
    render(
      <>
        <UploadLogFileButton />
        <Toaster />
      </>,
    );

    const input = document.querySelector<HTMLInputElement>('#log-file-uploader');
    expect(input).not.toBeNull();
    fireEvent.change(input!, { target: { files: [new File(['log'], 'log.html', { type: 'text/html' })] } });

    expect(await screen.findByText(i18n.t('analyze-logs:error'))).toBeTruthy();
  } finally {
    globalThis.FileReader = OriginalFileReader;
    console.error = originalConsoleError;
  }
});
