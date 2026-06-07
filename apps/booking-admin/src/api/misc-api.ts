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

export const fetchRecentBookings = async () => {
    const response = await apiClient.get('/dashboard/recent-bookings');
    return response.data;
};

export interface DashboardMetric {
    value: number;
    change: number;
    isPositiveTrend: boolean;
}

export interface DashboardSummary {
    revenue: DashboardMetric;
    lessons: DashboardMetric;
    noShow: DashboardMetric;
}

export interface ChartPoint {
    label: string;
    count: number;
}

export const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
    const response = await apiClient.get<DashboardSummary>('/dashboard/analytics/summary');
    return response.data;
};

export const fetchBookingChart = async (period: 'week' | 'month' | 'year'): Promise<{ period: string; data: ChartPoint[] }> => {
    const response = await apiClient.get<{ period: string; data: ChartPoint[] }>('/dashboard/analytics/chart', {
        params: { period },
    });
    return response.data;
};

export const fetchRecentBookingsAnalytics = async () => {
    const response = await apiClient.get('/dashboard/analytics/recent');
    return response.data;
};

export const sendMessage = async (message: string) => {
    const response = await apiClient.post('/chat', { message });
    return response.data;
};
