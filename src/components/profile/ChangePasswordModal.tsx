import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { changePassword } from '../../api/user-api';
import { Loader2, X, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { generateRandomPassword } from '../../util/generateRandomPassword';
import { toast } from 'sonner';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
    const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm({
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        }
    });

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const generatePassword = () => {
        const password = generateRandomPassword();
        setValue('newPassword', password, { shouldValidate: true });
        setValue('confirmPassword', password, { shouldValidate: true });
        setShowNewPassword(true);
        setShowConfirmPassword(true);
    };

    const onSubmit = async (data: any) => {
        setApiError('');
        setLoading(true);

        try {
            await changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
            toast.success('Password changed successfully');
            onCloseModal();
        } catch (err: any) {
            setApiError(err.response?.data?.message || 'Failed to change password. Please verify your current password.');
        } finally {
            setLoading(false);
        }
    };

    const onCloseModal = () => {
        reset();
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        setApiError('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex justify-between flex-row items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                        <button onClick={onCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {apiError && (
                        <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-start">
                            <AlertCircle size={16} className="mt-0.5 mr-2 shrink-0" />
                            <span>{apiError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type={showCurrentPassword ? "text" : "password"}
                                    {...register('currentPassword', { required: 'Current password is required' })}
                                    className={`w-full px-4 py-2 bg-gray-50 border ${errors.currentPassword ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/20 focus:border-primary'} rounded-lg focus:outline-none focus:ring-2 transition-all text-sm pr-10`}
                                />
                                <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none">
                                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.currentPassword && <p className="text-red-500 text-sm mt-1">{errors.currentPassword.message as string}</p>}
                        </div>

                        <div>
                            <div className="flex justify-between flex-row items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">New Password <span className="text-red-500">*</span></label>
                                <button type="button" onClick={generatePassword} className="text-xs text-primary hover:underline font-medium">
                                    Auto-generate
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    {...register('newPassword', {
                                        required: 'New password is required',
                                        minLength: { value: 8, message: 'Password must be at least 8 characters' }
                                    })}
                                    className={`w-full px-4 py-2 bg-gray-50 border ${errors.newPassword ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/20 focus:border-primary'} rounded-lg focus:outline-none focus:ring-2 transition-all text-sm pr-10`}
                                />
                                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none">
                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword.message as string}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    {...register('confirmPassword', {
                                        required: 'Please confirm your new password',
                                        validate: (val) => watch('newPassword') === val || 'Passwords do not match'
                                    })}
                                    className={`w-full px-4 py-2 bg-gray-50 border ${errors.confirmPassword ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/20 focus:border-primary'} rounded-lg focus:outline-none focus:ring-2 transition-all text-sm pr-10`}
                                />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none">
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message as string}</p>}
                        </div>

                        <div className="pt-4 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onCloseModal}
                                disabled={loading}
                                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 flex items-center transition-colors disabled:opacity-50"
                            >
                                {loading && <Loader2 size={16} className="animate-spin mr-2" />}
                                Update Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
