import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ArticleBody from '../features/articles/ArticleBody';
import {
  approveDraft,
  fetchDraft,
  fetchDrafts,
  fetchEditorStats,
  rejectDraft,
  reviseDraft,
} from '../api/editor';
import { articleUrl } from '../config';
import { useAuth } from '../features/auth/AuthContext';
import EditorLogin from '../features/auth/EditorLogin';
const STORAGE_KEY = 'ai_news_editor_key';

const REVISION_ACTIVE = new Set(['queued', 'processing']);

function revisionLabel(status) {
  switch (status) {
    case 'processing':
      return 'Llama is revising this article…';
    case 'queued':
      return 'Queued for revision…';
    case 'completed':
      return 'Revision complete — review the updated body below.';
    case 'failed':
      return 'Revision failed';
    default:
      return '';
  }
}

export default function EditorPage() {
  const { user, loading: authLoading, signOut: firebaseSignOut, isFirebaseConfigured: fbOn } =
    useAuth();
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem(STORAGE_KEY) || '');
  const isAuthed = fbOn ? !!user : !!apiKey;
  const [stats, setStats] = useState(null);
  const [drafts, setDrafts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [revisionComment, setRevisionComment] = useState('');
  const [showPreviousBody, setShowPreviousBody] = useState(false);
  const [reviseBusy, setReviseBusy] = useState(false);

  const saveApiKey = (key) => {
    sessionStorage.setItem(STORAGE_KEY, key);
    setApiKey(key);
  };

  const handleSignOut = async () => {
    if (fbOn && user) {
      await firebaseSignOut();
    }
    sessionStorage.removeItem(STORAGE_KEY);
    setApiKey('');
    setSelectedId(null);
    setDetail(null);
  };

  const loadQueue = useCallback(async () => {
    if (!isAuthed) return;
    setStatus('loading');
    setError('');
    try {
      const [s, d] = await Promise.all([fetchEditorStats(), fetchDrafts()]);
      setStats(s);
      setDrafts(d.results || []);
      setStatus('ready');
    } catch (e) {
      setError(e.detail || e.message);
      setStatus('failed');
    }
  }, [isAuthed]);

  const refreshDetail = useCallback(async () => {
    if (!selectedId || !isAuthed) return null;
    const d = await fetchDraft(selectedId);
    setDetail(d);
    return d;
  }, [selectedId, apiKey]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  useEffect(() => {
    if (!selectedId || !isAuthed) {
      setDetail(null);
      setRevisionComment('');
      setShowPreviousBody(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const d = await fetchDraft(selectedId);
        if (!cancelled) {
          setDetail(d);
          setRevisionComment(d.editor_comment || '');
        }
      } catch (e) {
        if (!cancelled) setError(e.detail || e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId, isAuthed]);

  const revisionStatus = detail?.revision_status;
  const detailId = detail?.id;

  useEffect(() => {
    if (!detailId || !REVISION_ACTIVE.has(revisionStatus)) return undefined;
    const timer = setInterval(() => {
      refreshDetail().catch(() => {});
    }, 2500);
    return () => clearInterval(timer);
  }, [revisionStatus, detailId, refreshDetail]);

  const onApprove = async () => {
    if (!selectedId) return;
    if (
      !window.confirm(
        'Approve this article? It will be marked Reviewed and published on the public site.'
      )
    ) {
      return;
    }
    setActionMsg('');
    try {
      const res = await approveDraft(selectedId);
      setActionMsg(`Approved · live at ${articleUrl(res.slug)}`);
      setSelectedId(null);
      setDetail(null);
      loadQueue();
    } catch (e) {
      setActionMsg(e.detail || e.message);
    }
  };

  const onReject = async () => {
    if (!selectedId) return;
    const reason = window.prompt('Rejection reason (optional):') || '';
    setActionMsg('');
    try {
      await rejectDraft(selectedId, reason);
      setActionMsg('Rejected.');
      setSelectedId(null);
      setDetail(null);
      loadQueue();
    } catch (e) {
      setActionMsg(e.detail || e.message);
    }
  };

  const onRevise = async () => {
    if (!selectedId) return;
    const comment = revisionComment.trim();
    if (comment.length < 8) {
      setActionMsg('Enter revision instructions (at least 8 characters).');
      return;
    }
    setReviseBusy(true);
    setActionMsg('');
    try {
      await reviseDraft(selectedId, comment);
      setActionMsg('Revision queued — Llama is updating the article…');
      setShowPreviousBody(false);
      await refreshDetail();
      loadQueue();
    } catch (e) {
      setActionMsg(e.detail || e.message);
    } finally {
      setReviseBusy(false);
    }
  };

  if (authLoading) {
    return (
      <div className="editor-page">
        <p className="editor-empty">Checking sign-in…</p>
      </div>
    );
  }

  if (!isAuthed) {
    return <EditorLogin onApiKeyLogin={saveApiKey} />;
  }

  const revisionActive = detail && REVISION_ACTIVE.has(detail.revision_status);
  const canApprove =
    detail && !revisionActive && detail.revision_status !== 'processing';

  return (
    <div className="editor-page">
      <header className="editor-header">
        <div>
          <h1>Editor — review queue</h1>
          {user?.email && (
            <p className="editor-header__user">{user.email}</p>
          )}
          {stats && (
            <p className="editor-header__stats">
              {stats.pending_review ?? stats.draft} awaiting review
              {stats.revising ? ` · ${stats.revising} revising` : ''} · {stats.published} live ·{' '}
              {stats.failed} failed
            </p>
          )}
        </div>
        <div className="editor-header__actions">
          <button type="button" className="btn btn--ghost" onClick={loadQueue}>
            Refresh
          </button>
          <button type="button" className="btn btn--ghost" onClick={handleSignOut}>
            Sign out
          </button>
          <Link to="/" className="btn btn--ghost">
            Public site
          </Link>
        </div>
      </header>

      {error && <p className="editor-error">{error}</p>}
      {actionMsg && <p className="editor-action-msg">{actionMsg}</p>}

      <div className="editor-layout">
        <aside className="editor-queue">
          <h2>Drafts</h2>
          {status === 'loading' && <p>Loading…</p>}
          {!drafts.length && status === 'ready' && (
            <p className="editor-empty">
              No drafts waiting. Set <code>SEO_REQUIRE_APPROVAL=1</code> on the API so new articles
              enter this queue.
            </p>
          )}
          <ul>
            {drafts.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  className={`editor-queue__item${selectedId === d.id ? ' editor-queue__item--active' : ''}`}
                  onClick={() => setSelectedId(d.id)}
                >
                  <span className="editor-queue__title">{d.seo_title || d.source_title}</span>
                  <span className="editor-queue__meta">
                    {d.reviewed ? 'Reviewed' : 'Not reviewed'}
                    {d.revision_status && d.revision_status !== 'idle'
                      ? ` · ${d.revision_status}`
                      : ''}
                    {' · '}
                    {d.read_time_minutes} min
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="editor-preview">
          {!detail && <p className="editor-empty">Select a draft to review.</p>}
          {detail && (
            <>
              {detail.revision_status && detail.revision_status !== 'idle' && (
                <div
                  className={`editor-revision-banner editor-revision-banner--${detail.revision_status}`}
                  role="status"
                >
                  <strong>{revisionLabel(detail.revision_status)}</strong>
                  {detail.revision_note && <p>{detail.revision_note}</p>}
                  {revisionActive && <p className="editor-revision-banner__poll">Checking for updates…</p>}
                </div>
              )}

              <div className="editor-preview__actions">
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={onApprove}
                  disabled={!canApprove}
                  title={
                    !canApprove
                      ? 'Wait until revision finishes before approving'
                      : 'Mark reviewed and publish'
                  }
                >
                  Approve
                </button>
                <button type="button" className="btn btn--ghost" onClick={onReject} disabled={revisionActive}>
                  Reject
                </button>
                {detail.reviewed && (
                  <span className="editor-badge editor-badge--ok">Reviewed</span>
                )}
                {detail.slug && (
                  <span className="editor-preview__slug">
                    Live URL: <code>{articleUrl(detail.slug)}</code>
                  </span>
                )}
              </div>

              <section className="editor-revise">
                <h2>Request Llama revision</h2>
                <p className="editor-revise__hint">
                  Describe what to change (tone, structure, facts to emphasize). The API runs Llama
                  and updates the draft body; refresh happens automatically while processing.
                </p>
                <textarea
                  className="editor-revise__input"
                  rows={5}
                  value={revisionComment}
                  onChange={(e) => setRevisionComment(e.target.value)}
                  placeholder="e.g. Add a stronger opening, split the wall of text into shorter paragraphs, and clarify the business impact."
                  disabled={revisionActive || reviseBusy}
                />
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={onRevise}
                  disabled={revisionActive || reviseBusy}
                >
                  {reviseBusy || revisionActive ? 'Revision in progress…' : 'Send to Llama'}
                </button>
              </section>

              {detail.body_html_before_revision && detail.revision_status === 'completed' && (
                <div className="editor-diff-toggle">
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => setShowPreviousBody((v) => !v)}
                  >
                    {showPreviousBody ? 'Hide previous version' : 'Show previous version'}
                  </button>
                </div>
              )}

              {showPreviousBody && detail.body_html_before_revision && (
                <section className="editor-article editor-article--previous">
                  <h2 className="editor-article__label">Before revision</h2>
                  <ArticleBody html={detail.body_html_before_revision} />
                </section>
              )}

              <article className="editor-article">
                <p className="editor-article__source">
                  Source:{' '}
                  <a href={detail.source_link} target="_blank" rel="noopener noreferrer">
                    {detail.source_title}
                  </a>
                </p>
                <h1>{detail.seo_title}</h1>
                <p className="editor-article__meta">{detail.meta_description}</p>
                {detail.error_message && (
                  <p className="editor-error editor-error--inline">{detail.error_message}</p>
                )}
                <p className="editor-article__keywords">
                  {(detail.target_keywords || []).join(' · ')}
                </p>
                <h2 className="editor-article__label">
                  {showPreviousBody ? 'After revision' : 'Current draft'}
                </h2>
                <ArticleBody html={detail.body_html} />
              </article>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
