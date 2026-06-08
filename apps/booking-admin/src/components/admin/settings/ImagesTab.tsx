import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Plus, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { fetchCarouselImages, deleteCarouselImage, uploadLogo, uploadCarouselImage } from '../../../api/company-api';
import { useCompany } from '../../../context/CompanyContext';
import Spinner from '../../Spinner';
import ConfirmationModal from '../../ConfirmationModal';

export default function ImagesTab() {
    const queryClient = useQueryClient();
    const { company } = useCompany();
    const [logoUploading, setLogoUploading] = useState(false);
    const [carouselUploading, setCarouselUploading] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [imageToDelete, setImageToDelete] = useState<string | null>(null);

    // Mutations
    const logoMutation = useMutation({
        mutationFn: uploadLogo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['company'] });
            toast.success('Logo updated successfully');
        },
        onError: () => toast.error('Failed to update logo')
    });

    const { data: carouselImages = [], isLoading: loadingCarousel } = useQuery({
        queryKey: ['carouselImages'],
        queryFn: fetchCarouselImages
    });

    const addCarouselMutation = useMutation({
        mutationFn: uploadCarouselImage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['carouselImages'] });
            toast.success('Carousel image added');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to add image');
        }
    });

    const deleteCarouselMutation = useMutation({
        mutationFn: deleteCarouselImage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['carouselImages'] });
            toast.success('Carousel image removed');
        },
        onError: () => toast.error('Failed to remove image')
    });

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setLogoUploading(true);
            await logoMutation.mutateAsync(file);
        } finally {
            setLogoUploading(false);
        }
    };

    const handleCarouselUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (carouselImages.length >= 4) {
            toast.warning('Maximum of 4 carousel images allowed');
            return;
        }

        try {
            setCarouselUploading(true);
            await addCarouselMutation.mutateAsync(file);
        } finally {
            setCarouselUploading(false);
        }
    };

    return (
        <div className="space-y-12">
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={async () => {
                    if (imageToDelete) {
                        await deleteCarouselMutation.mutateAsync(imageToDelete);
                        setDeleteModalOpen(false);
                        setImageToDelete(null);
                    }
                }}
                isConfirming={deleteCarouselMutation.isPending}
                title="Remove Carousel Image"
                message="Are you sure you want to remove this image from the carousel?"
                confirmText="Remove"
                variant="danger"
            />

            {/* Logo Section */}
            <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Logo</h3>
                <div className="flex items-start gap-8">
                    <div className="relative group">
                        <div className="w-40 h-40 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                            {company?.logoUrl ? (
                                <img src={company.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                                <ImageIcon className="w-12 h-12 text-gray-300" />
                            )}
                            
                            {logoUploading && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                </div>
                            )}
                        </div>
                        <label className="absolute -bottom-3 -right-3 p-2 bg-primary text-white rounded-full shadow-lg cursor-pointer hover:bg-primary-700 transition-colors">
                            <Camera size={20} />
                            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={logoUploading} />
                        </label>
                    </div>
                    <div className="max-w-sm">
                        <p className="text-xs text-gray-400 font-light italic">
                            Recommended: Square or horizontal aspect ratio, transparent PNG or high-quality JPG. Max 5MB.
                        </p>
                    </div>
                </div>
            </section>

            <hr className="border-gray-100" />

            {/* Carousel Section */}
            <section>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Carousel Images</h3>
                        <p className="text-sm text-gray-500">Managed images will rotate on the web page carousel section.</p>
                    </div>
                    <div className="text-sm font-medium">
                        <span className={carouselImages.length >= 4 ? 'text-red-500' : 'text-primary'}>
                            {carouselImages.length}/4
                        </span>
                        <span className="text-gray-400 ml-1">Images</span>
                    </div>
                </div>

                {loadingCarousel ? (
                    <div className="flex justify-center py-12">
                        <Spinner text="Loading images..." />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {carouselImages.map((img) => (
                            <div key={img.id} className="relative group rounded-xl overflow-hidden shadow-sm border border-gray-200 aspect-video bg-gray-50">
                                <img src={img.imageUrl} alt="Carousel" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button 
                                        onClick={() => {
                                            setImageToDelete(img.id);
                                            setDeleteModalOpen(true);
                                        }}
                                        className="p-2 bg-white text-red-500 rounded-full hover:bg-primary-50 transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {carouselImages.length < 4 && (
                            <label className={`relative flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed transition-all cursor-pointer ${carouselUploading ? 'bg-gray-50 border-gray-200 cursor-not-allowed' : 'border-gray-300 hover:border-primary hover:bg-primary/5'}`}>
                                {carouselUploading ? (
                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                ) : (
                                    <>
                                        <Plus className="w-8 h-8 text-gray-400 mb-2" />
                                        <span className="text-sm font-medium text-gray-500">Add Image</span>
                                    </>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={handleCarouselUpload} disabled={carouselUploading} />
                            </label>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}
