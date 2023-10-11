import { atom } from 'jotai';
import { useCallback } from 'react';
import type { Input } from 'valibot';
import { array, boolean, object, string } from 'valibot';
import { useGoogleAnalytics } from '@/shared/lib/useGoogleAnalytics';
import { useLocalStorageAtom } from '@/shared/lib/useLocalStorage';

export const quickInputItemsSchema = array(
  object({
    command: string(),
    isFavorite: boolean(),
  }),
);

export type QuickInputItem = Input<typeof quickInputItemsSchema>[number];

const quickInputAtom = atom<QuickInputItem[]>([
  { command: '1d6', isFavorite: true },
  { command: '1d100', isFavorite: true },
]);

export const useQuickInput = () => {
  const { sendEvent } = useGoogleAnalytics();
  const [items, setItems] = useLocalStorageAtom(
    'quick-input-items',
    quickInputAtom,
    quickInputItemsSchema,
  );

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
      const eventName = item.isFavorite
        ? 'FavoriteCommand'
        : 'UnfavoriteCommand';
      sendEvent(eventName, item.command);
      updateItems((prev) => [
        item,
        ...prev.filter((i) => i.command !== item.command),
      ]);
    },
    [sendEvent, updateItems],
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
