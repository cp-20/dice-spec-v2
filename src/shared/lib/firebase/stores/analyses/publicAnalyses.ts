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
import { atom, useAtom } from 'jotai';
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
};

const internalPublicAnalysesAtomFamily = atomFamily(
  (params: PublicAnalysesQueryParams) =>
    atom<PublicAnalysesState>({
      analyses: [],
      requestedTotalSize: params.pageSize,
      loading: false,
      hasMore: true,
      lastDoc: null,
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
        const state = get(stateAtom);
        if (!state.hasMore || state.loading || state.requestedTotalSize <= state.analyses.length) return;

        set(stateAtom, (prev) => ({ ...prev, loading: true }));

        const q = buildQuery(firestore, params, state.lastDoc);
        getDocs(q).then((snap) => {
          const data = snap.docs.map((docSnap) =>
            v.parse(analysesStoreSchema, docSnap.data({ serverTimestamps: 'estimate' })),
          );
          set(stateAtom, (prev) => ({
            analyses: prev.analyses.concat(data),
            requestedTotalSize: prev.requestedTotalSize,
            loading: false,
            hasMore: snap.docs.length === params.pageSize,
            lastDoc: snap.docs.slice(-1)[0] ?? state.lastDoc,
          }));
          for (const analysis of data) {
            set(internalUserFamilyAtom(analysis.ownerUid), analysis.owner);
          }
        });
      },
    ),
  (a, b) => queryKey(a) === queryKey(b),
);

export const usePublicAnalyses = (params: PublicAnalysesQueryParams) => {
  const [state, loadMore] = useAtom(publicAnalysesAtom(params));

  return { ...state, loadMore };
};
