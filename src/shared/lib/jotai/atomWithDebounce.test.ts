import { expect, test, vi } from 'bun:test';

import { createStore } from 'jotai';

import { atomWithDebounce } from './atomWithDebounce';

test('入力を即座に反映し、連続入力と空文字への変更は最後の入力から遅延させる', () => {
  vi.useFakeTimers();
  const store = createStore();
  const { currentValueAtom, debouncedValueAtom } = atomWithDebounce('', 300);

  store.set(debouncedValueAtom, 'シナリオ');
  expect(store.get(currentValueAtom)).toBe('シナリオ');
  expect(store.get(debouncedValueAtom)).toBe('');

  vi.advanceTimersByTime(200);
  store.set(debouncedValueAtom, 'シナリオ名');
  vi.advanceTimersByTime(100);
  expect(store.get(debouncedValueAtom)).toBe('');
  vi.advanceTimersByTime(200);
  expect(store.get(debouncedValueAtom)).toBe('シナリオ名');

  store.set(debouncedValueAtom, '');
  expect(store.get(currentValueAtom)).toBe('');
  expect(store.get(debouncedValueAtom)).toBe('シナリオ名');
  vi.advanceTimersByTime(300);
  expect(store.get(debouncedValueAtom)).toBe('');
});
