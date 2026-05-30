import { Link } from 'react-router-dom';
import { FOOTER_SITEMAP_SECTIONS } from '../../config/footerSitemap';

function searchTo(term) {
  return {
    pathname: '/',
    search: `search=${encodeURIComponent(term)}`,
  };
}

function SitemapLink({ item }) {
  const className = 'footer-sitemap__link';

  if (item.to) {
    return (
      <Link to={item.to} className={className}>
        {item.label}
      </Link>
    );
  }

  if (item.search) {
    return (
      <Link to={searchTo(item.search)} className={className}>
        {item.label}
      </Link>
    );
  }

  if (item.href) {
    const external = item.href.startsWith('http');
    return (
      <a
        href={item.href}
        className={className}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {item.label}
      </a>
    );
  }

  return <span className={className}>{item.label}</span>;
}

function SitemapBranch({ item }) {
  return (
    <li className="footer-sitemap__branch">
      <SitemapLink item={item} />
      {item.hint && <span className="footer-sitemap__hint">{item.hint}</span>}
    </li>
  );
}

function SitemapSection({ section }) {
  return (
    <section className="footer-sitemap__section" aria-labelledby={`footer-sitemap-${section.id}`}>
      <h3 className="footer-sitemap__heading" id={`footer-sitemap-${section.id}`}>
        {section.title}
      </h3>
      <ul className="footer-sitemap__tree">
        {section.items.map((item) => (
          <SitemapBranch key={`${section.id}-${item.label}`} item={item} />
        ))}
      </ul>
    </section>
  );
}

/** Hierarchical footer directory index for humans and internal link equity. */
export default function FooterSitemap() {
  return (
    <nav className="footer-sitemap" aria-label="Site directory">
      <p className="footer-sitemap__title">Site directory</p>
      <div className="footer-sitemap__grid">
        {FOOTER_SITEMAP_SECTIONS.map((section) => (
          <SitemapSection key={section.id} section={section} />
        ))}
      </div>
    </nav>
  );
}
