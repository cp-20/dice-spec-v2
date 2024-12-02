import { atom } from 'jotai';
import { useCallback } from 'react';
import type { InferInput } from 'valibot';
import * as v from 'valibot';
import { formatDiceCommand } from '@/shared/lib/formatDiceCommand';
import { useGoogleAnalytics } from '@/shared/lib/useGoogleAnalytics';
import { useLocalStorageAtom } from '@/shared/lib/useLocalStorage';

export const quickInputItemsSchema = v.array(
  v.object({
    command: v.string(),
    isFavorite: v.boolean(),
  }),
);

export type QuickInputItem = InferInput<typeof quickInputItemsSchema>[number];

const quickInputAtom = atom<QuickInputItem[]>([
  { command: '1d6', isFavorite: true },
  { command: '1d100', isFavorite: true },
]);

export const useQuickInput = () => {
  const { sendEvent } = useGoogleAnalytics();
  const [items, setItems] = useLocalStorageAtom('quick-input-items', quickInputAtom, quickInputItemsSchema);

  const updateItems = useCallback(
    (updateFunc: (prev: QuickInputItem[]) => QuickInputItem[]) => {
      setItems((prev) =>
        updateFunc(prev).toSorted(({ isFavorite: a }, { isFavorite: b }) => (a === b ? 0 : a ? -1 : 1)),
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

      updateItems((prev) => [{ command, isFavorite: false }, ...prev.filter((item) => item.command !== command)]);
    },
    [items, updateItems],
  );

  const updateItem = useCallback(
    (item: QuickInputItem) => {
      const eventName = item.isFavorite ? 'favoriteCommand' : 'unfavoriteCommand';
      sendEvent(eventName, formatDiceCommand(item.command));
      updateItems((prev) => [item, ...prev.filter((i) => i.command !== item.command)]);
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
