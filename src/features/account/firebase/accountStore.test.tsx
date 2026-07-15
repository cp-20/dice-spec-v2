import { expect, mock, test, vi } from 'bun:test';

import { act, renderHook, waitFor } from '@testing-library/react';
import * as firestore from 'firebase/firestore';
import { atom } from 'jotai';

type Snapshot = {
  exists: () => boolean;
  data: () => Record<string, unknown>;
  metadata: { fromCache: boolean; hasPendingWrites: boolean };
};

let snapshotListener: ((snapshot: Snapshot) => Promise<void>) | undefined;
let snapshotOptions: unknown;
let resolveSetDoc: (() => void) | undefined;

const setDocMock = vi.fn(
  () =>
    new Promise<void>((resolve) => {
      resolveSetDoc = resolve;
    }),
);
const createCustomerError = new Error('Failed to create customer', {
  cause: { name: 'Error', message: 'User not found' },
});
const createCustomerMock = vi.fn(async () => {
  throw createCustomerError;
});
const signOutMock = vi.fn();

mock.module('firebase/auth', () => ({ signOut: signOutMock }));
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
mock.module('@/shared/lib/firebase/storage/avatars', () => ({ uploadAvatarFromUrlToStorage: vi.fn() }));
mock.module('@/shared/lib/firebase/useFirebaseAuth', () => ({
  authUserAtom: atom({ uid: 'user_1', displayName: 'User', photoURL: null }),
  authUserLoadingAtom: atom(false),
}));

test('未確定のユーザー文書では Customer を作らず、User not found でもログアウトしない', async () => {
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
  expect(errorSpy).toHaveBeenCalledWith('Failed to create Stripe customer:', createCustomerError);
  expect(signOutMock).not.toHaveBeenCalled();
  errorSpy.mockRestore();
});
