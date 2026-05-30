import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { SitemapTreeSection } from '../components/navigation/SitemapTree';
import { SITEMAP_PAGE_SECTIONS } from '../config/siteDirectory';
import SeoHead from '../seo/SeoHead';
import { config } from '../config';

export default function SitemapPage() {
  return (
    <>
      <SeoHead
        title="Site Map"
        description="A human-readable directory of AI News Repo — main pages, tech exploration clusters, API documentation, and search filters."
        canonical={`${config.siteUrl}/sitemap`}
        keywords={['sitemap', 'site directory', 'AI news navigation', 'topics index']}
      />

      <div className="page page--sitemap">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Site Map' }]} />

        <div className="sitemap-page">
          <header className="sitemap-page__hero">
            <p className="sitemap-page__kicker">Directory index</p>
            <h1 className="sitemap-page__title">Site map</h1>
            <p className="sitemap-page__dek">
              A structured map of every major section on {config.siteName}. Use the branches below
              to navigate clusters, reports, and engineering resources — no XML required.
            </p>
            <p className="sitemap-page__xml-note">
              Search engines: use the{' '}
              <a href="/sitemap.xml" className="sitemap-page__xml-link">
                XML sitemap
              </a>{' '}
              for crawler indexing.
            </p>
          </header>

          <div className="sitemap-page__diagram" role="navigation" aria-label="Site structure">
            {SITEMAP_PAGE_SECTIONS.map((section) => (
              <SitemapTreeSection key={section.id} section={section} />
            ))}
          </div>

          <footer className="sitemap-page__footer">
            <p>
              Looking for a specific story?{' '}
              <Link to="/">Search the archive from home</Link> or{' '}
              <Link to="/topics">browse all topics</Link>.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
