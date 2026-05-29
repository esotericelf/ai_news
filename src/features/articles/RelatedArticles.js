import ArticleCard from './ArticleCard';
import SectionHeader from '../../components/ui/SectionHeader';
import { filterDisplayableArticles, isArticlePublic } from '../../utils/article';
import { seoMatrixLabels } from '../../utils/seoMatrix';

export default function RelatedArticles({ articles, currentSlug, keywords = [] }) {
  const related = filterDisplayableArticles(articles)
    .filter((a) => a.slug !== currentSlug && isArticlePublic(a))
    .filter((a) => {
      if (!keywords.length) return true;
      const tags = [...(a.target_keywords || []), ...seoMatrixLabels(a)];
      return tags.some((t) => keywords.includes(t));
    })
    .slice(0, 3);

  if (!related.length) return null;

  return (
    <aside className="related" aria-labelledby="related-heading">
      <SectionHeader title="Related Stories" />
      <div className="related__grid">
        {related.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </aside>
  );
}
