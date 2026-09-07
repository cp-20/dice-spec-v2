import { afterEach, describe, expect, test } from 'bun:test';

import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { createElement, type ReactNode } from 'react';

import { gameSystems } from '@/shared/lib/bcdice/loader';

import { useGameSystemList } from './useGameSystemList';

const wrapper = ({ children }: { children: ReactNode }) => createElement(Provider, { store: createStore() }, children);
afterEach(() => localStorage.clear());

describe('useGameSystemList', () => {
  test('ローカルのゲームシステム一覧を取得する', () => {
    const { result } = renderHook(useGameSystemList, { wrapper });
    expect(result.current.gameSystemList).toEqual(gameSystems);
  });

  test('選択したゲームシステムは一番上に表示される', () => {
    const { result } = renderHook(useGameSystemList, { wrapper });
    act(() => result.current.selectSystem('Ayabito'));
    expect(result.current.gameSystemList[0].id).toBe('Ayabito');
    expect(result.current.gameSystemList.slice(1)).toEqual(gameSystems.filter((s) => s.id !== 'Ayabito'));
  });
});
