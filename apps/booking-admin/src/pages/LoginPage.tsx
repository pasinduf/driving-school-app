
import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';
import { loginUser } from '../api/auth-api';
import { jwtDecode } from 'jwt-decode';
import PasswordInput from '../components/PasswordInput';
import { homeUrl } from '../config';

export default function LoginPage() {
    const { login, user, loading } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { company } = useCompany();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Already logged in → send them to the dashboard (or the original target).
    // Wait for the auth state to resolve so we don't flash the form on refresh.
    if (!loading && user) {
        return <Navigate to={searchParams.get('returnTo') || '/portal/dashboard'} replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            // Pass the current portal's company slug so the backend can enforce
            // that the user belongs to this company (multi-tenant isolation).
            const companySlug = company?.slug || import.meta.env.VITE_COMPANY_SLUG;
            const data = await loginUser(email, password, companySlug);
            login(data.access_token);

            // Decode token to get role
            jwtDecode(data.access_token);

            // Return the user to where their session expired, if known; otherwise the dashboard.
            const returnTo = searchParams.get('returnTo');
            navigate(returnTo || '/portal/dashboard');
        } catch (err: any) {
            console.error(err);
            setError('Invalid credentials');
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-surface px-4">
            {/* Soft brand-tinted backdrop (tracks the company theme color) */}
            <div className="pointer-events-none absolute inset-x-0 -top-40 flex justify-center">
                <div className="h-[420px] w-[680px] rounded-full bg-primary-100 blur-3xl opacity-60" />
            </div>

            <div className="relative w-full max-w-md">
                <div className="mb-6 flex flex-col items-center gap-3 text-center">
                    {/* <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-lg font-bold text-white shadow-glow">
                        {company?.name ? company.name.charAt(0) : 'D'}
                    </div> */}
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-ink">Welcome back</h1>
                        <p className="mt-1 text-sm text-muted">Sign in to {company?.name || 'your portal'}</p>
                    </div>
                </div>

                <div className="rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8">
                    {error && (
                        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">{error}</div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="mb-1.5 block text-sm font-semibold text-ink">Email</label>
                            <input
                                type="email"
                                className="w-full"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <div className="mb-1.5 flex items-center justify-between">
                                <label className="block text-sm font-semibold text-ink">Password</label>
                                <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">Forgot password?</Link>
                            </div>
                            <PasswordInput
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5 hover:opacity-95"
                        >
                            Sign in
                        </button>
                    </form>
                    <div className="mt-5 text-center">
                        <a href={homeUrl()} className="text-sm text-muted hover:text-primary transition-colors">← Back to home</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
