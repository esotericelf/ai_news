import { Link } from 'react-router-dom';
import { FOOTER_SITEMAP_SECTIONS } from '../../config/siteDirectory';
import { SitemapTreeLink } from './SitemapTree';

function SitemapSection({ section }) {
  return (
    <section className="footer-sitemap__section" aria-labelledby={`footer-sitemap-${section.id}`}>
      <h3 className="footer-sitemap__heading" id={`footer-sitemap-${section.id}`}>
        {section.title}
      </h3>
      <ul className="footer-sitemap__tree">
        {section.items.map((item) => (
          <li key={`${section.id}-${item.label}`} className="footer-sitemap__branch">
            <SitemapTreeLink item={item} className="footer-sitemap__link" />
            {item.hint && <span className="footer-sitemap__hint">{item.hint}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Hierarchical footer directory index for humans and internal link equity. */
export default function FooterSitemap() {
  return (
    <nav className="footer-sitemap" aria-label="Site directory">
      <p className="footer-sitemap__title">
        Site directory —{' '}
        <Link to="/sitemap" className="footer-sitemap__full-map">
          full map
        </Link>
      </p>
      <div className="footer-sitemap__grid">
        {FOOTER_SITEMAP_SECTIONS.map((section) => (
          <SitemapSection key={section.id} section={section} />
        ))}
      </div>
    </nav>
  );
}
