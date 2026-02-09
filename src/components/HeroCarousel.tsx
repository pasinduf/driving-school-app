import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const IMAGES = [
    // Modern car interior / driving
    "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1920&auto=format&fit=crop",
    // Road view
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1920&auto=format&fit=crop",
    // Learner driver / calm instruction (placeholder vibe)
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1920&auto=format&fit=crop",
    // City driving
    "https://images.unsplash.com/photo-1444723121867-c61267198d42?q=80&w=1920&auto=format&fit=crop"
];

export default function HeroCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % IMAGES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % IMAGES.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + IMAGES.length) % IMAGES.length);

    return (
        <div className="relative h-[600px] w-full overflow-hidden bg-gray-900">
            {/* Slides */}
            {IMAGES.map((img, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                >
                    <img
                        src={img}
                        alt={`Driving School Slide ${index + 1}`}
                        className="w-full h-full object-cover opacity-60"
                    />
                </div>
            ))}

            {/* Overlay Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg tracking-tight animate-fade-in-up">
                        Master the Road with Confidence
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-100 mb-10 max-w-2xl mx-auto drop-shadow-md font-light">
                        Professional driving lessons tailored to your needs. Book online in minutes.
                    </p>
                    <Link
                        to="/booking"
                        className="inline-block bg-primary text-white font-bold py-4 px-10 rounded-full text-lg shadow-xl hover:bg-red-700 transition-all transform hover:scale-105 hover:shadow-2xl"
                    >
                        Book Your Lesson
                    </Link>
                </div>
            </div>

            {/* Controls */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-20"
            >
                <ChevronLeft size={48} />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-20"
            >
                <ChevronRight size={48} />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
                {IMAGES.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-primary w-8' : 'bg-white/50 hover:bg-white'}`}
                    />
                ))}
            </div>
        </div>
    );
}
