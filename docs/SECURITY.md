# Security headers (frontend)

The public site on **Netlify** sends defensive HTTP headers via [`netlify.toml`](../netlify.toml) (`[[headers]]` for CSP) and [`public/_headers`](../public/_headers) (other headers). **Redeploy Netlify** after any CSP change — the live site keeps the old policy until then.

## Headers

| Header | Purpose |
|--------|---------|
| **Content-Security-Policy** | Limits where scripts, styles, images, and API calls can load from (mitigates XSS and unwanted embeds). |
| **Strict-Transport-Security** | Browsers use HTTPS only for ~2 years (`includeSubDomains; preload`). |
| **X-Content-Type-Options: nosniff** | Blocks MIME-type sniffing (e.g. treating a download as executable script). |
| **X-Frame-Options: DENY** | Prevents clickjacking via iframes. |
| **Referrer-Policy** | Sends only origin on cross-origin requests. |
| **Permissions-Policy** | Disables camera, mic, geolocation, etc. (not used by this app). |
| **Cross-Origin-Opener-Policy** | `same-origin-allow-popups` so Firebase Google/GitHub sign-in popups still work. |

### CSP notes

- **Images** use `img-src https:` so article heroes can load from any publisher origin.
- **API** uses `connect-src https:` so `REACT_APP_API_BASE_URL` can be ngrok or any HTTPS host without redeploying headers.
- **Google Analytics** is allowed via `script-src` / `connect-src` to Google domains.
- **Firebase editor** auth requires `script-src` and **`script-src-elem`** for `https://apis.google.com` and `https://www.gstatic.com`. `frame-src` covers Google/GitHub/Firebase popups; `connect-src https:` covers API calls. Sign-in uses a **popup** first, then full-page redirect if the popup is blocked.

If `/editor` sign-in shows `auth/internal-error`, add your hostname to Firebase **Authorized domains** and redeploy Netlify after env vars are set.

If a new third-party script is added, update `_headers` and redeploy Netlify.

## Verify after deploy

```bash
curl -sI https://ainewsrepo.netlify.app/ | findstr /I "content-security-policy strict-transport x-content-type x-frame"
```

Or use [securityheaders.com](https://securityheaders.com/) on your production URL.

## Local dev

`npm start` does **not** apply `_headers` (Create React App dev server). Headers only apply on Netlify (or another host that reads `_headers`).

Backend API headers: see `AI_News_Scraper/docs/SECURITY.md`.
