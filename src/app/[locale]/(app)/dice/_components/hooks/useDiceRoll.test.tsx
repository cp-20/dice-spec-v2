import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import type { ReactNode } from 'react';
import * as v from 'valibot';

import * as toastModule from '@/shared/components/ui/use-toast';
import * as bcdice from '@/shared/lib/bcdice/loader';
import { captureClientException } from '@/shared/lib/sentryClient';

import { AdvancedSettingsFormSchema } from '../advancedSettingsSchema';
import { useDiceLogs } from './useDiceLogs';
import { useDiceRoll, useDiceRollCore } from './useDiceRoll';
import { gameSystemAtom, selectGameSystemAtom } from './useGameSystem';
import { useQuickInput } from './useQuickInput';

const diceBot = await bcdice.loadGameSystem('DiceBot');
const rollResult = {
  text: '(1D6) ＞ 5',
  rands: [],
  detailedRands: [],
  critical: false,
  failure: false,
  fumble: false,
  secret: false,
  success: false,
};
const setup = () => {
  const store = createStore();
  store.set(gameSystemAtom, { system: 'DiceBot', status: 'ready', engine: diceBot });
  const hook = renderHook(
    () => ({ first: useDiceRollCore(), second: useDiceRollCore(), logs: useDiceLogs(), quick: useQuickInput() }),
    { wrapper: ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider> },
  );
  return { ...hook, store };
};

afterEach(() => localStorage.clear());

describe('ローカルのダイス操作', () => {
  test('同じエンジンで同期ロールし、呼び出しごとにログを一件だけ追加する', () => {
    const load = vi.spyOn(bcdice, 'loadGameSystem');
    const evaluate = vi.spyOn(diceBot, 'eval').mockReturnValue(rollResult);
    try {
      const { result } = setup();
      act(() => {
        expect(result.current.first.diceRoll('1D6')).toBe(rollResult);
        expect(result.current.second.diceRoll('1D6')).toBe(rollResult);
      });
      expect(evaluate).toHaveBeenCalledTimes(2);
      expect(load).not.toHaveBeenCalled();
      expect(result.current.logs.diceLogs).toHaveLength(2);
      expect(result.current.logs.diceLogs[0]).toMatchObject({ system: 'DiceBot', log: rollResult.text });
      expect(result.current.first.disabled).toBe(false);
      expect(result.current.quick.items.filter((item) => item.command === '1D6')).toHaveLength(1);
    } finally {
      load.mockRestore();
      evaluate.mockRestore();
    }
  });

  test.each([
    [{}, 'default'],
    [{ critical: true }, 'success'],
    [{ success: true }, 'success'],
    [{ failure: true }, 'failed'],
    [{ fumble: true }, 'failed'],
  ] as const)('判定フラグ %j をログの表示 %s に反映する', (flags, variant) => {
    const evaluate = vi.spyOn(diceBot, 'eval').mockReturnValue({ ...rollResult, ...flags });
    try {
      const { result } = setup();
      act(() => {
        result.current.first.diceRoll('1D6');
      });
      expect(result.current.logs.diceLogs[0].variant).toBe(variant);
    } finally {
      evaluate.mockRestore();
    }
  });

  test('選択直後から旧エンジンでのロールを抑止し、失敗中もログを増やさない', async () => {
    const pending = Promise.withResolvers<typeof diceBot>();
    const load = vi.spyOn(bcdice, 'loadGameSystem').mockReturnValueOnce(pending.promise);
    const evaluate = vi.spyOn(diceBot, 'eval');
    try {
      const { result, store } = setup();
      act(() => {
        store.set(selectGameSystemAtom, 'Cthulhu7th');
        expect(result.current.first.diceRoll('1D6')).toBeNull();
      });
      expect(result.current.first.disabled).toBe(true);
      expect(evaluate).not.toHaveBeenCalled();
      await act(async () => {
        pending.reject(new Error('チャンク取得失敗'));
        await pending.promise.catch(() => undefined);
      });
      expect(result.current.first.diceRoll('1D6')).toBeNull();
      expect(result.current.logs.diceLogs).toEqual([]);
      expect(result.current.quick.items).toHaveLength(2);
    } finally {
      load.mockRestore();
      evaluate.mockRestore();
    }
  });

  test('無効コマンド・評価不能・エンジン例外では成功ログを残さず、次のロールは実行できる', () => {
    const failure = new Error('評価失敗');
    const evaluate = vi
      .spyOn(diceBot, 'eval')
      .mockReturnValueOnce(null)
      .mockImplementationOnce(() => {
        throw failure;
      })
      .mockReturnValueOnce(rollResult);
    try {
      const { result } = setup();
      act(() => {
        expect(result.current.first.diceRoll('invalid')).toBeNull();
        expect(result.current.first.diceRoll('1D6')).toBeNull();
        expect(result.current.first.diceRoll('1D6')).toBeNull();
      });
      expect(evaluate).toHaveBeenCalledTimes(2);
      expect(captureClientException).toHaveBeenCalledWith(failure);
      expect(result.current.logs.diceLogs).toEqual([]);
      act(() => {
        expect(result.current.first.diceRoll('1D6')).toBe(rollResult);
      });
      expect(result.current.logs.diceLogs).toHaveLength(1);
    } finally {
      evaluate.mockRestore();
    }
  });

  test('旧 endpoint 設定が残っていても音量・ヘルプ設定を保持する', () => {
    expect(
      v.parse(AdvancedSettingsFormSchema, {
        showHelp: false,
        playSound: true,
        volume: 25,
        bcdiceApiEndpoint: 'old-invalid-endpoint',
      }),
    ).toEqual({ showHelp: false, playSound: true, volume: 25 });
  });

  test('ロール後のサウンドは保存した音量で一度だけ再生し、失敗時の通知も維持する', () => {
    localStorage.setItem('dice-advanced-settings', JSON.stringify({ showHelp: true, playSound: true, volume: 25 }));
    const volumes: number[] = [];
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (this: HTMLMediaElement) {
      volumes.push(this.volume);
      return Promise.resolve();
    });
    const evaluate = vi.spyOn(diceBot, 'eval').mockReturnValueOnce(rollResult).mockReturnValueOnce(null);
    const notify = vi.fn(() => ({ id: 'test', dismiss: () => undefined, update: () => undefined }));
    const toast = vi.spyOn(toastModule, 'useToast').mockReturnValue({
      toast: notify,
      toasts: [],
      dismiss: () => undefined,
    });
    try {
      const store = createStore();
      store.set(gameSystemAtom, { system: 'DiceBot', status: 'ready', engine: diceBot });
      const { result } = renderHook(useDiceRoll, {
        wrapper: ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>,
      });
      act(() => {
        expect(result.current.diceRoll('1D6')).toBe(rollResult);
      });
      act(() => {
        expect(result.current.diceRoll('1D6')).toBeNull();
      });
      expect(volumes).toEqual([0.25, 0.25]);
      expect(notify).toHaveBeenCalledTimes(1);
      expect(notify).toHaveBeenCalledWith({
        title: 'ダイスロールに失敗しました',
        variant: 'destructive',
      });
    } finally {
      play.mockRestore();
      evaluate.mockRestore();
      toast.mockRestore();
    }
  });
});
