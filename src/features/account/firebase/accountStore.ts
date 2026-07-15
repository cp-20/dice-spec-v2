import { signOut } from 'firebase/auth';
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { t } from 'i18next';
import { atom, useAtomValue } from 'jotai';
import { withAtomEffect } from 'jotai-effect';
import * as v from 'valibot';

import { createCustomer } from '@/features/stripe/api';
import { type NewUserDocument, type UserDocument, userDocumentSchema } from '@/features/user/firebase/schema';
import { toast } from '@/shared/components/ui/use-toast';
import { getFirebaseAuth, getFirebaseFirestore, getFirebaseStorage } from '@/shared/lib/firebase/client';
import { FIREBASE_COLLECTIONS } from '@/shared/lib/firebase/collections';
import { uploadAvatarFromUrlToStorage } from '@/shared/lib/firebase/storage/avatars';
import { authUserAtom, authUserLoadingAtom } from '@/shared/lib/firebase/useFirebaseAuth';

const internalMeLoadingAtom = atom(true);

const internalMeAtom = withAtomEffect(atom<UserDocument | null>(null), (get, set) => {
  const auth = getFirebaseAuth();
  const firestore = getFirebaseFirestore();
  const storage = getFirebaseStorage();

  const authUserLoading = get(authUserLoadingAtom);
  if (authUserLoading) {
    set(internalMeLoadingAtom, true);
    set(internalMeAtom, null);
    return;
  }

  const authUser = get(authUserAtom);
  if (authUser === null) {
    set(internalMeAtom, null);
    set(internalMeLoadingAtom, false);
    return;
  }

  set(internalMeLoadingAtom, true);

  const userRef = doc(firestore, FIREBASE_COLLECTIONS.users, authUser.uid);
  const unsubscribe = onSnapshot(userRef, { includeMetadataChanges: true }, async (snap) => {
    // Firestore emits optimistic snapshots before setDoc reaches the server.
    if (snap.metadata.fromCache || snap.metadata.hasPendingWrites) return;

    if (!snap.exists()) {
      try {
        let avatarUrl: string | undefined;
        if (authUser.photoURL) {
          try {
            avatarUrl = await uploadAvatarFromUrlToStorage(storage, authUser.uid, authUser.photoURL);
          } catch (err) {
            console.error('Failed to upload Google avatar to Storage:', err);
          }
        }

        const newUserDocument: NewUserDocument = {
          id: authUser.uid,
          name: authUser.displayName ?? 'ユーザー',
          avatarUrl,
          plan: 'free',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          stripeCustomerId: '',
          stripeSubscriptionId: '',
          analysisCount: 0,
          analysisCountSyncAnalysisId: null,
        };
        await setDoc(userRef, newUserDocument);
      } catch (error) {
        console.error('Failed to create user document:', error);
        toast({
          title: t('profile:toast.sign-in-error-title'),
          description: t('profile:toast.sign-in-error-description'),
          variant: 'destructive',
        });

        try {
          await signOut(auth);
        } catch (signOutError) {
          console.error('Failed to sign out after user document creation failure:', signOutError);
        }

        set(internalMeAtom, null);
        set(internalMeLoadingAtom, false);
        return;
      }

      try {
        await createCustomer();
      } catch (error) {
        console.error('Failed to create Stripe customer:', error);
      }
      return;
    }

    const data = v.parse(userDocumentSchema, snap.data({ serverTimestamps: 'estimate' }));

    if (data.stripeCustomerId === '') {
      createCustomer().catch((error) => {
        console.error('Failed to create Stripe customer for existing user:', error);
      });
    }

    set(internalMeAtom, data);
    set(internalMeLoadingAtom, false);
  });

  return unsubscribe;
});

const meAtom = atom((get) => get(internalMeAtom));
const meLoadingAtom = atom((get) => get(internalMeLoadingAtom));

export const useMeStore = () => {
  const me = useAtomValue(meAtom);
  const meLoading = useAtomValue(meLoadingAtom);
  return { me, meLoading };
};
