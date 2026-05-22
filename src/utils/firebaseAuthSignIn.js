import {
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';
import { formatFirebaseAuthError } from './firebaseAuthErrors';

const POPUP_FALLBACK_CODES = new Set([
  'auth/popup-blocked',
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
]);

async function signInWithProvider(auth, provider, setAuthError) {
  if (!auth) {
    throw new Error('Firebase is not configured');
  }
  setAuthError('');
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    const code = err?.code || '';
    if (POPUP_FALLBACK_CODES.has(code)) {
      setAuthError('Opening full-page sign-in…');
      await signInWithRedirect(auth, provider);
      return;
    }
    const message = formatFirebaseAuthError(err);
    setAuthError(message);
    throw err;
  }
}

export function signInGoogle(auth, setAuthError) {
  return signInWithProvider(auth, new GoogleAuthProvider(), setAuthError);
}

export function signInGitHub(auth, setAuthError) {
  return signInWithProvider(auth, new GithubAuthProvider(), setAuthError);
}

/** True when URL may be returning from Firebase OAuth redirect. */
export function isFirebaseRedirectReturn() {
  if (typeof window === 'undefined') return false;
  const { search, hash } = window.location;
  return /[?&#](state|code|error)=/.test(`${search}${hash}`);
}
