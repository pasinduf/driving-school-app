/**
 * Centralized cross-app URLs. The booking-admin app links back to the public
 * marketing website.
 *
 * - Two-domain setup: set VITE_WEBSITE_URL to the website origin. Links absolute.
 * - Single-domain (subpath) setup: leave VITE_WEBSITE_URL empty. Links become
 *   relative ("/"), served by the website at the shared domain root.
 * - Local dev falls back to the website dev server on :5174.
 */
const devFallback = import.meta.env.DEV ? 'http://localhost:5174' : '';

export const WEBSITE_URL = import.meta.env.VITE_WEBSITE_URL ?? devFallback;

/** Absolute (or root-relative) URL of the website home page. */
export const homeUrl = () => `${WEBSITE_URL}/`;
