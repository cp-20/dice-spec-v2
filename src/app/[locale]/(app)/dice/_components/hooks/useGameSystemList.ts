import { atom } from 'jotai';
import { useCallback, useEffect } from 'react';
import useImmutableSWR from 'swr/immutable';
import * as v from 'valibot';
import { useBcdiceApi } from './useBcdiceApi';
import { type GameSystem, gameSystemSchema } from '@/shared/lib/bcdice/getGameSystemList';
import { useLocalStorageAtom } from '@/shared/lib/useLocalStorage';

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
    // setGameSystemListをdependency arrayに入れると無限ループする (setGameSystemListがgameSystemListに依存しているため)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, setGameSystemList]);

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
