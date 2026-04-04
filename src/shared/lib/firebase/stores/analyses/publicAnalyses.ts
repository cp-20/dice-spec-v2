import {
  collection,
  type DocumentSnapshot,
  type Firestore,
  getDocs,
  limit,
  orderBy,
  type QueryOrderByConstraint,
  query,
  startAfter,
  where,
} from 'firebase/firestore';
import { atom, useAtom, useSetAtom } from 'jotai';
import { withAtomEffect } from 'jotai-effect';
import { atomFamily } from 'jotai-family';
import * as v from 'valibot';
import {
  ALL_SYSTEM_ID,
  type SortOption,
  type SystemFilterOption,
} from '@/app/[locale]/(app)/analyze-logs/list/_components/atoms';
import { useFirebase } from '@/shared/lib/firebase/useFirebase';
import { type AnalysisDocument, analysesStoreSchema, COLLECTIONS } from '../collections';
import { internalUserFamilyAtom } from '../userStore';

export type PublicAnalysesQueryParams = {
  systemId: SystemFilterOption;
  sortBy: SortOption;
  pageSize: number;
};

export type PublicAnalysesCachePolicy = {
  maxAgeMs: number;
  staleWhileRevalidateMs: number;
};

const defaultPublicAnalysesCachePolicy: PublicAnalysesCachePolicy = {
  maxAgeMs: 120_000,
  staleWhileRevalidateMs: 600_000,
};

export const publicAnalysesCachePolicyAtom = atom<PublicAnalysesCachePolicy>(defaultPublicAnalysesCachePolicy);

const publicAnalysesInvalidationTokenAtom = atom(0);
const invalidatePublicAnalysesCacheAtom = atom(null, (_get, set) => {
  set(publicAnalysesInvalidationTokenAtom, (prev) => prev + 1);
});

const queryKey = (params: PublicAnalysesQueryParams) => `${params.systemId}_${params.sortBy}`;

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

const buildQuery = (firestore: Firestore, params: PublicAnalysesQueryParams, lastDoc: DocumentSnapshot | null) => {
  const whereConstraints = [where('visibilityLevel', '==', 'public')];

  if (params.systemId !== ALL_SYSTEM_ID) {
    whereConstraints.push(where('systemId', '==', params.systemId));
  }

  const orderByConstraint = buildOrderByConstraint(params);

  const collectionRef = collection(firestore, COLLECTIONS.analyses);

  if (lastDoc) {
    return query(collectionRef, ...whereConstraints, orderByConstraint, limit(params.pageSize), startAfter(lastDoc));
  }

  return query(collectionRef, ...whereConstraints, orderByConstraint, limit(params.pageSize));
};

type PublicAnalysesState = {
  analyses: AnalysisDocument[];
  requestedTotalSize: number;
  loading: boolean;
  hasMore: boolean;
  lastDoc: DocumentSnapshot | null;
  lastFetchedAt: number | null;
  lastSeenInvalidationToken: number;
};

const internalPublicAnalysesAtomFamily = atomFamily(
  (params: PublicAnalysesQueryParams) =>
    atom<PublicAnalysesState>({
      analyses: [],
      requestedTotalSize: params.pageSize,
      loading: false,
      hasMore: true,
      lastDoc: null,
      lastFetchedAt: null,
      lastSeenInvalidationToken: 0,
    }),
  (a, b) => queryKey(a) === queryKey(b),
);

export const publicAnalysesAtom = atomFamily(
  (params: PublicAnalysesQueryParams) =>
    withAtomEffect(
      atom(
        (get) => {
          const stateAtom = internalPublicAnalysesAtomFamily(params);
          const state = get(stateAtom);
          return {
            analyses: state.analyses,
            loading: state.loading,
            hasMore: state.hasMore,
          };
        },
        (_, set) => {
          const stateAtom = internalPublicAnalysesAtomFamily(params);
          set(stateAtom, (prev) => ({ ...prev, requestedTotalSize: prev.requestedTotalSize + params.pageSize }));
        },
      ),
      (get, set) => {
        const { firestore } = useFirebase();
        const stateAtom = internalPublicAnalysesAtomFamily(params);
        const cachePolicy = get(publicAnalysesCachePolicyAtom);
        const invalidationToken = get(publicAnalysesInvalidationTokenAtom);
        const state = get(stateAtom);
        if (state.loading) return;

        const hasCache = state.analyses.length > 0;
        const now = Date.now();
        const ageMs = state.lastFetchedAt === null ? Number.POSITIVE_INFINITY : now - state.lastFetchedAt;
        const isFresh = hasCache && ageMs <= cachePolicy.maxAgeMs;
        const shouldForceRevalidate = invalidationToken > state.lastSeenInvalidationToken;
        const isWithinStaleWindow = hasCache && ageMs <= cachePolicy.maxAgeMs + cachePolicy.staleWhileRevalidateMs;
        const shouldBackgroundRevalidate = !isFresh && isWithinStaleWindow;
        const shouldHardReload = !isFresh && !isWithinStaleWindow;
        const needsPaginationFetch = state.hasMore && state.requestedTotalSize > state.analyses.length;

        if (!shouldForceRevalidate && !shouldBackgroundRevalidate && !shouldHardReload && !needsPaginationFetch) {
          return;
        }

        if (shouldHardReload) {
          set(stateAtom, (prev) => ({ ...prev, analyses: [], hasMore: true, lastDoc: null }));
        }

        set(stateAtom, (prev) => ({ ...prev, loading: true }));

        const shouldResetAndFetchFromTop = shouldForceRevalidate || shouldBackgroundRevalidate || shouldHardReload;
        const requestedTotalSize = shouldResetAndFetchFromTop ? state.requestedTotalSize : params.pageSize;
        const queryParams = shouldResetAndFetchFromTop ? { ...params, pageSize: requestedTotalSize } : params;
        const q = buildQuery(firestore, queryParams, shouldResetAndFetchFromTop ? null : state.lastDoc);

        getDocs(q)
          .then((snap) => {
            const data = snap.docs.map((docSnap) =>
              v.parse(analysesStoreSchema, docSnap.data({ serverTimestamps: 'estimate' })),
            );
            set(stateAtom, (prev) => ({
              analyses: shouldResetAndFetchFromTop ? data : prev.analyses.concat(data),
              requestedTotalSize: prev.requestedTotalSize,
              loading: false,
              hasMore: snap.docs.length === queryParams.pageSize,
              lastDoc: snap.docs.slice(-1)[0] ?? (shouldResetAndFetchFromTop ? null : state.lastDoc),
              lastFetchedAt: Date.now(),
              lastSeenInvalidationToken: invalidationToken,
            }));
            for (const analysis of data) {
              set(internalUserFamilyAtom(analysis.ownerUid), analysis.owner);
            }
          })
          .catch((error) => {
            // FIXME: ユーザーにも分かるようにエラーを出す
            console.error('Error fetching public analyses:', error);
            set(stateAtom, (prev) => ({ ...prev, loading: false }));
          });
      },
    ),
  (a, b) => queryKey(a) === queryKey(b),
);

export const usePublicAnalyses = (params: PublicAnalysesQueryParams) => {
  const [state, loadMore] = useAtom(publicAnalysesAtom(params));

  return { ...state, loadMore };
};

export const usePublicAnalysesCachePolicy = () => useAtom(publicAnalysesCachePolicyAtom);

export const useInvalidatePublicAnalysesCache = () => useSetAtom(invalidatePublicAnalysesCacheAtom);
