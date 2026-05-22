import { useState } from 'react';
import { GitHubIcon, GoogleIcon } from '../../components/icons/OAuthProviderIcons';
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
        <GoogleIcon className="btn--oauth__icon" />
        <span>{busy === 'google' ? 'Redirecting to Google…' : 'Continue with Google'}</span>
      </button>
      <button
        type="button"
        className="btn btn--oauth btn--github"
        onClick={onGitHub}
        disabled={!!busy}
      >
        <GitHubIcon className="btn--oauth__icon" />
        <span>{busy === 'github' ? 'Redirecting to GitHub…' : 'Continue with GitHub'}</span>
      </button>
      {authError ? <p className="editor-error">{authError}</p> : null}
    </div>
  );
}
