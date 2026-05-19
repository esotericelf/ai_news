import { Link, useSearchParams } from 'react-router-dom';
import TaxonomyNav from '../features/navigation/TaxonomyNav';
import { config } from '../config';

export default function Header() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('search') || '';
  const masthead = config.siteName.toUpperCase();

  return (
    <header className="site-header" role="banner">
      <div className="site-header__top">
        <span className="site-header__edition">Technology · Science · AI</span>
      </div>
      <div className="site-header__main">
        <Link
          to="/"
          className="site-logo"
          aria-label={`${config.siteName} — back to home`}
          title="Back to home"
        >
          {masthead}
        </Link>
        <form className="site-search" action="/" method="get" role="search">
          <label htmlFor="site-search-input" className="visually-hidden">
            Search articles
          </label>
          <input
            id="site-search-input"
            type="search"
            name="search"
            defaultValue={q}
            placeholder="Search"
            autoComplete="off"
          />
          <button type="submit" aria-label="Search">
            →
          </button>
        </form>
      </div>
      <TaxonomyNav />
    </header>
  );
}
