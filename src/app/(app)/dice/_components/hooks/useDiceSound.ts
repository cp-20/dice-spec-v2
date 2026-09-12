import { useCallback, useRef } from 'react';

import { useAdvancedSettings } from './useAdvancedSettings';

export const useDiceSound = () => {
  const { advancedSettings } = useAdvancedSettings();
  const audioRef = useRef<HTMLAudioElement>(null);

  const play = useCallback(() => {
    if (!advancedSettings.playSound) return;

    const audio = audioRef.current ?? new Audio('/dice.wav');
    audioRef.current = audio;
    audio.volume = advancedSettings.volume / 100;
    audio.currentTime = 0;
    audio.play().catch(() => undefined);
  }, [advancedSettings.playSound, advancedSettings.volume]);

  return { play };
};
