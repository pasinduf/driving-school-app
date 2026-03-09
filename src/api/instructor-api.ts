import { apiClient } from './client';

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
