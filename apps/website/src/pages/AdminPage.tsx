import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Instructors from "../components/admin/Instructors";
import Packages from "../components/admin/Packages";
import Holidays from "../components/admin/Holidays";
import Spinner from '../components/Spinner';
import Bookings from '../components/admin/Bookings';
import Reviews from '../components/admin/Reviews';
import Settings from '../components/admin/Settings';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = location.pathname.includes('holidays')
    ? 'holidays'
    : location.pathname.includes('instructors')
      ? 'instructors'
      : location.pathname.includes('packages')
        ? 'packages'
        : location.pathname.includes('reviews')
          ? 'reviews'
          : location.pathname.includes('settings')
            ? 'settings'
            : 'bookings';

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading || !user) return <div className="p-8"><Spinner size="lg" text="Loading..." /></div>;

  return (
    <div className="w-full">
      <main className="w-full">
        {activeTab === "bookings" && <Bookings />}
        {activeTab === "holidays" && <Holidays />}
        {activeTab === "instructors" && <Instructors />}
        {activeTab === "packages" && <Packages />}
        {activeTab === "reviews" && <Reviews />}
        {activeTab === "settings" && <Settings />}
      </main>
    </div>
  );
}
