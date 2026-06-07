/**
 * Centralized cross-app URLs. The booking-admin app links back to the public
 * marketing website. Configure per environment via VITE_WEBSITE_URL; falls
 * back to local dev.
 */
export const WEBSITE_URL =
  import.meta.env.VITE_WEBSITE_URL || 'http://localhost:5174';
