import { act, renderHook } from '@testing-library/react';
import * as useImmutableSWR from 'swr/immutable';
import { useGameSystemList } from './useGameSystemList';

describe('useGameSystemList', () => {
  beforeEach(() => {
    vi.mock('swr/immutable', () => ({
      default: vi.fn(),
    }));

    const spy = vi.spyOn(useImmutableSWR, 'default');
    spy.mockReturnValue({
      data: [
        { id: 'DiceBot', name: 'DiceBot', sort_key: '*たいすほつと' },
        { id: 'EarthDawn', name: 'アースドーン', sort_key: 'ああすとおん' },
        { id: 'Ayabito', name: 'あやびと', sort_key: 'あやひと' },
      ],
      isLoading: false,
      mutate: vi.fn(),
      error: undefined,
      isValidating: false,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test('ゲームシステムの一覧を取得してくる', () => {
    const { result } = renderHook(() => useGameSystemList());

    expect(result.current.gameSystemList).toEqual([
      { id: 'DiceBot', name: 'DiceBot', sort_key: '*たいすほつと' },
      { id: 'EarthDawn', name: 'アースドーン', sort_key: 'ああすとおん' },
      { id: 'Ayabito', name: 'あやびと', sort_key: 'あやひと' },
    ]);
  });

  test('選択したゲームシステムは一番上に表示される', () => {
    const { result } = renderHook(() => useGameSystemList());

    act(() => result.current.selectSystem('Ayabito'));

    expect(result.current.gameSystemList).toEqual([
      { id: 'Ayabito', name: 'あやびと', sort_key: 'あやひと' },
      { id: 'DiceBot', name: 'DiceBot', sort_key: '*たいすほつと' },
      { id: 'EarthDawn', name: 'アースドーン', sort_key: 'ああすとおん' },
    ]);
  });
});
