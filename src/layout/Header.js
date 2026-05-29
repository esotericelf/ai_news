import { Link } from 'react-router-dom';
import SiteSearch from '../components/navigation/SiteSearch';
import TaxonomyNav from '../features/navigation/TaxonomyNav';
import { config } from '../config';
import HeaderAccount from './HeaderAccount';

export default function Header() {
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
        <div className="site-header__tools">
          <SiteSearch />
          <HeaderAccount />
        </div>
      </div>
      <TaxonomyNav />
    </header>
  );
}
