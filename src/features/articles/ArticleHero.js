import { Link } from 'react-router-dom';
import { articleUrl } from '../../config';
import ArticleImage from '../../components/ui/ArticleImage';
import { articleCategory, articleTitle } from '../../utils/article';
import { formatDate } from '../../utils/format';

export default function ArticleHero({ article }) {
  if (!article) return null;

  const title = articleTitle(article);
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
          <p className="lead-story__dek">{article.meta_description}</p>
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
