/**
 * Generates Vercel's Build Output API config (.vercel/output) so the website's
 * edge routing can be driven by environment variables (which a static
 * vercel.json cannot do).
 *
 * Env vars (set on the Vercel project, or inline for a local build):
 *   BOOKING_ADMIN_URL  origin of the booking-admin deployment to proxy
 *                      subpaths to (e.g. https://booking-admin-xxx.vercel.app).
 *                      Leave empty for the two-domain / standalone model — then
 *                      no booking-admin proxy routes are emitted.
 *   BACKEND_API_URL    origin the /api/* calls proxy to. Falls back to the
 *                      previously hard-coded backend if unset.
 *
 * Runs after `vite build`; copies dist into .vercel/output/static and writes
 * .vercel/output/config.json. Vercel uses this in preference to vercel.json.
 */
import { rmSync, mkdirSync, cpSync, writeFileSync } from 'node:fs';

const OUT = '.vercel/output';
const BACKEND = (process.env.BACKEND_API_URL || 'http://217.216.109.188:8020').replace(/\/$/, '');
const BOOKING_ADMIN = (process.env.BOOKING_ADMIN_URL || '').replace(/\/$/, '');

rmSync(OUT, { recursive: true, force: true });
mkdirSync(`${OUT}/static`, { recursive: true });
cpSync('dist', `${OUT}/static`, { recursive: true });

const routes = [
  // Backend API proxy
  { src: '/api/(.*)', dest: `${BACKEND}/$1` },
];

// Single-domain (subpath) hosting: proxy booking-admin's paths + its assets.
// Skipped entirely when BOOKING_ADMIN_URL is empty (two-domain / standalone).
if (BOOKING_ADMIN) {
  routes.push({ src: '/ba-assets/(.*)', dest: `${BOOKING_ADMIN}/ba-assets/$1` });
  routes.push({ src: '/portal(/.*)?', dest: `${BOOKING_ADMIN}/portal$1` });
  routes.push({
    src: '/(login|forgot-password|reset-password|booking)',
    dest: `${BOOKING_ADMIN}/$1`,
  });
}

// Serve real files, then fall back to the SPA entry for client-side routes.
routes.push({ handle: 'filesystem' });
routes.push({ src: '/(.*)', dest: '/index.html' });

writeFileSync(`${OUT}/config.json`, JSON.stringify({ version: 3, routes }, null, 2));
console.log(
  `[vercel-output] backend=${BACKEND} bookingAdmin=${BOOKING_ADMIN || '(disabled)'}`,
);
