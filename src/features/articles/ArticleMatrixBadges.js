import Tag from '../../components/ui/Tag';
import { matrixEntityBadges } from '../../utils/seoMatrix';

/** Inline flex row of matrix entity links (article-matrix__tags styles). */
export default function ArticleMatrixBadges({ article }) {
  const badges = matrixEntityBadges(article);
  if (!badges.length) return null;

  return (
    <ul className="article-matrix__tags" aria-label="Companies, tools, and industries">
      {badges.map((entity, index) => (
        <li key={entity.slug || `${entity.label}-${index}`}>
          <Tag label={entity.label} slug={entity.slug} matrixType={entity.matrixType} />
        </li>
      ))}
    </ul>
  );
}
