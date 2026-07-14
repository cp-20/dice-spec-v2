import { toPng } from 'html-to-image';
import { atom } from 'jotai';

import { atomWithDebounce } from '@/shared/lib/jotai/atomWithDebounce';

export const imageRefAtom = atom<React.RefObject<HTMLDivElement | null> | undefined>(undefined);
export const { currentValueAtom: scenarioNameAtom, debouncedValueAtom: debouncedScenarioNameAtom } = atomWithDebounce(
  '',
  300,
  true,
);
export const sharingImageVersionAtom = atom(0);

export const sharingImageDataUrlAtom = atom(async (get) => {
  get(sharingImageVersionAtom);
  const imageRef = get(imageRefAtom);
  if (!imageRef?.current) return null;
  return await toPng(imageRef.current);
});
