import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { resetPasswordWithToken } from '../api/client';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { generateRandomPassword } from '../util/generateRandomPassword';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
        defaultValues: { newPassword: '', confirmPassword: '' }
    });

    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (!token || !email) {
            setApiError('Invalid password reset link. Please request a new one.');
        }
    }, [token, email]);

    const generatePassword = () => {
        const password = generateRandomPassword();
        setValue('newPassword', password, { shouldValidate: true });
        setValue('confirmPassword', password, { shouldValidate: true });
        setShowNewPassword(true);
        setShowConfirmPassword(true);
    };

    const onSubmit = async (data: any) => {
        if (!token || !email) return;
        setApiError('');
        setLoading(true);

        try {
            await resetPasswordWithToken(email, token, data.newPassword);
            toast.success('Password has been reset successfully. You can now log in.');
            navigate('/login');
        } catch (err: any) {
            setApiError(err.response?.data?.message || 'Failed to reset password. The link might be expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-primary font-bold text-xl">D</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Set new password</h2>
            <p className="mt-2 text-sm text-gray-600">Please enter your new password below.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {apiError && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center">{apiError}</div>}

            <div>
              <div className="flex justify-between flex-row items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  New Password <span className="text-red-500">*</span>
                </label>
                <button type="button" onClick={generatePassword} className="text-xs text-primary hover:underline font-medium">
                  Auto-generate
                </button>
              </div>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  {...register("newPassword", {
                    required: "New password is required",
                    minLength: { value: 8, message: "Password must be at least 8 characters" },
                  })}
                  disabled={!token || !email || loading}
                  className={`w-full px-4 py-2 bg-gray-50 border ${errors.newPassword ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-primary/20 focus:border-primary"} rounded-lg focus:outline-none focus:ring-2 transition-all text-sm pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword", {
                    required: "Please confirm your new password",
                    validate: (val) => watch("newPassword") === val || "Passwords do not match",
                  })}
                  disabled={!token || !email || loading}
                  className={`w-full px-4 py-2 bg-gray-50 border ${errors.confirmPassword ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-primary/20 focus:border-primary"} rounded-lg focus:outline-none focus:ring-2 transition-all text-sm pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message as string}</p>}
            </div>

            <button
              type="submit"
              disabled={!token || !email || loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Reset password"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              <ArrowLeft size={16} className="mr-2" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
}
