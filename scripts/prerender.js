/**
 * Build-time prerendering for key SEO routes.
 *
 * Why: CRA is client-rendered; Google "view source" sees an empty <div id="root"></div>.
 * This script runs after `react-scripts build`, reads the backend-generated sitemap
 * (copied into build/ by fetch-seo-files.js), and snapshots a capped set of routes
 * into static HTML files using react-snap.
 *
 * Controls (Netlify env or local):
 * - PRERENDER_NEWS_LIMIT: number of /news/:slug pages to prerender (default 100)
 * - PRERENDER_CATEGORY_LIMIT: number of /category pages (default 50; sitemap usually ~18-36)
 * - PRERENDER_TAG_LIMIT: number of /tags pages (default 30)
 * - PRERENDER_TOTAL_LIMIT: hard cap for all routes (default 250)
 */
const fs = require('fs');
const path = require('path');

function intEnv(name, fallback) {
  const raw = (process.env[name] || '').trim();
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}

function uniq(arr) {
  return [...new Set(arr)];
}

function readFileIfExists(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return '';
  }
}

function extractLocsFromSitemap(xml) {
  // Simple + robust enough for our generated sitemap.xml.
  const locs = [];
  const re = /<loc>(.*?)<\/loc>/gi;
  let m;
  while ((m = re.exec(xml))) {
    const loc = (m[1] || '').trim();
    if (loc) locs.push(loc);
  }
  return locs;
}

function toPathname(loc) {
  try {
    const u = new URL(loc);
    const p = (u.pathname || '/').replace(/\/+$/, '') || '/';
    return p;
  } catch {
    // If loc is already a path.
    const p = (loc || '').trim();
    if (!p) return null;
    if (p.startsWith('http://') || p.startsWith('https://')) return null;
    return p.replace(/\/+$/, '') || '/';
  }
}

function pickRoutesFromSitemap({ sitemapXml, limits }) {
  const locs = extractLocsFromSitemap(sitemapXml);
  const paths = uniq(locs.map(toPathname).filter(Boolean));

  // Always include these entry points.
  const always = ['/', '/topics'];

  const categories = paths.filter((p) => p === '/topics' || p.startsWith('/category/'));
  const tags = paths.filter((p) => p.startsWith('/tags/'));
  const news = paths.filter((p) => p.startsWith('/news/'));

  const picked = [];
  picked.push(...always);
  picked.push(...categories.slice(0, limits.category));
  picked.push(...tags.slice(0, limits.tag));
  picked.push(...news.slice(0, limits.news));

  const final = uniq(picked)
    .filter((p) => p !== '/editor' && !p.startsWith('/editor/'))
    .slice(0, limits.total);

  return final;
}

async function main() {
  const rootDir = path.join(__dirname, '..');
  const buildDir = path.join(rootDir, 'build');
  const sitemapPath = path.join(buildDir, 'sitemap.xml');

  const limits = {
    news: intEnv('PRERENDER_NEWS_LIMIT', 100),
    category: intEnv('PRERENDER_CATEGORY_LIMIT', 50),
    tag: intEnv('PRERENDER_TAG_LIMIT', 30),
    total: intEnv('PRERENDER_TOTAL_LIMIT', 250),
  };

  const sitemapXml = readFileIfExists(sitemapPath);
  if (!sitemapXml) {
    console.warn(
      `[prerender] No build/sitemap.xml found. Skipping prerender. ` +
        `Ensure scripts/fetch-seo-files.js runs in prebuild and API is reachable.`
    );
    return;
  }

  const include = pickRoutesFromSitemap({ sitemapXml, limits });
  if (!include.length) {
    console.warn('[prerender] No routes selected. Skipping prerender.');
    return;
  }

  console.log(
    `[prerender] Prerendering ${include.length} routes (limits: ` +
      `news=${limits.news}, category=${limits.category}, tag=${limits.tag}, total=${limits.total})`
  );

  // Defer require so installs can finish before postbuild runs.
  const { run } = require('react-snap');

  await run({
    source: 'build',
    include,
    // Only snapshot the include list (avoid crawling to /404.html etc).
    crawl: false,
    // Keep it stable in CI/Netlify.
    headless: true,
    // More generous navigation timeout (ngrok/cold starts can be slow).
    puppeteer: { timeout: 120000 },
    puppeteerArgs: ['--no-sandbox', '--disable-setuid-sandbox'],
    // Don’t let one flakey route fail the entire deploy.
    // react-snap uses "skipThirdPartyRequests" to reduce noise.
    skipThirdPartyRequests: true,
  });

  console.log('[prerender] Done.');
}

main().catch((err) => {
  console.error('[prerender] Fatal:', err);
  process.exit(1);
});

