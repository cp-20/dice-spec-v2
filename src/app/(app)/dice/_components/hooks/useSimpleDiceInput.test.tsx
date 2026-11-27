import { act, renderHook } from '@testing-library/react';
import { Provider } from 'jotai';

import { useSimpleDiceInput } from './useSimpleDiceInput';
import { useSimpleDiceOutput } from './useSimpleDiceOutput';

const useSimpleDice = () => ({ input: useSimpleDiceInput(), output: useSimpleDiceOutput() });

test('選んだ個数と面数のダイスを振り、プリセットを振ると入力にも反映する', () => {
  // 出目を固定して結果の文字列を検証する。
  vi.spyOn(Math, 'random').mockReturnValue(0.99);
  const { result } = renderHook(useSimpleDice, { wrapper: Provider });

  act(() => result.current.input.changeFaces(2));
  act(() => result.current.input.rollInput());
  expect(result.current.output.latestOutput?.resultStr).toBe('1D2 => 2[2] => 2');

  act(() => result.current.input.roll({ count: 2, faces: 6 }));
  expect(result.current.input.input).toEqual({ count: 2, faces: 6 });
  expect(result.current.output.latestOutput?.resultStr).toBe('2D6 => 12[6, 6] => 12');

  // 範囲外の個数・面数は範囲へ収める。
  act(() => result.current.input.changeCount(-5));
  act(() => result.current.input.changeFaces(1));
  expect(result.current.input.input).toEqual({ count: 1, faces: 2 });
  vi.restoreAllMocks();
});
