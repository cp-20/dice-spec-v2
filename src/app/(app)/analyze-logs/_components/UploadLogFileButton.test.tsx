import { fireEvent, render, screen } from '@testing-library/react';

import { Toaster } from '@/shared/components/ui/toaster';

import { UploadLogFileButton } from './UploadLogFileButton';

test('ファイルを読み込めない場合は未処理にせずエラーを表示する', async () => {
  const OriginalFileReader = globalThis.FileReader;
  const originalConsoleError = console.error;

  class FailingFileReader extends EventTarget {
    error = new DOMException('File not found', 'NotFoundError');

    readAsArrayBuffer() {
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

    expect(
      await screen.findByText('log.html: ファイルを読み込めませんでした。もう一度選択してください。'),
    ).toBeTruthy();
  } finally {
    globalThis.FileReader = OriginalFileReader;
    console.error = originalConsoleError;
  }
});
