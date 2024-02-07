import { atom } from 'jotai';
import {
  AdvancedSettingsFormSchema,
  type AdvancedSettings,
} from '@/app/[locale]/(app)/dice/_components/AdvancedSettingsContent';
import { bcdiceApiEndpoint } from '@/shared/lib/const';
import { useLocalStorageAtom } from '@/shared/lib/useLocalStorage';

const advancedSettingsAtom = atom<AdvancedSettings>({
  showHelp: true,
  playSound: false,
  volume: 50,
  bcdiceApiEndpoint,
});

export const useAdvancedSettings = () => {
  const [advancedSettings, setAdvancedSettings] = useLocalStorageAtom(
    'dice-advanced-settings',
    advancedSettingsAtom,
    AdvancedSettingsFormSchema,
  );

  return {
    advancedSettings,
    setAdvancedSettings,
  };
};
