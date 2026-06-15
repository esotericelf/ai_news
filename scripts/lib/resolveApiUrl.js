/** Shared API origin for Node build scripts (matches src/config.js). */
function resolveApiUrl() {
  return (
    process.env.REACT_APP_API_URL ||
    process.env.REACT_APP_API_BASE_URL ||
    process.env.API_BASE_URL ||
    ''
  ).replace(/\/$/, '');
}

function apiAuthHeaders(apiKey, apiBase = resolveApiUrl()) {
  const headers = { Accept: 'application/json' };
  if (apiKey) {
    headers['X-Api-Key'] = apiKey;
    headers['ngrok-skip-browser-warning'] = 'true';
  } else if (/ngrok/i.test(apiBase)) {
    headers['ngrok-skip-browser-warning'] = 'true';
  }
  return headers;
}

module.exports = { resolveApiUrl, apiAuthHeaders };
