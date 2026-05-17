# Deploy to Netlify

This project cannot be deployed “for you” from an AI session: **you** must link Netlify (or GitHub secrets) once. Docker Desktop’s API at `localhost` is **not** reachable from Netlify or visitors’ browsers—you need a **public** API URL for production builds.

## Option A — Netlify UI (fastest first deploy)

1. Sign in at [Netlify](https://app.netlify.com/).
2. **Add new site** → **Import an existing project** → connect **GitHub** → pick this repo.
3. Netlify should read `netlify.toml` (build: `npm run build`, publish: `build`).
4. **Site configuration → Environment variables** — add:

   | Name | Value |
   |-----|--------|
   | `REACT_APP_API_BASE_URL` | `https://your-public-api.example.com` (no trailing slash) |
   | `REACT_APP_SITE_URL` | `https://your-site.netlify.app` (or custom domain) |
   | `REACT_APP_API_KEY` | Same as Django `API_KEY` if the API requires it |
   | `REACT_APP_SITE_NAME` | e.g. `AI News Digest` (optional) |
   | `REACT_APP_SITE_DESCRIPTION` | Short site tagline (optional) |

5. **Trigger deploy**. After the site exists, set `REACT_APP_SITE_URL` to the exact production URL and redeploy so canonicals and Open Graph stay correct.

6. On the Django server, set `CORS_ALLOWED_ORIGINS` to your Netlify URL(s), then restart the web container.

Do **not** set `REACT_APP_USE_DEV_PROXY` in Netlify.

## Option B — GitHub Actions (automate on every `git push`)

1. **Netlify:** Site → **Site configuration** → copy **Site ID**.
2. **Netlify:** User settings → **Applications** → **Personal access tokens** → create a token (deploy scope).
3. **GitHub:** Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

   | Secret | Purpose |
   |--------|---------|
   | `NETLIFY_AUTH_TOKEN` | Token from step 2 |
   | `NETLIFY_SITE_ID` | From step 1 |
   | `REACT_APP_API_BASE_URL` | Public API base URL |
   | `REACT_APP_SITE_URL` | Your Netlify (or custom) URL |
   | `REACT_APP_API_KEY` | Optional; if API uses `X-Api-Key` |
   | `REACT_APP_SITE_NAME` | Optional |
   | `REACT_APP_SITE_DESCRIPTION` | Optional |

4. Default branch should be **`main`** (or edit `.github/workflows/deploy-netlify.yml`).

5. Push to `main`; the workflow **Build** then **Deploy** runs.

If any `REACT_APP_*` secret is missing, the build may use defaults from `src/config.js` (including localhost for API)—fix secrets before relying on CI.

## What you do **not** need

- **Docker Desktop LAN IP** for Netlify — browsers cannot call your home network reliably; expose the API on HTTPS (VPS, cloud, tunnel for demos only).

## Verify

Open the live site → DevTools → Network: requests should go to your **public** `REACT_APP_API_BASE_URL`, not `localhost:8000`.
