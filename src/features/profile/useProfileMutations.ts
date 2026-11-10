'use client';

import { doc, type Firestore, serverTimestamp, writeBatch } from 'firebase/firestore';
import { useAtomValue } from 'jotai';
import { useCallback } from 'react';

import { meAtom } from '@/features/account/firebase/accountStore';
import { myAnalysesAtom } from '@/features/log-analysis/firebase/userAnalyses';
import { toPublicUser, type UserDocument } from '@/features/user/firebase/schema';
import { getFirebaseFirestore } from '@/shared/lib/firebase/client';
import { FIREBASE_COLLECTIONS } from '@/shared/lib/firebase/collections';

import { splitProfileUpdateBatches } from './profileUpdateBatches';

type ProfileUpdate = { name: string } | { avatarUrl: string };

export const updateProfile = async (
  firestore: Firestore,
  me: UserDocument,
  analysisIds: string[],
  profileUpdate: ProfileUpdate,
) => {
  // 保存済みの owner ではなく現在の users から作る。プランなどサーバーが書き換えた項目も一致させないと Rules に拒否される。
  const owner = { ...toPublicUser(me), ...profileUpdate, updatedAt: serverTimestamp() };

  // Firestoreのバッチ間は原子的にできない。途中失敗時は同じ更新を再実行して未反映分を収束させる。
  for (const analysisIdsBatch of splitProfileUpdateBatches(analysisIds)) {
    const batch = writeBatch(firestore);
    const userRef = doc(firestore, FIREBASE_COLLECTIONS.users, me.id);
    batch.set(userRef, { ...profileUpdate, updatedAt: serverTimestamp() }, { merge: true });

    for (const analysisId of analysisIdsBatch) {
      batch.set(doc(firestore, FIREBASE_COLLECTIONS.analyses, analysisId), { owner }, { merge: true });
    }

    await batch.commit();
  }
};

export const useProfileMutations = () => {
  const me = useAtomValue(meAtom);
  const analyses = useAtomValue(myAnalysesAtom);

  const update = useCallback(
    async (profileUpdate: ProfileUpdate) => {
      if (!me) return;
      await updateProfile(
        getFirebaseFirestore(),
        me,
        analyses.map((analysis) => analysis.id),
        profileUpdate,
      );
    },
    [analyses, me],
  );

  const updateName = useCallback((name: string) => update({ name }), [update]);
  const updateAvatarUrl = useCallback((avatarUrl: string) => update({ avatarUrl }), [update]);

  return { updateName, updateAvatarUrl };
};
