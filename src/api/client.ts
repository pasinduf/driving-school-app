import axios from 'axios';

export const apiClient = axios.create({
    baseURL: '/api',
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
