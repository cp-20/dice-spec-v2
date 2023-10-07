import { atom, useAtom } from 'jotai';
import type { AdvancedSettings } from '@/app/(app)/dice/_components/AdvancedSettingsContent';
import { bcdiceApiEndpoint } from '@/shared/lib/const';

const advancedSettingsAtom = atom<AdvancedSettings>({
  showHelp: true,
  playSound: false,
  volume: 50,
  bcdiceApiEndpoint,
});

export const useAdvancedSettings = () => {
  const [advancedSettings, setAdvancedSettings] = useAtom(advancedSettingsAtom);

  return {
    advancedSettings,
    setAdvancedSettings,
  };
};
