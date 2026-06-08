import { apiClient } from './client';

export interface ManagedTestingCenter {
    id?: number;
    name: string;
    postalcode: string;
    latitude: number;
    longitude: number;
    isActive: boolean;
}

/** Company-scoped testing centers for management (active + inactive). */
export const fetchManagedTestingCenters = async () => {
    const response = await apiClient.get<ManagedTestingCenter[]>('/testing-centers/manage');
    return response.data;
};

/** Persist the enable toggle + the full list of testing centers. */
export const saveTestingCenters = async (payload: { enabled: boolean; centers: ManagedTestingCenter[] }) => {
    const response = await apiClient.put<ManagedTestingCenter[]>('/testing-centers/manage', payload);
    return response.data;
};
