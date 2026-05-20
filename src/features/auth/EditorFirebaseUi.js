import { useEffect, useRef } from 'react';
import { GithubAuthProvider, GoogleAuthProvider } from 'firebase/auth';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import { auth } from '../../firebase';

/**
 * FirebaseUI sign-in card (Google + GitHub). Uses OAuth popups under the hood.
 */
export default function EditorFirebaseUi() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!auth || !containerRef.current) {
      return undefined;
    }

    let ui = firebaseui.auth.AuthUI.getInstance();
    if (!ui) {
      ui = new firebaseui.auth.AuthUI(auth);
    }

    ui.start(containerRef.current, {
      signInFlow: 'popup',
      signInOptions: [
        GoogleAuthProvider.PROVIDER_ID,
        GithubAuthProvider.PROVIDER_ID,
      ],
      callbacks: {
        signInSuccessWithAuthResult: () => false,
      },
    });

    return () => {
      ui.reset();
    };
  }, []);

  return <div ref={containerRef} className="editor-firebaseui" />;
}
