import InstructorProfile from './InstructorProfile';
import ReviewForm from './ReviewForm';

export default function InstructorFeedbackSection() {
    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 uppercase tracking-tight">
                        Meet Your Instructor
                    </h2>
                    <p className="text-gray-500 italic mb-4 text-lg">Expert guidance every step of the way</p>
                    <div className="flex justify-center items-center">
                        <div className="h-[2px] w-16 bg-gray-300"></div>
                        <span className="text-3xl mx-2">🤝</span>
                        <div className="h-[2px] w-16 bg-gray-300"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                    <div className="w-full">
                        <InstructorProfile />
                    </div>

                    <div className="w-full">
                        <ReviewForm />
                    </div>
                </div>
            </div>
        </section>
    );
}
