import { apiClient } from './client';

export interface Review {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
}

export const submitReview = async (userName: string, rating: number, comment: string) => {
    const response = await apiClient.post('/reviews', { userName, rating, comment });
    return response.data;
};

export const fetchAllReviews = async () => {
    const response = await apiClient.get('/reviews/all');
    return response.data;
};

export const updateReviewStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const response = await apiClient.patch(`/reviews/${id}/status`, { status });
    return response.data;
};

export const fetchApprovedReviews = async () => {
    const response = await apiClient.get<Review[]>('/reviews');
    return response.data;
};
