import {
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithRedirect,
} from 'firebase/auth';
import { formatFirebaseAuthError } from './firebaseAuthErrors';

function googleProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return provider;
}

function githubProvider() {
  return new GithubAuthProvider();
}

/**
 * Full-page OAuth redirect (no popup). Avoids COOP / window.close console noise
 * and shows the provider account picker in the main tab.
 */
async function signInWithProvider(auth, provider, setAuthError) {
  if (!auth) {
    throw new Error('Firebase is not configured');
  }
  setAuthError('');
  try {
    await signInWithRedirect(auth, provider);
  } catch (err) {
    const message = formatFirebaseAuthError(err);
    setAuthError(message);
    throw err;
  }
}

export function signInGoogle(auth, setAuthError) {
  return signInWithProvider(auth, googleProvider(), setAuthError);
}

export function signInGitHub(auth, setAuthError) {
  return signInWithProvider(auth, githubProvider(), setAuthError);
}

/** True when URL may be returning from Firebase OAuth redirect. */
export function isFirebaseRedirectReturn() {
  if (typeof window === 'undefined') return false;
  const { search, hash } = window.location;
  return /[?&#](state|code|error)=/.test(`${search}${hash}`);
}
