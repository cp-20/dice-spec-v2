import { describe, beforeEach, test, expect, mock, spyOn } from 'bun:test';
import { act, renderHook } from '@testing-library/react';
import * as useBcdiceApi from './useBcdiceApi';
import { useDiceRollCore } from './useDiceRoll';

describe('useDiceRollCore', () => {
  const spy = spyOn(useBcdiceApi, 'useBcdiceApi');

  beforeEach(() => {
    spy.mockReturnValue({
      getDiceRoll: mock(async () => ({
        ok: true as const,
        text: '(1D6) ＞ 5',
        critical: false,
        failure: false,
        fumble: false,
        secret: false,
        success: false,
        rands: [
          {
            kind: 'normal' as const,
            sides: 6,
            value: 5,
          },
        ],
      })),
      getGameSystemInfo: mock(),
      getGameSystemList: mock(),
    });
  });

  afterEach(() => {
    spy.mockReset();
  });

  test('正しくダイスを振れる', async () => {
    const { result } = renderHook(() => useDiceRollCore());

    const diceRollResult = await act(() => result.current.diceRoll('1d6'));

    expect(diceRollResult).toEqual({
      ok: true as const,
      text: '(1D6) ＞ 5',
      critical: false,
      failure: false,
      fumble: false,
      secret: false,
      success: false,
      rands: [
        {
          kind: 'normal' as const,
          sides: 6,
          value: 5,
        },
      ],
    });
  });
});
