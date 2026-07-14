import {
  collection,
  type Firestore,
  getDocs,
  limit,
  orderBy,
  type QueryOrderByConstraint,
  query,
  where,
} from 'firebase/firestore';
import { atom, useAtom, useSetAtom } from 'jotai';
import { withAtomEffect } from 'jotai-effect';
import { atomFamily } from 'jotai-family';

import { FIREBASE_COLLECTIONS } from '@/shared/lib/firebase/collections';
import { useFirebase } from '@/shared/lib/firebase/useFirebase';

import { ALL_SYSTEM_ID, type AnalysisSort, type AnalysisSystemFilter } from '../query';
import { type AnalysisDocument, parseAnalysisDocument } from './schema';

export type PublicAnalysesQueryParams = {
  systemId: AnalysisSystemFilter;
  sortBy: AnalysisSort;
  pageSize: number;
};

const publicAnalysesInvalidationTokenAtom = atom(0);
const invalidatePublicAnalysesCacheAtom = atom(null, (_get, set) => {
  set(publicAnalysesInvalidationTokenAtom, (prev) => prev + 1);
});

const queryKey = (params: PublicAnalysesQueryParams) => `${params.systemId}_${params.sortBy}_${params.pageSize}`;

const buildOrderByConstraint = (params: PublicAnalysesQueryParams): QueryOrderByConstraint => {
  switch (params.sortBy) {
    case 'deviationScoreDesc':
      return orderBy('primaryDeviationScore', 'desc');
    case 'deviationScoreAsc':
      return orderBy('primaryDeviationScore', 'asc');
    case 'newest':
      return orderBy('sessionDate', 'desc');
    case 'oldest':
      return orderBy('sessionDate', 'asc');
    default: {
      const _: never = params.sortBy;
      throw new Error(`Invalid sortBy value: ${params.sortBy}`);
    }
  }
};

const buildQuery = (firestore: Firestore, params: PublicAnalysesQueryParams, requestedTotalSize: number) => {
  const whereConstraints = [where('visibilityLevel', '==', 'public')];
  if (params.systemId !== ALL_SYSTEM_ID) {
    whereConstraints.push(where('systemId', '==', params.systemId));
  }

  return query(
    collection(firestore, FIREBASE_COLLECTIONS.analyses),
    ...whereConstraints,
    buildOrderByConstraint(params),
    limit(requestedTotalSize),
  );
};

type PublicAnalysesState = {
  analyses: AnalysisDocument[];
  requestedTotalSize: number;
  fetchedTotalSize: number;
  lastSeenInvalidationToken: number;
  loading: boolean;
  hasMore: boolean;
  error: Error | null;
};

const internalPublicAnalysesAtomFamily = atomFamily(
  (params: PublicAnalysesQueryParams) =>
    atom<PublicAnalysesState>({
      analyses: [],
      requestedTotalSize: params.pageSize,
      fetchedTotalSize: 0,
      lastSeenInvalidationToken: -1,
      loading: false,
      hasMore: true,
      error: null,
    }),
  (a, b) => queryKey(a) === queryKey(b),
);

const publicAnalysesAtom = atomFamily(
  (params: PublicAnalysesQueryParams) =>
    withAtomEffect(
      atom(
        (get) => {
          const state = get(internalPublicAnalysesAtomFamily(params));
          return {
            analyses: state.analyses,
            loading: state.loading,
            hasMore: state.hasMore,
            error: state.error,
          };
        },
        (_get, set, action: 'loadMore' | 'retry') => {
          set(internalPublicAnalysesAtomFamily(params), (prev) =>
            action === 'retry'
              ? { ...prev, fetchedTotalSize: 0, error: null }
              : { ...prev, requestedTotalSize: prev.requestedTotalSize + params.pageSize },
          );
        },
      ),
      (get, set) => {
        const { firestore } = useFirebase();
        const stateAtom = internalPublicAnalysesAtomFamily(params);
        const state = get(stateAtom);
        const invalidationToken = get(publicAnalysesInvalidationTokenAtom);
        const shouldFetch =
          state.fetchedTotalSize < state.requestedTotalSize || state.lastSeenInvalidationToken !== invalidationToken;

        if (state.loading || !shouldFetch) return;

        const requestedTotalSize = state.requestedTotalSize;
        set(stateAtom, (prev) => ({ ...prev, loading: true, error: null }));

        getDocs(buildQuery(firestore, params, requestedTotalSize))
          .then((snap) => {
            const analyses = snap.docs.flatMap((docSnap) => {
              const parsed = parseAnalysisDocument(docSnap.data({ serverTimestamps: 'estimate' }));
              if (parsed) return [parsed];

              console.error(`Invalid public analysis document: ${docSnap.id}`);
              return [];
            });

            set(stateAtom, {
              analyses,
              requestedTotalSize,
              fetchedTotalSize: requestedTotalSize,
              lastSeenInvalidationToken: invalidationToken,
              loading: false,
              hasMore: snap.docs.length === requestedTotalSize,
              error: null,
            });
          })
          .catch((error: unknown) => {
            console.error('Error fetching public analyses:', error);
            set(stateAtom, (prev) => ({
              ...prev,
              fetchedTotalSize: requestedTotalSize,
              lastSeenInvalidationToken: invalidationToken,
              loading: false,
              error: error instanceof Error ? error : new Error('Failed to fetch public analyses'),
            }));
          });
      },
    ),
  (a, b) => queryKey(a) === queryKey(b),
);

export const usePublicAnalyses = (params: PublicAnalysesQueryParams) => {
  const [state, dispatch] = useAtom(publicAnalysesAtom(params));
  return {
    ...state,
    loadMore: () => dispatch('loadMore'),
    retry: () => dispatch('retry'),
  };
};

export const useInvalidatePublicAnalysesCache = () => useSetAtom(invalidatePublicAnalysesCacheAtom);
