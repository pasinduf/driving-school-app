import { apiClient } from './client';
import type { Suburb } from './booking-api';

export const fetchSuburbs = async (search?: string) => {
    const response = await apiClient.get<Suburb[]>('/suburbs', {
        params: { search },
    });
    return response.data;
};

export const fetchHolidays = async () => {
    const response = await apiClient.get<any[]>('/holidays');
    return response.data;
};

export const createHoliday = async (date: string, reason: string) => {
    const response = await apiClient.post('/holidays', { date, reason });
    return response.data;
};

export const deleteHoliday = async (id: string) => {
    const response = await apiClient.delete(`/holidays/${id}`);
    return response.data;
};

export const fetchDashboardMetrics = async () => {
    const response = await apiClient.get('/dashboard/metrics');
    return response.data;
};

export const sendMessage = async (message: string) => {
    const response = await apiClient.post('/chat', { message });
    return response.data;
};
