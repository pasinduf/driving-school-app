import { apiClient } from './client';

export const fetchPackages = async () => {
    const response = await apiClient.get<any[]>('/packages');
    return response.data;
};

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
