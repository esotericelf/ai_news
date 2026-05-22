const STORAGE_KEY = 'ai_news_editor_firebase_session';

/** @typedef {{ token: string, email: string, exp: number }} EditorFirebaseSession */

export function saveEditorFirebaseSession(user) {
  if (!user || typeof window === 'undefined') return Promise.resolve();
  return user.getIdToken().then((token) => {
    const payload = {
      token,
      email: user.email || '',
      exp: Date.now() + 55 * 60 * 1000,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  });
}

/** @returns {EditorFirebaseSession | null} */
export function loadEditorFirebaseSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.token || !data?.exp || data.exp < Date.now()) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearEditorFirebaseSession() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
}

/** Minimal user shape for UI when Firebase persistence is blocked. */
export function sessionAsUser(session) {
  return {
    email: session.email,
    uid: 'session',
    getIdToken: () => Promise.resolve(session.token),
  };
}
