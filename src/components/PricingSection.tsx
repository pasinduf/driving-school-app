import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchPackages } from '../api/package-api';
import Spinner from './Spinner';

interface PackageData {
    id: number;
    name: string;
    description: string;
    price: string | number;
    isHighlight: boolean;
}

const PACKAGE_IMAGES = [
    "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1444723121867-c61267198d42?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506469717969-08fc1dd260f3?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1532585620931-50e4171d9d13?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1580273916550-e323be2ebdd9?q=80&w=800&auto=format&fit=crop"
];

const PricingCard = ({ pkg, index }: { pkg: PackageData, index: number }) => {
    const image = PACKAGE_IMAGES[index % PACKAGE_IMAGES.length];
    return (
        <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div className={`py-6 text-center ${pkg.isHighlight ? "bg-primary" : "bg-gray-800"}`}>
                <h3 className="text-white font-bold text-xl uppercase tracking-wider">{pkg.name}</h3>
            </div>

            <div className="h-48 overflow-hidden relative group">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300 z-10"></div>
                <img src={image} alt={pkg.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-8 py-4 bg-white">
                <p className="text-gray-500 font-medium text-xs uppercase tracking-widest mb-4 text-center">{pkg.description}</p>
                <div className="text-4xl font-extrabold text-gray-900">${pkg.price}</div>
                <div className="w-12 h-1 bg-gray-100 rounded-full"></div>
            </div>

            <div className="p-6 bg-white border-t border-gray-100">
                <Link
                    to="/booking"
                    className={`block w-full py-3 text-center rounded-lg font-bold uppercase tracking-wider transition-all duration-300 ${pkg.isHighlight ? "bg-primary text-white hover:bg-red-700 shadow-md hover:shadow-lg" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                >
                    Choose Plan
                </Link>
            </div>
        </div>
    );
};

export default function PricingSection() {
    const [packages, setPackages] = useState<PackageData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const loadPackages = async () => {
            try {
                const data = await fetchPackages();
                if (mounted) {
                    const formatted = data.map((p: any, i: number) => ({
                        ...p,
                        highlight: i === 2 // highlight the 3rd one
                    }));
                    setPackages(formatted);
                }
            } catch (error) {
                console.error("Failed to load packages", error);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        loadPackages();
        return () => { mounted = false; };
    }, []);
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
