import { expect, mock, test, vi } from 'bun:test';

import { act, renderHook, waitFor } from '@testing-library/react';
import * as firebaseAuth from 'firebase/auth';
import * as firestore from 'firebase/firestore';
import { atom } from 'jotai';

import * as firebaseAuthHook from '@/shared/lib/firebase/useFirebaseAuth';

type Snapshot = {
  exists: () => boolean;
  data: () => Record<string, unknown>;
  metadata: { fromCache: boolean; hasPendingWrites: boolean };
};

let snapshotListener: ((snapshot: Snapshot) => Promise<void>) | undefined;
let snapshotOptions: unknown;
let resolveSetDoc: (() => void) | undefined;

const setDocMock = vi.fn(
  (_ref: unknown, _data: Record<string, unknown>) =>
    new Promise<void>((resolve) => {
      resolveSetDoc = resolve;
    }),
);
const avatarUploadError = new Error('Firebase Storage: User does not have permission');
const uploadAvatarMock = vi.fn(async () => {
  throw avatarUploadError;
});
const createCustomerError = new Error('Failed to create customer', {
  cause: { name: 'Error', message: 'User not found' },
});
const createCustomerMock = vi.fn(async () => {
  throw createCustomerError;
});
const signOutMock = vi.fn();

mock.module('firebase/auth', () => ({ ...firebaseAuth, signOut: signOutMock }));
mock.module('firebase/firestore', () => ({
  ...firestore,
  doc: vi.fn(() => ({})),
  onSnapshot: vi.fn((...args: unknown[]) => {
    snapshotOptions = args[1];
    snapshotListener = args.find((arg) => typeof arg === 'function') as (snapshot: Snapshot) => Promise<void>;
    return vi.fn();
  }),
  serverTimestamp: vi.fn(() => ({})),
  setDoc: setDocMock,
}));

mock.module('@/features/stripe/api', () => ({ createCustomer: createCustomerMock }));
mock.module('@/shared/lib/firebase/client', () => ({
  getFirebaseAuth: () => ({}),
  getFirebaseFirestore: () => ({}),
  getFirebaseStorage: () => ({}),
}));
mock.module('@/shared/lib/firebase/storage/avatars', () => ({ uploadAvatarFromUrlToStorage: uploadAvatarMock }));
mock.module('@/shared/lib/firebase/useFirebaseAuth', () => ({
  ...firebaseAuthHook,
  authUserAtom: atom({ uid: 'user_1', displayName: 'User', photoURL: 'https://example.com/avatar.png' }),
  authUserLoadingAtom: atom(false),
}));

test('アバター保存失敗時もユーザー文書を作り、User not found でログアウトしない', async () => {
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  const { useMeStore } = await import('./accountStore');
  renderHook(() => useMeStore());

  await waitFor(() => expect(snapshotListener).toBeDefined());
  expect(snapshotOptions).toEqual({ includeMetadataChanges: true });

  await act(async () => {
    await snapshotListener!({
      exists: () => true,
      data: () => ({}),
      metadata: { fromCache: true, hasPendingWrites: false },
    });
  });
  expect(createCustomerMock).not.toHaveBeenCalled();

  const createUserDocument = snapshotListener!({
    exists: () => false,
    data: () => ({}),
    metadata: { fromCache: false, hasPendingWrites: false },
  });
  await waitFor(() => expect(setDocMock).toHaveBeenCalledTimes(1));
  expect(setDocMock.mock.calls[0]?.[1]).not.toHaveProperty('avatarUrl');

  await act(async () => {
    await snapshotListener!({
      exists: () => true,
      data: () => ({
        id: 'user_1',
        name: 'User',
        plan: 'free',
        createdAt: firestore.Timestamp.fromMillis(0),
        updatedAt: firestore.Timestamp.fromMillis(0),
        stripeCustomerId: '',
        stripeSubscriptionId: '',
        analysisCount: 0,
        analysisCountSyncAnalysisId: null,
      }),
      metadata: { fromCache: false, hasPendingWrites: true },
    });
  });

  expect(createCustomerMock).not.toHaveBeenCalled();

  resolveSetDoc!();
  await act(async () => {
    await createUserDocument;
  });

  expect(createCustomerMock).toHaveBeenCalledTimes(1);
  expect(errorSpy).toHaveBeenCalledWith('Failed to upload Google avatar to Storage:', avatarUploadError);
  expect(errorSpy).toHaveBeenCalledWith('Failed to create Stripe customer:', createCustomerError);
  expect(signOutMock).not.toHaveBeenCalled();
  errorSpy.mockRestore();
});
