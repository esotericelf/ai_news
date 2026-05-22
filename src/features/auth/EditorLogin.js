import { useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../../seo/SeoHead';
import { getMissingFirebaseEnv, isFirebaseConfigured } from '../../firebase';
import EditorOAuthButtons from './EditorOAuthButtons';

export default function EditorLogin({ onApiKeyLogin }) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [keyInput, setKeyInput] = useState('');

  if (!isFirebaseConfigured) {
    const missing = getMissingFirebaseEnv();
    return (
      <div className="editor-page">
        <SeoHead title="Editor" noindex />
        <div className="editor-auth">
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
              placeholder="API key"
              autoComplete="off"
            />
            <button type="button" onClick={() => onApiKeyLogin?.(keyInput.trim())}>
              Sign in
            </button>
          </div>
          <Link className="editor-auth__back" to="/">
            ← Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-page">
      <SeoHead title="Editor" noindex />
      <div className="editor-auth">
        <EditorOAuthButtons />

        {onApiKeyLogin && (
          <>
            <button
              type="button"
              className="btn btn--ghost editor-auth__toggle"
              onClick={() => setShowApiKey((v) => !v)}
            >
              {showApiKey ? 'Hide API key' : 'API key'}
            </button>
            {showApiKey && (
              <div className="editor-auth__row">
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="API key"
                  autoComplete="off"
                />
                <button type="button" onClick={() => onApiKeyLogin(keyInput.trim())}>
                  Sign in
                </button>
              </div>
            )}
          </>
        )}

        <Link className="editor-auth__back" to="/">
          ← Home
        </Link>
      </div>
    </div>
  );
}
