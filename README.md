# AI News Digest

Editorial frontend for SEO-ready AI and technology articles from the [AI_News_Scraper](https://github.com/) Django API.

## What this app does

- **Public site:** Home, article pages (`/news/:slug`), category and tag listings, topics browse, trending tags
- **SEO:** Meta tags, JSON-LD, dynamic `sitemap.xml` / `robots.txt` (fetched from API at build time)
- **Editor** (`/editor`): Google or GitHub sign-in (Firebase), draft queue, Approve, Llama revision, reject
- **Analytics:** Google Analytics via `REACT_APP_GA_MEASUREMENT_ID` (loaded in `GoogleAnalytics.js`)

Backend scraping, LLM generation, and approval logic live in **AI_News_Scraper**, not this repo.

**How to view logs, DB counts, editor stats, and API data:** see [AI_News_Scraper/docs/VIEWING_DATA.md](../AI_News_Scraper/docs/VIEWING_DATA.md).

**Security headers (CSP, HSTS, nosniff):** [docs/SECURITY.md](docs/SECURITY.md) (Netlify); API: [AI_News_Scraper/docs/SECURITY.md](../AI_News_Scraper/docs/SECURITY.md).

**Editor GitHub login (`redirect_uri` error):** [docs/FIREBASE_EDITOR_AUTH.md](docs/FIREBASE_EDITOR_AUTH.md).

## Local setup

```bash
cp .env.example .env.local
npm install
npm start
```

Configure `.env.local` — see `.env.example`.

**Typical local setup (ngrok + Docker):**

```bash
# AI_News_Scraper
docker compose up -d web
ngrok http 8000
```

```env
REACT_APP_API_URL=https://YOUR-SUBDOMAIN.ngrok-free.dev
REACT_APP_API_KEY=<same as AI_News_Scraper API_KEY>
REACT_APP_SITE_URL=http://localhost:3000
REACT_APP_USE_DEV_PROXY=false
```

The browser calls ngrok directly; Django must allow `http://localhost:3000` in `CORS_ALLOWED_ORIGINS`.

**Alternative (no ngrok):** `REACT_APP_API_URL=http://localhost:8000` and `REACT_APP_USE_DEV_PROXY=true` — then the dev server proxies `/api`, `/health`, `/robots.txt`, `/sitemap.xml`.

Add `REACT_APP_FIREBASE_*` for Google/GitHub editor sign-in (see below).

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Development server |
| `npm run build` | Production build (`prebuild` fetches sitemap/robots from API) |
| `npm run fetch-seo-files` | Refresh `public/sitemap.xml` and `public/robots.txt` manually |
| `npm test` | Run tests |

Generated `public/sitemap.xml`, `public/robots.txt`, and `public/_redirects` are gitignored; they are created on each build.

**Where the sitemap really lives:** Django (`AI_News_Scraper`) builds it dynamically from Postgres at `/sitemap.xml`. This React app does **not** generate URLs itself — `prebuild` snapshots that XML into `public/` and writes Netlify proxy rules so production can stay fresh without redeploying after every scrape.

**If you only see the homepage in `public/sitemap.xml`:** the build could not reach the API (missing `REACT_APP_API_URL`, ngrok down, or API offline). Fix the env var, ensure Django is up, then run `npm run fetch-seo-files` or redeploy.

## Deploy to Netlify

Netlify cannot reach `localhost:8000`. Use a **public HTTPS** API URL for production.

### Option A — Netlify UI

1. [Netlify](https://app.netlify.com/) → **Add site** → import this Git repo.
2. Build settings come from `netlify.toml` (`npm run build`, publish `build`).
3. **Site configuration → Environment variables:**

   | Name | Value |
   |------|--------|
   | `REACT_APP_API_URL` | Public API URL for build-time SEO fetch (no trailing slash). Leave unset in Netlify UI for runtime `/api` proxy. |
   | `API_BASE_URL` | Netlify **site** env: ngrok/hosted Django origin for `netlify/functions/proxy.js` |
   | `REACT_APP_SITE_URL` | `https://your-site.netlify.app` or custom domain |
   | `REACT_APP_API_KEY` | Same as Django `API_KEY` if required |
   | `REACT_APP_GA_MEASUREMENT_ID` | Google Analytics ID (optional) |
   | `REACT_APP_EDITOR_API_KEY` | Editor `/editor` access (optional) |
   | `REACT_APP_SITE_NAME` | Optional |
   | `REACT_APP_SITE_DESCRIPTION` | Optional |

4. Deploy. Set `REACT_APP_SITE_URL` to the final production URL and redeploy for correct canonicals.
5. On Django: add your Netlify URL to `CORS_ALLOWED_ORIGINS` and set `PUBLIC_SITE_URL` to match.

Do **not** set `REACT_APP_USE_DEV_PROXY` on Netlify.

**Sitemap:** `prebuild` pulls `/sitemap.xml` and `/robots.txt` from Django. If the API is unreachable, a **1-URL fallback** is written (homepage only). Set `REACT_APP_API_URL` (build) and `API_BASE_URL` (Netlify runtime proxy) to your **stable public HTTPS API** (not localhost). Redeploy whenever you change the API URL.

**Google Search Console:** Use **URL prefix** verification (`https://your-site.netlify.app`) with **HTML tag** or the file `public/googleNKJh_qORZg2X3hGb4oCIfiEmgH93H4f2ovlcDp2V0AQ.html`. Domain DNS TXT does not work on `*.netlify.app`.

### Option B — GitHub Actions

Workflow: `.github/workflows/deploy-netlify.yml` (runs on push to `main` / `master`).

**GitHub repository secrets:**

| Secret | Purpose |
|--------|---------|
| `NETLIFY_AUTH_TOKEN` | Netlify personal access token |
| `NETLIFY_SITE_ID` | Site ID from Netlify |
| `REACT_APP_API_URL` | Build-time API (optional on Netlify if using proxy only) |
| `API_BASE_URL` | Netlify runtime proxy target (ngrok) |
| `REACT_APP_SITE_URL` | Production site URL |
| `REACT_APP_API_KEY` | Optional |
| `REACT_APP_GA_MEASUREMENT_ID` | Optional |
| `REACT_APP_EDITOR_API_KEY` | Optional |
| `REACT_APP_SITE_NAME` | Optional |
| `REACT_APP_SITE_DESCRIPTION` | Optional |

### Verify production

- Live site loads articles (Network tab → your public API, not `localhost:8000`).
- `https://your-site.netlify.app/sitemap.xml` starts with `<?xml` (not HTML).
- `/editor` works with your editor API key when `SEO_REQUIRE_APPROVAL=1` on the backend.

## Editor Firebase auth (Google + GitHub)

1. [Firebase Console](https://console.firebase.google.com/) → create project → add **Web app** → copy config into `.env.local` (`REACT_APP_FIREBASE_*`).
2. **Authentication** → Sign-in method → enable **Google** and **GitHub** (add GitHub OAuth app ID/secret if needed).
3. **Authentication** → Settings → add authorized domains: `localhost`, `ainewsrepo.netlify.app`, your custom domain.
4. On **AI_News_Scraper** `.env`:
   - `FIREBASE_PROJECT_ID` = same project ID
   - `FIREBASE_SERVICE_ACCOUNT_JSON` = service account JSON (Project settings → Service accounts → Generate key), or `GOOGLE_APPLICATION_CREDENTIALS` path
   - `EDITOR_ALLOWED_EMAILS` = comma-separated emails allowed to use the editor (your Google/GitHub login emails)
5. Rebuild Docker: `docker compose up -d --build web`
6. Netlify: add all `REACT_APP_FIREBASE_*` env vars and redeploy.

Editor API calls send `Authorization: Bearer <Firebase ID token>`. The backend verifies the token and checks the email allowlist.

## Project layout

```
src/api/           API clients (published, taxonomy, editor)
src/features/auth/ Firebase AuthProvider + editor login
src/pages/         Routes (home, article, category, tag, topics, editor)
src/features/      Article UI, taxonomy nav, trending
src/store/         Redux
scripts/           fetch-seo-files.js (prebuild)
public/            Static assets, _headers, Google verification HTML
```
