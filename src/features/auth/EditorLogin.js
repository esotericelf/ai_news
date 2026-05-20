import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import EditorFirebaseUi from './EditorFirebaseUi';
import { getMissingFirebaseEnv, isFirebaseConfigured } from '../../firebase';

export default function EditorLogin({ onApiKeyLogin }) {
  const { authError } = useAuth();
  const [showApiKey, setShowApiKey] = useState(false);
  const [keyInput, setKeyInput] = useState('');

  if (!isFirebaseConfigured) {
    const missing = getMissingFirebaseEnv();
    return (
      <div className="editor-page">
        <div className="editor-auth">
          <h1>Editor — admin login</h1>
          <p>
            Firebase is not active in this deploy. Set the missing Netlify environment variables,
            then <strong>clear cache and redeploy</strong> (Create React App bakes env in at build
            time).
          </p>
          {missing.length > 0 && (
            <ul className="editor-auth__missing">
              {missing.map((name) => (
                <li key={name}>
                  <code>{name}</code>
                </li>
              ))}
            </ul>
          )}
          <div className="editor-auth__row">
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Same value as AI_News_Scraper API_KEY"
              autoComplete="off"
            />
            <button type="button" onClick={() => onApiKeyLogin?.(keyInput.trim())}>
              Sign in
            </button>
          </div>
          <p className="editor-auth__hint">
            Paste the <code>API_KEY</code> from <code>AI_News_Scraper/.env</code> (not your email).
          </p>
          <Link to="/">← Back to site</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-page">
      <div className="editor-auth editor-auth--firebaseui">
        <h1>Editor — sign in</h1>
        <p className="editor-auth__hint">
          Choose Google or GitHub (Firebase sign-in). Your email must be in{' '}
          <code>EDITOR_ALLOWED_EMAILS</code> on the API.
        </p>

        <EditorFirebaseUi />

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
                  placeholder="API_KEY from AI_News_Scraper/.env"
                  autoComplete="off"
                />
                <button type="button" onClick={() => onApiKeyLogin(keyInput.trim())}>
                  Sign in
                </button>
              </div>
            )}
          </>
        )}

        <Link to="/">← Back to site</Link>
      </div>
    </div>
  );
}
