import { getRedirectResult, onAuthStateChanged } from 'firebase/auth';
import { formatFirebaseAuthError } from './firebaseAuthErrors';
import { clearFirebaseRedirectParams, isFirebaseRedirectReturn } from './firebaseAuthSignIn';

/** OAuth redirect can only be consumed once; shared across StrictMode remounts. */
let redirectResultPromise = null;

export function resetRedirectResultCache() {
  redirectResultPromise = null;
}

function getRedirectResultOnce(auth) {
  if (!auth) {
    return Promise.resolve(null);
  }
  if (!redirectResultPromise) {
    redirectResultPromise = getRedirectResult(auth);
  }
  return redirectResultPromise;
}

function waitForAuthUser(auth, maxMs) {
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
  let result = null;

  if (!returning) {
    resetRedirectResultCache();
    const existing = auth.currentUser || (await waitForAuthUser(auth, 2000));
    return existing;
  }

  try {
    result = await getRedirectResultOnce(auth);
  } catch (err) {
    if (err?.code && err.code !== 'auth/no-auth-event') {
      redirectError = err;
    }
  } finally {
    setTimeout(() => resetRedirectResultCache(), 3000);
  }

  let user = result?.user || auth.currentUser;
  if (!user) {
    user = await waitForAuthUser(auth, 8000);
  }

  if (user) {
    try {
      await user.getIdToken(true);
    } catch {
      /* token optional for state */
    }
    clearFirebaseRedirectParams();
  } else if (returning) {
    clearFirebaseRedirectParams();
  }

  if (redirectError && !user) {
    throw redirectError;
  }

  if (returning && !user) {
    const err = new Error(
      'Google/GitHub sent you back but this browser did not keep the Firebase session. ' +
        'Allow third-party cookies for ainewsrepo.netlify.app, disable strict tracking protection, ' +
        'or use API key login below.'
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

/** Console: __ainewsAuthDebug() after page load */
export function publishAuthDebug(auth) {
  if (typeof window === 'undefined' || !auth) return;
  window.__ainewsAuthDebug = () => ({
    email: auth.currentUser?.email ?? null,
    uid: auth.currentUser?.uid ?? null,
    redirectPending: isFirebaseRedirectReturn(),
    href: window.location.href,
  });
}
