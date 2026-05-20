# AI News Digest

Editorial frontend for SEO-ready AI and technology articles from the [AI_News_Scraper](https://github.com/) Django API.

## What this app does

- **Public site:** Home, article pages (`/news/:slug`), category and tag listings, topics browse, trending tags
- **SEO:** Meta tags, JSON-LD, dynamic `sitemap.xml` / `robots.txt` (fetched from API at build time)
- **Editor** (`/editor`): Admin API-key login, draft queue, Approve, Llama revision requests, reject
- **Analytics:** Google Analytics via `REACT_APP_GA_MEASUREMENT_ID` (loaded in `GoogleAnalytics.js`)

Backend scraping, LLM generation, and approval logic live in **AI_News_Scraper**, not this repo.

## Local setup

```bash
cp .env.example .env.local
npm install
npm start
```

Configure `.env.local` — see `.env.example`. Minimum:

| Variable | Purpose |
|----------|---------|
| `REACT_APP_API_BASE_URL` | Django API (e.g. `http://localhost:8000`) |
| `REACT_APP_API_KEY` | Matches backend `API_KEY` if required |
| `REACT_APP_SITE_URL` | `http://localhost:3000` locally |
| `REACT_APP_EDITOR_API_KEY` | Unlocks `/editor` (can match `API_KEY`) |

Dev server proxies `/api`, `/health`, `/robots.txt`, `/sitemap.xml` to the API when `REACT_APP_USE_DEV_PROXY=true` (default).

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Development server |
| `npm run build` | Production build (`prebuild` fetches sitemap/robots from API) |
| `npm run fetch-seo-files` | Refresh `public/sitemap.xml` and `public/robots.txt` manually |
| `npm test` | Run tests |

Generated `public/sitemap.xml` and `public/robots.txt` are gitignored; they are created on each build.

## Deploy to Netlify

Netlify cannot reach `localhost:8000`. Use a **public HTTPS** API URL for production.

### Option A — Netlify UI

1. [Netlify](https://app.netlify.com/) → **Add site** → import this Git repo.
2. Build settings come from `netlify.toml` (`npm run build`, publish `build`).
3. **Site configuration → Environment variables:**

   | Name | Value |
   |------|--------|
   | `REACT_APP_API_BASE_URL` | Public API URL (no trailing slash) |
   | `REACT_APP_SITE_URL` | `https://your-site.netlify.app` or custom domain |
   | `REACT_APP_API_KEY` | Same as Django `API_KEY` if required |
   | `REACT_APP_GA_MEASUREMENT_ID` | Google Analytics ID (optional) |
   | `REACT_APP_EDITOR_API_KEY` | Editor `/editor` access (optional) |
   | `REACT_APP_SITE_NAME` | Optional |
   | `REACT_APP_SITE_DESCRIPTION` | Optional |

4. Deploy. Set `REACT_APP_SITE_URL` to the final production URL and redeploy for correct canonicals.
5. On Django: add your Netlify URL to `CORS_ALLOWED_ORIGINS` and set `PUBLIC_SITE_URL` to match.

Do **not** set `REACT_APP_USE_DEV_PROXY` on Netlify.

**Sitemap:** `prebuild` calls your API. If the API is down during build, a minimal fallback sitemap is used. Redeploy after scrapes to refresh URLs, or run `npm run fetch-seo-files` before build.

**Google Search Console:** Use **URL prefix** verification (`https://your-site.netlify.app`) with **HTML tag** or the file `public/googleNKJh_qORZg2X3hGb4oCIfiEmgH93H4f2ovlcDp2V0AQ.html`. Domain DNS TXT does not work on `*.netlify.app`.

### Option B — GitHub Actions

Workflow: `.github/workflows/deploy-netlify.yml` (runs on push to `main` / `master`).

**GitHub repository secrets:**

| Secret | Purpose |
|--------|---------|
| `NETLIFY_AUTH_TOKEN` | Netlify personal access token |
| `NETLIFY_SITE_ID` | Site ID from Netlify |
| `REACT_APP_API_BASE_URL` | Public API |
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

## Project layout

```
src/api/           API clients (published, taxonomy, editor)
src/pages/         Routes (home, article, category, tag, topics, editor)
src/features/      Article UI, taxonomy nav, trending
src/store/         Redux
scripts/           fetch-seo-files.js (prebuild)
public/            Static assets, _headers, Google verification HTML
```
