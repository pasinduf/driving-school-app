/**
 * Centralized cross-app URLs. The website (marketing) links out to the
 * booking-admin app for login / booking / portal flows.
 *
 * - Two-domain setup: set VITE_BOOKING_ADMIN_URL to the booking-admin origin
 *   (e.g. https://app.apex-driving-school.com). Links become absolute.
 * - Single-domain (subpath) setup: leave VITE_BOOKING_ADMIN_URL empty. Links
 *   become relative (/login, /booking, …) and the website's vercel.json
 *   rewrites proxy those paths to the booking-admin deployment.
 * - Local dev falls back to the booking-admin dev server on :5173.
 */
const devFallback = import.meta.env.DEV ? 'http://localhost:5173' : '';

export const BOOKING_ADMIN_URL =
  import.meta.env.VITE_BOOKING_ADMIN_URL ?? devFallback;

export const loginUrl = () => `${BOOKING_ADMIN_URL}/login`;
export const bookingUrl = () => `${BOOKING_ADMIN_URL}/booking`;
export const dashboardUrl = () => `${BOOKING_ADMIN_URL}/portal/dashboard`;
