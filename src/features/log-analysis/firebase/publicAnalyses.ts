import {
  collection,
  type DocumentData,
  type Firestore,
  getDocs,
  limit,
  orderBy,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  query,
  startAfter,
  where,
} from 'firebase/firestore';
import { atom, useAtom, useSetAtom } from 'jotai';
import { withAtomEffect } from 'jotai-effect';
import { atomFamily } from 'jotai-family';

import { getFirebaseServices } from '@/shared/lib/firebase/client';
import { FIREBASE_COLLECTIONS } from '@/shared/lib/firebase/collections';

import { ALL_SYSTEM_ID, type AnalysisSort, type AnalysisSystemFilter } from '../query';
import {
  initialPageProgress,
  markPageFailed,
  markPageLoaded,
  requestNextPage,
  resetLoadedPages,
  retryPage,
  shouldFetchPage,
  type PageProgress,
} from './pageProgress';
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

const orderByConstraint = (sortBy: AnalysisSort): QueryConstraint => {
  switch (sortBy) {
    case 'deviationScoreDesc':
      return orderBy('primaryDeviationScore', 'desc');
    case 'deviationScoreAsc':
      return orderBy('primaryDeviationScore', 'asc');
    case 'newest':
      return orderBy('sessionDate', 'desc');
    case 'oldest':
      return orderBy('sessionDate', 'asc');
    default: {
      const _: never = sortBy;
      throw new Error(`Invalid sortBy value: ${sortBy}`);
    }
  }
};

const buildQuery = (
  firestore: Firestore,
  params: PublicAnalysesQueryParams,
  cursor: QueryDocumentSnapshot<DocumentData> | null,
) => {
  const constraints: QueryConstraint[] = [where('visibilityLevel', '==', 'public')];
  if (params.systemId !== ALL_SYSTEM_ID) constraints.push(where('systemId', '==', params.systemId));
  constraints.push(orderByConstraint(params.sortBy));
  if (cursor) constraints.push(startAfter(cursor));
  constraints.push(limit(params.pageSize));
  return query(collection(firestore, FIREBASE_COLLECTIONS.analyses), ...constraints);
};

type PublicAnalysesState = {
  analyses: AnalysisDocument[];
  progress: PageProgress;
  cursor: QueryDocumentSnapshot<DocumentData> | null;
  lastSeenInvalidationToken: number;
  loading: boolean;
  error: Error | null;
};

const internalPublicAnalysesAtomFamily = atomFamily(
  (_params: PublicAnalysesQueryParams) =>
    atom<PublicAnalysesState>({
      analyses: [],
      progress: initialPageProgress(),
      cursor: null,
      lastSeenInvalidationToken: -1,
      loading: false,
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
            hasMore: state.progress.hasMore,
            error: state.error,
          };
        },
        (_get, set, action: 'loadMore' | 'retry') => {
          set(internalPublicAnalysesAtomFamily(params), (prev) => ({
            ...prev,
            progress: action === 'retry' ? retryPage(prev.progress) : requestNextPage(prev.progress),
            error: null,
          }));
        },
      ),
      (get, set) => {
        const { firestore } = getFirebaseServices();
        const stateAtom = internalPublicAnalysesAtomFamily(params);
        const state = get(stateAtom);
        const invalidationToken = get(publicAnalysesInvalidationTokenAtom);
        const invalidated = state.lastSeenInvalidationToken !== invalidationToken;

        if (state.loading || (!invalidated && !shouldFetchPage(state.progress))) return;

        const cursor = invalidated ? null : state.cursor;
        if (invalidated) {
          set(stateAtom, (prev) => ({
            ...prev,
            analyses: [],
            progress: resetLoadedPages(prev.progress),
            cursor: null,
            lastSeenInvalidationToken: invalidationToken,
            loading: true,
            error: null,
          }));
        } else {
          set(stateAtom, (prev) => ({ ...prev, loading: true, error: null }));
        }

        getDocs(buildQuery(firestore, params, cursor))
          .then((snap) => {
            const analyses = snap.docs.flatMap((docSnap) => {
              const parsed = parseAnalysisDocument(docSnap.data({ serverTimestamps: 'estimate' }));
              if (parsed) return [parsed];
              console.error(`Invalid public analysis document: ${docSnap.id}`);
              return [];
            });

            set(stateAtom, (prev) => ({
              ...prev,
              analyses: invalidated ? analyses : [...prev.analyses, ...analyses],
              progress: markPageLoaded(prev.progress, snap.docs.length === params.pageSize),
              cursor: snap.docs.at(-1) ?? null,
              loading: false,
              error: null,
            }));
          })
          .catch((error: unknown) => {
            console.error('Error fetching public analyses:', error);
            set(stateAtom, (prev) => ({
              ...prev,
              progress: markPageFailed(prev.progress),
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
