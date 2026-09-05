import { atom } from 'jotai';

export function atomWithDebounce<T>(initialValue: T, delayMilliseconds: number) {
  const prevTimeoutAtom = atom<ReturnType<typeof setTimeout> | undefined>(undefined);

  // 入力値と遅延値が不整合にならないよう、入力値への直接の書き込みは公開しない。
  const currentValueAtom = atom(initialValue);
  const debouncedValueAtom = atom(initialValue, (get, set, nextValue: T) => {
    clearTimeout(get(prevTimeoutAtom));
    set(currentValueAtom, nextValue);

    // 次の入力時に取り消せるよう、タイマーを保持する。
    set(
      prevTimeoutAtom,
      setTimeout(() => set(debouncedValueAtom, nextValue), delayMilliseconds),
    );
  });

  return {
    currentValueAtom: atom((get) => get(currentValueAtom)),
    debouncedValueAtom,
  };
}
