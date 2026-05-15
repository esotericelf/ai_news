import { formatDate } from '../../utils/format';

export default function ArticleMeta({ article }) {
  const published = article.source?.published_at || article.generated_at;
  const sourceTitle = article.source?.title;
  const sourceLink = article.canonical_url || article.source?.link;

  return (
    <div className="article-meta">
      <time className="article-meta__date" dateTime={published}>
        {formatDate(published)}
      </time>
      {article.read_time_minutes && (
        <span className="article-meta__read-time">
          {article.read_time_minutes} min read
        </span>
      )}
      {sourceLink && (
        <p className="article-meta__source">
          Originally reported by{' '}
          <a href={sourceLink} rel="noopener noreferrer" target="_blank">
            {sourceTitle || 'source'}
          </a>
        </p>
      )}
    </div>
  );
}
