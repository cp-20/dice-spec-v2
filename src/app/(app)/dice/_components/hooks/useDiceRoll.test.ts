import { act, renderHook } from '@testing-library/react';

import { describe, expect, test } from 'vitest';
import * as useBcdiceApi from './useBcdiceApi';
import { useDiceRollCore } from './useDiceRoll';

describe('useDiceRollCore', () => {
  beforeEach(() => {
    const spy = vi.spyOn(useBcdiceApi, 'useBcdiceApi');

    spy.mockReturnValue({
      getDiceRoll: vi.fn(async () => ({
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
      getGameSystemInfo: vi.fn(),
      getGameSystemList: vi.fn(),
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
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
