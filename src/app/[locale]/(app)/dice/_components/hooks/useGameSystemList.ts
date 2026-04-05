import { atom } from 'jotai';
import { useCallback, useEffect } from 'react';
import useImmutableSWR from 'swr/immutable';
import * as v from 'valibot';

import { type GameSystem, gameSystemSchema } from '@/shared/lib/bcdice/getGameSystemList';
import { useLocalStorageAtom } from '@/shared/lib/useLocalStorage';

import { useBcdiceApi } from './useBcdiceApi';

const gameSystemListSchema = v.array(gameSystemSchema);

const gameSystemListAtom = atom<GameSystem[]>([{ id: 'DiceBot', name: 'DiceBot', sort_key: '*たいすほつと' }]);

export const useGameSystemList = () => {
  const [gameSystemList, setGameSystemList] = useLocalStorageAtom(
    'game-system-list',
    gameSystemListAtom,
    gameSystemListSchema,
  );

  const { getGameSystemList } = useBcdiceApi();
  const { data } = useImmutableSWR('bcdice/systems', getGameSystemList);

  useEffect(() => {
    if (data !== undefined) {
      const newSystemIds = data.map((system) => system.id);
      setGameSystemList((prev) => {
        const prevSystemIds = prev.map((system) => system.id);
        return prev
          .filter((system) => newSystemIds.includes(system.id))
          .concat(data.filter((system) => !prevSystemIds.includes(system.id)));
      });
    }
    // oxlint-disable-next-line eslint-plugin-react-hooks/exhaustive-deps setGameSystemListをdependency arrayに入れると無限ループする (setGameSystemListがgameSystemListに依存しているため)
  }, [data]);

  const selectSystem = useCallback(
    (systemId: string) => {
      const system = gameSystemList.find((system) => system.id === systemId);
      if (system === undefined) return;

      setGameSystemList((prev) => [system, ...prev.filter((system) => system.id !== systemId)]);
    },
    [gameSystemList, setGameSystemList],
  );

  return {
    gameSystemList,
    selectSystem,
  };
};
