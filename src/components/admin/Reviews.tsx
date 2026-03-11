import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAllReviews, updateReviewStatus } from '../../api/review-api';
import { toast } from 'sonner';
import { Star, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import ConfirmationModal from '../ConfirmationModal';
import Pagination from '../Pagination';
import { format } from 'date-fns';
import Spinner from '../Spinner';

export default function Reviews() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const limit = 10;

    // Data Fetching
    const { data: reviews = [], isLoading } = useQuery({
        queryKey: ['adminReviews'],
        queryFn: fetchAllReviews,
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<{ id: string; action: 'APPROVED' | 'REJECTED' } | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);

    const handleAction = (id: string, action: 'APPROVED' | 'REJECTED') => {
        setSelectedReview({ id, action });
        setIsModalOpen(true);
    };

    const executeAction = async () => {
        if (!selectedReview) return;
        setIsConfirming(true);
        try {
            await updateReviewStatus(selectedReview.id, selectedReview.action);
            toast.success(`Review ${selectedReview.action.toLowerCase()} successfully`);
            queryClient.invalidateQueries({ queryKey: ['adminReviews'] });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to update review');
        } finally {
            setIsConfirming(false);
            setIsModalOpen(false);
            setSelectedReview(null);
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={16}
                        className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                    />
                ))}
            </div>
        );
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>;
            case 'REJECTED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
        }
    };

    // Simple client-side pagination
    const paginatedReviews = reviews.slice((page - 1) * limit, page * limit);
    const totalPages = Math.ceil(reviews.length / limit);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Manage Reviews</h2>
                        <p className="text-sm text-gray-500">Approve or reject customer reviews.</p>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-1">
                    <Spinner text="Loading data..." />
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 border-b">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Customer</th>
                                    <th className="px-6 py-4 font-medium">Rating</th>
                                    <th className="px-6 py-4 font-medium">Comment</th>
                                    <th className="px-6 py-4 font-medium">Submitted Date</th>
                                    <th className="px-6 py-4 font-medium text-center">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedReviews.map((review: any) => (
                                    <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {review.userName}
                                        </td>
                                        <td className="px-6 py-4">
                                            {renderStars(review.rating)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={review.comment}>
                                            {review.comment}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                            {format(new Date(review.createdAt), 'PPP')}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getStatusBadge(review.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {review.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(review.id, 'APPROVED')}
                                                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(review.id, 'REJECTED')}
                                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {review.status !== 'PENDING' && (
                                                    <span className="text-xs text-gray-400 italic">Reviewed</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {reviews.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            No reviews found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
            )}

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={executeAction}
                isConfirming={isConfirming}
                title={selectedReview?.action === 'APPROVED' ? 'Approve Review' : 'Reject Review'}
                message={selectedReview?.action === 'APPROVED'
                    ? 'Are you sure you want to approve this review? It will be visible publicly.'
                    : 'Are you sure you want to reject this review? It will not be displayed.'}
                confirmText={selectedReview?.action === 'APPROVED' ? 'Approve' : 'Reject'}
                variant={selectedReview?.action === 'REJECTED' ? 'danger' : 'primary'}
            />
        </div>
    );
}
