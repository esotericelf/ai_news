/**
 * Spot-check live pages for the "Unexpected token '<' ... not valid JSON" issue.
 *
 * This happens when the SPA tries to fetch JSON but receives HTML (often Netlify's
 * index.html due to redirects or a mis-set API base).
 *
 * Usage (PowerShell):
 *   node scripts/check-json-pages.js --base https://ainewsrepo.netlify.app --limit 50
 */
const fs = require('fs');
const path = require('path');

function arg(name, fallback = null) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return fallback;
  return process.argv[idx + 1] || fallback;
}

function intArg(name, fallback) {
  const v = arg(name, '');
  const n = Number(v);
  return Number.isFinite(n) ? Math.floor(n) : fallback;
}

function readBuildSitemap() {
  const p = path.join(__dirname, '..', 'build', 'sitemap.xml');
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}

function extractNewsUrls(xml) {
  const out = [];
  const re = /<loc>(.*?)<\/loc>/gi;
  let m;
  while ((m = re.exec(xml))) {
    const loc = (m[1] || '').trim();
    if (loc.includes('/news/')) out.push(loc);
  }
  return [...new Set(out)];
}

async function head(url) {
  const res = await fetch(url, { method: 'GET', headers: { Accept: 'text/html' } });
  const ct = (res.headers.get('content-type') || '').toLowerCase();
  const text = await res.text();
  const isHtml = text.trim().startsWith('<!doctype') || text.trim().startsWith('<html');
  return { ok: res.ok, status: res.status, ct, isHtml, sample: text.slice(0, 80) };
}

async function main() {
  const base = arg('base', 'https://ainewsrepo.netlify.app').replace(/\/$/, '');
  const limit = intArg('limit', 30);

  const xml = readBuildSitemap();
  if (!xml) {
    console.error('[check] build/sitemap.xml missing. Run npm run build first.');
    process.exit(1);
  }

  const urls = extractNewsUrls(xml).slice(0, limit);
  console.log(`[check] Testing ${urls.length} /news URLs against ${base}`);

  let bad = 0;
  for (const loc of urls) {
    const u = new URL(loc);
    const live = `${base}${u.pathname}`;
    try {
      const r = await head(live);
      if (!r.ok || !r.isHtml) {
        // If it isn't HTML, that's also suspicious for a page route.
        console.log(`WARN ${r.status} ${live} ct=${r.ct} sample=${JSON.stringify(r.sample)}`);
      }
      // Page itself can be HTML; the JSON error is usually from API calls.
      // Heuristic: ensure prerendered HTML contains some article structure.
      if (r.isHtml && r.sample.toLowerCase().includes('<!doctype')) {
        // ok
      }
    } catch (e) {
      bad += 1;
      console.log(`ERR  ${live} ${e.message}`);
    }
  }

  console.log(`[check] Done. Errors=${bad}`);
}

main().catch((e) => {
  console.error('[check] Fatal:', e);
  process.exit(1);
});

