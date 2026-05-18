import { Link } from 'react-router-dom';
import { config } from '../config';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer__rule" aria-hidden="true" />
      <div className="site-footer__inner">
        <p className="site-footer__brand">{config.siteName.toUpperCase()}</p>
        <p className="site-footer__copy">
          © {year} {config.siteName}. The latest in artificial intelligence, science, and
          technology.
        </p>
        <nav className="site-footer__nav" aria-label="Footer">
          <Link to="/">Home</Link>
          <Link to="/topics">Topics</Link>
          <a href="/sitemap.xml">Sitemap</a>
        </nav>
      </div>
    </footer>
  );
}
