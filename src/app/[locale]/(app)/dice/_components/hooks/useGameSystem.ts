import type GameSystemClass from 'bcdice/lib/game_system';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { withAtomEffect } from 'jotai-effect';
import { useCallback } from 'react';

import { gameSystemsById, loadGameSystem } from '@/shared/lib/bcdice/loader';
import { captureClientException } from '@/shared/lib/sentryClient';
import { useGoogleAnalytics } from '@/shared/lib/useGoogleAnalytics';

import { rememberSystemAtom } from '../gameSystemHistory';

type GameSystemState = { system: string } & (
  | { status: 'loading' | 'error'; engine: null }
  | { status: 'ready'; engine: GameSystemClass }
);

const selectionAtom = atom<GameSystemState>({ system: 'DiceBot', status: 'loading', engine: null });

export const gameSystemAtom = withAtomEffect(selectionAtom, (get, set) => {
  const selected = get(selectionAtom);
  if (selected.status !== 'loading') return;

  void loadGameSystem(selected.system).then(
    (engine) => {
      // 後から選択したシステムを、先行する読み込みの完了で上書きしない。
      if (get.peek(selectionAtom) === selected) {
        set(selectionAtom, { system: selected.system, status: 'ready', engine });
      }
    },
    (error: unknown) => {
      captureClientException(error);
      if (get.peek(selectionAtom) === selected) set(selectionAtom, { ...selected, status: 'error' });
    },
  );
});

export const selectGameSystemAtom = atom(null, (get, set, system: string) => {
  if (!gameSystemsById.has(system)) return;
  set(rememberSystemAtom, system);
  const selected = get(selectionAtom);
  if (selected.system === system && selected.status !== 'error') return;
  set(selectionAtom, { system, status: 'loading', engine: null });
});

export const useGameSystem = () => {
  const selection = useAtomValue(gameSystemAtom);
  const selectSystem = useSetAtom(selectGameSystemAtom);
  const { sendEvent } = useGoogleAnalytics();
  const setSystem = useCallback(
    (system: string) => {
      sendEvent('setSystem', system);
      selectSystem(system);
    },
    [selectSystem, sendEvent],
  );
  return { selection, setSystem };
};
