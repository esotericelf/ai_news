import Tag from '../../components/ui/Tag';
import { buildSearchSuggestions } from '../../utils/searchSuggestions';

export default function SearchKeywordSuggestions({ query, articles, matchedArticles, hasMatches }) {
  const suggestions = buildSearchSuggestions(
    hasMatches ? matchedArticles : articles,
    query,
    { limit: 10, matchedOnly: hasMatches }
  );

  if (!suggestions.length) return null;

  return (
    <aside className="search-results__suggestions" aria-labelledby="search-suggestions-heading">
      <h2 className="search-results__suggestions-title" id="search-suggestions-heading">
        Try searching for these related topics:
      </h2>
      <ul className="search-results__suggestions-list">
        {suggestions.map((label) => (
          <li key={label}>
            <Tag label={label} />
          </li>
        ))}
      </ul>
    </aside>
  );
}
