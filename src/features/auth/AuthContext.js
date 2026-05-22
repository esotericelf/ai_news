import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getRedirectResult, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, isFirebaseAuthDomainValid, isFirebaseConfigured } from '../../firebase';
import { setEditorTokenProvider } from '../../api/editor';
import { formatFirebaseAuthError } from '../../utils/firebaseAuthErrors';
import { isFirebaseRedirectReturn, signInGitHub, signInGoogle } from '../../utils/firebaseAuthSignIn';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [authError, setAuthError] = useState('');
  const [finishingRedirect, setFinishingRedirect] = useState(
    () => isFirebaseConfigured && isFirebaseRedirectReturn()
  );

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      setFinishingRedirect(false);
      setEditorTokenProvider(null);
      return undefined;
    }

    if (!isFirebaseAuthDomainValid()) {
      setAuthError(
        'REACT_APP_FIREBASE_AUTH_DOMAIN must be your-project.firebaseapp.com (not the Netlify URL).'
      );
      setLoading(false);
      setFinishingRedirect(false);
      return undefined;
    }

    let active = true;

    (async () => {
      if (isFirebaseRedirectReturn()) {
        setFinishingRedirect(true);
      }
      try {
        const result = await getRedirectResult(auth);
        if (active && result?.user) {
          setUser(result.user);
        }
        if (active && isFirebaseRedirectReturn()) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      } catch (err) {
        if (active && err?.code && err.code !== 'auth/no-auth-event') {
          setAuthError(formatFirebaseAuthError(err));
        }
      } finally {
        if (active) {
          setFinishingRedirect(false);
        }
      }
    })();

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      if (!active) return;
      setUser(nextUser);
      setLoading(false);
      setFinishingRedirect(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const getIdToken = useCallback(async () => {
    const active = user || auth?.currentUser;
    if (!active) return null;
    return active.getIdToken();
  }, [user]);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setEditorTokenProvider(null);
      return;
    }
    setEditorTokenProvider(getIdToken);
    return () => setEditorTokenProvider(null);
  }, [getIdToken]);

  const signInWithGoogle = useCallback(
    () => signInGoogle(auth, setAuthError),
    []
  );

  const signInWithGitHub = useCallback(
    () => signInGitHub(auth, setAuthError),
    []
  );

  const signOut = useCallback(async () => {
    setAuthError('');
    if (auth) {
      await firebaseSignOut(auth);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading: loading || finishingRedirect,
      authError,
      setAuthError,
      isFirebaseConfigured,
      signInWithGoogle,
      signInWithGitHub,
      signOut,
      getIdToken,
    }),
    [user, loading, finishingRedirect, authError, signInWithGoogle, signInWithGitHub, signOut, getIdToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
