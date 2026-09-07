import { afterEach, describe, expect, spyOn, test } from 'bun:test';

import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { createElement, type ReactNode } from 'react';
import * as v from 'valibot';

import * as diceRoll from '@/shared/lib/bcdice/getDiceRoll';
import * as systemInfo from '@/shared/lib/bcdice/getGameSystemInfo';
import { gameSystems, loadGameSystem } from '@/shared/lib/bcdice/loader';

import { AdvancedSettingsFormSchema } from '../advancedSettingsSchema';
import { useDiceLogs } from './useDiceLogs';
import { useDiceRollCore } from './useDiceRoll';
import { diceRollOptionAtom, useDiceRollOption } from './useDiceRollOption';
import { useGameSystemList } from './useGameSystemList';

const info = await systemInfo.getGameSystemInfo('DiceBot');
const result = {
  ok: true as const,
  text: '(1D6) ＞ 5',
  critical: false,
  failure: false,
  fumble: false,
  secret: false,
  success: false,
};
const createWrapper = () => {
  const store = createStore();
  store.set(diceRollOptionAtom, { system: 'DiceBot', systemInfo: info, error: false });
  return { store, wrapper: ({ children }: { children: ReactNode }) => createElement(Provider, { store }, children) };
};
afterEach(() => localStorage.clear());

describe('ローカル BCDice', () => {
  test('代表システムのヘルプ・判定・無効コマンドを扱う', async () => {
    expect(gameSystems).toHaveLength(336);
    for (const [id, command] of [
      ['DiceBot', '1D6'],
      ['Cthulhu7th', 'CC<=100'],
      ['SwordWorld2.5', 'K20+5'],
    ]) {
      expect((await systemInfo.getGameSystemInfo(id)).help_message.length).toBeGreaterThan(0);
      expect((await diceRoll.getDiceRoll(command, id)).ok).toBe(true);
    }
    expect(await diceRoll.getDiceRoll('invalid', 'DiceBot')).toEqual({ ok: false });
    expect(await diceRoll.getDiceRoll('1D6', 'MissingSystem')).toEqual({ ok: false });
    expect(await diceRoll.getDiceRoll('S1D6', 'DiceBot')).toMatchObject({ ok: true, secret: true });
    expect(await diceRoll.getDiceRoll('1D6>=1', 'DiceBot')).toMatchObject({ ok: true, success: true });
    expect(await diceRoll.getDiceRoll('1D6>=7', 'DiceBot')).toMatchObject({ ok: true, failure: true });
  });

  test('同時読み込みを共有し、失敗はキャッシュに残さない', async () => {
    expect(loadGameSystem('Cthulhu7th')).toBe(loadGameSystem('Cthulhu7th'));
    const failed = loadGameSystem('MissingSystem');
    await expect(failed).rejects.toThrow();
    const retry = loadGameSystem('MissingSystem');
    expect(retry).not.toBe(failed);
    await expect(retry).rejects.toThrow();
  });

  test('旧 endpoint 設定が残っていても他の設定を読み込める', () => {
    expect(
      v.parse(AdvancedSettingsFormSchema, {
        showHelp: false,
        playSound: true,
        volume: 25,
        bcdiceApiEndpoint: 'old-invalid-endpoint',
      }),
    ).toEqual({ showHelp: false, playSound: true, volume: 25 });
  });

  test('未収録 ID と最近使用順を読み込みや選択で消さない', () => {
    const saved = [
      { id: 'MissingSystem', name: '保存済み', sort_key: '' },
      { id: 'Cthulhu7th', name: '旧名称', sort_key: '' },
    ];
    localStorage.setItem('game-system-list', JSON.stringify(saved));
    const { result: hook } = renderHook(useGameSystemList, createWrapper());
    expect(hook.current.gameSystemList.slice(0, 2).map((s) => s.id)).toEqual(['MissingSystem', 'Cthulhu7th']);
    expect(JSON.parse(localStorage.getItem('game-system-list')!)).toEqual(saved);
    act(() => hook.current.selectSystem('DiceBot'));
    expect(JSON.parse(localStorage.getItem('game-system-list')!).map((s: { id: string }) => s.id)).toEqual([
      'DiceBot',
      'MissingSystem',
      'Cthulhu7th',
    ]);
  });

  test('遅れて完了したシステム読み込みと失敗が最新選択を上書きしない', async () => {
    const spy = spyOn(systemInfo, 'getGameSystemInfo');
    const first = Promise.withResolvers<typeof info>();
    const second = Promise.withResolvers<typeof info>();
    spy.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    try {
      const { result: hook } = renderHook(useDiceRollOption, createWrapper());
      let a!: Promise<void>, b!: Promise<void>;
      act(() => {
        a = hook.current.setSystem('A');
        b = hook.current.setSystem('B');
      });
      await act(async () => {
        second.resolve({ ...info, id: 'B' });
        await b;
      });
      await act(async () => {
        first.resolve({ ...info, id: 'A' });
        await a;
      });
      expect(hook.current.option).toMatchObject({ system: 'B', systemInfo: { id: 'B' }, error: false });
      const delayedFailure = Promise.withResolvers<typeof info>();
      spy.mockReturnValueOnce(delayedFailure.promise).mockResolvedValueOnce({ ...info, id: 'B' });
      let failed!: Promise<void>;
      act(() => {
        failed = hook.current.setSystem('A');
      });
      await act(() => hook.current.setSystem('B'));
      await act(async () => {
        delayedFailure.reject(new Error('チャンク取得失敗'));
        await failed;
      });
      expect(hook.current.option).toMatchObject({ system: 'B', systemInfo: { id: 'B' }, error: false });
      spy.mockRejectedValueOnce(new Error('チャンク取得失敗'));
      await act(() => hook.current.setSystem('A'));
      expect(hook.current.option).toMatchObject({ system: 'A', systemInfo: null, error: true });
      spy.mockResolvedValueOnce({ ...info, id: 'A' });
      await act(() => hook.current.setSystem('A'));
      expect(hook.current.option).toMatchObject({ system: 'A', systemInfo: { id: 'A' }, error: false });
    } finally {
      spy.mockRestore();
    }
  });

  test('複数の呼び出し元の連打とシステム切替中の古い結果を抑止する', async () => {
    const spy = spyOn(diceRoll, 'getDiceRoll');
    const pending = Promise.withResolvers<diceRoll.DiceRollResult>();
    spy.mockReturnValueOnce(pending.promise);
    const config = createWrapper();
    try {
      const { result: hook } = renderHook(
        () => ({ first: useDiceRollCore(), second: useDiceRollCore(), logs: useDiceLogs() }),
        config,
      );
      let rolling!: Promise<diceRoll.DiceRollResult>;
      act(() => {
        rolling = hook.current.first.diceRoll('1D6');
      });
      expect(await hook.current.second.diceRoll('1D6')).toEqual({ ok: false });
      expect(spy).toHaveBeenCalledTimes(1);
      act(() => config.store.set(diceRollOptionAtom, { system: 'B', systemInfo: null, error: false }));
      await act(async () => {
        pending.resolve(result);
        await rolling;
      });
      expect(hook.current.logs.diceLogs).toEqual([]);
      expect(await hook.current.first.diceRoll('1D6')).toEqual({ ok: false });
      act(() => config.store.set(diceRollOptionAtom, { system: 'DiceBot', systemInfo: info, error: false }));
      spy.mockResolvedValueOnce({ ...result, critical: true });
      await act(() => hook.current.first.diceRoll('1D6'));
      expect(hook.current.logs.diceLogs[0]).toMatchObject({ system: 'DiceBot', log: result.text, variant: 'success' });
    } finally {
      spy.mockRestore();
    }
  });
});
