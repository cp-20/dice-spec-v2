import { signOut } from 'firebase/auth';
import { doc, onSnapshot, serverTimestamp, setDoc, Timestamp, writeBatch } from 'firebase/firestore';
import { t } from 'i18next';
import { atom, useAtomValue } from 'jotai';
import { withAtomEffect } from 'jotai-effect';
import { atomFamily } from 'jotai-family';
import * as v from 'valibot';
import { createCustomer } from '@/features/stripe/api';
import { toast } from '@/shared/components/ui/use-toast';
import { useFirebase } from '@/shared/lib/firebase/useFirebase';
import { authUserAtom, authUserLoadingAtom, useFirebaseAuth } from '@/shared/lib/firebase/useFirebaseAuth';
import { storagePaths, uploadBufferFromUrlToStorage } from '@/shared/lib/firebase/useStorage';
import { myAnalysesAtom } from './analyses/userAnalyses';
import { COLLECTIONS, type NewUserDocument, type PublicUser, type UserDocument, userStoreSchema } from './collections';

const anonymousUserDocument: UserDocument = {
  name: '匿名ユーザー',
  plan: 'free',
  updatedAt: Timestamp.now(),
  createdAt: Timestamp.now(),
  stripeCustomerId: '',
  analysisCount: 0,
  analysisCountSyncAnalysisId: null,
};

const internalMeLoadingAtom = atom(true);

const internalMeAtom = withAtomEffect(atom<UserDocument>(anonymousUserDocument), (get, set) => {
  const { auth, firestore, storage } = useFirebase();

  const authUserLoading = get(authUserLoadingAtom);
  if (authUserLoading) return;

  const authUser = get(authUserAtom);
  if (authUser === null) {
    set(internalMeAtom, anonymousUserDocument);
    set(internalMeLoadingAtom, false);
    return;
  }

  const userRef = doc(firestore, COLLECTIONS.users, authUser.uid);
  const unsubscribe = onSnapshot(userRef, async (snap) => {
    if (!snap.exists()) {
      try {
        let avatarUrl: string | undefined;
        if (authUser.photoURL) {
          try {
            avatarUrl = await uploadBufferFromUrlToStorage(
              storage,
              storagePaths.getAvatarPath(authUser.uid),
              authUser.photoURL,
            );
          } catch (uploadError) {
            console.error('Failed to upload Google avatar to Storage:', uploadError);
          }
        }

        const newUserDocument: NewUserDocument = {
          name: authUser.displayName ?? 'ユーザー',
          avatarUrl,
          plan: 'free',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          stripeCustomerId: '',
          analysisCount: 0,
          analysisCountSyncAnalysisId: null,
        };
        await setDoc(userRef, newUserDocument);

        await createCustomer();
      } catch (error) {
        console.error('Failed to create Stripe customer:', error);
        toast({
          title: t('profile:toast.sign-in-error-title'),
          description: t('profile:toast.sign-in-error-description'),
          variant: 'destructive',
        });

        try {
          await signOut(auth);
        } catch (signOutError) {
          console.error('Failed to sign out after Stripe customer creation failure:', signOutError);
        }

        set(internalMeAtom, anonymousUserDocument);
        set(internalMeLoadingAtom, false);
      }
      return;
    }

    const data = v.parse(userStoreSchema, snap.data({ serverTimestamps: 'estimate' }));
    set(internalMeAtom, data);
    set(internalMeLoadingAtom, false);
  });

  return unsubscribe;
});

export const meAtom = atom((get) => get(internalMeAtom));
export const meLoadingAtom = atom((get) => get(internalMeLoadingAtom));

export const useMeStore = () => {
  const { authUser } = useFirebaseAuth();
  const { firestore } = useFirebase();
  const me = useAtomValue(meAtom);
  const analyses = useAtomValue(myAnalysesAtom);

  const updateName = async (newName: string) => {
    if (!authUser) return;

    const batch = writeBatch(firestore);

    const userRef = doc(firestore, COLLECTIONS.users, authUser.uid);
    batch.set(userRef, { name: newName, updatedAt: serverTimestamp() }, { merge: true });

    for (const analysis of analyses) {
      const analysisRef = doc(firestore, COLLECTIONS.analyses, analysis.id);
      batch.set(
        analysisRef,
        { owner: { ...analysis.owner, name: newName, updatedAt: serverTimestamp() } },
        { merge: true },
      );
    }

    await batch.commit();
  };

  const updateAvatarUrl = async (newAvatarUrl: string) => {
    if (!authUser) return;

    const batch = writeBatch(firestore);

    const userRef = doc(firestore, COLLECTIONS.users, authUser.uid);
    batch.set(userRef, { avatarUrl: newAvatarUrl, updatedAt: serverTimestamp() }, { merge: true });

    for (const analysis of analyses) {
      const analysisRef = doc(firestore, COLLECTIONS.analyses, analysis.id);
      batch.set(
        analysisRef,
        { owner: { ...analysis.owner, avatarUrl: newAvatarUrl, updatedAt: serverTimestamp() } },
        { merge: true },
      );
    }

    await batch.commit();
  };

  return { me, updateName, updateAvatarUrl };
};

// analyses.owner から取得される
// セキュリティ上の理由から直接取得できないため、getDoc 等はしない
export const internalUserFamilyAtom = atomFamily((_uid: string | null | undefined) => atom<PublicUser | null>(null));

export const userFamilyAtom = atomFamily((uid: string | null | undefined) =>
  atom((get) => get(internalUserFamilyAtom(uid))),
);

export const useUserStore = (uid: string | null | undefined) => {
  const userStore = useAtomValue(userFamilyAtom(uid));

  return userStore;
};
