import { Car, Award, ShieldCheck, Rocket } from 'lucide-react';

const INFO_CARDS = [
    {
        icon: Car,
        title: "INSTRUCTOR RATINGS",
        description: "Access peer reviews & find an instructor who has consistently provided a great learning experience."
    },
    {
        icon: Award,
        title: "ACCREDITED",
        description: "We obtain up to date copies of relevant instructor accreditations & verify their working with children credentials."
    },
    {
        icon: ShieldCheck,
        title: "VEHICLE SAFETY",
        description: "Gain access to instructor vehicle make, model, year & safety rating."
    },
    {
        icon: Rocket,
        title: "ALWAYS YOUR CHOICE",
        description: "Don't like your current instructor? Select a new instructor via our online portal, no questions asked."
    }
];

export default function InstructorInfoSection() {
    return (
        <section className="bg-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 uppercase tracking-tight">
                        Who's teaching you to drive?
                    </h2>
                    <p className="text-gray-500 italic mb-4 text-lg">Make an informed choice</p>
                    <div className="flex justify-center items-center">
                        <div className="h-[2px] w-16 bg-gray-300"></div>
                        <span className="text-3xl mx-2">🚦</span>
                        <div className="h-[2px] w-16 bg-gray-300"></div>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {INFO_CARDS.map((card, index) => (
                        <div key={index} className="flex flex-col items-center text-center group">
                            {/* Octagon Container */}
                            <div className="relative w-64 h-64 mb-6 transition-transform duration-300 group-hover:-translate-y-2">
                                {/* Shadow/Border Simulated by a larger octagon behind? 
                                    Or just a drop shadow on the clip-path element if possible (usually tricky).
                                    Let's try a wrapper with drop-shadow filter.
                                */}
                                <div className="w-full h-full drop-shadow-xl filter">
                                    <div className="w-full h-full bg-gray-50 clip-octagon flex flex-col items-center justify-center p-6 border border-gray-200">
                                        <card.icon className="text-primary w-12 h-12 mb-4" />
                                        <h3 className="text-gray-900 font-bold uppercase tracking-wider mb-2">{card.title}</h3>
                                        <div className="w-8 h-1 bg-primary mb-4"></div>
                                        <p className="text-gray-600 text-xs leading-relaxed">
                                            {card.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
