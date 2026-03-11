import React, { createContext, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCompanyBySlug } from '../api/company-api';
import type { CompanyDetails } from '../api/company-api';
import Spinner from '../components/Spinner';

interface CompanyContextType {
    company: CompanyDetails | null;
    isLoading: boolean;
    error: any;
}

export const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const companySlug = import.meta.env.VITE_COMPANY_SLUG;

    const { data: company = null, isLoading, error } = useQuery({
        queryKey: ['company', companySlug],
        queryFn: () => fetchCompanyBySlug(companySlug),
        enabled: !!companySlug,
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    useEffect(() => {
        if (company) {
            // Store companyId so the API client interceptor can use it
            localStorage.setItem('companyId', company.id);

            // Apply dynamic theme color
            if (company.themeColor) {
                document.documentElement.style.setProperty('--color-primary', company.themeColor);
            }

            // Set page title
            document.title = `${company.name} | Portal`;
        }
    }, [company]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
                    {/* Icon */}
                    <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                        </svg>
                    </div>

                    {/* Heading */}
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Company Not Found</h1>
                    <p className="text-gray-500 mb-6 leading-relaxed">
                        We couldn't locate the company associated with this portal.
                        This may be because the company is inactive or the configuration is incorrect.
                    </p>

                    {/* Suggestions */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">What you can try</p>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                                <span className="text-gray-400 mt-0.5">•</span>
                                Check that the portal URL is correct
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-gray-400 mt-0.5">•</span>
                                Contact your administrator for assistance
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-gray-400 mt-0.5">•</span>
                                Try refreshing the page
                            </li>
                        </ul>
                    </div>

                    {/* Action */}
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-2.5 px-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <CompanyContext.Provider value={{ company, isLoading, error }}>
            {children}
        </CompanyContext.Provider>
    );
};

export const useCompany = () => {
    const context = useContext(CompanyContext);
    if (context === undefined) {
        throw new Error('useCompany must be used within a CompanyProvider');
    }
    return context;
};
