import axios from 'axios';

export const apiClient = axios.create({
  baseURL: "http://localhost:8020", // '/api',
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    const companyId = localStorage.getItem('companyId');
    if (companyId) {
        config.headers['x-company-id'] = companyId;
    }
    return config;
});

// Endpoints whose own 401 means "bad credentials", not "expired session".
// These should surface the error to the caller instead of triggering a redirect.
const AUTH_ENDPOINTS = ['/auth/login', '/auth/forgot-password', '/auth/reset-password'];

// Guard so a burst of concurrent 401s only triggers a single redirect.
let isRedirectingToLogin = false;

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const url: string = error.config?.url ?? '';
        const isAuthEndpoint = AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));

        if (status === 401 && !isAuthEndpoint) {
            // Clear the expired/invalid session.
            localStorage.removeItem('token');

            // Redirect to login unless we're already there (avoids loops).
            if (!isRedirectingToLogin && window.location.pathname !== '/login') {
                isRedirectingToLogin = true;
                const returnTo = window.location.pathname + window.location.search;
                const target = returnTo && returnTo !== '/'
                    ? `/login?returnTo=${encodeURIComponent(returnTo)}`
                    : '/login';
                // Full navigation resets all in-memory app/auth state cleanly.
                window.location.replace(target);
            }
        }

        return Promise.reject(error);
    }
);
