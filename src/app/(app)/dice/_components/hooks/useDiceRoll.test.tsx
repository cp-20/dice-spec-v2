import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import type { ReactNode } from 'react';
import * as v from 'valibot';

import { useToast } from '@/shared/components/ui/use-toast';
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
  test('実エンジンで同期ロールし、呼び出しごとにログを一件だけ追加する', () => {
    const { result } = setup();
    act(() => {
      expect(result.current.first.diceRoll('1D1')?.text).toBe('(1D1) ＞ 1');
      expect(result.current.second.diceRoll('1D1')?.text).toBe('(1D1) ＞ 1');
    });
    expect(result.current.logs.diceLogs).toHaveLength(2);
    expect(result.current.logs.diceLogs.every((log) => log.system === 'DiceBot' && log.log === '(1D1) ＞ 1')).toBe(
      true,
    );
    expect(result.current.first.disabled).toBe(false);
    expect(result.current.quick.items.filter((item) => item.command === '1D1')).toHaveLength(1);
  });

  test.each([
    ['1D1', 'default'],
    ['1D1>=1', 'success'],
    ['1D1>=2', 'failed'],
  ] as const)('実エンジンの判定 %s をログの表示 %s に反映する', (command, variant) => {
    const { result } = setup();
    act(() => {
      result.current.first.diceRoll(command);
    });
    expect(result.current.logs.diceLogs[0].variant).toBe(variant);
  });

  test.each([
    [1, 'success'],
    [100, 'failed'],
  ] as const)('クトゥルフのクリティカル・ファンブルを実エンジンからログへ反映する (%s)', async (random, variant) => {
    const engine = await bcdice.loadGameSystem('Cthulhu');
    // 稀なクリティカル・ファンブルを安定して再現するため、乱数源だけを固定する。
    const evaluate = vi.spyOn(engine, 'eval').mockImplementation((command) => {
      const instance = new engine(command);
      vi.spyOn(instance.randomizer, '$random').mockReturnValue(random);
      return instance.eval();
    });
    try {
      const { result, store } = setup();
      act(() => {
        store.set(gameSystemAtom, { system: 'Cthulhu', status: 'ready', engine });
        const rolled = result.current.first.diceRoll('CCB<=50');
        expect(random === 1 ? rolled?.critical : rolled?.fumble).toBe(true);
      });
      expect(result.current.logs.diceLogs[0].variant).toBe(variant);
    } finally {
      evaluate.mockRestore();
    }
  });

  test('選択直後から旧エンジンでのロールを抑止し、失敗中もログを増やさない', async () => {
    const pending = Promise.withResolvers<typeof diceBot>();
    // 動的チャンクの取得失敗と完了順序を固定するため、ローダーの境界を置き換える。
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
    // 通常の入力では起きないエンジン例外からの復帰を検証するため、評価境界に障害を注入する。
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
    // happy-dom には音声再生機能がないため、ブラウザの再生境界だけを置き換える。
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (this: HTMLMediaElement) {
      volumes.push(this.volume);
      return Promise.resolve();
    });
    try {
      const store = createStore();
      store.set(gameSystemAtom, { system: 'DiceBot', status: 'ready', engine: diceBot });
      const { result } = renderHook(() => ({ ...useDiceRoll(), notifications: useToast() }), {
        wrapper: ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>,
      });
      act(() => {
        expect(result.current.diceRoll('1D1')?.text).toBe('(1D1) ＞ 1');
      });
      act(() => {
        expect(result.current.diceRoll('invalid')).toBeNull();
      });
      expect(volumes).toEqual([0.25, 0.25]);
      expect(result.current.notifications.toasts).toHaveLength(1);
      expect(result.current.notifications.toasts[0]).toMatchObject({
        title: 'ダイスロールに失敗しました',
        variant: 'destructive',
      });
    } finally {
      play.mockRestore();
    }
  });
});
