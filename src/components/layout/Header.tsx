import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../ConfirmationModal';

export default function Header({ setMobileMenuOpen }: { setMobileMenuOpen?: (v: boolean) => void }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogoutClick = () => {
        setMenuOpen(false);
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        setShowLogoutModal(false);
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 sticky top-0">

            {/* Mobile Menu Toggle + Breadcrumbs/Title Placeholder */}
            <div className="flex items-center flex-1">
                <button
                    onClick={() => setMobileMenuOpen && setMobileMenuOpen(true)}
                    className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-md"
                >
                    <Menu size={20} />
                </button>
                <span className="hidden md:block text-gray-500 font-medium ml-2">
                    Dashboard
                </span>
            </div>

            {/* User Dropdown */}
            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center space-x-3 hover:bg-gray-50 rounded-full py-1.5 px-3 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                >
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden md:block text-left">
                        <p className="text-sm font-medium text-gray-700 leading-none">{user.name}</p>
                        <p className="text-xs text-gray-500 mt-1 leading-none font-medium">{user.role}</p>
                    </div>
                </button>

                {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-100 ring-1 ring-black ring-opacity-5 animate-in fade-in slide-in-from-top-2">
                        <div className="px-4 py-3 border-b border-gray-100 md:hidden flex flex-col gap-0.5">
                            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate font-medium">{user.role}</p>
                            <p className="text-xs text-gray-500/80 truncate">{user.email}</p>
                        </div>

                        <button
                            onClick={() => { setMenuOpen(false); navigate('/portal/profile'); }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                            <User size={16} className="mr-2 text-gray-400" />
                             Profile
                        </button>
                        <div className="border-t border-gray-100 mt-1"></div>
                        <button
                            onClick={handleLogoutClick}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                        >
                            <LogOut size={16} className="mr-2 text-red-500" />
                            Logout
                        </button>
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={confirmLogout}
                isConfirming={false}
                title="Log Out"
                message="Are you sure you want to log out of your session?"
                confirmText="Log Out"
                variant="danger"
            />
        </header>
    );
}
