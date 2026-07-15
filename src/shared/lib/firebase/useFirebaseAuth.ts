import { FirebaseError } from 'firebase/app';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
  AuthErrorCodes,
} from 'firebase/auth';
import { atom, useAtomValue } from 'jotai';
import { withAtomEffect } from 'jotai-effect';
import { useCallback } from 'react';

import { getFirebaseAuth } from './client';

const internalAuthUserLoadingAtom = atom(true);

export const isExpectedSignInCancellation = (error: unknown) =>
  error instanceof FirebaseError &&
  (error.code === AuthErrorCodes.POPUP_CLOSED_BY_USER || error.code === AuthErrorCodes.EXPIRED_POPUP_REQUEST);

const internalAuthUserAtom = withAtomEffect(atom<User | null>(null), (_, set) => {
  const auth = getFirebaseAuth();

  const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
    set(internalAuthUserAtom, nextUser);
    set(internalAuthUserLoadingAtom, false);
  });

  return unsubscribe;
});
export const authUserAtom = atom((get) => get(internalAuthUserAtom));
export const authUserLoadingAtom = atom((get) => get(internalAuthUserLoadingAtom));

export const useFirebaseAuth = () => {
  const auth = getFirebaseAuth();
  const authUser = useAtomValue(internalAuthUserAtom);
  const loading = useAtomValue(internalAuthUserLoadingAtom);

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      if (isExpectedSignInCancellation(err)) return;
      throw err;
    }
  }, [auth]);

  const signOutUser = useCallback(async () => {
    await signOut(auth);
  }, [auth]);

  return {
    authUser,
    loading,
    signInWithGoogle,
    signOut: signOutUser,
  };
};
