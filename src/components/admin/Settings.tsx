import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Camera, Plus, Trash2, Image as ImageIcon, Settings as SettingsIcon, Loader2, Save } from 'lucide-react';
import { fetchCarouselImages, deleteCarouselImage, uploadLogo, uploadCarouselImage, updateCompanySettings } from '../../api/company-api';
import Spinner from '../Spinner';
import { useCompany } from '../../context/CompanyContext';
import ConfirmationModal from '../ConfirmationModal';

interface GeneralSettingsFormData {
    name: string;
    themeColor: string;
    contactEmail: string;
    contactNumber: string;
    address: string;
    terms: string;
}

export default function Settings() {
    const [activeTab, setActiveTab] = useState<'images' | 'general' | 'others'>('general');
    const queryClient = useQueryClient();
    const { company } = useCompany();
    const [logoUploading, setLogoUploading] = useState(false);
    const [carouselUploading, setCarouselUploading] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [imageToDelete, setImageToDelete] = useState<string | null>(null);

    const { register, handleSubmit, reset } = useForm<GeneralSettingsFormData>({
        defaultValues: {
            name: company?.name || '',
            themeColor: company?.themeColor || '#e53e3e',
            contactEmail: company?.contactEmail || '',
            contactNumber: company?.contactNumber || '',
            address: company?.address || '',
            terms: company?.terms || ''
        }
    });

    useEffect(() => {
        if (company && activeTab !== 'images') {
            reset({
                name: company.name,
                themeColor: company.themeColor,
                contactEmail: company.contactEmail,
                contactNumber: company.contactNumber,
                address: company.address,
                terms: company.terms
            });
        }
    }, [company, reset, activeTab]);

    // Mutations
    const settingsMutation = useMutation({
        mutationFn: updateCompanySettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['company'] });
            toast.success('Settings updated successfully');
        },
        onError: () => toast.error('Failed to update settings')
    });

    // Fetch Carousel Images
    const { data: carouselImages = [], isLoading: loadingCarousel } = useQuery({
        queryKey: ['carouselImages'],
        queryFn: fetchCarouselImages
    });

    // Mutations
    const logoMutation = useMutation({
        mutationFn: uploadLogo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['company'] });
            toast.success('Logo updated successfully');
        },
        onError: () => toast.error('Failed to update logo')
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
        } catch (error) {
            // Error handled by mutation
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
        } catch (error) {
            // Error handled by mutation
        } finally {
            setCarouselUploading(false);
        }
    };

    const handleCancelDelete = () => {
        setDeleteModalOpen(false);
        setImageToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (imageToDelete) {
            await deleteCarouselMutation.mutateAsync(imageToDelete);
            setDeleteModalOpen(false);
            setImageToDelete(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                isConfirming={deleteCarouselMutation.isPending}
                title="Remove Carousel Image"
                message="Are you sure you want to remove this image from the carousel? This action cannot be undone."
                confirmText="Remove"
                variant="danger"
            />
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <SettingsIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Company Settings</h2>
                        <p className="text-sm text-gray-500">Manage your company's visual branding and configurations.</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex border-b">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'general' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                        General
                    </button>
                    <button
                        onClick={() => setActiveTab('images')}
                        className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'images' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                        Logo & Carousel
                    </button>
                    <button
                        onClick={() => setActiveTab('others')}
                        className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'others' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                        Others
                    </button>
                </div>

                <div className="p-8">
                    {activeTab === 'images' && (
                        <div className="space-y-12">
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
                                        {/* <p className="text-sm text-gray-600 mb-2">
                                            This logo will appear in the navigation bar, footer, and emails.
                                        </p> */}
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
                                                        title="Remove Image"
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
                    )}

                    {(activeTab === 'general' || activeTab === 'others') && (
                        <form onSubmit={handleSubmit((data) => settingsMutation.mutate(data))} className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activeTab === 'general' && (
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-6">General Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                                <input
                                                    type="text"
                                                    {...register('name')}
                                                    disabled
                                                    className="w-full px-4 py-2 border border-gray-100 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed font-medium"
                                                />
                                                <p className="text-[10px] text-gray-400 mt-1 italic">Company name cannot be changed.</p>
                                            </div>

                                            <div className="md:col-span-2">
                                                <h4 className="text-sm font-semibold text-gray-900 mb-4 pt-4 border-t">Contact Information</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                                                        <input
                                                            type="email"
                                                            {...register('contactEmail')}
                                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                                                        <input
                                                            type="text"
                                                            {...register('contactNumber')}
                                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Physical Address</label>
                                                <textarea
                                                    rows={2}
                                                    {...register('address')}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                                />
                                            </div>

                                            <div className="md:col-span-2 pt-6 border-t">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal & Policies</h3>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                                                <textarea
                                                    rows={6}
                                                    {...register('terms')}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono text-sm"
                                                    placeholder="Write your company terms and conditions here..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'others' && (
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Appearance & Customization</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Theme Color</label>
                                                <div className="flex gap-3">
                                                    <input
                                                        type="color"
                                                        {...register('themeColor')}
                                                        className="h-10 w-12 p-1 rounded border border-gray-200 cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        {...register('themeColor')}
                                                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-mono"
                                                        placeholder="#e53e3e"
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-400 mt-2 font-light italic">
                                                    This color will be used as primary color for buttons, links, and accents across the application.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 border-t flex justify-end">
                                <button
                                    type="submit"
                                    disabled={settingsMutation.isPending}
                                    className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-opacity-90 transition-all font-medium disabled:opacity-50"
                                >
                                    {settingsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
