import { toPng } from 'html-to-image';
import { atom } from 'jotai';
import { unwrap } from 'jotai/utils';

import { atomWithDebounce } from '@/shared/lib/jotai/atomWithDebounce';

export const imageRefAtom = atom<React.RefObject<HTMLDivElement | null> | undefined>(undefined);
export const { currentValueAtom: scenarioNameAtom, debouncedValueAtom: debouncedScenarioNameAtom } = atomWithDebounce(
  '',
  300,
);
export const sharingImageVersionAtom = atom(0);

// 画像生成でSuspenseに入ると、画像元のrefが再接続されて生成が繰り返されるため、待機中はnullを返す。
export const sharingImageDataUrlAtom = unwrap(
  atom(async (get) => {
    get(sharingImageVersionAtom);
    const imageRef = get(imageRefAtom);
    if (!imageRef?.current) return null;
    return await toPng(imageRef.current);
  }),
  () => null,
);
