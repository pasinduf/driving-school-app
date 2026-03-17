import { apiClient } from './client';

export interface Suburb {
    id: string;
    name: string;
    stateCode: string;
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

export interface CreateBookingRequest {
    testingCenterId?: string | number;
    suburbId: string | number;
    packageId?: string | number;
    duration: number;
    lockToken: string;
    slots: { date: string; time: string }[];
    customerDetails: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        phone: string;
        pickupAddress: string;
        transmission: string;
        registerFor: string;
        contactPersonFirstName?: string;
        contactPersonLastName?: string;
        contactPersonEmail?: string;
        contactPersonPhone?: string;
        relation?: string;
        notes?: string;
    };
}

export const getAvailableDates = async (startDate: string, instructorId?: string) => {
    const params: any = { startDate };
    if (instructorId) {
        params.instructorId = instructorId;
    }
    const response = await apiClient.get<{ date: string; isAvailable: boolean; reason?: string }[]>('/bookings/dates', {
        params
    });
    return response.data;
};

export const fetchSlots = async (date: string, instructorId: string, duration: number, margin?: number, step?: number) => {
    const response = await apiClient.get<Slot[]>('/bookings/availability', {
        params: { date, instructorId, duration, margin, step },
    });
    return response.data;
};

export const lockSlots = async (slots: { date: string; time: string }[], instructorId: string, duration: number, margin: number) => {
    const response = await apiClient.post<{ token: string; expiresAt: number, sessionDuration: number }>('/bookings/lock', {
        slots, instructorId, duration, margin
    });
    return response.data;
};

export const unlockSlots = async (slots: { date: string; time: string }[], token: string, instructorId: string, duration: number, margin: number) => {
    const response = await apiClient.post('/bookings/unlock', {
        token, slots, instructorId, duration, margin
    });
    return response.data;
};

export const createBooking = async (details: CreateBookingRequest) => {
    const response = await apiClient.post('/bookings/create', details);
    return response.data;
};

export const createManualBooking = async (details: {
    date: string;
    time: string;
    duration: number;
    note?: string;
    customerName?: string;
    suburbId?: number | null;
    packageId?: number;
}) => {
    const response = await apiClient.post('/bookings/manual', details);
    return response.data;
};

export const updateManualBooking = async (id: string, details: {
    date?: string;
    time?: string;
    duration?: number;
    note?: string;
    customerName?: string;
    suburbId?: number | null;
    packageId?: number;
}) => {
    const response = await apiClient.put(`/bookings/${id}/manual-update`, details);
    return response.data;
};

export const cancelBooking = async (id: string) => {
    const response = await apiClient.post(`/bookings/${id}/cancel`);
    return response.data;
};

export const fetchBookings = async (params?: { date?: string; instructorId?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get<{ data: any[]; total: number }>('/bookings', { params });
    return response.data;
};

export const confirmBookingAdmin = async (id: string): Promise<any> => {
    const response = await apiClient.post(`/bookings/${id}/confirm`);
    return response.data;
};

export const cancelBookingAdmin = async (id: string): Promise<any> => {
    const response = await apiClient.post(`/bookings/${id}/cancel`);
    return response.data;
};

export const fetchMyBookings = async (page: number = 1, limit: number = 10) => {
    const response = await apiClient.get<{ data: any[]; total: number }>('/bookings/my-bookings', {
        params: { page, limit },
    });
    return response.data;
};

export const fetchInstructorBookings = async (params: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
}) => {
    const response = await apiClient.get<{ data: any[]; total: number }>("/bookings/instructor-bookings", {
        params,
    });
    return response.data;
};
