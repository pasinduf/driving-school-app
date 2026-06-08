import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { requestPasswordReset } from '../api/auth-api';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: { email: '' }
    });

    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [apiError, setApiError] = useState('');

    const onSubmit = async (data: { email: string }) => {
        setApiError('');
        setLoading(true);

        try {
            await requestPasswordReset(data.email);
            setIsSubmitted(true);
            toast.success('Password reset email sent (if account exists).');
        } catch (err: any) {
            setApiError(err.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Reset your password</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {isSubmitted
                            ? "Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder."
                            : "Enter your email address and we'll send you a link to reset your password."}
                    </p>
                </div>

                {!isSubmitted ? (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {apiError && (
                            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center">
                                {apiError}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address'
                                    }
                                })}
                                className={`w-full px-4 py-2 border ${errors.email ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/20 focus:border-primary'} rounded-lg focus:outline-none focus:ring-2 transition-all transition-colors`}
                                disabled={loading}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email.message as string}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send reset link'}
                        </button>
                    </form>
                ) : (
                    <button
                        onClick={() => setIsSubmitted(false)}
                        className="w-full flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                    >
                        Try another email
                    </button>
                )}

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
