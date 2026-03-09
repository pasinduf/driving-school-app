import { apiClient } from './client';

export interface CompanyDetails {
    id: string;
    name: string;
    slug: string;
    themeColor: string;
    contactNumber: string;
    contactEmail: string;
    address: string;
    terms?: string;
    logoUrl?: string;
}

export const fetchCompanyBySlug = async (slug: string) => {
    const response = await apiClient.get<CompanyDetails>(`/companies/slug/${slug}`);
    return response.data;
};

export const fetchCompanyById = async (id: string) => {
    const response = await apiClient.get<CompanyDetails>(`/companies/${id}`);
    return response.data;
};
