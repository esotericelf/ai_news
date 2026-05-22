import {
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';
import { saveEditorFirebaseSession } from './editorFirebaseSession';
import { formatFirebaseAuthError } from './firebaseAuthErrors';

const POPUP_FALLBACK_CODES = new Set([
  'auth/popup-blocked',
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
]);

function googleProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return provider;
}

function githubProvider() {
  return new GithubAuthProvider();
}

/**
 * Popup first (token saved to sessionStorage immediately). Redirect if popup blocked.
 */
async function signInWithProvider(auth, provider, setAuthError) {
  if (!auth) {
    throw new Error('Firebase is not configured');
  }
  setAuthError('');
  try {
    const result = await signInWithPopup(auth, provider);
    if (result?.user) {
      await saveEditorFirebaseSession(result.user);
    }
  } catch (err) {
    const code = err?.code || '';
    if (POPUP_FALLBACK_CODES.has(code)) {
      await signInWithRedirect(auth, provider);
      return;
    }
    setAuthError(formatFirebaseAuthError(err));
    throw err;
  }
}

export function signInGoogle(auth, setAuthError) {
  return signInWithProvider(auth, googleProvider(), setAuthError);
}

export function signInGitHub(auth, setAuthError) {
  return signInWithProvider(auth, githubProvider(), setAuthError);
}

/** True when URL is returning from Firebase redirect OAuth (not arbitrary query params). */
export function isFirebaseRedirectReturn() {
  if (typeof window === 'undefined') return false;
  const { search, hash } = window.location;
  if (!search && !hash) return false;
  const blob = `${search}${hash}`;
  return (
    blob.includes('/__/auth/') ||
    blob.includes('authType=') ||
    blob.includes('apiKey=') ||
    /[?&#](state|code|error)=/i.test(blob)
  );
}

export function clearFirebaseRedirectParams() {
  if (typeof window === 'undefined') return;
  window.history.replaceState(null, '', window.location.pathname);
}
