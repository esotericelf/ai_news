/**
 * Build-time SEO JSON cache for react-snap prerendering.
 *
 * Problem: CRA pages fetch data from the API at runtime. During react-snap, Chromium
 * sometimes fails to reach the ngrok API (cert/proxy/network), producing prerendered
 * "Something went wrong" error pages.
 *
 * Solution: fetch required JSON during prebuild using Node (same environment as
 * fetch-seo-files.js, with NODE_OPTIONS=--use-system-ca if needed) and write it into
 * public/seo-cache/*.json. During react-snap, the app will read from this cache.
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const cacheDir = path.join(publicDir, 'seo-cache');

function mkdirp(p) {
  fs.mkdirSync(p, { recursive: true });
}

function readFileIfExists(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return '';
  }
}

function loadEnvFile(filename) {
  const filePath = path.join(rootDir, filename);
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function intEnv(name, fallback) {
  const raw = (process.env[name] || '').trim();
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}

function extractLocs(xml) {
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
    return (u.pathname || '/').replace(/\/+$/, '') || '/';
  } catch {
    return null;
  }
}

function uniq(arr) {
  return [...new Set(arr)];
}

const { resolveApiUrl, apiAuthHeaders } = require('./lib/resolveApiUrl');

async function apiGetJson(apiBase, apiPath, apiKey) {
  const headers = apiAuthHeaders(apiKey, apiBase);
  const res = await fetch(`${apiBase}${apiPath}`, { headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} for ${apiPath} (${text.slice(0, 120)})`);
  }
  return res.json();
}

function cachePathForApi(apiPath) {
  // Map known endpoints to stable cache locations.
  if (apiPath === '/api/taxonomy/') return path.join(cacheDir, 'taxonomy.json');
  if (apiPath === '/api/companies/') return path.join(cacheDir, 'companies.json');
  if (apiPath === '/api/tools/') return path.join(cacheDir, 'tools.json');
  if (apiPath === '/api/industries/') return path.join(cacheDir, 'industries.json');

  // /api/published/<slug>/
  const m = apiPath.match(/^\/api\/published\/([^/]+)\/$/);
  if (m) {
    return path.join(cacheDir, 'published', 'slug', `${decodeURIComponent(m[1])}.json`);
  }

  // /api/published/?... (home/category/tag lists)
  if (apiPath.startsWith('/api/published/?')) {
    const key = apiPath
      .slice('/api/published/?'.length)
      .replace(/[^a-z0-9=_-]+/gi, '_')
      .slice(0, 180);
    return path.join(cacheDir, 'published', 'list', `${key || 'default'}.json`);
  }
  return null;
}

async function main() {
  loadEnvFile('.env');
  loadEnvFile('.env.local');
  loadEnvFile('.env.production');

  const apiBase = resolveApiUrl();
  const apiKey = (process.env.REACT_APP_API_KEY || process.env.API_KEY || '').trim();

  if (!apiBase) {
    console.warn('[build-seo-cache] No API base URL; skipping cache build.');
    return;
  }

  mkdirp(cacheDir);
  mkdirp(path.join(cacheDir, 'published', 'slug'));
  mkdirp(path.join(cacheDir, 'published', 'list'));

  const sitemapXml = readFileIfExists(path.join(publicDir, 'sitemap.xml'));
  if (!sitemapXml) {
    console.warn('[build-seo-cache] public/sitemap.xml missing; skipping cache build.');
    return;
  }

  const limits = {
    news: intEnv('PRERENDER_NEWS_LIMIT', 100),
    category: intEnv('PRERENDER_CATEGORY_LIMIT', 50),
    matrix: intEnv('PRERENDER_MATRIX_LIMIT', 30),
  };

  const paths = uniq(extractLocs(sitemapXml).map(toPathname).filter(Boolean));
  const categoryPaths = paths.filter((p) => p.startsWith('/category/')).slice(0, limits.category);
  const matrixPaths = paths
    .filter(
      (p) =>
        p.startsWith('/companies/') ||
        p.startsWith('/tools/') ||
        p.startsWith('/industries/')
    )
    .slice(0, limits.matrix);
  const newsPaths = paths.filter((p) => p.startsWith('/news/')).slice(0, limits.news);

  const apiPaths = new Set();
  apiPaths.add('/api/taxonomy/');
  apiPaths.add('/api/companies/');
  apiPaths.add('/api/tools/');
  apiPaths.add('/api/industries/');
  apiPaths.add('/api/published/?page=1&ordering=-generated_at');

  for (const p of categoryPaths) {
    const parts = p.split('/').filter(Boolean); // category, l1, l2?
    const l1 = parts[1];
    const l2 = parts[2];
    const qs = new URLSearchParams({ page: '1', ordering: '-generated_at', category_l1: l1 });
    if (l2) qs.set('category_l2', l2);
    apiPaths.add(`/api/published/?${qs.toString()}`);
  }

  for (const p of matrixPaths) {
    const parts = p.split('/').filter(Boolean);
    const segment = parts[0];
    const slug = parts[1];
    const qs = new URLSearchParams({ page: '1', ordering: '-generated_at' });
    if (segment === 'companies') qs.set('company', slug);
    else if (segment === 'tools') qs.set('tool', slug);
    else if (segment === 'industries') qs.set('industry', slug);
    apiPaths.add(`/api/published/?${qs.toString()}`);
  }

  for (const p of newsPaths) {
    const slug = p.split('/').filter(Boolean)[1];
    apiPaths.add(`/api/published/${encodeURIComponent(slug)}/`);
  }

  const list = [...apiPaths];
  console.log(
    `[build-seo-cache] Building cache from ${apiBase} (${list.length} API calls; ` +
      `news=${newsPaths.length}, categories=${categoryPaths.length}, matrix=${matrixPaths.length})`
  );

  let ok = 0;
  for (const apiPath of list) {
    const out = cachePathForApi(apiPath);
    if (!out) continue;
    try {
      const json = await apiGetJson(apiBase, apiPath, apiKey);
      mkdirp(path.dirname(out));
      fs.writeFileSync(out, JSON.stringify(json), 'utf8');
      ok += 1;
    } catch (e) {
      console.warn(`[build-seo-cache] Skip ${apiPath}: ${e.message}`);
    }
  }

  console.log(`[build-seo-cache] Wrote ${ok} cache files to public/seo-cache/`);
}

main().catch((err) => {
  console.error('[build-seo-cache] Fatal:', err);
  process.exit(1);
});

