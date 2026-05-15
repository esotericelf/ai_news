# AI News Digest

Editorial frontend for SEO-ready AI and technology articles from the AI News Scraper API.

## Setup

```bash
cp .env.example .env.local
npm install
npm start
```

Configure `REACT_APP_API_BASE_URL`, `REACT_APP_API_KEY`, and `REACT_APP_SITE_URL` in `.env.local`. See `.env.example` for details.

## Scripts

| Command       | Description              |
| ------------- | ------------------------ |
| `npm start`   | Development server       |
| `npm run build` | Production build       |
| `npm test`    | Run tests                |

## Deploy

Built for [Netlify](https://www.netlify.com/). Publish directory: `build`. Set environment variables in the Netlify dashboard to match `.env.example`.
