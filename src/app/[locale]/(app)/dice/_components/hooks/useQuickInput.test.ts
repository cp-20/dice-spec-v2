import { act, renderHook } from '@testing-library/react';
import { useQuickInput } from './useQuickInput';

describe('useQuickInput', () => {
  test('最初に1D6と1D100がお気に入りとして登録されている', () => {
    const { result } = renderHook(() => useQuickInput());
    act(() => result.current.resetItems());

    expect(result.current.items).toEqual([
      {
        command: '1d6',
        isFavorite: true,
      },
      {
        command: '1d100',
        isFavorite: true,
      },
    ]);
  });

  test('addItemで新しいコマンドを追加できる', () => {
    const { result } = renderHook(() => useQuickInput());
    act(() => result.current.resetItems());

    act(() => result.current.addItem('1d20'));
    expect(result.current.items).toEqual([
      {
        command: '1d6',
        isFavorite: true,
      },
      {
        command: '1d100',
        isFavorite: true,
      },
      {
        command: '1d20',
        isFavorite: false,
      },
    ]);
  });

  test('addItemで既にあるコマンドを追加すると順番がお気に入りを除いて一番上になる', () => {
    const { result } = renderHook(() => useQuickInput());
    act(() => result.current.resetItems());

    act(() => result.current.addItem('1d20'));
    act(() => result.current.addItem('1d10'));
    expect(result.current.items).toEqual([
      {
        command: '1d6',
        isFavorite: true,
      },
      {
        command: '1d100',
        isFavorite: true,
      },
      {
        command: '1d10',
        isFavorite: false,
      },
      {
        command: '1d20',
        isFavorite: false,
      },
    ]);

    act(() => result.current.addItem('1d20'));
    expect(result.current.items).toEqual([
      {
        command: '1d6',
        isFavorite: true,
      },
      {
        command: '1d100',
        isFavorite: true,
      },
      {
        command: '1d20',
        isFavorite: false,
      },
      {
        command: '1d10',
        isFavorite: false,
      },
    ]);
  });

  test('addItemで既にお気に入りに登録されているコマンドを追加すると何も起きない', () => {
    const { result } = renderHook(() => useQuickInput());
    act(() => result.current.resetItems());

    act(() => result.current.addItem('1d6'));
    expect(result.current.items).toEqual([
      {
        command: '1d6',
        isFavorite: true,
      },
      {
        command: '1d100',
        isFavorite: true,
      },
    ]);

    act(() => result.current.addItem('1d100'));
    expect(result.current.items).toEqual([
      {
        command: '1d6',
        isFavorite: true,
      },
      {
        command: '1d100',
        isFavorite: true,
      },
    ]);
  });

  test('updateItemでお気に入りの登録/解除ができる (その際にソートが上手く動く)', () => {
    const { result } = renderHook(() => useQuickInput());
    act(() => result.current.resetItems());

    act(() => result.current.updateItem({ command: '1d6', isFavorite: false }));
    expect(result.current.items).toEqual([
      {
        command: '1d100',
        isFavorite: true,
      },
      {
        command: '1d6',
        isFavorite: false,
      },
    ]);

    act(() => result.current.addItem('1d20'));
    act(() => result.current.updateItem({ command: '1d20', isFavorite: true }));

    expect(result.current.items).toEqual([
      {
        command: '1d20',
        isFavorite: true,
      },
      {
        command: '1d100',
        isFavorite: true,
      },
      {
        command: '1d6',
        isFavorite: false,
      },
    ]);

    act(() => result.current.updateItem({ command: '1d20', isFavorite: false }));
    expect(result.current.items).toEqual([
      {
        command: '1d100',
        isFavorite: true,
      },
      {
        command: '1d20',
        isFavorite: false,
      },
      {
        command: '1d6',
        isFavorite: false,
      },
    ]);

    act(() => result.current.updateItem({ command: '1d6', isFavorite: true }));

    expect(result.current.items).toEqual([
      {
        command: '1d6',
        isFavorite: true,
      },
      {
        command: '1d100',
        isFavorite: true,
      },
      {
        command: '1d20',
        isFavorite: false,
      },
    ]);
  });
});
