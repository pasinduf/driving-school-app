import axios from 'axios';

export const apiClient = axios.create({
    baseURL: 'http://localhost:8020',
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

// ... existing imports
export interface TestingCenter {
    id: string;
    name: string;
    code: string;
    postalcode: string;
    latitude?: number;
    longitude?: number;
}

export interface Instructor {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    contactNumber: string;
    address: string;
    transmission: 'Automatic' | 'Manual' | 'Both';
    isActive: boolean;
    profileImage?: string;
}

export const fetchTestingCenters = async () => {
    const response = await apiClient.get<TestingCenter[]>('/testing-centers');
    return response.data;
};

export const fetchAvailableInstructors = async (suburbId: string | number, transmission: string) => {
    const response = await apiClient.get<Instructor[]>('/instructors/available', {
        params: { suburbId, transmission },
    });
    return response.data;
};

export const fetchSuburbs = async (search?: string) => {
    const response = await apiClient.get<Suburb[]>('/suburbs', {
        params: { search },
    });
    return response.data;
};
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

export const lockSlots = async (slots: { date: string; time: string }[], instructorId: string) => {
    const response = await apiClient.post<{ token: string; expiresAt: number, sessionDuration: number }>('/bookings/lock', {
        slots, instructorId
    });
    return response.data;
};

export const unlockSlots = async (slots: { date: string; time: string }[], token: string, instructorId: string) => {
    const response = await apiClient.post('/bookings/unlock', {
        token, slots, instructorId
    });
    return response.data;
};

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

export const createBooking = async (details: CreateBookingRequest) => {
    const response = await apiClient.post('/bookings/create', details);
    return response.data;
};

export const createManualBooking = async (details: {
    date: string;
    time: string;
    duration: number;
    note?: string;
}) => {
    const response = await apiClient.post('/bookings/manual', details);
    return response.data;
};

export const cancelBooking = async (id: string) => {
    const response = await apiClient.post(`/bookings/${id}/cancel`);
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

export const requestPasswordReset = async (email: string) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
};

export const resetPasswordWithToken = async (email: string, token: string, newPassword: string) => {
    const response = await apiClient.post('/auth/reset-password', { email, token, newPassword });
    return response.data;
};

export const fetchBookings = async (params?: { date?: string; instructorId?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get<{ data: any[]; total: number }>('/bookings', { params });
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

// Admin Actions
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

export const fetchInstructorBookings = async (page: number = 1, limit: number = 10, startDate?: string, endDate?: string) => {
    const response = await apiClient.get<{ data: any[]; total: number }>("/bookings/instructor-bookings", {
        params: { page, limit, startDate, endDate },
    });
    return response.data;
};

export const submitReview = async (userName: string, rating: number, comment: string) => {
    const response = await apiClient.post('/reviews', { userName, rating, comment });
    return response.data;
};

export const sendMessage = async (message: string) => {
    const response = await apiClient.post('/chat', { message });
    return response.data;
};

// Admin Instructors
export const fetchAdminInstructors = async (page: number = 1, limit: number = 10) => {
    const response = await apiClient.get<any>('/instructors', { params: { page, limit } });
    return response.data;
};

export const searchInstructorsDropdown = async (searchTerm?: string) => {
    const response = await apiClient.get<any[]>('/instructors/search', { params: { searchTerm } });
    return response.data;
};

export const createInstructor = async (data: any) => {
    const response = await apiClient.post('/instructors', data);
    return response.data;
};

export const updateInstructor = async (id: string, data: any) => {
    const response = await apiClient.put(`/instructors/${id}`, data);
    return response.data;
};

export const deleteInstructor = async (id: string) => {
    const response = await apiClient.delete(`/instructors/${id}`);
    return response.data;
};

export const fetchDashboardMetrics = async () => {
    const response = await apiClient.get('/dashboard/metrics');
    return response.data;
};

// User Profile Actions
export const getProfile = async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
};

export const updateProfile = async (data: any) => {
    const response = await apiClient.put('/users/profile', data);
    return response.data;
};

export const uploadProfileImage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/users/profile/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data; // { url: string }
};

export const changePassword = async (data: any) => {
    const response = await apiClient.put('/users/profile/password', data);
    return response.data;
};

// Packages Management

export const fetchAdminPackages = async () => {
    const response = await apiClient.get('/packages/admin');
    return response.data;
};

export const createPackage = async (data: any) => {
    const response = await apiClient.post('/packages', data);
    return response.data;
};

export const updatePackage = async (id: number, data: any) => {
    const response = await apiClient.put(`/packages/${id}`, data);
    return response.data;
};

export const deactivatePackage = async (id: number) => {
    const response = await apiClient.delete(`/packages/${id}`);
    return response.data;
};
