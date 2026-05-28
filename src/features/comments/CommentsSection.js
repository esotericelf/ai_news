import { useCallback, useEffect, useState } from 'react';
import {
  GithubAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { fetchArticleComments, postArticleComment } from '../../api/comments';
import { GitHubIcon, GoogleIcon } from '../../components/icons/OAuthProviderIcons';
import {
  auth,
  getFirebaseInitError,
  isFirebaseAuthDomainValid,
  isFirebaseConfigured,
} from '../../firebase';
import { formatFirebaseAuthError } from '../../utils/firebaseAuthErrors';
import { formatRelativeDate } from '../../utils/format';
import './comments-section.css';

const MAX_LENGTH = 2000;

function providerFromUser(user) {
  const pid = user?.providerData?.[0]?.providerId || '';
  if (pid.includes('google')) return 'google';
  if (pid.includes('github')) return 'github';
  return 'unknown';
}

function profileFromUser(user) {
  return {
    display_name: user.displayName || user.email || 'Reader',
    avatar_url: user.photoURL || '',
    provider: providerFromUser(user),
  };
}

function CommentItem({ comment }) {
  const initial = (comment.display_name || '?').charAt(0).toUpperCase();
  return (
    <li className="comments-section__item">
      {comment.avatar_url ? (
        <img
          className="comments-section__avatar"
          src={comment.avatar_url}
          alt=""
          width={40}
          height={40}
          loading="lazy"
        />
      ) : (
        <span
          className="comments-section__avatar comments-section__avatar--placeholder"
          aria-hidden="true"
        >
          {initial}
        </span>
      )}
      <div className="comments-section__item-body">
        <p className="comments-section__item-name">
          {comment.display_name || 'Reader'}
          {!comment.is_approved ? (
            <span className="comments-section__item-pending">(pending moderation)</span>
          ) : null}
        </p>
        <p className="comments-section__item-text">{comment.content}</p>
        <time className="comments-section__item-time" dateTime={comment.created_at}>
          {formatRelativeDate(comment.created_at)}
        </time>
      </div>
    </li>
  );
}

/**
 * Drop-in reader comments for a published SEO article.
 * @param {{ slug: string, seoArticleId?: number }} props
 */
export default function CommentsSection({ slug, seoArticleId }) {
  const [comments, setComments] = useState([]);
  const [listStatus, setListStatus] = useState('idle');
  const [listError, setListError] = useState('');
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(!isFirebaseConfigured);
  const [authError, setAuthError] = useState('');
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [formError, setFormError] = useState('');
  const [signInBusy, setSignInBusy] = useState('');

  const firebaseReady =
    isFirebaseConfigured && auth && !getFirebaseInitError() && isFirebaseAuthDomainValid();

  useEffect(() => {
    if (!slug) return undefined;
    let cancelled = false;
    setListStatus('loading');
    setListError('');
    fetchArticleComments(slug)
      .then((data) => {
        if (cancelled) return;
        setComments(data.comments || []);
        setListStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setListError(err.message || 'Could not load comments.');
        setListStatus('failed');
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!firebaseReady || !auth) {
      setAuthReady(true);
      return undefined;
    }
    const unsub = onAuthStateChanged(auth, (next) => {
      setUser(next);
      setAuthReady(true);
    });
    return unsub;
  }, [firebaseReady]);

  const signIn = useCallback(async (providerFactory, key) => {
    if (!auth) return;
    setSignInBusy(key);
    setAuthError('');
    try {
      await signInWithPopup(auth, providerFactory());
    } catch (err) {
      setAuthError(formatFirebaseAuthError(err));
    } finally {
      setSignInBusy('');
    }
  }, []);

  const onGoogle = () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return signIn(() => provider, 'google');
  };

  const onGitHub = () => signIn(() => new GithubAuthProvider(), 'github');

  const onSignOut = async () => {
    if (!auth) return;
    setAuthError('');
    try {
      await signOut(auth);
    } catch (err) {
      setAuthError(formatFirebaseAuthError(err));
    }
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setFormError('');
    const text = content.trim();
    if (!text) return;
    if (!user) {
      setFormError('Sign in to post a comment.');
      return;
    }
    setPosting(true);
    try {
      const idToken = await user.getIdToken();
      const data = await postArticleComment(slug, {
        content: text,
        idToken,
        seoArticleId,
        profile: profileFromUser(user),
      });
      if (data.comment) {
        setComments((prev) => [...prev, data.comment]);
      }
      setContent('');
    } catch (err) {
      setFormError(err.message || 'Could not post comment.');
    } finally {
      setPosting(false);
    }
  };

  if (!slug) return null;

  return (
    <section className="comments-section" aria-labelledby="comments-section-title">
      <h2 id="comments-section-title" className="comments-section__title">
        Comments
      </h2>

      {!firebaseReady ? (
        <p className="comments-section__notice">
          Comments are unavailable: Firebase is not configured for this build. Set{' '}
          <code>REACT_APP_FIREBASE_*</code> environment variables.
        </p>
      ) : null}

      {firebaseReady ? (
        <div className="comments-section__auth">
          {!authReady ? (
            <p className="comments-section__loading" aria-busy="true">
              Checking sign-in…
            </p>
          ) : null}

          {authReady && !user ? (
            <div className="comments-section__providers">
              <button
                type="button"
                className="btn btn--oauth btn--google"
                onClick={onGoogle}
                disabled={!!signInBusy}
              >
                <GoogleIcon className="btn--oauth__icon" />
                <span>
                  {signInBusy === 'google' ? 'Opening Google…' : 'Sign in with Google'}
                </span>
              </button>
              <button
                type="button"
                className="btn btn--oauth btn--github"
                onClick={onGitHub}
                disabled={!!signInBusy}
              >
                <GitHubIcon className="btn--oauth__icon" />
                <span>
                  {signInBusy === 'github' ? 'Opening GitHub…' : 'Sign in with GitHub'}
                </span>
              </button>
            </div>
          ) : null}

          {authReady && user ? (
            <form className="comments-section__composer" onSubmit={onSubmit}>
              {user.photoURL ? (
                <img
                  className="comments-section__avatar"
                  src={user.photoURL}
                  alt=""
                  width={40}
                  height={40}
                />
              ) : (
                <span
                  className="comments-section__avatar comments-section__avatar--placeholder"
                  aria-hidden="true"
                >
                  {(user.displayName || user.email || '?').charAt(0).toUpperCase()}
                </span>
              )}
              <div className="comments-section__composer-body">
                <p className="comments-section__user-label">
                  {user.displayName || user.email}
                </p>
                <textarea
                  className="comments-section__textarea"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts…"
                  maxLength={MAX_LENGTH}
                  required
                  disabled={posting}
                  aria-label="Comment text"
                />
                <div className="comments-section__actions">
                  <button type="submit" className="btn btn--primary" disabled={posting}>
                    {posting ? 'Posting…' : 'Post comment'}
                  </button>
                  <button
                    type="button"
                    className="comments-section__signout"
                    onClick={onSignOut}
                    disabled={posting}
                  >
                    Sign out
                  </button>
                </div>
                {formError ? (
                  <p className="comments-section__error" role="alert">
                    {formError}
                  </p>
                ) : null}
              </div>
            </form>
          ) : null}

          {authError ? (
            <p className="comments-section__error" role="alert">
              {authError}
            </p>
          ) : null}
        </div>
      ) : null}

      {listStatus === 'loading' ? (
        <p className="comments-section__loading" aria-busy="true">
          Loading comments…
        </p>
      ) : null}

      {listError ? (
        <p className="comments-section__error" role="alert">
          {listError}
        </p>
      ) : null}

      {listStatus === 'ready' && comments.length === 0 && !listError ? (
        <p className="comments-section__empty">No comments yet. Be the first to share your view.</p>
      ) : null}

      {comments.length > 0 ? (
        <ul className="comments-section__list">
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}
