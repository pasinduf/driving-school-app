import { CheckCircle, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchAllInstructors, type Instructor } from '../api/instructor-api';
import Spinner from './Spinner';
import instructorPlaceholder from '../assets/instructor_placeholder.png';

export default function InstructorProfile() {
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const loadInstructors = async () => {
            try {
                const data = await fetchAllInstructors();
                setInstructors(data);
            } catch (error) {
                console.error("Failed to fetch instructors", error);
            } finally {
                setLoading(false);
            }
        };
        loadInstructors();
    }, []);

    useEffect(() => {
        if (instructors.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % instructors.length);
        }, 5000); // Auto slide every 5 seconds

        return () => clearInterval(interval);
    }, [instructors.length]);

    const nextInstructor = () => {
        setCurrentIndex((prev) => (prev + 1) % instructors.length);
    };

    const prevInstructor = () => {
        setCurrentIndex((prev) => (prev - 1 + instructors.length) % instructors.length);
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Spinner text="Loading instructors..." />
            </div>
        );
    }

    if (instructors.length === 0) {
        return null; // Or some fallback UI
    }

    const currentInstructor = instructors[currentIndex];
    const qualificationsList = currentInstructor.qualifications
        ? currentInstructor.qualifications.split('|').map(q => q.trim()).filter(q => q)
        : [];

    return (
        <div className="relative group/carousel">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 h-full flex flex-col transition-all duration-500">
                <div className="relative h-64 sm:h-80 overflow-hidden group/image">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    <img
                        src={currentInstructor.profileImage || instructorPlaceholder}
                        alt={currentInstructor.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-110"
                    />
                    <div className="absolute bottom-4 left-6 z-20 text-white">
                        <h3 className="text-2xl font-bold">{currentInstructor.name}</h3>
                    </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                    {currentInstructor.about && (
                        <div className="mb-6">
                            <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <span className="text-xl">👋</span> About {currentInstructor.name.split(' ')[0]}
                            </h4>
                            <p className="text-gray-600 leading-relaxed line-clamp-4">
                                {currentInstructor.about}
                            </p>
                        </div>
                    )}

                    {qualificationsList.length > 0 && (
                        <div className="mb-8">
                            <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Award className="w-5 h-5 text-primary" /> Qualifications
                            </h4>
                            <ul className="space-y-2">
                                {qualificationsList.map((qual, index) => (
                                    <li key={index} className="flex items-center text-gray-700">
                                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                        <span className="text-sm">{qual}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* <div className="mt-auto pt-6 border-t border-gray-100">
                        <a
                            href={`tel:${currentInstructor.contactNumber}`}
                            className="flex items-center justify-center gap-3 w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                        >
                            <Phone className="w-5 h-5" />
                            Book Lesson: {currentInstructor.contactNumber}
                        </a>
                    </div> */}
                </div>
            </div>

            {instructors.length > 1 && (
                <>
                    <button
                        onClick={prevInstructor}
                        className="absolute left-[-20px] top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-lg border border-gray-100 text-gray-600 hover:text-primary transition-all opacity-0 group-hover/carousel:opacity-100 z-30"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={nextInstructor}
                        className="absolute right-[-20px] top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-lg border border-gray-100 text-gray-600 hover:text-primary transition-all opacity-0 group-hover/carousel:opacity-100 z-30"
                    >
                        <ChevronRight size={24} />
                    </button>

                    {/* Indicators */}
                    <div className="flex justify-center gap-2 mt-4">
                        {instructors.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-1.5 rounded-full transition-all ${currentIndex === idx ? "w-6 bg-primary" : "w-2 bg-gray-300"}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
