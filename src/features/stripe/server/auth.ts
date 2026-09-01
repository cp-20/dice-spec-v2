import { runtimeEnv } from '@/shared/lib/env';

import { scheduleStripeLog } from './logger';

type IdentityToolkitLookupResponse = {
  users?: Array<{
    localId?: string;
    email?: string;
    displayName?: string;
  }>;
};

class FirebaseAuthServiceError extends Error {}

const isFirebaseApiKeyError = (body: string): boolean => {
  try {
    const payload = JSON.parse(body) as { error?: { message?: unknown; details?: unknown } };
    const values = [payload.error?.message];
    if (Array.isArray(payload.error?.details)) {
      values.push(...payload.error.details.map((detail: { reason?: unknown }) => detail.reason));
    }
    return values.some((value) => typeof value === 'string' && /API[ _-]?KEY/i.test(value));
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
  let apiKey: string;
  try {
    apiKey = runtimeEnv.firebase.webApiKey;
  } catch (error) {
    throw new FirebaseAuthServiceError('Firebase ID token verification is not configured', { cause: error });
  }

  let response: Response;
  try {
    response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
  } catch (error) {
    throw new FirebaseAuthServiceError('Firebase ID token verification request failed', { cause: error });
  }

  if (!response.ok) {
    let body: string;
    try {
      body = await response.text();
    } catch (error) {
      throw new FirebaseAuthServiceError('Failed to read Firebase ID token verification response', { cause: error });
    }
    const message = `Firebase ID token verification failed with status ${response.status}: ${body}`;
    if (response.status === 429 || response.status >= 500 || isFirebaseApiKeyError(body)) {
      throw new FirebaseAuthServiceError(message);
    }
    throw new Error(message);
  }

  let payload: IdentityToolkitLookupResponse;
  try {
    payload = (await response.json()) as IdentityToolkitLookupResponse;
  } catch (error) {
    throw new FirebaseAuthServiceError('Failed to parse Firebase ID token verification response', { cause: error });
  }
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
    const serviceFailure = error instanceof FirebaseAuthServiceError;
    const logError = serviceFailure ? (error.cause ?? error) : error;
    scheduleStripeLog({
      level: serviceFailure ? 'error' : 'warning',
      eventType,
      message: 'Firebase ID token verification failed',
      error: logError,
    });
    return null;
  }
};
