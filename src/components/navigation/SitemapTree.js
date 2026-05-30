import { Link } from 'react-router-dom';

export function searchPath(term) {
  return {
    pathname: '/',
    search: `search=${encodeURIComponent(term)}`,
  };
}

export function SitemapTreeLink({ item, className = 'sitemap-tree__link' }) {
  if (item.to) {
    return (
      <Link to={item.to} className={className}>
        {item.label}
      </Link>
    );
  }

  if (item.search) {
    return (
      <Link to={searchPath(item.search)} className={className}>
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

export function SitemapTreeBranch({ item }) {
  return (
    <li className="sitemap-tree__branch">
      <span className="sitemap-tree__bullet" aria-hidden="true" />
      <div className="sitemap-tree__branch-body">
        <SitemapTreeLink item={item} />
        {item.hint && <p className="sitemap-tree__hint">{item.hint}</p>}
      </div>
    </li>
  );
}

export function SitemapTreeSection({ section, headingLevel: Heading = 'h2' }) {
  const headingId = `sitemap-section-${section.id}`;

  return (
    <section className="sitemap-tree__section" aria-labelledby={headingId}>
      <Heading className="sitemap-tree__heading" id={headingId}>
        {section.title}
      </Heading>
      {section.description && (
        <p className="sitemap-tree__section-dek">{section.description}</p>
      )}
      <ul className="sitemap-tree__list">
        {section.items.map((item) => (
          <SitemapTreeBranch key={`${section.id}-${item.label}`} item={item} />
        ))}
      </ul>
    </section>
  );
}
