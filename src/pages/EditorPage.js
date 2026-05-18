import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ArticleBody from '../features/articles/ArticleBody';
import {
  approveDraft,
  fetchDraft,
  fetchDrafts,
  fetchEditorStats,
  rejectDraft,
} from '../api/editor';
import { articleUrl } from '../config';

const STORAGE_KEY = 'ai_news_editor_key';

export default function EditorPage() {
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem(STORAGE_KEY) || '');
  const [keyInput, setKeyInput] = useState(apiKey);
  const [stats, setStats] = useState(null);
  const [drafts, setDrafts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const saveKey = () => {
    sessionStorage.setItem(STORAGE_KEY, keyInput.trim());
    setApiKey(keyInput.trim());
    window.location.reload();
  };

  const loadQueue = useCallback(async () => {
    if (!apiKey) return;
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
  }, [apiKey]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  useEffect(() => {
    if (!selectedId || !apiKey) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const d = await fetchDraft(selectedId);
        if (!cancelled) setDetail(d);
      } catch (e) {
        if (!cancelled) setError(e.detail || e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId, apiKey]);

  const onApprove = async () => {
    if (!selectedId) return;
    setActionMsg('');
    try {
      const res = await approveDraft(selectedId);
      setActionMsg(`Published: ${res.slug}`);
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

  if (!apiKey) {
    return (
      <div className="editor-page">
        <div className="editor-auth">
          <h1>Editor — approval queue</h1>
          <p>
            Enter your <code>EDITOR_API_KEY</code> (or <code>API_KEY</code>) from the Django{' '}
            <code>.env</code>. This is stored in your browser session only.
          </p>
          <div className="editor-auth__row">
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="X-Api-Key value"
              autoComplete="off"
            />
            <button type="button" onClick={saveKey}>
              Unlock
            </button>
          </div>
          <p className="editor-auth__hint">
            No email workflow — review drafts here and click Publish. Llama writes multi-section
            SEO reviews; only approved articles appear on the public site.
          </p>
          <Link to="/">← Back to site</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-page">
      <header className="editor-header">
        <div>
          <h1>Approval queue</h1>
          {stats && (
            <p className="editor-header__stats">
              {stats.draft} awaiting · {stats.published} live · {stats.failed} failed
            </p>
          )}
        </div>
        <div className="editor-header__actions">
          <button type="button" className="btn btn--ghost" onClick={loadQueue}>
            Refresh
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
            <p className="editor-empty">No drafts waiting. Run regenerate on the server.</p>
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
                    {d.read_time_minutes} min · {d.llm_model || 'fallback'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="editor-preview">
          {!detail && <p className="editor-empty">Select a draft to preview.</p>}
          {detail && (
            <>
              <div className="editor-preview__actions">
                <button type="button" className="btn btn--primary" onClick={onApprove}>
                  Publish
                </button>
                <button type="button" className="btn btn--ghost" onClick={onReject}>
                  Reject
                </button>
                {detail.slug && (
                  <span className="editor-preview__slug">
                    Will live at <code>{articleUrl(detail.slug)}</code>
                  </span>
                )}
              </div>
              <article className="editor-article">
                <p className="editor-article__source">
                  Source:{' '}
                  <a href={detail.source_link} target="_blank" rel="noopener noreferrer">
                    {detail.source_title}
                  </a>
                </p>
                <h1>{detail.seo_title}</h1>
                <p className="editor-article__meta">{detail.meta_description}</p>
                <p className="editor-article__keywords">
                  {(detail.target_keywords || []).join(' · ')}
                </p>
                <ArticleBody html={detail.body_html} />
              </article>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
