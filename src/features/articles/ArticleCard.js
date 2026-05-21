import { Link } from 'react-router-dom';
import { absoluteArticleUrl, articleUrl } from '../../config';
import ArticleShareCompact from './ArticleShareCompact';
import ArticleImage from '../../components/ui/ArticleImage';
import { articleCategory, articleTitle } from '../../utils/article';
import { formatRelativeDate } from '../../utils/format';

export default function ArticleCard({ article, variant = 'default' }) {
  const title = articleTitle(article);
  const category = articleCategory(article);
  const excerpt = article.meta_description;
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
          <p className="story-card__dek">{excerpt}</p>
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
        <ArticleShareCompact
          url={absoluteArticleUrl(article.slug)}
          title={title}
          className="story-card__share"
        />
      )}
    </article>
  );
}
