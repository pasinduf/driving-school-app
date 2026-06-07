import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { updateFirstLoginPassword } from '../api/user-api';
import PasswordInput from '../components/PasswordInput';

const PASSWORD_HINT = 'Must be at least 8 characters and include at least 1 letter and 1 number.';

function validate(current: string, next: string, confirm: string): string | null {
    if (!current) return 'Current password is required.';
    if (next.length < 8) return 'New password must be at least 8 characters.';
    if (!/[A-Za-z]/.test(next) || !/\d/.test(next))
        return 'New password must contain at least 1 letter and 1 number.';
    if (next !== confirm) return 'Passwords do not match.';
    if (next === current) return 'New password must differ from the current password.';
    return null;
}

export default function UpdatePasswordPage() {
    const { login, user } = useAuth();
    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!user) {
        navigate('/login', { replace: true });
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const error = validate(currentPassword, newPassword, confirmPassword);
        if (error) {
            toast.error(error);
            return;
        }

        setIsSubmitting(true);
        try {
            const { access_token } = await updateFirstLoginPassword({
                currentPassword,
                newPassword,
            });
            login(access_token);
            toast.success('Password updated successfully. Welcome!');
            navigate('/portal/dashboard', { replace: true });
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to update password. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 border border-gray-100">
                <div className="flex flex-col items-center mb-6">
                    <div className="p-3 bg-primary/10 rounded-full mb-3">
                        <Lock className="w-7 h-7 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Update Your Password</h1>
                    <p className="text-sm text-gray-500 text-center mt-1">
                        You must set a new password before accessing the portal.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Current / temporary password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current / Temporary Password <span className="text-red-500">*</span>
                        </label>
                        <PasswordInput
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter your current password"
                        />
                    </div>

                    {/* New password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password <span className="text-red-500">*</span>
                        </label>
                        <PasswordInput
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                        />
                        <p className="text-xs text-gray-400 mt-1">{PASSWORD_HINT}</p>
                    </div>

                    {/* Confirm password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password <span className="text-red-500">*</span>
                        </label>
                        <PasswordInput
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter new password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary text-white py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 mt-2"
                    >
                        {isSubmitting ? 'Updating…' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
