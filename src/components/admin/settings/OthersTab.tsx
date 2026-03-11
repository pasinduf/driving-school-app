import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';
import { updateCompanySettings } from '../../../api/company-api';
import { useCompany } from '../../../context/CompanyContext';

interface OthersFormData {
  themeColor: string;
  bookingSessionDuration: number;
}

export default function OthersTab() {
    const queryClient = useQueryClient();
    const { company } = useCompany();

    const { register, handleSubmit, reset } = useForm<OthersFormData>({
      defaultValues: {
        themeColor: company?.settings?.themeColor || "#e53e3e",
        bookingSessionDuration: company?.settings?.bookingSessionDuration || 180,
      },
    });

    useEffect(() => {
        if (company) {
            reset({
              themeColor: company.settings?.themeColor || "#e53e3e",
              bookingSessionDuration: company.settings?.bookingSessionDuration || 180,
            });
        }
    }, [company, reset]);

    const mutation = useMutation({
        mutationFn: updateCompanySettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['company'] });
            toast.success('Appearance settings updated');
        },
        onError: () => toast.error('Failed to update settings')
    });

    return (
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                                This color will be used as primary color for buttons, links, and accents.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Booking Session Duration (Minutes)</label>
                            <input
                                type="number"
                                {...register('bookingSessionDuration', { valueAsNumber: true })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                            />
                            <p className="text-xs text-gray-400 mt-2 font-light italic">
                                The locking duration for a booking session. Default is 180 minutes.
                            </p>
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
