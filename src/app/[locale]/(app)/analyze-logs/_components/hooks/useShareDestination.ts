import { atom } from 'jotai';
import { picklist } from 'valibot';

import { useLocalStorageAtom } from '@/shared/lib/useLocalStorage';

import type { ShareDestination } from '../shareUrl';

const shareDestinationAtom = atom<ShareDestination>('X');
const shareDestinationSchema = picklist(['X', 'Bluesky']);

export const useShareDestination = () =>
  useLocalStorageAtom('analysis-share-destination', shareDestinationAtom, shareDestinationSchema, 'X');
