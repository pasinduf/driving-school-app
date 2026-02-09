import { useState, useEffect } from 'react';

const REVIEWS = [
    {
        id: 1,
        name: "ISAAC",
        review: "Elisa is an excellent driving instructor who provided me with a comprehensive understanding of driving. Furthermore, she is cool, calm and collected, which enable me to broaden my knowledge. I highly recommend her and can not wait for my next lesson!",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop"
    },
    {
        id: 2,
        name: "SARAH",
        review: "I passed my test first time thanks to the amazing instruction! The lessons were structured perfectly and I felt so confident going into the exam. Validated all my fears and turned them into strengths.",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop"
    },
    {
        id: 3,
        name: "MICHAEL",
        review: "Professional, patient, and very knowledgeable. I had struggled with parking for ages, but within two lessons I had it mastered. Cannot recommend highly enough used their service for my whole family.",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop"
    },
    {
        id: 4,
        name: "EMILY",
        review: "The best driving school in the area! My instructor was always on time, the car was clean and modern, and the teaching style was exactly what I needed. Five stars all the way!",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop"
    }
];

export default function TestimonialSection() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % REVIEWS.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="bg-gray-100 py-20 relative overflow-hidden">
            {/* Background Image / Overlay */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center opacity-5"></div>

            <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 uppercase tracking-tight">
                    Hear from learners about their experience
                </h2>

                <div className="relative overflow-hidden min-h-[400px]">
                    <div
                        className="transition-transform duration-700 ease-in-out flex"
                        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                        {REVIEWS.map((review) => (
                            <div key={review.id} className="w-full flex-shrink-0 flex flex-col items-center justify-center px-4">
                                {/* Diamond Avatar Container */}
                                <div className="mb-8 relative">
                                    <div className="w-32 h-32 md:w-40 md:h-40 bg-white p-1 clip-diamond shadow-xl">
                                        <img
                                            src={review.image}
                                            alt={review.name}
                                            className="w-full h-full object-cover clip-diamond"
                                        />
                                    </div>
                                </div>

                                {/* Review Text */}
                                <blockquote className="text-gray-600 text-lg md:text-xl italic leading-relaxed mb-6 max-w-2xl">
                                    "{review.review}"
                                </blockquote>

                                {/* Name */}
                                <cite className="text-gray-900 font-bold uppercase tracking-wider not-italic">
                                    {review.name}
                                </cite>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Indicators */}
                <div className="flex justify-center space-x-2 mt-8">
                    {REVIEWS.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-3 h-3 rounded-full transition-colors duration-300 ${currentSlide === index ? 'bg-primary' : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
