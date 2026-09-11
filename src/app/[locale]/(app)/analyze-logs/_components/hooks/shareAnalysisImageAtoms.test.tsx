import { expect, mock, test } from 'bun:test';

import { act, render, waitFor } from '@testing-library/react';
import { createStore, Provider, useAtomValue } from 'jotai';
import { Suspense } from 'react';

let resolveImage: (value: string) => void;
mock.module('html-to-image', () => ({
  toPng: () =>
    new Promise<string>((resolve) => {
      resolveImage = resolve;
    }),
}));

const { imageRefAtom, sharingImageDataUrlAtom, sharingImageVersionAtom } = await import('./shareAnalysisImageAtoms');

test('画像の生成中と再生成中も共有ボタンを表示し、完了した画像を反映する', async () => {
  const store = createStore();
  store.set(imageRefAtom, { current: document.createElement('div') });
  const ShareButton = () => {
    const image = useAtomValue(sharingImageDataUrlAtom);
    return <button data-image={image}>解析結果をシェア</button>;
  };
  const view = render(
    <Provider store={store}>
      <Suspense fallback={<span>待機中</span>}>
        <ShareButton />
      </Suspense>
    </Provider>,
  );
  try {
    expect(view.getByRole('button').textContent).toBe('解析結果をシェア');
    await act(async () => resolveImage('data:image/png;base64,first'));
    await waitFor(() =>
      expect(view.getByRole('button').getAttribute('data-image')).toBe('data:image/png;base64,first'),
    );
    act(() => store.set(sharingImageVersionAtom, (version) => version + 1));
    expect(view.queryByText('待機中')).toBeNull();
    expect(view.getByRole('button').getAttribute('data-image')).toBeNull();
    await act(async () => resolveImage('data:image/png;base64,second'));
    await waitFor(() =>
      expect(view.getByRole('button').getAttribute('data-image')).toBe('data:image/png;base64,second'),
    );
  } finally {
    view.unmount();
  }
});
