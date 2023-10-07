import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';
import { useBcdiceApi } from '@/app/(app)/dice/_components/hooks/useBcdiceApi';
import { defaultOption } from '@/shared/lib/bcdice/defaultOption';
import type { GameSystemInfo } from '@/shared/lib/bcdice/getGameSystemInfo';

export type DiceRollOptions = {
  system: string;
  systemInfo: GameSystemInfo;
};

const diceRollOptionAtom = atom<DiceRollOptions>(defaultOption);
const diceRegexpAtom = atom(
  (get) => new RegExp(get(diceRollOptionAtom).systemInfo.command_pattern),
);

export const useDiceRollOption = () => {
  const { getGameSystemInfo } = useBcdiceApi();
  const [option, setOptions] = useAtom(diceRollOptionAtom);

  const setSystem = useCallback(
    async (system: string) => {
      try {
        const systemInfo = await getGameSystemInfo(system);
        setOptions((prev) => ({ ...prev, system, systemInfo }));
      } catch (err) {
        console.error(err);
      }
    },
    [getGameSystemInfo, setOptions],
  );

  return { option, setSystem };
};

export const useDiceRollValidation = () => {
  const [diceRegexp] = useAtom(diceRegexpAtom);

  const validate = useCallback(
    (command: string) => diceRegexp.test(command),
    [diceRegexp],
  );

  return { validate };
};
