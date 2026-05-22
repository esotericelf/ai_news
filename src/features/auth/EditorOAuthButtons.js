import { useState } from 'react';
import { useAuth } from './AuthContext';

export default function EditorOAuthButtons() {
  const { signInWithGoogle, signInWithGitHub, authError } = useAuth();
  const [busy, setBusy] = useState('');

  const onGoogle = async () => {
    setBusy('google');
    try {
      await signInWithGoogle();
    } catch {
      setBusy('');
    }
  };

  const onGitHub = async () => {
    setBusy('github');
    try {
      await signInWithGitHub();
    } catch {
      setBusy('');
    }
  };

  return (
    <div className="editor-auth__providers">
      <button
        type="button"
        className="btn btn--oauth btn--google"
        onClick={onGoogle}
        disabled={!!busy}
      >
        {busy === 'google' ? 'Redirecting…' : 'Continue with Google'}
      </button>
      <button
        type="button"
        className="btn btn--oauth btn--github"
        onClick={onGitHub}
        disabled={!!busy}
      >
        {busy === 'github' ? 'Redirecting…' : 'Continue with GitHub'}
      </button>
      {authError ? <p className="editor-error">{authError}</p> : null}
    </div>
  );
}
