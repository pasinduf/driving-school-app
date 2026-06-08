import { useQuery } from '@tanstack/react-query';
import { fetchPackages } from '../api/package-api'; // value: Package[]
import { Check, Clock, CalendarDays } from 'lucide-react';
import Spinner from './Spinner';

interface Package {
    id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
    maximumSlotsCount: number;
    margin: number;
}

interface PackageSelectProps {
    onSelect: (pkg: Package) => void;
    selectedPackage: Package | null;
}

export default function PackageSelect({ onSelect, selectedPackage }: PackageSelectProps) {
    const { data: packages = [], isLoading: loading } = useQuery<Package[]>({
        queryKey: ['packages'],
        queryFn: fetchPackages,
    });

    if (loading) {
        return <div className="flex justify-center p-8"><Spinner text="Loading packages..." /></div>;
    }

    return (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => {
                const isSelected = selectedPackage?.id === pkg.id;
                return (
                    <div
                        key={pkg.id}
                        onClick={() => onSelect(pkg)}
                        role="button"
                        tabIndex={0}
                        className={`group relative cursor-pointer rounded-2xl border p-6 transition-all duration-200
                            ${isSelected
                                ? 'border-primary bg-primary-50 shadow-glow ring-1 ring-primary'
                                : 'border-line bg-white shadow-soft hover:-translate-y-1 hover:border-primary/40 hover:shadow-card'}`}
                    >
                        {/* Selected check */}
                        <span
                            className={`absolute right-4 top-4 grid h-6 w-6 place-items-center rounded-full text-white transition-all duration-200
                                ${isSelected ? 'scale-100 bg-primary opacity-100' : 'scale-50 opacity-0'}`}
                        >
                            <Check size={14} strokeWidth={3} />
                        </span>

                        <h3 className="pr-8 text-lg font-bold text-ink">{pkg.name}</h3>
                        <p className="mt-1 min-h-[2.5rem] text-sm leading-relaxed text-muted line-clamp-2">{pkg.description}</p>

                        <div className="mt-5 flex items-end justify-between">
                            <div>
                                <span className="text-3xl font-black text-primary">${pkg.price}</span>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                                    <Clock size={12} /> {pkg.duration} min
                                </span>
                                {pkg.maximumSlotsCount > 1 && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                                        <CalendarDays size={12} /> up to {pkg.maximumSlotsCount} slots
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
