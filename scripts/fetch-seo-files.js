/**
 * Fetches robots.txt and sitemap.xml from the Django API into public/
 * so Netlify serves real XML/text (not the SPA index.html).
 *
 * Runs automatically via npm "prebuild" before react-scripts build.
 *
 * Also writes public/_redirects so Netlify can proxy /sitemap.xml and
 * /robots.txt to the live Django endpoint (Postgres-backed, always fresh).
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

const { resolveApiUrl, loadEnvFile } = require('./lib/resolveApiUrl');

loadEnvFile(rootDir, '.env');
loadEnvFile(rootDir, '.env.local');
loadEnvFile(rootDir, '.env.production');

const apiBase = resolveApiUrl();
const siteUrl = (
  process.env.REACT_APP_SITE_URL || 'https://ainewsrepo.netlify.app'
).replace(/\/$/, '');
const apiKey = (process.env.REACT_APP_API_KEY || process.env.API_KEY || '').trim();

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
  if (apiKey) {
    headers['X-Api-Key'] = apiKey;
    headers['ngrok-skip-browser-warning'] = 'true';
  } else if (/ngrok/i.test(apiBase)) {
    headers['ngrok-skip-browser-warning'] = 'true';
  }
  const res = await fetch(`${apiBase}${apiPath}`, { headers });
  const body = await res.text();
  return { ok: res.ok, status: res.status, body };
}

async function writeSeoFile(apiPath, filename, validate, fallback) {
  const outPath = path.join(publicDir, filename);
  if (!apiBase) {
    console.warn(
      `[fetch-seo-files] No REACT_APP_API_URL — writing fallback ${filename}. ` +
        'Set REACT_APP_API_URL on Netlify so prebuild can pull the Django sitemap.'
    );
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
    const urlCount = filename.endsWith('.xml') ? (body.match(/<loc>/g) || []).length : null;
    const extra = urlCount != null ? `, ${urlCount} URLs` : '';
    console.log(`[fetch-seo-files] Wrote public/${filename} (${body.length} bytes${extra})`);
    return true;
  } catch (err) {
    console.warn(
      `[fetch-seo-files] ${filename}: ${err.message} — using fallback. ` +
        `Ensure ${apiBase}${apiPath} is reachable during build.`
    );
    fs.writeFileSync(outPath, fallback, 'utf8');
    return false;
  }
}

function writeNetlifyRedirects() {
  const redirectsPath = path.join(publicDir, '_redirects');
  const onNetlify =
    process.env.NETLIFY === 'true' || /\.netlify\.app$/i.test(siteUrl);
  const runtimeApi =
    (
      process.env.API_BASE_URL ||
      process.env.REACT_APP_API_URL ||
      process.env.REACT_APP_API_BASE_URL ||
      apiBase ||
      ''
    ).replace(/\/$/, '');

  const lines = [];

  // Always write proxy rules on Netlify deploys (function reads API_BASE_URL at runtime).
  if (onNetlify || apiBase || runtimeApi) {
    lines.push(`/sitemap.xml  /.netlify/functions/proxy/sitemap.xml  200!`);
    lines.push(`/robots.txt   /.netlify/functions/proxy/robots.txt   200!`);
    lines.push(`/health       /.netlify/functions/proxy/health       200!`);
    lines.push(`/api/*        /.netlify/functions/proxy/api/:splat   200!`);
    console.log(
      `[fetch-seo-files] Wrote public/_redirects — API proxy` +
        (runtimeApi ? ` (build API: ${runtimeApi})` : ' (set API_BASE_URL on Netlify)')
    );
  } else {
    console.warn(
      '[fetch-seo-files] No API URL — skipping _redirects proxy (local build only).'
    );
  }

  fs.writeFileSync(redirectsPath, lines.join('\n') + (lines.length ? '\n' : ''), 'utf8');
}

async function main() {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  console.log(`[fetch-seo-files] API base: ${apiBase || '(not set)'}`);
  console.log(`[fetch-seo-files] Site URL: ${siteUrl}`);

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

  writeNetlifyRedirects();
}

main().catch((err) => {
  console.error('[fetch-seo-files] Fatal:', err);
  process.exit(1);
});
