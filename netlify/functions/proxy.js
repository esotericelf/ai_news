/**
 * Netlify Function: reverse proxy to backend API (ngrok / hosted),
 * injecting headers needed to bypass ngrok interstitial pages.
 *
 * Routes are mapped via public/_redirects:
 *   /api/*      -> /.netlify/functions/proxy/api/:splat
 *   /health     -> /.netlify/functions/proxy/health
 *   /robots.txt -> /.netlify/functions/proxy/robots.txt
 *   /sitemap.xml-> /.netlify/functions/proxy/sitemap.xml
 *
 * Env:
 *   API_BASE_URL (preferred) or REACT_APP_API_BASE_URL
 */

function baseUrl() {
  const raw =
    (process.env.API_BASE_URL || process.env.REACT_APP_API_BASE_URL || '').trim();
  return raw.replace(/\/$/, '');
}

function stripHopByHopHeaders(headers) {
  const out = {};
  const drop = new Set([
    'connection',
    'keep-alive',
    'proxy-authenticate',
    'proxy-authorization',
    'te',
    'trailers',
    'transfer-encoding',
    'upgrade',
    'host',
  ]);
  for (const [k, v] of Object.entries(headers || {})) {
    const key = String(k || '').toLowerCase();
    if (drop.has(key)) continue;
    out[k] = v;
  }
  return out;
}

exports.handler = async function handler(event) {
  const b = baseUrl();
  if (!b) {
    return {
      statusCode: 500,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
      body:
        'Missing API_BASE_URL. Set it in Netlify environment variables to your backend origin.',
    };
  }

  // event.path looks like: "/.netlify/functions/proxy/api/published/..."
  const prefix = '/.netlify/functions/proxy';
  const rawPath = (event.path || '').startsWith(prefix)
    ? event.path.slice(prefix.length)
    : event.path || '';

  const qs = event.rawQueryString
    ? `?${event.rawQueryString}`
    : '';
  const targetUrl = `${b}${rawPath}${qs}`;

  const incoming = stripHopByHopHeaders(event.headers);

  // Always send ngrok bypass header when proxying to ngrok.
  if (/ngrok/i.test(b)) {
    incoming['ngrok-skip-browser-warning'] = 'true';
  }

  // If you secure your backend with API_KEY, clients may send X-Api-Key.
  // We pass through whatever the browser sent, and also allow setting one
  // server-side (optional) for bots/crawlers.
  if (!incoming['X-Api-Key'] && !incoming['x-api-key']) {
    const serverKey = (process.env.API_KEY || process.env.REACT_APP_API_KEY || '').trim();
    if (serverKey) {
      incoming['X-Api-Key'] = serverKey;
    }
  }

  const method = event.httpMethod || 'GET';
  const body =
    method === 'GET' || method === 'HEAD'
      ? undefined
      : event.isBase64Encoded
        ? Buffer.from(event.body || '', 'base64')
        : event.body;

  let res;
  try {
    res = await fetch(targetUrl, {
      method,
      headers: incoming,
      body,
      redirect: 'manual',
    });
  } catch (e) {
    return {
      statusCode: 502,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
      body: `Proxy fetch failed: ${e.message}`,
    };
  }

  const outHeaders = {};
  for (const [k, v] of res.headers.entries()) {
    // Netlify will manage compression; avoid forwarding encodings that may confuse clients.
    if (k.toLowerCase() === 'content-encoding') continue;
    outHeaders[k] = v;
  }
  outHeaders['cache-control'] = outHeaders['cache-control'] || 'no-store';

  const buf = Buffer.from(await res.arrayBuffer());

  // Return base64 for non-text bodies.
  const ct = (res.headers.get('content-type') || '').toLowerCase();
  const isText =
    ct.startsWith('application/json') ||
    ct.startsWith('text/') ||
    ct.includes('xml') ||
    ct.includes('javascript') ||
    ct.includes('application/x-www-form-urlencoded');

  return {
    statusCode: res.status,
    headers: outHeaders,
    body: isText ? buf.toString('utf8') : buf.toString('base64'),
    isBase64Encoded: !isText,
  };
};

