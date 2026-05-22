import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getRedirectResult, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import {
  auth,
  getFirebaseInitError,
  isFirebaseAuthDomainValid,
  isFirebaseConfigured,
} from '../../firebase';
import { setEditorTokenProvider } from '../../api/editor';
import { formatFirebaseAuthError } from '../../utils/firebaseAuthErrors';
import {
  clearFirebaseRedirectParams,
  isFirebaseRedirectReturn,
  signInGitHub,
  signInGoogle,
} from '../../utils/firebaseAuthSignIn';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const initErr = getFirebaseInitError();
    if (!isFirebaseConfigured || !auth) {
      if (initErr) {
        setAuthError(initErr.message || 'Firebase failed to initialize.');
      }
      setLoading(false);
      setEditorTokenProvider(null);
      return undefined;
    }

    if (!isFirebaseAuthDomainValid()) {
      setAuthError(
        'REACT_APP_FIREBASE_AUTH_DOMAIN must be your-project.firebaseapp.com (not the Netlify URL).'
      );
      setLoading(false);
      return undefined;
    }

    let active = true;
    let unsubscribe = () => {};

    (async () => {
      setLoading(true);
      const returningFromOAuth = isFirebaseRedirectReturn();

      try {
        // Must finish before onAuthStateChanged — otherwise null fires first and login reappears.
        const result = await getRedirectResult(auth);
        if (active && result?.user) {
          setUser(result.user);
        } else if (active && auth.currentUser) {
          setUser(auth.currentUser);
        }
      } catch (err) {
        if (active && err?.code && err.code !== 'auth/no-auth-event') {
          setAuthError(formatFirebaseAuthError(err));
        }
      }

      if (active && returningFromOAuth) {
        clearFirebaseRedirectParams();
      }

      if (!active) return;

      unsubscribe = onAuthStateChanged(auth, (nextUser) => {
        if (!active) return;
        setUser(nextUser);
        setLoading(false);
      });
    })();

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

  const signInWithGoogle = useCallback(() => signInGoogle(auth, setAuthError), []);
  const signInWithGitHub = useCallback(() => signInGitHub(auth, setAuthError), []);

  const signOut = useCallback(async () => {
    setAuthError('');
    if (auth) {
      await firebaseSignOut(auth);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      authError,
      setAuthError,
      isFirebaseConfigured,
      signInWithGoogle,
      signInWithGitHub,
      signOut,
      getIdToken,
    }),
    [user, loading, authError, signInWithGoogle, signInWithGitHub, signOut, getIdToken]
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
