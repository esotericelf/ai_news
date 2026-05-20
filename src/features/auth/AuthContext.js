import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  GithubAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../../firebase';
import { setEditorTokenProvider } from '../../api/editor';

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
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err) {
      setAuthError(err.message || 'Google sign-in failed');
      throw err;
    }
  }, []);

  const signInWithGitHub = useCallback(async () => {
    if (!auth) {
      throw new Error('Firebase is not configured');
    }
    setAuthError('');
    try {
      await signInWithPopup(auth, new GithubAuthProvider());
    } catch (err) {
      setAuthError(err.message || 'GitHub sign-in failed');
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
