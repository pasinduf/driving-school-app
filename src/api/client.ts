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
    postalcode: string;
}

export interface Slot {
    startTime: string; // ISO
    endTime: string; // ISO
    available: boolean;
}

export interface BookingRequest {
    suburbId: string | number;
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

// ... existing imports
export interface TestingCenter {
    id: string;
    name: string;
    code: string;
    postalcode: string;
}

export const fetchTestingCenters = async () => {
    const response = await apiClient.get<TestingCenter[]>('/testing-centers');
    return response.data;
};

export const fetchSuburbs = async () => {
    const response = await apiClient.get<Suburb[]>('/suburbs');
    return response.data;
};
export const getAvailableDates = async (startDate: string) => {
    const response = await apiClient.get<{ date: string; isAvailable: boolean; reason?: string }[]>('/bookings/dates', {
        params: { startDate },
    });
    return response.data;
};

export const fetchSlots = async (date: string, duration: number, margin?: number, step?: number) => {
    const response = await apiClient.get<Slot[]>('/slots/availability', {
        params: { date, duration, margin, step },
    });
    return response.data;
};

export const lockSlots = async (slots: { date: string; time: string }[]) => {
    const response = await apiClient.post<{ token: string; expiresAt: number, sessionDuration: number }>('/bookings/lock', {
        slots
    });
    return response.data;
};

export const unlockSlots = async (slots: { date: string; time: string }[], token: string) => {
    const response = await apiClient.post('/bookings/unlock', {
        token, slots
    });
    return response.data;
};

export const createBooking = async (details: BookingRequest & { slots?: { date: string; time: string }[]; totalAmount?: number; packageId?: string }) => {
    const response = await apiClient.post('/bookings/create', details);
    return response.data;
};

export const fetchPackages = async () => {
    const response = await apiClient.get<any[]>('/packages');
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
