import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  GithubAuthProvider,
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithRedirect,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../../firebase';
import { setEditorTokenProvider } from '../../api/editor';
import { formatFirebaseAuthError } from '../../utils/firebaseAuthErrors';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      setEditorTokenProvider(null);
      return undefined;
    }

    getRedirectResult(auth).catch((err) => {
      if (err?.code && err.code !== 'auth/no-auth-event') {
        setAuthError(formatFirebaseAuthError(err));
      }
    });

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
    return unsubscribe;
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

  const signInWithGoogle = useCallback(async () => {
    if (!auth) {
      throw new Error('Firebase is not configured');
    }
    setAuthError('');
    try {
      await signInWithRedirect(auth, new GoogleAuthProvider());
    } catch (err) {
      setAuthError(formatFirebaseAuthError(err));
      throw err;
    }
  }, []);

  const signInWithGitHub = useCallback(async () => {
    if (!auth) {
      throw new Error('Firebase is not configured');
    }
    setAuthError('');
    try {
      await signInWithRedirect(auth, new GithubAuthProvider());
    } catch (err) {
      setAuthError(formatFirebaseAuthError(err));
      throw err;
    }
  }, []);

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
