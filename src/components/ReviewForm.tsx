import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { submitReview } from '../api/client';

export default function ReviewForm() {
    const [name, setName] = useState('');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hoveredRating, setHoveredRating] = useState(0);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const mutation = useMutation({
        mutationFn: (data: { name: string; rating: number; comment: string }) => {
            return submitReview(data.name, data.rating, data.comment);
        },
        onSuccess: () => {
            setStatus({ type: 'success', message: 'Thank you for your review! Your feedback has been submitted.' });
            setName('');
            setRating(0);
            setComment('');
        },
        onError: () => {
            setStatus({ type: 'error', message: 'Failed to submit review. Please try again.' });
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(null);

        if (rating === 0) {
            setStatus({ type: 'error', message: 'Please select a rating' });
            return;
        }

        mutation.mutate({ name, rating, comment });
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 h-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 uppercase tracking-tight text-center">
                Leave a Review
            </h3>

            {status && (
                <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${status.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                        placeholder="John Doe"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <div className="flex space-x-2 justify-center sm:justify-start">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                type="button"
                                key={star}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="focus:outline-none transition-transform hover:scale-110"
                            >
                                <Star
                                    className={`w-8 h-8 ${star <= (hoveredRating || rating)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                        } transition-colors duration-200`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none"
                        placeholder="Tell us about your experience..."
                        required
                    />
                </div>

                <div className="flex justify-center pt-4">
                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className={`w-full sm:w-auto px-8 py-3 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-red-700 transition-all transform hover:scale-105 active:scale-95 ${mutation.isPending ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                    >
                        {mutation.isPending ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            </form>
        </div>
    );
}
