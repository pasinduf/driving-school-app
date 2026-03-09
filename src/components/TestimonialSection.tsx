import { useState, useEffect } from 'react';
import { fetchApprovedReviews, type Review } from '../api/review-api';
import { Star } from 'lucide-react';

export default function TestimonialSection() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadReviews = async () => {
            try {
                const data = await fetchApprovedReviews();
                setReviews(data);
            } catch (error) {
                console.error('Failed to fetch reviews:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadReviews();
    }, []);

    useEffect(() => {
        if (reviews.length > 1) {
            const interval = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % reviews.length);
            }, 6000);
            return () => clearInterval(interval);
        }
    }, [reviews.length, currentSlide]);

    if (isLoading) {
        return (
            <section className="bg-white py-20">
                <div className="max-w-4xl mx-auto px-4 flex justify-center">
                    <div className="animate-pulse flex space-x-4">
                        <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                        <div className="flex-1 space-y-6 py-1">
                            <div className="h-2 bg-gray-200 rounded"></div>
                            <div className="space-y-3">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="h-2 bg-gray-200 rounded col-span-2"></div>
                                    <div className="h-2 bg-gray-200 rounded col-span-1"></div>
                                </div>
                                <div className="h-2 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (reviews.length === 0) return null;

    const renderStars = (rating: number) => {
        return (
            <div className="flex justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        size={16}
                        className={i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                    />
                ))}
            </div>
        );
    };

    return (
        <section className="bg-gradient-to-b from-gray-50 to-white py-16 relative overflow-hidden">
            {/* Minimalist Background Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

            <div className="max-w-5xl mx-auto px-4 relative z-10">
                <div className="text-center mb-8">
                    <h2 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-4">Testimonials</h2>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight uppercase">What Our Students Say</h2>
                </div>

                <div className="relative">
                    <div className="overflow-hidden px-4">
                        <div className="transition-transform duration-1000 ease-in-out flex" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                            {reviews.map((review) => (
                                <div key={review.id} className="w-full flex-shrink-0 flex flex-col items-center px-4 md:px-12">
                                    {renderStars(review.rating)}

                                    <div className="relative max-w-3xl">
                                        <blockquote className="text-xl md:text-3xl text-gray-700 font-medium leading-tight mb-10 text-center tracking-tight">
                                            "{review.comment}"
                                        </blockquote>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <div className="h-px w-12 bg-primary/30 mb-4"></div>
                                        <cite className="text-gray-900 text-lg font-bold uppercase tracking-widest not-italic">{review.userName}</cite>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Arrows (Optional but helpful) */}
                    {reviews.length > 1 && (
                        <div className="hidden md:flex absolute inset-y-0 left-0 right-0 items-center justify-between pointer-events-none">
                            <button
                                onClick={() => setCurrentSlide((prev) => (prev - 1 + reviews.length) % reviews.length)}
                                className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-400 hover:text-primary transition-all pointer-events-auto -ml-6 border border-gray-100"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setCurrentSlide((prev) => (prev + 1) % reviews.length)}
                                className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-400 hover:text-primary transition-all pointer-events-auto -mr-6 border border-gray-100"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                {/* Indicators */}
                <div className="flex justify-center space-x-3 mt-12">
                    {reviews.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-1.5 transition-all duration-500 rounded-full ${currentSlide === index ? "w-8 bg-primary" : "w-2 bg-gray-200 hover:bg-gray-300"}`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
