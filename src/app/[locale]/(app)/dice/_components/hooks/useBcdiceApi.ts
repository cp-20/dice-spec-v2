import { useMemo } from 'react';
import { useAdvancedSettings } from './useAdvancedSettings';
import { getDiceRollGenerator } from '@/shared/lib/bcdice/getDiceRoll';
import { getGameSystemInfoGenerator } from '@/shared/lib/bcdice/getGameSystemInfo';
import { getGameSystemListGenerator } from '@/shared/lib/bcdice/getGameSystemList';

export const useBcdiceApi = () => {
  const { advancedSettings } = useAdvancedSettings();

  const bcdiceApiEndpoint = advancedSettings.bcdiceApiEndpoint;

  const getDiceRoll = useMemo(() => getDiceRollGenerator(bcdiceApiEndpoint), [bcdiceApiEndpoint]);
  const getGameSystemInfo = useMemo(() => getGameSystemInfoGenerator(bcdiceApiEndpoint), [bcdiceApiEndpoint]);
  const getGameSystemList = useMemo(() => getGameSystemListGenerator(bcdiceApiEndpoint), [bcdiceApiEndpoint]);

  return { getDiceRoll, getGameSystemInfo, getGameSystemList };
};
