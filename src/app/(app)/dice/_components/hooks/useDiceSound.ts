import { useCallback } from 'react';
import useSound from 'use-sound';
import { useAdvancedSettings } from './useAdvancedSettings';

export const useDiceSound = () => {
  const { advancedSettings } = useAdvancedSettings();
  const [playSound] = useSound('/dice.wav', {
    volume: advancedSettings.volume / 100,
  });

  const play = useCallback(() => {
    if (advancedSettings.playSound) {
      playSound();
    }
  }, [advancedSettings.playSound, playSound]);

  return { play };
};
