import { afterEach, expect, test, vi } from 'bun:test';

import { act, renderHook } from '@testing-library/react';

import { useTimedFeedback } from './useTimedFeedback';

afterEach(() => vi.useRealTimers());

test('表示中の再実行でも最新操作から表示時間を数え直す', () => {
  vi.useFakeTimers();
  const { result } = renderHook(() => useTimedFeedback(1_000));

  act(() => result.current.show());
  expect(result.current.visible).toBe(true);

  act(() => vi.advanceTimersByTime(600));
  act(() => result.current.show());
  act(() => vi.advanceTimersByTime(600));
  expect(result.current.visible).toBe(true);

  act(() => vi.advanceTimersByTime(400));
  expect(result.current.visible).toBe(false);
});
