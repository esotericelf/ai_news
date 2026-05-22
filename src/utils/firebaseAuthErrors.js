/**
 * User-facing Firebase Auth errors (FirebaseUI often shows only auth/internal-error).
 */
export function formatFirebaseAuthError(error) {
  if (!error) return 'Sign-in failed.';

  const code = error.code || '';
  const hints = {
    'auth/redirect-session-missing':
      'Sign-in returned but the browser did not keep your session. Disable strict tracking protection / ad blockers for this site, or try another browser.',
    'auth/argument-error':
      'Firebase Auth is misconfigured. Set REACT_APP_FIREBASE_AUTH_DOMAIN to ainewsrepo.firebaseapp.com, ' +
      'include REACT_APP_FIREBASE_APP_ID in Netlify env, then redeploy. Clear site data for /editor if this persists.',
    'auth/internal-error':
      'Check Firebase Console: enable Google/GitHub under Authentication → Sign-in method. ' +
      'Add this site under Authentication → Settings → Authorized domains. ' +
      'If you use Netlify, redeploy after setting REACT_APP_FIREBASE_* env vars. ' +
      'Popups/CSP can also cause this — this app uses redirect sign-in to avoid that.',
    'auth/unauthorized-domain':
      `Add "${typeof window !== 'undefined' ? window.location.hostname : 'your domain'}" to Firebase → Authentication → Authorized domains.`,
    'auth/popup-blocked': 'Allow popups for this site or reload and try again.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    'auth/network-request-failed': 'Network error — check your connection and try again.',
    'auth/operation-not-allowed':
      'That provider is disabled in Firebase Console → Authentication → Sign-in method.',
  };

  if (hints[code]) {
    return hints[code];
  }
  return error.message || code || 'Sign-in failed.';
}
