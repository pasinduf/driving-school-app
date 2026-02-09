
import { FileText, Car, Rocket, User, Clock, Signpost } from 'lucide-react';

const FeatureItem = ({ icon: Icon, title, description, align = 'left' }: { icon: any, title: string, description: string, align?: 'left' | 'right' }) => {
    return (
        <div className={`flex ${align === 'right' ? 'flex-row-reverse text-right' : 'flex-row text-left'} items-start gap-4 mb-8 group`}>
            <div className={`p-3 rounded-full border-2 border-primary text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white`}>
                <Icon size={28} />
            </div>
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
            </div>
        </div>
    );
};

export default function FeatureSection() {
    return (
        <section className="py-20 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight uppercase">Our Features</h2>
                    <p className="text-gray-500 italic mb-4">Master driving skills with our comprehensive features</p>
                    <div className="flex justify-center items-center">
                        <div className="h-[2px] w-16 bg-gray-300"></div>
                        <span className="text-3xl mx-2">🚦</span>
                        <div className="h-[2px] w-16 bg-gray-300"></div>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                    {/* Left Column */}
                    <div className="space-y-12">
                        <FeatureItem
                            align="right"
                            icon={FileText}
                            title="Quick License"
                            description="We will also help you become a safer and responsible driver."
                        />
                        <FeatureItem
                            align="right"
                            icon={Car}
                            title="Professional Service"
                            description="Patient, friendly and professional service."
                        />
                        <FeatureItem
                            align="right"
                            icon={Rocket}
                            title="Learning Experiences"
                            description="We make your learning experiences enjoyable, fun and safe."
                        />
                    </div>

                    {/* Center Image */}
                    <div className="relative flex justify-center py-10 lg:py-0">
                        {/* Hexagon Border Effect */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-[320px] h-[320px] bg-primary clip-hexagon opacity-10 animate-pulse"></div>
                        </div>

                        <div className="w-[300px] h-[300px] relative clip-hexagon shadow-xl bg-gray-100 transform hover:scale-105 transition-transform duration-500">
                            <img
                                src="https://images.unsplash.com/photo-1517524285303-d6fc683dddf8?q=80&w=1000&auto=format&fit=crop"
                                alt="Happy Driver"
                                className="w-full h-full object-cover"
                            />
                            {/* Red Border Overlay - since clip-path hides actual border props */}
                            <div className="absolute inset-0 border-[6px] border-primary/20 clip-hexagon pointer-events-none"></div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-12">
                        <FeatureItem
                            align="left"
                            icon={User}
                            title="Experienced Instructors"
                            description="Guidance from beginning to end."
                        />
                        <FeatureItem
                            align="left"
                            icon={Clock}
                            title="Any Time Any Place"
                            description="Flexible scheduling to suit your busy lifestyle anytime, anywhere."
                        />
                        <FeatureItem
                            align="left"
                            icon={Signpost}
                            title="Quality Insertions"
                            description="Comprehensive training materials and structured lesson plans."
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
