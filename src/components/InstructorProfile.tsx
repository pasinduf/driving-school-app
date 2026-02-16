import { Phone, CheckCircle, Award } from 'lucide-react';

// Sample instructor data - in a real app this could come from props or API
const INSTRUCTOR = {
    name: "Elisa Doe",
    role: "Senior Instructor",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
    phone: "+61 400 123 456",
    about: "Elisa has over 10 years of experience teaching students of all ages and capabilities. She specializes in nervous beginners and helps them build confidence on the road. With a patient and structured approach, she ensures every student becomes a safe and competent driver.",
    qualifications: [
        "Cert IV in Transport & Logistics",
        "10+ Years Experience",
        "Fluent in English & Mandarin",
        "High Pass Rate"
    ]
};

export default function InstructorProfile() {
    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 h-full flex flex-col">
            <div className="relative h-64 sm:h-80 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <img
                    src={INSTRUCTOR.image}
                    alt={INSTRUCTOR.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute bottom-4 left-6 z-20 text-white">
                    <h3 className="text-2xl font-bold">{INSTRUCTOR.name}</h3>
                    <p className="text-white/90 font-medium">{INSTRUCTOR.role}</p>
                </div>
            </div>

            <div className="p-8 flex-1 flex flex-col">
                <div className="mb-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="text-xl">👋</span> About User
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                        {INSTRUCTOR.about}
                    </p>
                </div>

                <div className="mb-8">
                    <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Award className="w-5 h-5 text-primary" /> Qualifications
                    </h4>
                    <ul className="space-y-2">
                        {INSTRUCTOR.qualifications.map((qual, index) => (
                            <li key={index} className="flex items-center text-gray-700">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                <span className="text-sm">{qual}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-auto pt-6 border-t border-gray-100">
                    <a
                        href={`tel:${INSTRUCTOR.phone}`}
                        className="flex items-center justify-center gap-3 w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                    >
                        <Phone className="w-5 h-5" />
                        Book Lesson: {INSTRUCTOR.phone}
                    </a>
                </div>
            </div>
        </div>
    );
}
