'use client';

import { doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { useAtomValue } from 'jotai';
import { useCallback } from 'react';

import { myAnalysesAtom } from '@/features/log-analysis/firebase/userAnalyses';
import { FIREBASE_COLLECTIONS } from '@/shared/lib/firebase/collections';
import { getFirebaseServices } from '@/shared/lib/firebase/client';
import { useFirebaseAuth } from '@/shared/lib/firebase/useFirebaseAuth';

import { splitProfileUpdateBatches } from './profileUpdateBatches';

type ProfileUpdate = { name: string } | { avatarUrl: string };

export const useProfileMutations = () => {
  const { firestore } = getFirebaseServices();
  const { authUser } = useFirebaseAuth();
  const analyses = useAtomValue(myAnalysesAtom);

  const updateProfile = useCallback(
    async (profileUpdate: ProfileUpdate) => {
      if (!authUser) return;

      // Firestoreのバッチ間は原子的にできない。途中失敗時は同じ更新を再実行して未反映分を収束させる。
      for (const analysesBatch of splitProfileUpdateBatches(analyses)) {
        const batch = writeBatch(firestore);
        const userRef = doc(firestore, FIREBASE_COLLECTIONS.users, authUser.uid);
        batch.set(userRef, { ...profileUpdate, updatedAt: serverTimestamp() }, { merge: true });

        for (const analysis of analysesBatch) {
          const analysisRef = doc(firestore, FIREBASE_COLLECTIONS.analyses, analysis.id);
          batch.set(
            analysisRef,
            { owner: { ...analysis.owner, ...profileUpdate, updatedAt: serverTimestamp() } },
            { merge: true },
          );
        }

        await batch.commit();
      }
    },
    [analyses, authUser, firestore],
  );

  const updateName = useCallback((name: string) => updateProfile({ name }), [updateProfile]);
  const updateAvatarUrl = useCallback(
    (avatarUrl: string) => updateProfile({ avatarUrl }),
    [updateProfile],
  );

  return { updateName, updateAvatarUrl };
};
