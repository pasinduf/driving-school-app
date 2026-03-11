import { apiClient } from './client';

export interface CarouselImage {
    id: string;
    imageUrl: string;
    displayOrder: number;
}

export interface CompanyDetails {
  id: string;
  name: string;
  slug: string;
  contactNumber: string;
  contactEmail: string;
  address: string;
  terms?: string;
  logoUrl?: string;
  settings: {
    themeColor: string;
    bookingSessionDuration: number;
  };
  carouselImages?: CarouselImage[];
}

export interface CompanySettings {
  themeColor: string;
  bookingSessionDuration: number;
}



export const fetchCompanyBySlug = async (slug: string) => {
    const response = await apiClient.get<CompanyDetails>(`/companies/slug/${slug}`);
    return response.data;
};

export const fetchCompanyById = async (id: string) => {
    const response = await apiClient.get<CompanyDetails>(`/companies/${id}`);
    return response.data;
};

export const updateCompanyGeneral = async (data: Partial<CompanyDetails>) => {
    const response = await apiClient.put('/companies/general', data);
    return response.data;
};

export const updateCompanySettings = async (data: Partial<CompanySettings>) => {
  const response = await apiClient.put("/companies/settings", data);
  return response.data;
};

export const fetchCarouselImages = async () => {
    const response = await apiClient.get<CarouselImage[]>('/companies/carousel');
    return response.data;
};

export const deleteCarouselImage = async (id: string) => {
    const response = await apiClient.delete(`/companies/carousel/${id}`);
    return response.data;
};

export const uploadLogo = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<{ logoUrl: string }>('/companies/logo/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const uploadCarouselImage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<CarouselImage>('/companies/carousel/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
