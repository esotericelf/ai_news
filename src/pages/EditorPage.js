import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ArticleBody from '../features/articles/ArticleBody';
import ArticleSharePopover from '../features/articles/ArticleSharePopover';
import {
  approveDraft,
  fetchDraft,
  fetchDrafts,
  fetchEditorStats,
  rejectDraft,
  reviseDraft,
} from '../api/editor';
import { absoluteArticleUrl, articleUrl } from '../config';
import { useAuth } from '../features/auth/AuthContext';
import EditorLogin from '../features/auth/EditorLogin';
const STORAGE_KEY = 'ai_news_editor_key';

const REVISION_ACTIVE = new Set(['queued', 'processing']);

/** Stats line — only uses boolean status model (no legacy failed/published keys). */
function editorStatsLine(stats) {
  if (!stats) return null;
  const parts = [
    `${stats.pending_review ?? 0} in queue`,
  ];
  if (stats.revising) parts.push(`${stats.revising} revising`);
  parts.push(`${stats.public ?? 0} public`);
  if (stats.on_feed != null) parts.push(`${stats.on_feed} on feed`);
  parts.push(`${stats.draft ?? 0} draft (thin)`);
  parts.push(`${stats.reviewed ?? 0} signed off`);
  return parts.join(' · ');
}

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
    if (!isAuthed || authLoading) return;
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
  }, [isAuthed, authLoading]);

  const refreshDetail = useCallback(async () => {
    if (!selectedId || !isAuthed) return null;
    const d = await fetchDraft(selectedId);
    setDetail(d);
    return d;
  }, [selectedId, isAuthed]);

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
        'Mark this article as reviewed? It is already live on the public site.'
      )
    ) {
      return;
    }
    setActionMsg('');
    try {
      const res = await approveDraft(selectedId);
      setActionMsg(`Marked reviewed · ${articleUrl(res.slug)}`);
      clearSelection();
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
      setActionMsg('Moved to draft (unpublished).');
      clearSelection();
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
      <div className="editor-page editor-page--loading" aria-busy="true" aria-label="Loading" />
    );
  }

  if (!isAuthed) {
    return <EditorLogin onApiKeyLogin={saveApiKey} />;
  }

  const revisionActive = detail && REVISION_ACTIVE.has(detail.revision_status);
  const canApprove =
    detail && !revisionActive && detail.revision_status !== 'processing';

  const clearSelection = () => {
    setSelectedId(null);
    setDetail(null);
    setShowPreviousBody(false);
  };

  return (
    <div className="editor-page">
      <header className="editor-header">
        <div>
          <h1>Editor — review queue</h1>
          {user?.email && (
            <p className="editor-header__user">{user.email}</p>
          )}
          {stats && (
            <>
              <p className="editor-header__stats">{editorStatsLine(stats)}</p>
              <p className="editor-header__legend">
                Queue = public and not signed off. Draft = thin, not on site. There is no
                separate failed bucket anymore — reject moves an item to draft.
              </p>
            </>
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

      <div
        className={`editor-layout${selectedId ? ' editor-layout--detail' : ''}`}
      >
        <aside className="editor-queue" aria-label="Articles awaiting review">
          <h2>Needs review</h2>
          {status === 'loading' && <p>Loading…</p>}
          {!drafts.length && status === 'ready' && (
            <p className="editor-empty">
              Queue is empty. New articles go public automatically; they stay in this list
              until you click Mark reviewed.
            </p>
          )}
          <ul>
            {drafts.map((d) => (
              <li key={d.id} className="editor-queue__entry">
                <button
                  type="button"
                  className={`editor-queue__item${selectedId === d.id ? ' editor-queue__item--active' : ''}`}
                  onClick={() => setSelectedId(d.id)}
                >
                  <span className="editor-queue__title">{d.seo_title || d.source_title}</span>
                  <span className="editor-queue__meta">
                    {d.reviewed ? 'Reviewed' : 'In queue'}
                    {d.status === false ? ' · draft' : ''}
                    {d.revision_status && d.revision_status !== 'idle'
                      ? ` · ${d.revision_status}`
                      : ''}
                    {' · '}
                    {d.read_time_minutes} min
                  </span>
                </button>
                {d.slug ? (
                  <Link
                    to={articleUrl(d.slug)}
                    className="editor-queue__live"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open live page in a new tab"
                  >
                    Live
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </aside>

        <main className="editor-preview">
          {!detail && <p className="editor-empty">Select an article to review.</p>}
          {detail && (
            <div className="editor-preview__panel">
              <div className="editor-mobile-nav">
                <button
                  type="button"
                  className="btn btn--ghost editor-mobile-nav__back"
                  onClick={clearSelection}
                >
                  ← Queue
                </button>
                {detail.slug && (
                  <Link
                    to={articleUrl(detail.slug)}
                    className="editor-mobile-nav__live btn btn--ghost"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Live page
                  </Link>
                )}
                {drafts.length > 1 && (
                  <label className="editor-mobile-nav__jump">
                    <span className="visually-hidden">Switch article</span>
                    <select
                      value={selectedId}
                      onChange={(e) => setSelectedId(Number(e.target.value))}
                      aria-label="Switch article in queue"
                    >
                      {drafts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.seo_title || d.source_title}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              <div className="editor-preview__scroll">
                {detail.revision_status && detail.revision_status !== 'idle' && (
                  <div
                    className={`editor-revision-banner editor-revision-banner--${detail.revision_status}`}
                    role="status"
                  >
                    <strong>{revisionLabel(detail.revision_status)}</strong>
                    {detail.revision_note && <p>{detail.revision_note}</p>}
                    {revisionActive && (
                      <p className="editor-revision-banner__poll">Checking for updates…</p>
                    )}
                  </div>
                )}

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
                  {detail.slug && (
                    <ArticleSharePopover
                      url={absoluteArticleUrl(detail.slug)}
                      title={detail.seo_title}
                      className="editor-article__share"
                    />
                  )}
                  {detail.error_message && (
                    <p className="editor-error editor-error--inline">{detail.error_message}</p>
                  )}
                  <p className="editor-article__keywords">
                    {(detail.target_keywords || []).join(' · ')}
                  </p>
                  {detail.slug && (
                    <p className="editor-preview__slug editor-preview__slug--inline">
                      <Link
                        to={articleUrl(detail.slug)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View live page
                      </Link>
                      <span className="editor-preview__slug-path">{articleUrl(detail.slug)}</span>
                    </p>
                  )}
                  <h2 className="editor-article__label">
                    {showPreviousBody ? 'After revision' : 'Live preview'}
                  </h2>
                  <ArticleBody html={detail.body_html} />
                </article>
              </div>

              <div className="editor-preview__dock">
                <div className="editor-preview__actions">
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={onApprove}
                    disabled={!canApprove}
                    title={
                      !canApprove
                        ? 'Wait until revision finishes before marking reviewed'
                        : 'Mark as reviewed (already live)'
                    }
                  >
                    Mark reviewed
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={onReject}
                    disabled={revisionActive}
                  >
                    Reject
                  </button>
                  {detail.reviewed && (
                    <span className="editor-badge editor-badge--ok">Reviewed</span>
                  )}
                </div>

                <section className="editor-revise" aria-label="Request Llama revision">
                  <h2 className="editor-revise__title">Llama revision</h2>
                  <p className="editor-revise__hint">
                    Short instructions for tone, structure, or facts to emphasize.
                  </p>
                  <textarea
                    className="editor-revise__input"
                    rows={3}
                    value={revisionComment}
                    onChange={(e) => setRevisionComment(e.target.value)}
                    placeholder="e.g. Stronger opening, shorter paragraphs, clearer business impact."
                    disabled={revisionActive || reviseBusy}
                  />
                  <button
                    type="button"
                    className="btn btn--primary editor-revise__send"
                    onClick={onRevise}
                    disabled={revisionActive || reviseBusy}
                  >
                    {reviseBusy || revisionActive ? 'Revising…' : 'Send to Llama'}
                  </button>
                </section>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
