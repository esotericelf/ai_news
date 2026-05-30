import { Link } from 'react-router-dom';
import { getRelationalKeywordLabels } from '../../utils/search';

function searchUrl(label) {
  return {
    pathname: '/',
    search: `search=${encodeURIComponent(label)}`,
  };
}

/** Sticky sidebar widget of searchable keyword chips for the active article. */
export default function RelationalKeywordMatrix({ article }) {
  const keywords = getRelationalKeywordLabels(article);

  return (
    <aside className="keyword-matrix" aria-labelledby="keyword-matrix-heading">
      <div className="keyword-matrix__panel">
        <h2 className="keyword-matrix__title" id="keyword-matrix-heading">
          Relational Keyword Matrix
        </h2>
        <p className="keyword-matrix__dek">
          Explore related topics across our archive.
        </p>
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
