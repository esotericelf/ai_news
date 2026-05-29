import { Link } from 'react-router-dom';
import { absoluteArticleUrl, articleUrl } from '../../config';
import ArticleSharePopover from './ArticleSharePopover';
import ArticleImage from '../../components/ui/ArticleImage';
import { articleCategory } from '../../utils/article';
import { articleExcerpt } from '../../utils/seoMatrix';
import { formatRelativeDate } from '../../utils/format';
import ArticleMatrixBadges from './ArticleMatrixBadges';

export default function ArticleCard({ article, variant = 'default' }) {
  const title = article.seo_title || 'Untitled';
  const category = articleCategory(article);
  const date = article.source?.published_at || article.generated_at;
  return (
    <article className={`story-card story-card--${variant}`}>
      <Link to={articleUrl(article.slug)} className="story-card__link">
        <div className="story-card__media">
          <ArticleImage
            article={article}
            loading="lazy"
            decoding="async"
            width={variant === 'wide' ? 800 : 400}
            height={variant === 'wide' ? 450 : 225}
          />
        </div>
        <div className="story-card__body">
          <span className="story-card__category">{category}</span>
          <h2 className="story-card__title">{title}</h2>
          <ArticleMatrixBadges article={article} />
          <p className="story-card__dek">{articleExcerpt(article)}</p>
          <footer className="story-card__meta">
            <time dateTime={date}>{formatRelativeDate(date)}</time>
            {article.read_time_minutes && (
              <span className="story-card__read-time">
                {article.read_time_minutes} min read
              </span>
            )}
          </footer>
        </div>
      </Link>
      {article.slug && (
        <ArticleSharePopover
          url={absoluteArticleUrl(article.slug)}
          title={title}
          className="story-card__share"
        />
      )}
    </article>
  );
}
