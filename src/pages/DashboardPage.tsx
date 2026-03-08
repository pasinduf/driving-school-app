import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchDashboardMetrics } from '../api/client';
import { Users, CarFront, DollarSign, Calendar } from 'lucide-react';
import Spinner from '../components/Spinner';

export default function DashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await fetchDashboardMetrics();
      setMetrics(data);
    } catch (error) {
      console.error("Failed to load metrics", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center min-h-[50vh]">
        <Spinner text="Loading dashboard metrics..." />
      </div>
    );
  }

  if (!user || !metrics) return null;

  const role = user.role;

  // Formatting helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Welcome back, {user.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Admin Cards */}
        {role === "Admin" && (
          <>
            <MetricCard
              title="Total Active Instructors"
              value={metrics.totalInstructors || 0}
              icon={<Users className="w-6 h-6 text-blue-600" />}
              gradient="from-blue-50 to-blue-100/50"
            />
            <MetricCard
              title="Global Bookings"
              value={metrics.totalBookings || 0}
              icon={<CarFront className="w-6 h-6 text-indigo-600" />}
              gradient="from-indigo-50 to-indigo-100/50"
            />
            <MetricCard
              title="Total Estimated Revenue"
              value={formatCurrency(metrics.totalRevenue || 0)}
              icon={<DollarSign className="w-6 h-6 text-emerald-600" />}
              gradient="from-emerald-50 to-emerald-100/50"
            />
          </>
        )}

        {/* Instructor Cards */}
        {role === "Instructor" && (
          <>
            <MetricCard
              title="My Total Bookings"
              value={metrics.totalBookings || 0}
              icon={<CarFront className="w-6 h-6 text-purple-600" />}
              gradient="from-purple-50 to-purple-100/50"
            />
            <MetricCard
              title="Unique Students Taught"
              value={metrics.totalStudents || 0}
              icon={<Users className="w-6 h-6 text-orange-600" />}
              gradient="from-orange-50 to-orange-100/50"
            />
            <MetricCard
              title="Total Revenue Earned"
              value={formatCurrency(metrics.totalRevenue || 0)}
              icon={<DollarSign className="w-6 h-6 text-emerald-600" />}
              gradient="from-emerald-50 to-emerald-100/50"
            />
          </>
        )}

        {/* Student Cards */}
        {role === "Student" && (
          <>
            <MetricCard
              title="Total Lessons Booked"
              value={metrics.totalBookings || 0}
              icon={<Calendar className="w-6 h-6 text-blue-600" />}
              gradient="from-blue-50 to-blue-100/50"
            />
            <MetricCard
              title="Overall Amount Spent"
              value={formatCurrency(metrics.totalSpent || 0)}
              icon={<DollarSign className="w-6 h-6 text-emerald-600" />}
              gradient="from-emerald-50 to-emerald-100/50"
            />
          </>
        )}
      </div>
    </div>
  );
}

// Simple internal component for UI consistency
function MetricCard({ title, value, icon, gradient }: { title: string, value: string | number, icon: React.ReactNode, gradient: string }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between transition-transform hover:-translate-y-1 hover:shadow-md`}>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
      </div>
      <div className="bg-white p-3 rounded-xl shadow-sm">
        {icon}
      </div>
    </div>
  );
}
