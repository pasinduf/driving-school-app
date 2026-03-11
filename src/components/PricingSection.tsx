import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchPackages } from '../api/package-api';
import Spinner from './Spinner';
import { Check, Star } from 'lucide-react';

interface PackageData {
    id: number;
    name: string;
    description: string;
    price: string | number;
    isHighlight: boolean;
}

const PricingCard = ({ pkg }: { pkg: PackageData, index: number }) => {
    return (
        <div className={`relative flex flex-col h-full bg-white rounded-3xl overflow-hidden transition-all duration-300 transform hover:-translate-y-2 ${pkg.isHighlight
                ? "ring-2 ring-primary shadow-2xl scale-105 z-10"
                : "shadow-lg hover:shadow-xl border border-gray-100"
            }`}>
            {pkg.isHighlight && (
                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                    <Star size={10} fill="currentColor" />
                    Most Popular
                </div>
            )}

            <div className={`pt-10 pb-8 px-8 text-center ${pkg.isHighlight ? "bg-red-50/30" : ""}`}>
                <h3 className={`font-black text-xs uppercase tracking-[0.2em] mb-4 ${pkg.isHighlight ? "text-primary" : "text-gray-400"}`}>
                    {pkg.name}
                </h3>
                <div className="flex items-center justify-center gap-0.5">
                    <span className="text-2xl font-bold text-gray-900 self-start mt-1">$</span>
                    <span className="text-6xl font-black text-gray-900 tracking-tight">{pkg.price}</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col px-8 pb-8">
                <div className="space-y-4 mb-8">
                    <p className="text-gray-600 text-sm leading-relaxed text-center font-medium italic">
                        "{pkg.description}"
                    </p>

                    <div className="h-px w-12 bg-gray-100 mx-auto"></div>

                    <ul className="space-y-3 pt-2">
                        {[
                            "Professional Instructor",
                            "Progress Tracking"
                        ].map((feature, i) => (
                            <li key={i} className="flex items-center gap-3 text-gray-600">
                                <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${pkg.isHighlight ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400"}`}>
                                    <Check size={12} strokeWidth={3} />
                                </div>
                                <span className="text-sm font-medium">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <Link
                    to="/booking"
                    className={`mt-auto w-full py-4 text-center rounded-2xl font-bold uppercase tracking-widest text-xs transition-all duration-300 ${pkg.isHighlight
                            ? "bg-primary text-white hover:bg-primary-700 shadow-lg shadow-primary/30 active:scale-95"
                            : "bg-gray-900 text-white hover:bg-black active:scale-95"
                        }`}
                >
                    Get Started
                </Link>
            </div>
        </div>
    );
};

export default function PricingSection() {
    const { data: packages = [], isLoading } = useQuery({
        queryKey: ['packages'],
        queryFn: async () => {
            const data = await fetchPackages();
            return data;
        },
    });
    return (
        <section className="bg-gray-50 pb-20">
            {/* CTA Banner */}
            <div className="bg-primary py-12 px-4 shadow-lg mb-20 relative overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between relative z-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 md:mb-0 uppercase tracking-tight text-center md:text-left">
                        Try to get our amazing lesson
                    </h2>
                    <Link
                        to="/booking"
                        className="px-8 py-3 border-2 border-white text-primary bg-white hover:bg-transparent hover:text-white font-bold uppercase tracking-wider transition-all duration-300 rounded-sm"
                    >
                        Get Lesson Packages
                    </Link>
                </div>
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black/10 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight uppercase">Our Pricing Plans</h2>
                    <p className="text-gray-500 italic mb-4">Choose the package that suits you best</p>
                    <div className="flex justify-center items-center">
                        <div className="h-[2px] w-16 bg-gray-300"></div>
                        <span className="text-3xl mx-2">🚦</span>
                        <div className="h-[2px] w-16 bg-gray-300"></div>
                    </div>
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Spinner size="lg" text="Loading packages..." />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {packages.map((pkg, index) => (
                            <PricingCard key={pkg.id || index} pkg={pkg} index={index} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
