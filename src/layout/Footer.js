import { Link } from 'react-router-dom';
import FooterSitemap from '../components/navigation/FooterSitemap';
import { config } from '../config';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer__rule" aria-hidden="true" />
      <div className="site-footer__inner">
        <p className="site-footer__brand">{config.siteName.toUpperCase()}</p>

        <FooterSitemap />

        <p className="site-footer__copy">
          © {year} {config.siteName}. The latest in artificial intelligence, science, and
          technology.
        </p>
        <nav className="site-footer__nav" aria-label="Footer utilities">
          <Link to="/">Home</Link>
          <Link to="/report">Master Report</Link>
          <Link to="/topics">Topics</Link>
          <Link to="/sitemap">Site Map</Link>
          <a href="/sitemap.xml">XML Sitemap</a>
        </nav>
      </div>
    </footer>
  );
}
