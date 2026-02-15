
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from './Footer';

export default function Layout() {
    const { user } = useAuth();
    const location = useLocation();

    // Show full navigation if:
    // 1. User is NOT logged in
    // 2. OR User is logged in but is on the Home page
    const showFullNav = !user || location.pathname === '/';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Bar */}
            <div className="bg-gray-900 text-white text-sm py-2">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">

                    {/* Left content */}
                    <div className="flex space-x-4">
                        <span>📞 (02) 1234 5678</span>
                        <span>✉ info@drivingschool.com.au</span>
                    </div>

                    {/* Right content */}
                    <div className="ml-auto flex items-center space-x-6">
                        <span className="hidden sm:block">
                            ⏲ Mon - Sat : 8AM - 6PM
                        </span>

                        <Link
                            to="/portal"
                            className="hover:text-primary transition-colors underline"
                        >
                            LOGIN
                        </Link>
                    </div>

                </div>
            </div>


            {/* Main Header */}
            <header className="bg-white shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="text-3xl font-bold text-primary tracking-tight" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        DRIVING<span className="text-gray-900">SCHOOL</span>
                    </Link>

                    {/* Desktop Components */}
                    <div className="hidden md:flex items-center space-x-8">
                        <nav className="flex space-x-6 font-medium text-gray-700">
                            <Link to="/" className="hover:text-primary transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>HOME</Link>
                            {showFullNav && (
                                <>
                                    <a href="/#about" className="hover:text-primary transition-colors">ABOUT</a>
                                    <a href="/#packages" className="hover:text-primary transition-colors">PACKAGES</a>
                                    <a href="/#testimonial" className="hover:text-primary transition-colors">TESTIMONIAL</a>
                                    <a href="/#contact" className="hover:text-primary transition-colors">CONTACT</a>
                                </>
                            )}
                        </nav>
                        {showFullNav && (
                            <Link
                                to="/booking"
                                className="px-6 py-3 bg-primary text-white font-bold rounded shadow-lg hover:bg-red-700 transition-transform transform hover:scale-105"
                            >
                                BOOK LESSON
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button className="text-gray-700 hover:text-primary focus:outline-none">
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
