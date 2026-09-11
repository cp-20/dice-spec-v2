import { afterEach, describe, expect, test } from 'bun:test';

import { act, renderHook } from '@testing-library/react';
import { createStore, Provider, useAtomValue } from 'jotai';
import type { ReactNode } from 'react';

import { gameSystems } from '@/shared/lib/bcdice/loader';

import { gameSystemListAtom } from './gameSystemHistory';
import { selectGameSystemAtom } from './hooks/useGameSystem';

const setup = () => {
  const store = createStore();
  const hook = renderHook(() => useAtomValue(gameSystemListAtom), {
    wrapper: ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>,
  });
  return { ...hook, store };
};

afterEach(() => localStorage.clear());

describe('ゲームシステムの最近使用順', () => {
  test('保存がなければ同梱カタログを表示する', () => {
    const { result } = setup();
    expect(result.current).toEqual(gameSystems);
  });

  test('選択操作で最近使用順を更新し、IDだけを保存して再表示できる', () => {
    const { result, store, unmount } = setup();
    act(() => {
      store.set(selectGameSystemAtom, 'Cthulhu7th');
      store.set(selectGameSystemAtom, 'SwordWorld2.5');
      store.set(selectGameSystemAtom, 'Cthulhu7th');
    });
    expect(result.current.slice(0, 2).map((s) => s.id)).toEqual(['Cthulhu7th', 'SwordWorld2.5']);
    expect(new Set(result.current.map((s) => s.id)).size).toBe(gameSystems.length);
    expect(JSON.parse(localStorage.getItem('game-system-list')!)).toEqual(['Cthulhu7th', 'SwordWorld2.5']);

    unmount();
    expect(
      setup()
        .result.current.slice(0, 2)
        .map((s) => s.id),
    ).toEqual(['Cthulhu7th', 'SwordWorld2.5']);
  });

  test('旧保存形式を読み込み、未収録システムの名称と順番を保持する', () => {
    const saved = [
      { id: 'MissingSystem', name: '保存済み', sort_key: '' },
      { id: 'Cthulhu7th', name: '旧名称', sort_key: '' },
    ];
    localStorage.setItem('game-system-list', JSON.stringify(saved));
    const { result, store, unmount } = setup();
    expect(result.current[0]).toEqual({ id: 'MissingSystem', name: '保存済み' });
    expect(result.current[1].name).toBe('新クトゥルフ神話TRPG');
    expect(JSON.parse(localStorage.getItem('game-system-list')!)).toEqual(saved);

    act(() => store.set(selectGameSystemAtom, 'DiceBot'));
    expect(JSON.parse(localStorage.getItem('game-system-list')!)).toEqual([
      'DiceBot',
      { id: 'MissingSystem', name: '保存済み' },
      'Cthulhu7th',
    ]);
    unmount();
    expect(setup().result.current[1]).toEqual({ id: 'MissingSystem', name: '保存済み' });
  });

  test('未収録のIDは選択できず、保存内容も変更しない', () => {
    const { result, store } = setup();
    act(() => store.set(selectGameSystemAtom, 'MissingSystem'));
    expect(result.current).toEqual(gameSystems);
    expect(localStorage.getItem('game-system-list')).toBeNull();
  });
});
