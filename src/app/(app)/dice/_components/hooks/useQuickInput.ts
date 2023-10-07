import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';

export type QuickInputItem = {
  command: string;
  isFavorite: boolean;
};

const quickInputAtom = atom<QuickInputItem[]>([
  { command: '1d6', isFavorite: true },
  { command: '1d100', isFavorite: true },
]);

export const useQuickInput = () => {
  const [items, setItems] = useAtom(quickInputAtom);

  const updateItems = useCallback(
    (updateFunc: (prev: QuickInputItem[]) => QuickInputItem[]) => {
      setItems((prev) =>
        updateFunc(prev).toSorted(({ isFavorite: a }, { isFavorite: b }) =>
          a === b ? 0 : a ? -1 : 1,
        ),
      );
    },
    [setItems],
  );

  const addItem = useCallback(
    (command: string) => {
      const alreadyAddedItem = items.find((item) => item.command === command);

      if (alreadyAddedItem === undefined) {
        updateItems((prev) => [{ command, isFavorite: false }, ...prev]);
        return;
      }

      if (alreadyAddedItem.isFavorite) return;

      updateItems((prev) => [
        { command, isFavorite: false },
        ...prev.filter((item) => item.command !== command),
      ]);
    },
    [items, updateItems],
  );

  const updateItem = useCallback(
    (item: QuickInputItem) => {
      updateItems((prev) => [
        item,
        ...prev.filter((i) => i.command !== item.command),
      ]);
    },
    [updateItems],
  );

  const resetItems = useCallback(() => {
    setItems([
      { command: '1d6', isFavorite: true },
      { command: '1d100', isFavorite: true },
    ]);
  }, [setItems]);

  return {
    items,
    addItem,
    updateItem,
    resetItems,
  };
};
