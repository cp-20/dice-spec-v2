import { atom } from 'jotai';
import { atomFamily } from 'jotai-family';

import type { PublicUser } from './collections';

// analyses.owner のスナップショットからのみ設定し、非公開の users を直接参照しない。
export const internalUserFamilyAtom = atomFamily((_uid: string | null | undefined) => atom<PublicUser | null>(null));
