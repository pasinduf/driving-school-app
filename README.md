# Driving School Frontend (Turborepo monorepo)

Two independently deployable frontend apps that share the same NestJS backend API.

```
driving-school-app/            ← monorepo root (npm workspaces + Turborepo)
├─ apps/
│  ├─ website/                 ← public/company marketing website (SEO-focused pages)
│  └─ booking-admin/           ← booking system + company admin panel (auth portal)
├─ package.json                ← workspaces + turbo scripts
└─ turbo.json                  ← task pipeline
```

Both apps are plain Vite + React + Tailwind and talk to the backend through the
same `/api` proxy / API client. They are fully independent (no shared frontend
package) so each can be developed, built, and deployed on its own.

## Develop

```bash
npm install            # once, at the root — installs all workspaces

npm run dev            # run BOTH apps (website :5174, booking-admin :5173)
npm run dev:website    # only the website
npm run dev:booking-admin  # only the booking + admin portal
```

## Build

```bash
npm run build              # build both
npm run build:website      # build only website        → apps/website/dist
npm run build:booking-admin# build only booking-admin   → apps/booking-admin/dist
```

## Deploy (Vercel — one project per app)

Create **two** Vercel projects from this same repo:

| Vercel project | Root Directory          | Output |
|----------------|-------------------------|--------|
| website        | `apps/website`          | `dist` |
| booking-admin  | `apps/booking-admin`    | `dist` |

For each project:

- **Root Directory** → set as above (Vercel auto-detects the npm workspace and
  installs from the monorepo root).
- **Framework preset** → Vite. Build command `npm run build`, output `dist`.
- Routing/SPA + the `/api` proxy are handled by each app's `vercel.json`.
- Set the app's env vars (e.g. `VITE_COMPANY_SLUG`) in the Vercel project.

Each app deploys independently — changes to one don't require redeploying the other.

## Hosting models

Both apps are deployed separately (above). How they're presented to a company is
purely a config choice — the code supports both without changes:

### A) Two domains / subdomains (simplest)
- website → `apex-driving-school.com`
- booking-admin → `app.apex-driving-school.com`

Set the cross-app URL env vars so links point across:
- website project: `VITE_BOOKING_ADMIN_URL=https://app.apex-driving-school.com`
- booking-admin project: `VITE_WEBSITE_URL=https://apex-driving-school.com`

### B) One domain, subpaths
Everything served under `apex-driving-school.com`; the website's `vercel.json`
proxies booking-admin paths to the booking-admin deployment:

```
apex-driving-school.com/            → website
apex-driving-school.com/login       → booking-admin
apex-driving-school.com/booking     → booking-admin
apex-driving-school.com/portal/...  → booking-admin
apex-driving-school.com/ba-assets/* → booking-admin (its built JS/CSS)
```

The proxy is **driven by environment variables**, not hard-coded. The website
build emits Vercel Build Output API config (`.vercel/output/config.json`) from
`process.env` — see [apps/website/scripts/build-vercel-output.mjs](apps/website/scripts/build-vercel-output.mjs).

Steps (on the **website** Vercel project):
1. **Framework Preset → Other** (so Vercel uses the Build Output API the build
   emits instead of forcing the Vite `dist` output). Build command stays
   `npm run build`.
2. Set env vars:
   - `BOOKING_ADMIN_URL` = the booking-admin deployment origin to proxy to
     (e.g. `https://booking-admin-xxxx.vercel.app`). This is the **server-side**
     proxy target.
   - `VITE_BOOKING_ADMIN_URL` = **empty** — so the website's own links render as
     relative paths (`/login`, `/booking`) that the proxy then handles.
   - (optional) `BACKEND_API_URL` to override the `/api` proxy target.
3. booking-admin already emits its assets under `/ba-assets` (see its
   `vite.config.ts`) so they never collide with the website's `/assets`.

If `BOOKING_ADMIN_URL` is left empty, no proxy routes are emitted (safe for the
two-domain / standalone model).

Local dev is unaffected by either model: the apps fall back to
`http://localhost:5173` / `:5174` when the env vars are unset in dev.

> Note: a static `vercel.json` cannot read env vars, and a `vercel.json`
> generated during the build is not reliably honored (Vercel reads it from
> source pre-build). The Build Output API is the supported way to make routing
> env-driven for a Vite app. Verify on a preview deployment.

