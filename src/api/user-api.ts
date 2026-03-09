import { apiClient } from './client';

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
