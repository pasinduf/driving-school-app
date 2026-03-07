import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import TopBar from './TopBar';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../Spinner';
import { fetchCompanyBySlug } from '../../api/client';
import type { CompanyDetails } from '../../api/client';

export default function DashboardLayout() {
    const { user, loading } = useAuth();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);

    useEffect(() => {
        const loadCompany = async () => {
            try {
                let data: CompanyDetails | null = null;
                if (user) {
                     const slug = import.meta.env.VITE_COMPANY_SLUG;
                     if (slug) {
                       data = await fetchCompanyBySlug(slug);
                     }
                }
                if (data) {
                    setCompanyDetails(data);
                    if (data.themeColor) {
                        document.documentElement.style.setProperty('--color-primary', data.themeColor);
                    }
                }
            } catch (err) {
                console.error('Failed to load company details:', err);
            }
        };
        loadCompany();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Spinner size="lg" text="Loading dashboard..." />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            <TopBar />

            <div className="flex-1 flex overflow-hidden bg-gray-50 w-full">
                {/* Sidebar */}
                <Sidebar
                    collapsed={sidebarCollapsed}
                    setCollapsed={setSidebarCollapsed}
                    mobileMenuOpen={mobileMenuOpen}
                    setMobileMenuOpen={setMobileMenuOpen}
                    companyDetails={companyDetails}
                />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    {/* Header */}
                    <Header setMobileMenuOpen={setMobileMenuOpen} />

                    {/* Scrollable Content */}
                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}
