import Tag from '../../components/ui/Tag';
import { companyAndToolBadges } from '../../utils/seoMatrix';

/** Inline flex row of company / tool tags (existing article-matrix__tags styles). */
export default function ArticleMatrixBadges({ article }) {
  const badges = companyAndToolBadges(article);
  if (!badges.length) return null;

  return (
    <ul className="article-matrix__tags" aria-label="Companies and tools">
      {badges.map((entity, index) => (
        <li key={entity.slug || `${entity.label}-${index}`}>
          <Tag label={entity.label} slug={entity.slug} />
        </li>
      ))}
    </ul>
  );
}
