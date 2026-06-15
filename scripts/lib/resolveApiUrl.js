/** Shared API origin for Node build scripts (matches src/config.js). */

function isPlaceholderApiUrl(url) {
  if (!url) return true;
  return /YOUR-SUBDOMAIN|your-subdomain|example\.com/i.test(url);
}

function resolveApiUrl() {
  const onNetlify =
    process.env.NETLIFY === 'true' ||
    Boolean(process.env.NETLIFY_DEV) ||
    Boolean(process.env.DEPLOY_URL);

  // On Netlify, API_BASE_URL is the site secret; don't let committed .env placeholders win.
  const candidates = onNetlify
    ? [
        process.env.API_BASE_URL,
        process.env.REACT_APP_API_URL,
        process.env.REACT_APP_API_BASE_URL,
      ]
    : [
        process.env.REACT_APP_API_URL,
        process.env.REACT_APP_API_BASE_URL,
        process.env.API_BASE_URL,
      ];

  for (const raw of candidates) {
    const url = String(raw || '')
      .trim()
      .replace(/\/$/, '');
    if (url && !isPlaceholderApiUrl(url)) return url;
  }
  return '';
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

function loadEnvFile(rootDir, filename) {
  const fs = require('fs');
  const path = require('path');
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
    if (process.env[key] !== undefined) continue;
    if (/API_URL|API_BASE/i.test(key) && isPlaceholderApiUrl(value)) continue;
    process.env[key] = value;
  }
}

module.exports = {
  resolveApiUrl,
  apiAuthHeaders,
  isPlaceholderApiUrl,
  loadEnvFile,
};
