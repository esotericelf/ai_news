import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { isFirebaseConfigured } from '../../firebase';

export default function EditorLogin({ onApiKeyLogin }) {
  const { signInWithGoogle, signInWithGitHub, authError, setAuthError } = useAuth();
  const [busy, setBusy] = useState('');
  const [showApiKey, setShowApiKey] = useState(!isFirebaseConfigured);
  const [keyInput, setKeyInput] = useState('');

  const handleProvider = async (provider) => {
    setAuthError('');
    setBusy(provider);
    try {
      if (provider === 'google') await signInWithGoogle();
      else await signInWithGitHub();
    } catch {
      /* authError set in context */
    } finally {
      setBusy('');
    }
  };

  if (!isFirebaseConfigured) {
    return (
      <div className="editor-page">
        <div className="editor-auth">
          <h1>Editor — admin login</h1>
          <p>
            Set <code>REACT_APP_FIREBASE_*</code> for Google/GitHub sign-in, or use your{' '}
            <code>EDITOR_API_KEY</code> below.
          </p>
          <div className="editor-auth__row">
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="EDITOR_API_KEY"
              autoComplete="off"
            />
            <button type="button" onClick={() => onApiKeyLogin?.(keyInput.trim())}>
              Sign in
            </button>
          </div>
          <Link to="/">← Back to site</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-page">
      <div className="editor-auth">
        <h1>Editor — sign in</h1>
        <p>Sign in with an allowed Google or GitHub account to review and publish drafts.</p>

        <div className="editor-auth__providers">
          <button
            type="button"
            className="btn btn--oauth btn--google"
            disabled={!!busy}
            onClick={() => handleProvider('google')}
          >
            {busy === 'google' ? 'Signing in…' : 'Continue with Google'}
          </button>
          <button
            type="button"
            className="btn btn--oauth btn--github"
            disabled={!!busy}
            onClick={() => handleProvider('github')}
          >
            {busy === 'github' ? 'Signing in…' : 'Continue with GitHub'}
          </button>
        </div>

        {authError && <p className="editor-error">{authError}</p>}

        {onApiKeyLogin && (
          <>
            <button
              type="button"
              className="btn btn--ghost editor-auth__toggle"
              onClick={() => setShowApiKey((v) => !v)}
            >
              {showApiKey ? 'Hide API key login' : 'Use API key instead (dev)'}
            </button>
            {showApiKey && (
              <div className="editor-auth__row">
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="EDITOR_API_KEY"
                  autoComplete="off"
                />
                <button type="button" onClick={() => onApiKeyLogin(keyInput.trim())}>
                  Sign in
                </button>
              </div>
            )}
          </>
        )}

        <p className="editor-auth__hint">
          Your email must be listed in <code>EDITOR_ALLOWED_EMAILS</code> on the API server.
        </p>
        <Link to="/">← Back to site</Link>
      </div>
    </div>
  );
}
