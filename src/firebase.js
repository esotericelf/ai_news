import { initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  getAuth,
  initializeAuth,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const REQUIRED_FIREBASE_ENV = [
  ['apiKey', 'REACT_APP_FIREBASE_API_KEY'],
  ['authDomain', 'REACT_APP_FIREBASE_AUTH_DOMAIN'],
  ['projectId', 'REACT_APP_FIREBASE_PROJECT_ID'],
  ['appId', 'REACT_APP_FIREBASE_APP_ID'],
];

/** Which REACT_APP_FIREBASE_* vars were empty when this bundle was built (Netlify build-time). */
export function getMissingFirebaseEnv() {
  return REQUIRED_FIREBASE_ENV.filter(([key]) => !firebaseConfig[key]).map(
    ([, envName]) => envName
  );
}

export const isFirebaseConfigured = getMissingFirebaseEnv().length === 0;

/** authDomain must be *.firebaseapp.com (not your Netlify URL). */
export function isFirebaseAuthDomainValid() {
  const domain = (firebaseConfig.authDomain || '').trim().toLowerCase();
  return domain.endsWith('.firebaseapp.com');
}

let app = null;
let auth = null;
let initError = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    try {
      auth = initializeAuth(app, {
        persistence: browserLocalPersistence,
        popupRedirectResolver: browserPopupRedirectResolver,
      });
    } catch (e) {
      // Hot reload / second init: reuse existing Auth instance
      auth = getAuth(app);
    }
  } catch (e) {
    initError = e;
  }
}

export function getFirebaseInitError() {
  return initError;
}

export { app, auth };
