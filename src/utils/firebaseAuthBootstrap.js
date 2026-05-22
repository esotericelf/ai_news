import { getRedirectResult, onAuthStateChanged } from 'firebase/auth';
import {
  loadEditorFirebaseSession,
  saveEditorFirebaseSession,
} from './editorFirebaseSession';
import { formatFirebaseAuthError } from './firebaseAuthErrors';
import { clearFirebaseRedirectParams, isFirebaseRedirectReturn } from './firebaseAuthSignIn';

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

async function persistUserSession(user) {
  if (!user) return;
  try {
    await user.getIdToken(true);
    await saveEditorFirebaseSession(user);
  } catch {
    /* best effort */
  }
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
    if (existing) {
      await persistUserSession(existing);
    }
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
    await persistUserSession(user);
    clearFirebaseRedirectParams();
  } else if (returning) {
    clearFirebaseRedirectParams();
  }

  if (redirectError && !user) {
    throw redirectError;
  }

  if (returning && !user) {
    const err = new Error(
      'Google/GitHub returned but no Firebase user was attached. Try API key login, another browser, ' +
        'or allow third-party cookies for firebaseapp.com.'
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

export function publishAuthDebug(auth) {
  if (typeof window === 'undefined') return;
  const stored = loadEditorFirebaseSession();
  window.__ainewsAuthDebug = () => ({
    email: auth?.currentUser?.email ?? stored?.email ?? null,
    uid: auth?.currentUser?.uid ?? (stored ? 'sessionStorage' : null),
    redirectPending: isFirebaseRedirectReturn(),
    sessionStorageEmail: stored?.email ?? null,
    href: window.location.href,
  });
}
