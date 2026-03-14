import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';
import { updateCompanyGeneral } from '../../../api/company-api';
import { useCompany } from '../../../context/CompanyContext';

interface GeneralFormData {
    name: string;
    contactEmail: string;
    contactNumber: string;
    address: string;
    terms: string;
}

export default function GeneralTab() {
    const queryClient = useQueryClient();
    const { company } = useCompany();

    const { register, handleSubmit, reset } = useForm<GeneralFormData>({
        defaultValues: {
            name: company?.name || '',
            contactEmail: company?.contactEmail || '',
            contactNumber: company?.contactNumber || '',
            address: company?.address || '',
            terms: company?.terms || ''
        }
    });

    useEffect(() => {
        if (company) {
            reset({
                name: company.name,
                contactEmail: company.contactEmail,
                contactNumber: company.contactNumber,
                address: company.address,
                terms: company.terms
            });
        }
    }, [company, reset]);

    const mutation = useMutation({
      mutationFn: updateCompanyGeneral,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["company"] });
        toast.success("General details updated");
      },
      onError: () => toast.error("Failed to update settings"),
    });

    return (
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

            <div className="pt-6 border-t flex justify-end">
                <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-opacity-90 transition-all font-medium disabled:opacity-50"
                >
                    {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                </button>
            </div>
        </form>
    );
}
