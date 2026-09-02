import { FirebaseError } from 'firebase/app';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, type User, AuthErrorCodes } from 'firebase/auth';
import { atom, useAtomValue } from 'jotai';
import { withAtomEffect } from 'jotai-effect';
import { useCallback } from 'react';

import { captureClientException } from '@/shared/lib/sentryClient';
import { useGoogleAnalytics } from '@/shared/lib/useGoogleAnalytics';

import { getFirebaseAuth } from './client';
import { signOutWithGuard } from './signOut';

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
  const { sendEvent } = useGoogleAnalytics();

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      sendEvent('login', { method: 'Google' });
    } catch (err) {
      if (isExpectedSignInCancellation(err)) {
        sendEvent('login_error', { method: 'Google', reason: 'cancelled' });
        return;
      }
      captureClientException(err);
      throw err;
    }
  }, [auth, sendEvent]);

  const signOutUser = useCallback(async () => {
    try {
      if (await signOutWithGuard(auth)) sendEvent('logout');
    } catch (err) {
      captureClientException(err);
      throw err;
    }
  }, [auth, sendEvent]);

  return {
    authUser,
    loading,
    signInWithGoogle,
    signOut: signOutUser,
  };
};
