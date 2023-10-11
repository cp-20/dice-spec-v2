import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';
import { useBcdiceApi } from './useBcdiceApi';
import { defaultOption } from '@/shared/lib/bcdice/defaultOption';
import type { GameSystemInfo } from '@/shared/lib/bcdice/getGameSystemInfo';
import { useGoogleAnalytics } from '@/shared/lib/useGoogleAnalytics';

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
  const { sendEvent } = useGoogleAnalytics();

  const setSystem = useCallback(
    async (system: string) => {
      sendEvent('setSystem', system);
      try {
        const systemInfo = await getGameSystemInfo(system);
        setOptions((prev) => ({ ...prev, system, systemInfo }));
      } catch (err) {
        sendEvent('getGameSystemInfoFailed', system);
        console.error(err);
      }
    },
    [getGameSystemInfo, sendEvent, setOptions],
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
