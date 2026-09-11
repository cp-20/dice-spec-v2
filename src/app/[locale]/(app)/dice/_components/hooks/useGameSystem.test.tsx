import { act, renderHook, waitFor } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import type { ReactNode } from 'react';

import * as bcdice from '@/shared/lib/bcdice/loader';

import { gameSystemAtom, useGameSystem } from './useGameSystem';

const diceBot = await bcdice.loadGameSystem('DiceBot');
const cthulhu = await bcdice.loadGameSystem('Cthulhu7th');
const swordWorld = await bcdice.loadGameSystem('SwordWorld2.5');
const setup = (ready = true) => {
  const store = createStore();
  if (ready) store.set(gameSystemAtom, { system: 'DiceBot', status: 'ready', engine: diceBot });
  const hook = renderHook(useGameSystem, {
    wrapper: ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>,
  });
  return { ...hook, store };
};

afterEach(() => localStorage.clear());

describe('選択中のゲームシステム', () => {
  test('選択UIに依存せず初期ロードし、再マウントでもエンジンを保持する', async () => {
    const { result, store, unmount } = setup(false);
    await waitFor(() => expect(result.current.selection.status).toBe('ready'));
    expect(result.current.selection.engine).toBe(diceBot);
    unmount();
    const again = renderHook(useGameSystem, {
      wrapper: ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>,
    });
    expect(again.result.current.selection).toEqual({ system: 'DiceBot', status: 'ready', engine: diceBot });
  });

  test('同じシステムの再選択で読込済み状態を破棄しない', () => {
    const { result } = setup();
    const selected = result.current.selection;
    act(() => result.current.setSystem('DiceBot'));
    expect(result.current.selection).toBe(selected);
  });

  test('読み込み中の同じ選択を重ねても、進行中の読み込みをやり直さない', async () => {
    const pending = Promise.withResolvers<typeof cthulhu>();
    const spy = vi.spyOn(bcdice, 'loadGameSystem').mockReturnValueOnce(pending.promise);
    try {
      const { result } = setup();
      act(() => result.current.setSystem('Cthulhu7th'));
      const selected = result.current.selection;
      act(() => result.current.setSystem('Cthulhu7th'));
      expect(result.current.selection).toBe(selected);
      expect(spy).toHaveBeenCalledTimes(1);
      await act(async () => {
        pending.resolve(cthulhu);
        await pending.promise;
      });
      expect(result.current.selection.engine).toBe(cthulhu);
    } finally {
      spy.mockRestore();
    }
  });

  test.each(['成功', '失敗'])('先行する読み込みの%sが最新の選択を上書きしない', async (outcome) => {
    const pending = Promise.withResolvers<typeof cthulhu>();
    const spy = vi
      .spyOn(bcdice, 'loadGameSystem')
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValueOnce(swordWorld);
    try {
      const { result } = setup();
      act(() => result.current.setSystem('Cthulhu7th'));
      expect(result.current.selection).toEqual({ system: 'Cthulhu7th', status: 'loading', engine: null });
      act(() => result.current.setSystem('SwordWorld2.5'));
      await waitFor(() => expect(result.current.selection.status).toBe('ready'));
      await act(async () => {
        if (outcome === '成功') pending.resolve(cthulhu);
        else pending.reject(new Error('チャンク取得失敗'));
        await pending.promise.catch(() => undefined);
      });
      expect(result.current.selection).toEqual({ system: 'SwordWorld2.5', status: 'ready', engine: swordWorld });
    } finally {
      spy.mockRestore();
    }
  });

  test('取得失敗を表示できる状態にし、別のシステムを選択して復旧できる', async () => {
    const spy = vi
      .spyOn(bcdice, 'loadGameSystem')
      .mockRejectedValueOnce(new Error('チャンク取得失敗'))
      .mockResolvedValueOnce(diceBot);
    try {
      const { result } = setup();
      act(() => result.current.setSystem('Cthulhu7th'));
      await waitFor(() => expect(result.current.selection.status).toBe('error'));
      expect(result.current.selection.engine).toBeNull();
      act(() => result.current.setSystem('DiceBot'));
      await waitFor(() => expect(result.current.selection.status).toBe('ready'));
      expect(result.current.selection.engine).toBe(diceBot);
    } finally {
      spy.mockRestore();
    }
  });
});
