import { atom } from 'jotai';
import { useCallback } from 'react';
import * as v from 'valibot';

import { type GameSystem, gameSystemSchema } from '@/shared/lib/bcdice/getGameSystemList';
import { gameSystems } from '@/shared/lib/bcdice/loader';
import { useLocalStorageAtom } from '@/shared/lib/useLocalStorage';

const gameSystemListSchema = v.array(gameSystemSchema);

const gameSystemListAtom = atom<GameSystem[]>([{ id: 'DiceBot', name: 'DiceBot', sort_key: '*たいすほつと' }]);

export const useGameSystemList = () => {
  const [gameSystemList, setGameSystemList] = useLocalStorageAtom(
    'game-system-list',
    gameSystemListAtom,
    gameSystemListSchema,
  );

  // 未収録の保存済み ID も最近使用順とともに保持する。
  const systems = gameSystemList
    .map((saved) => gameSystems.find((system) => system.id === saved.id) ?? saved)
    .concat(gameSystems.filter((system) => !gameSystemList.some((saved) => saved.id === system.id)));

  const selectSystem = useCallback(
    (systemId: string) => {
      const system = systems.find((system) => system.id === systemId);
      if (system === undefined) return;

      setGameSystemList((prev) => [system, ...prev.filter((system) => system.id !== systemId)]);
    },
    [systems, setGameSystemList],
  );

  return {
    gameSystemList: systems,
    selectSystem,
  };
};
