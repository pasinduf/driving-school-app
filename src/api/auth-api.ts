import { apiClient } from './client';

export const loginUser = async (email: string, password: string) => {
    const response = await apiClient.post<{ access_token: string }>('/auth/login', { email, password });
    return response.data;
};

export const requestPasswordReset = async (email: string) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
};

export const resetPasswordWithToken = async (email: string, token: string, newPassword: string) => {
    const response = await apiClient.post('/auth/reset-password', { email, token, newPassword });
    return response.data;
};
