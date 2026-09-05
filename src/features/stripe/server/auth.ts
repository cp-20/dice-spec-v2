import { runtimeEnv } from '@/shared/lib/env';

import { scheduleStripeLog } from './logger';

type IdentityToolkitLookupResponse = {
  users?: Array<{
    localId?: string;
    email?: string;
    displayName?: string;
  }>;
};

class FirebaseUserError extends Error {}

const isFirebaseUserError = (body: string): boolean => {
  try {
    const payload = JSON.parse(body) as { error?: { message?: unknown } };
    return payload.error?.message === 'INVALID_ID_TOKEN' || payload.error?.message === 'USER_NOT_FOUND';
  } catch {
    return false;
  }
};

export const getBearerToken = (authorizationHeader: string | undefined) => {
  if (!authorizationHeader) return null;

  const [scheme, token, extra] = authorizationHeader.split(' ');
  if (!scheme || !token || extra || scheme.toLowerCase() !== 'bearer') return null;
  return token;
};

const lookupFirebaseUserByIdToken = async (idToken: string) => {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${runtimeEnv.firebase.webApiKey}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ idToken }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    const message = `Firebase ID token verification failed with status ${response.status}: ${body}`;
    throw isFirebaseUserError(body) ? new FirebaseUserError(message) : new Error(message);
  }

  const payload = (await response.json()) as IdentityToolkitLookupResponse;
  return payload.users?.[0] ?? null;
};

export const getAuthenticatedUser = async (authorizationHeader: string | undefined, eventType: string) => {
  const idToken = getBearerToken(authorizationHeader);
  if (!idToken) {
    scheduleStripeLog({ level: 'warning', eventType, message: 'Missing or invalid authorization header' });
    return null;
  }

  try {
    const user = await lookupFirebaseUserByIdToken(idToken);
    if (!user?.localId) {
      scheduleStripeLog({ level: 'warning', eventType, message: 'No Firebase user was resolved from ID token' });
      return null;
    }

    if (!user.email || !user.displayName) {
      scheduleStripeLog({ level: 'warning', eventType, message: 'Authenticated user is missing email or name' });
    }

    return {
      uid: user.localId,
      email: user.email ?? 'unknown@dicespec.app',
      name: user.displayName ?? 'unknown',
    };
  } catch (error) {
    console.error('Failed to verify Firebase ID token:', error);
    scheduleStripeLog({
      level: error instanceof FirebaseUserError ? 'warning' : 'error',
      eventType,
      message: 'Firebase ID token verification failed',
      error,
    });
    return null;
  }
};
