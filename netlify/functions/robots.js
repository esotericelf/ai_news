/** Proxy dynamic robots.txt from the Django API (updates when the scrape pipeline runs). */

async function fetchFromApi(path) {
  const apiBase = (process.env.REACT_APP_API_BASE_URL || process.env.API_BASE_URL || '')
    .replace(/\/$/, '');
  if (!apiBase) {
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: 'User-agent: *\nAllow: /\n# API_BASE_URL not configured on Netlify\n',
    };
  }

  const headers = { Accept: 'text/plain' };
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
      'Content-Type': res.headers.get('content-type') || 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
    body,
  };
}

exports.handler = async () => fetchFromApi('/robots.txt');
