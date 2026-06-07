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
