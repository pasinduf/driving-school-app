import axios from 'axios';

export const apiClient = axios.create({
    baseURL: 'http://localhost:3000', // Backend URL
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface Suburb {
    id: string;
    name: string;
    postcode: string;
}

export interface Slot {
    startTime: string; // ISO
    endTime: string; // ISO
    available: boolean;
}

export interface BookingRequest {
    suburbId: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    duration: number; // minutes
    customerDetails: {
        customerName: string;
        customerEmail: string;
        customerPhone: string;
        pickupAddress: string;
        notes?: string;
    };
    token: string; // lock token
}

export const fetchSuburbs = async () => {
    const response = await apiClient.get<Suburb[]>('/suburbs');
    return response.data;
};

export const fetchSlots = async (suburbId: string, date: string, duration: number) => {
    const response = await apiClient.get<Slot[]>('/slots/availability', {
        params: { suburbId, date, duration },
    });
    return response.data;
};

export const lockSlot = async (suburbId: string, date: string, time: string) => {
    const response = await apiClient.post<{ token: string; expiresAt: number }>('/bookings/lock', {
        suburbId, date, time
    });
    return response.data;
};

export const unlockSlot = async (suburbId: string, date: string, time: string, token: string) => {
    const response = await apiClient.post('/bookings/unlock', {
        suburbId, date, time, token
    });
    return response.data;
};

export const confirmBooking = async (details: BookingRequest) => {
    const response = await apiClient.post('/bookings/confirm', details);
    return response.data;
};

export const loginUser = async (email: string, password: string) => {
    const response = await apiClient.post<{ access_token: string }>('/auth/login', { email, password });
    return response.data;
};

export const fetchBookings = async (params?: { date?: string; suburbId?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get<{ data: any[]; total: number }>('/bookings', { params });
    return response.data;
};

export const fetchHolidays = async () => {
    const response = await apiClient.get<any[]>('/holidays');
    return response.data;
};

export const createHoliday = async (date: string, reason: string, suburbId?: string) => {
    const response = await apiClient.post('/holidays', { date, reason, suburbId });
    return response.data;
};

export const deleteHoliday = async (id: string) => {
    const response = await apiClient.delete(`/holidays/${id}`);
    return response.data;
};

// Admin Actions
export const confirmBookingAdmin = async (id: string): Promise<any> => {
    const response = await apiClient.post(`/bookings/${id}/confirm`);
    return response.data;
};

export const cancelBookingAdmin = async (id: string): Promise<any> => {
    const response = await apiClient.post(`/bookings/${id}/cancel`);
    return response.data;
};
