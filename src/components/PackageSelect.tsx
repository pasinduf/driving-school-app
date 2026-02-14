import { useState, useEffect } from 'react';
import { fetchPackages } from '../api/client'; // value: Package[]
import { Loader2, Check } from 'lucide-react';

interface Package {
    id: string;
    name: string;
    description: string;
    price: number;
    maximumSlotsCount: number;
}

interface PackageSelectProps {
    onSelect: (pkg: Package) => void;
    selectedPackage: Package | null;
}

export default function PackageSelect({ onSelect, selectedPackage }: PackageSelectProps) {
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPackages = async () => {
            try {
                const data = await fetchPackages();
                setPackages(data);
            } catch (error) {
                console.error("Failed to load packages", error);
            } finally {
                setLoading(false);
            }
        };
        loadPackages();
    }, []);

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => {
                const isSelected = selectedPackage?.id === pkg.id;
                return (
                    <div
                        key={pkg.id}
                        onClick={() => onSelect(pkg)}
                        className={`cursor-pointer rounded-lg border-2 p-6 transition-all hover:shadow-lg ${isSelected
                            ? 'border-primary bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-primary'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg">{pkg.name}</h3>
                                <p className="text-sm text-gray-500">{pkg.description}</p>
                            </div>
                            {isSelected && <div className="bg-primary text-white p-1 rounded-full"><Check size={16} /></div>}
                        </div>
                        <div className="text-2xl font-bold text-primary">${pkg.price}</div>
                    </div>
                );
            })}
        </div>
    );
}
