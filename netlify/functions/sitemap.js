/** Proxy dynamic sitemap.xml from the Django API (updates when the scrape pipeline runs). */

async function fetchFromApi(path) {
  const apiBase = (process.env.REACT_APP_API_BASE_URL || process.env.API_BASE_URL || '')
    .replace(/\/$/, '');
  if (!apiBase) {
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
      body:
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n',
    };
  }

  const headers = { Accept: 'application/xml' };
  if (/ngrok/i.test(apiBase)) {
    headers['ngrok-skip-browser-warning'] = 'true';
  }
  const apiKey = (process.env.REACT_APP_API_KEY || process.env.API_KEY || '').trim();
  if (apiKey) {
    headers['X-Api-Key'] = apiKey;
  }

  const res = await fetch(`${apiBase}${path}`, { headers });
  const body = await res.text();
  return {
    statusCode: res.status,
    headers: {
      'Content-Type': res.headers.get('content-type') || 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
    body,
  };
}

exports.handler = async () => fetchFromApi('/sitemap.xml');
