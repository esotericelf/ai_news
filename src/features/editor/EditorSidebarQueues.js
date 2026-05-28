import { Link } from 'react-router-dom';
import { articleUrl } from '../../config';
import { formatRelativeDate, truncate } from '../../utils/format';

function QueueCount({ count, urgent }) {
  if (!count) return null;
  return (
    <span
      className={`editor-queue-panel__count${urgent ? ' editor-queue-panel__count--urgent' : ''}`}
      aria-label={`${count} items`}
    >
      {count}
    </span>
  );
}

export function EditorCommentsQueue({
  comments,
  status,
  selectedCommentId,
  onSelectComment,
}) {
  const count = comments.length;
  return (
    <section
      className={`editor-queue-panel editor-queue-panel--comments${count ? ' editor-queue-panel--has-items' : ''}`}
      aria-labelledby="editor-comments-queue-title"
    >
      <header className="editor-queue-panel__head">
        <h2 id="editor-comments-queue-title" className="editor-queue-panel__title">
          Comments
          <QueueCount count={count} urgent />
        </h2>
        <p className="editor-queue-panel__hint">Reader posts — approve to publish on site</p>
      </header>

      {status === 'loading' && <p className="editor-queue-panel__status">Loading…</p>}
      {!count && status === 'ready' && (
        <p className="editor-queue-panel__empty">No comments waiting.</p>
      )}
      {count > 0 && (
        <ul className="editor-queue-panel__list">
          {comments.map((c) => (
            <li key={c.id} className="editor-queue__entry">
              <button
                type="button"
                className={`editor-queue__item editor-queue__item--comment${selectedCommentId === c.id ? ' editor-queue__item--active' : ''}`}
                onClick={() => onSelectComment(c)}
              >
                <span className="editor-queue__title">
                  {c.display_name || 'Reader'}
                </span>
                <span className="editor-queue__meta editor-queue__meta--truncate">
                  {c.article_title || c.article_slug || 'Article'}
                </span>
                <span className="editor-queue__snippet">{truncate(c.content, 72)}</span>
                <span className="editor-queue__meta">
                  {formatRelativeDate(c.created_at)}
                  {c.provider ? ` · ${c.provider}` : ''}
                </span>
              </button>
              {c.article_slug ? (
                <Link
                  to={articleUrl(c.article_slug)}
                  className="editor-queue__live"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open article in a new tab"
                >
                  Live
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function EditorArticlesQueue({
  drafts,
  status,
  selectedId,
  onSelectArticle,
}) {
  const count = drafts.length;
  return (
    <section
      className="editor-queue-panel editor-queue-panel--articles"
      aria-labelledby="editor-articles-queue-title"
    >
      <header className="editor-queue-panel__head">
        <h2 id="editor-articles-queue-title" className="editor-queue-panel__title">
          Articles
          <QueueCount count={count} />
        </h2>
        <p className="editor-queue-panel__hint">Public SEO pages awaiting sign-off</p>
      </header>

      {status === 'loading' && <p className="editor-queue-panel__status">Loading…</p>}
      {!count && status === 'ready' && (
        <p className="editor-queue-panel__empty">
          Queue empty — new articles stay here until marked reviewed.
        </p>
      )}
      {count > 0 && (
        <ul className="editor-queue-panel__list">
          {drafts.map((d) => (
            <li key={d.id} className="editor-queue__entry">
              <button
                type="button"
                className={`editor-queue__item${selectedId === d.id ? ' editor-queue__item--active' : ''}`}
                onClick={() => onSelectArticle(d.id)}
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
      )}
    </section>
  );
}
