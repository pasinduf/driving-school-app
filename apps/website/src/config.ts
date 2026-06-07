/**
 * Centralized cross-app URLs. The website (marketing) links out to the
 * booking-admin app for login / booking / portal flows. Configure per
 * environment via VITE_BOOKING_ADMIN_URL; falls back to local dev.
 */
export const BOOKING_ADMIN_URL =
  import.meta.env.VITE_BOOKING_ADMIN_URL || 'http://localhost:5173';

export const loginUrl = () => `${BOOKING_ADMIN_URL}/login`;
export const bookingUrl = () => `${BOOKING_ADMIN_URL}/booking`;
export const dashboardUrl = () => `${BOOKING_ADMIN_URL}/portal/dashboard`;
