import { atom, useAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import useImmutableSWR from 'swr/immutable';
import { useBcdiceApi } from './useBcdiceApi';
import type { GameSystem } from '@/shared/lib/bcdice/getGameSystemList';

const gameSystemListAtom = atom<GameSystem[]>([
  { id: 'DiceBot', name: 'DiceBot', sort_key: '*たいすほつと' },
]);

export const useGameSystemList = () => {
  const [gameSystemList, setGameSystemList] = useAtom(gameSystemListAtom);

  const { getGameSystemList } = useBcdiceApi();
  const { data } = useImmutableSWR('bcdice/systems', getGameSystemList);

  useEffect(() => {
    if (data !== undefined) {
      setGameSystemList(data);
    }
  }, [data, setGameSystemList]);

  const selectSystem = useCallback(
    (systemId: string) => {
      const system = gameSystemList.find((system) => system.id === systemId);
      if (system === undefined) return;

      setGameSystemList((prev) => [
        system,
        ...prev.filter((system) => system.id !== systemId),
      ]);
    },
    [gameSystemList, setGameSystemList],
  );

  return {
    gameSystemList,
    selectSystem,
  };
};
