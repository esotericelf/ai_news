/**
 * Fetches robots.txt and sitemap.xml from the Django API into public/
 * so Netlify serves real XML/text (not the SPA index.html).
 * Runs automatically via npm "prebuild" before react-scripts build.
 */

const fs = require('fs');
const path = require('path');

const apiBase = (process.env.REACT_APP_API_BASE_URL || process.env.API_BASE_URL || '')
  .replace(/\/$/, '');
const siteUrl = (
  process.env.REACT_APP_SITE_URL || 'https://ainewsrepo.netlify.app'
).replace(/\/$/, '');
const apiKey = (process.env.REACT_APP_API_KEY || process.env.API_KEY || '').trim();
const publicDir = path.join(__dirname, '..', 'public');

const FALLBACK_SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;

const FALLBACK_ROBOTS = `# Build-time fallback (API unreachable)
User-agent: *
Allow: /
Disallow: /editor

Sitemap: ${siteUrl}/sitemap.xml
`;

function isHtml(body) {
  const t = (body || '').trim().toLowerCase();
  return t.startsWith('<!doctype') || t.startsWith('<html') || t.includes('<html');
}

async function fetchPath(apiPath, accept) {
  const headers = { Accept: accept };
  if (/ngrok/i.test(apiBase)) {
    headers['ngrok-skip-browser-warning'] = 'true';
  }
  if (apiKey) {
    headers['X-Api-Key'] = apiKey;
  }
  const res = await fetch(`${apiBase}${apiPath}`, { headers });
  const body = await res.text();
  return { ok: res.ok, status: res.status, body };
}

async function writeSeoFile(apiPath, filename, validate, fallback) {
  const outPath = path.join(publicDir, filename);
  if (!apiBase) {
    console.warn(`[fetch-seo-files] No API URL — writing fallback ${filename}`);
    fs.writeFileSync(outPath, fallback, 'utf8');
    return false;
  }
  try {
    const accept =
      filename.endsWith('.xml') ? 'application/xml, text/xml' : 'text/plain';
    const { ok, status, body } = await fetchPath(apiPath, accept);
    if (!ok || isHtml(body) || !validate(body)) {
      throw new Error(`invalid response (HTTP ${status}, ${body.length} bytes)`);
    }
    fs.writeFileSync(outPath, body, 'utf8');
    console.log(`[fetch-seo-files] Wrote public/${filename} (${body.length} bytes)`);
    return true;
  } catch (err) {
    console.warn(`[fetch-seo-files] ${filename}: ${err.message} — using fallback`);
    fs.writeFileSync(outPath, fallback, 'utf8');
    return false;
  }
}

async function main() {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  await writeSeoFile(
    '/sitemap.xml',
    'sitemap.xml',
    (body) => body.includes('<urlset') && body.includes('</urlset>'),
    FALLBACK_SITEMAP
  );

  await writeSeoFile(
    '/robots.txt',
    'robots.txt',
    (body) => body.toLowerCase().includes('user-agent'),
    FALLBACK_ROBOTS
  );
}

main().catch((err) => {
  console.error('[fetch-seo-files] Fatal:', err);
  process.exit(1);
});
