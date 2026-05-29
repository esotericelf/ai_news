import { Link } from 'react-router-dom';
import { articleUrl } from '../../config';
import ArticleImage from '../../components/ui/ArticleImage';
import { articleCategory } from '../../utils/article';
import { articleExcerpt } from '../../utils/seoMatrix';
import { formatDate } from '../../utils/format';
import ArticleMatrixBadges from './ArticleMatrixBadges';

export default function ArticleHero({ article }) {
  if (!article) return null;

  const title = article.seo_title || 'Untitled';
  const category = articleCategory(article);
  const date = article.source?.published_at || article.generated_at;
  return (
    <section className="lead-story" aria-labelledby="featured-article-title">
      <Link to={articleUrl(article.slug)} className="lead-story__link">
        <div className="lead-story__media">
          <ArticleImage article={article} fetchPriority="high" width={1400} height={787} />
        </div>
        <div className="lead-story__content">
          <span className="lead-story__category">{category}</span>
          <h2 id="featured-article-title" className="lead-story__title">
            {title}
          </h2>
          <ArticleMatrixBadges article={article} />
          <p className="lead-story__dek">{articleExcerpt(article)}</p>
          <div className="lead-story__meta">
            <time dateTime={date}>{formatDate(date)}</time>
            {article.read_time_minutes && (
              <span> · {article.read_time_minutes} min read</span>
            )}
          </div>
        </div>
      </Link>
    </section>
  );
}
