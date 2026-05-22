import { useEffect, useRef } from 'react';
import { GithubAuthProvider, GoogleAuthProvider } from 'firebase/auth';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import { auth } from '../../firebase';
import { formatFirebaseAuthError } from '../../utils/firebaseAuthErrors';
import { useAuth } from './AuthContext';

/**
 * FirebaseUI sign-in (Google + GitHub). Uses redirect flow — more reliable than
 * popups with strict CSP and on mobile.
 */
export default function EditorFirebaseUi() {
  const containerRef = useRef(null);
  const { setAuthError } = useAuth();

  useEffect(() => {
    if (!auth || !containerRef.current) {
      return undefined;
    }

    let ui = firebaseui.auth.AuthUI.getInstance();
    if (!ui) {
      ui = new firebaseui.auth.AuthUI(auth);
    }

    ui.start(containerRef.current, {
      signInFlow: 'redirect',
      signInOptions: [
        GoogleAuthProvider.PROVIDER_ID,
        GithubAuthProvider.PROVIDER_ID,
      ],
      callbacks: {
        signInSuccessWithAuthResult: () => false,
        signInFailureWithAuthResult: (_result, error) => {
          setAuthError(formatFirebaseAuthError(error));
          return Promise.resolve();
        },
      },
    });

    return () => {
      ui.reset();
    };
  }, [setAuthError]);

  return <div ref={containerRef} className="editor-firebaseui" />;
}
