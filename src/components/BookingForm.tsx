
import { useForm } from 'react-hook-form';

interface BookingFormProps {
    onSubmit: (data: any) => void;
    isSubmitting: boolean;
    onCancel: () => void;
}

export default function BookingForm({ onSubmit, isSubmitting, onCancel }: BookingFormProps) {
    const { register, handleSubmit, formState: { errors } } = useForm();

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        {...register('customerName', { required: 'Name is required' })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                    {errors.customerName && <p className="text-red-500 text-sm">{errors.customerName.message as string}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                        {...register('customerPhone', { required: 'Phone is required' })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                    {errors.customerPhone && <p className="text-red-500 text-sm">{errors.customerPhone.message as string}</p>}
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input
                        {...register('customerEmail', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: "Invalid email" } })}
                        type="email"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                    {errors.customerEmail && <p className="text-red-500 text-sm">{errors.customerEmail.message as string}</p>}
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Pickup Address</label>
                    <textarea
                        {...register('pickupAddress', { required: 'Address is required' })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        rows={3}
                    />
                    {errors.pickupAddress && <p className="text-red-500 text-sm">{errors.pickupAddress.message as string}</p>}
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                    <textarea
                        {...register('notes')}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        rows={2}
                    />
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                </button>
            </div>
        </form>
    );
}
