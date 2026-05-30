import { Link } from 'react-router-dom';
import { getRelationalKeywordLabels } from '../../utils/search';

function searchUrl(label) {
  return {
    pathname: '/',
    search: `search=${encodeURIComponent(label)}`,
  };
}

/** Relational Keyword Matrix — searchable topic chips (sticky sidebar desktop, footer on mobile). */
export default function RelationalKeywordMatrix({ article }) {
  const keywords = getRelationalKeywordLabels(article);

  return (
    <aside className="keyword-matrix" aria-labelledby="related-topics-heading">
      <div className="keyword-matrix__panel">
        <h2 className="keyword-matrix__title" id="related-topics-heading">
          Related topics
        </h2>
        <ul className="keyword-matrix__list">
          {keywords.map((label) => (
            <li key={label}>
              <Link to={searchUrl(label)} className="keyword-matrix__chip">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
