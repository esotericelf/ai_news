# Editor login (Firebase + GitHub)

Google sign-in is configured automatically by Firebase. **GitHub requires a GitHub OAuth app** linked to your Firebase project.

## Google (usually works after env + authorized domains)

1. Firebase Console → **Authentication** → **Sign-in method** → enable **Google**.
2. **Authentication** → **Settings** → **Authorized domains** → add:
   - `localhost`
   - `ainewsrepo.netlify.app`
   - any custom domain
3. Netlify env (build-time):
   - `REACT_APP_FIREBASE_AUTH_DOMAIN=ainewsrepo.firebaseapp.com` (not the Netlify URL)
   - `REACT_APP_FIREBASE_PROJECT_ID=ainewsrepo`
   - `REACT_APP_FIREBASE_APP_ID=...`
   - `REACT_APP_FIREBASE_API_KEY=...`

## GitHub — fix “redirect_uri is not associated with this application”

GitHub shows that warning when the **Authorization callback URL** on your GitHub OAuth app does not match Firebase exactly.

### Step 1 — Firebase

1. [Firebase Console](https://console.firebase.google.com/) → project **ainewsrepo**
2. **Authentication** → **Sign-in method** → **GitHub** → **Enable**
3. Copy the **Client ID** and **Client secret** placeholders — Firebase shows the callback URL you must use:
   ```text
   https://ainewsrepo.firebaseapp.com/__/auth/handler
   ```
   (Replace `ainewsrepo` if your project ID differs.)

### Step 2 — GitHub OAuth app

1. GitHub → **Settings** → **Developer settings** → **OAuth Apps** → **New OAuth App** (or edit existing)
2. **Application name:** e.g. `AI News Repo Editor`
3. **Homepage URL:** `https://ainewsrepo.netlify.app`
4. **Authorization callback URL** — paste **exactly** (no trailing slash, no Netlify URL):
   ```text
   https://ainewsrepo.firebaseapp.com/__/auth/handler
   ```
5. Create the app → generate a **Client secret**
6. Paste **Client ID** and **Client secret** into Firebase GitHub provider → **Save**

### Step 3 — Retry

1. Wait ~1 minute for GitHub/Firebase to pick up changes
2. Open `/editor` → **Continue with GitHub**
3. Approve GitHub access → you should return to `/editor` signed in

## Backend allowlist (after Firebase sign-in works)

Firebase only proves identity. The API still checks email:

```env
# AI_News_Scraper/.env
EDITOR_ALLOWED_EMAILS=your@gmail.com,your-github-username@users.noreply.github.com
```

Use the **email GitHub gives Firebase** (often your primary GitHub email or `id+noreply@users.noreply.github.com`).

Restart API: `docker compose up -d --force-recreate web`

## API key login (no OAuth)

On `/editor` → **API key** → paste `API_KEY` from `AI_News_Scraper/.env` → skips Firebase entirely.

## Console debug

After deploy, on `/editor`:

```javascript
__ainewsAuthDebug()
```

- `email` from Firebase `currentUser`, or
- `sessionStorageEmail` if the browser blocked Firebase cookies but we saved the token on redirect.

Use optional chaining with **two dots**: `?.email` — not `?email`.

## Browser blocks Firebase cookies

If `__ainewsAuthDebug()` shows `email: null` and `sessionStorageEmail: null` after Google/GitHub, the redirect never produced a user. Use **API key** login or allow third-party cookies for `firebaseapp.com`.

If `sessionStorageEmail` is set, you should still enter the editor queue after redeploy (session bridge).
