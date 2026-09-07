import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';

import { getGameSystemInfo, type GameSystemInfo } from '@/shared/lib/bcdice/getGameSystemInfo';
import { captureClientException } from '@/shared/lib/sentryClient';
import { useGoogleAnalytics } from '@/shared/lib/useGoogleAnalytics';

type DiceRollOptions = {
  system: string;
  systemInfo: GameSystemInfo | null;
  error: boolean;
};

export const diceRollOptionAtom = atom<DiceRollOptions>({ system: 'DiceBot', systemInfo: null, error: false });
const setSystemAtom = atom(null, async (get, set, system: string) => {
  if (!system) return;
  const pending = { system, systemInfo: null, error: false };
  set(diceRollOptionAtom, pending);
  try {
    const systemInfo = await getGameSystemInfo(system);
    // 後から選択したシステムを、先行する読み込みの完了で上書きしない。
    if (get(diceRollOptionAtom) === pending) set(diceRollOptionAtom, { system, systemInfo, error: false });
  } catch (error) {
    captureClientException(error);
    if (get(diceRollOptionAtom) === pending) set(diceRollOptionAtom, { ...pending, error: true });
  }
});

export const useDiceRollOption = () => {
  const option = useAtomValue(diceRollOptionAtom);
  const selectSystem = useSetAtom(setSystemAtom);
  const { sendEvent } = useGoogleAnalytics();
  const setSystem = useCallback(
    (system: string) => {
      sendEvent('setSystem', system);
      return selectSystem(system);
    },
    [selectSystem, sendEvent],
  );
  return { option, setSystem };
};

export const useDiceRollValidation = () => {
  const option = useAtomValue(diceRollOptionAtom);
  const validate = useCallback(
    (command: string) => option.systemInfo?.command_pattern.test(command) ?? false,
    [option],
  );
  return { validate };
};
