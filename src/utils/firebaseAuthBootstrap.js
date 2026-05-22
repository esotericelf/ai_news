import { getRedirectResult, onAuthStateChanged } from 'firebase/auth';
import { formatFirebaseAuthError } from './firebaseAuthErrors';
import { clearFirebaseRedirectParams, isFirebaseRedirectReturn } from './firebaseAuthSignIn';

/** Survives React StrictMode remount (redirect result can only be consumed once). */
let redirectResultPromise = null;

export function getRedirectResultOnce(auth) {
  if (!auth) {
    return Promise.resolve(null);
  }
  if (!redirectResultPromise) {
    redirectResultPromise = getRedirectResult(auth).catch((err) => {
      redirectResultPromise = null;
      throw err;
    });
  }
  return redirectResultPromise;
}

function waitForAuthUser(auth, maxMs = 5000) {
  if (auth.currentUser) {
    return Promise.resolve(auth.currentUser);
  }
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      unsub();
      resolve(auth.currentUser);
    }, maxMs);

    const unsub = onAuthStateChanged(auth, (nextUser) => {
      if (nextUser) {
        clearTimeout(timeout);
        unsub();
        resolve(nextUser);
      }
    });
  });
}

/**
 * Complete OAuth redirect and resolve a Firebase user (or null).
 */
export async function bootstrapFirebaseAuth(auth) {
  const returning = isFirebaseRedirectReturn();
  let redirectError = null;

  try {
    await getRedirectResultOnce(auth);
  } catch (err) {
    if (err?.code && err.code !== 'auth/no-auth-event') {
      redirectError = err;
    }
  }

  let user = auth.currentUser;
  if (!user) {
    user = await waitForAuthUser(auth, returning ? 6000 : 1500);
  }

  if (returning) {
    clearFirebaseRedirectParams();
  }

  if (redirectError && !user) {
    throw redirectError;
  }

  if (returning && !user) {
    const err = new Error(
      'Sign-in returned but no session was saved. Turn off strict tracking protection / ad blockers for this site, or try Chrome without extensions.'
    );
    err.code = 'auth/redirect-session-missing';
    throw err;
  }

  return user;
}

export function formatBootstrapError(err) {
  if (err?.code === 'auth/redirect-session-missing') {
    return err.message;
  }
  return formatFirebaseAuthError(err);
}
