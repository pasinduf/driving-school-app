import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import {
  fetchDashboardMetrics,
  fetchDashboardSummary,
  fetchBookingChart,
  fetchRecentBookingsAnalytics,
  type DashboardMetric,
} from '../api/misc-api';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Spinner from '../components/Spinner';
import BookingBarChart from '../components/dashboard/BookingBarChart';
import { format } from 'date-fns';
import { parseBookingTime } from '../util/parseBookingTime';
import BookingDetailsModal from '../components/BookingDetailsModal';
import type { Booking } from '../api/types/booking-response';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === 'Admin' || user.role === 'Instructor') {
    return <AnalyticsDashboard />;
  }

  return <StudentDashboard />;
}

/* -------------------------------------------------------------------------- */
/* Admin & Instructor analytics dashboard                                     */
/* -------------------------------------------------------------------------- */

function AnalyticsDashboard() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: fetchDashboardSummary,
    enabled: !!user,
  });

  const { data: chart, isLoading: chartLoading, isFetching: chartFetching } = useQuery({
    queryKey: ['bookingChart', period],
    queryFn: () => fetchBookingChart(period),
    placeholderData: keepPreviousData,
    enabled: !!user,
  });

  const { data: recent = [], isLoading: recentLoading } = useQuery<Booking[]>({
    queryKey: ['recentBookingsAnalytics'],
    queryFn: fetchRecentBookingsAnalytics,
    enabled: !!user,
  });

  if (summaryLoading) {
    return (
      <div className="flex-1 flex justify-center items-center min-h-[50vh]">
        <Spinner text="Loading dashboard..." />
      </div>
    );
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="max-w-7xl mx-auto">
      <p className="text-sm font-medium text-gray-400">Welcome Back</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Operations overview</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <SummaryCard title="Revenue (month)" value={summary ? formatCurrency(summary.revenue.value) : "—"} metric={summary?.revenue} />
        <SummaryCard title="Lessons booked (month)" value={summary ? summary.lessons.value.toLocaleString() : "—"} metric={summary?.lessons} />
        <SummaryCard title="No-show rate (month)" value={summary ? `${summary.noShow.value}%` : "—"} metric={summary?.noShow} changeSuffix="%" />
      </div>

      {/* Analytics + Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-gray-900">Bookings this {period}</h2>
            <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
              {(["week", "month", "year"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-all ${
                    period === p ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {chartLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Spinner text="Loading chart..." />
            </div>
          ) : (
            <div className={chartFetching ? "opacity-60 transition-opacity" : "transition-opacity"}>
              <BookingBarChart data={chart?.data ?? []} />
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Recent Bookings</h2>
          {recentLoading ? (
            <div className="py-10 flex justify-center">
              <Spinner size="sm" />
            </div>
          ) : recent.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">No recent bookings.</div>
          ) : (
            <div className="space-y-1">
              {recent.map((booking) => (
                <RecentBookingItem key={booking.id} booking={booking} onClick={() => setSelectedBooking(booking)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedBooking && <BookingDetailsModal isOpen={true} onClose={() => setSelectedBooking(null)} booking={selectedBooking} />}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  metric,
  changeSuffix = '%',
}: {
  title: string;
  value: string;
  metric?: DashboardMetric;
  changeSuffix?: string;
}) {
  const change = metric?.change ?? 0;
  const good = metric?.isPositiveTrend ?? true;
  const changeLabel = `${change >= 0 ? '+' : ''}${change}${changeSuffix}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-sm font-medium text-gray-900 mb-1">{title}</p>
      <h3 className="text-2xl sm:text-3xl font-bold text-primary-500">{value}</h3>
      {metric && (
        <div className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${good ? "text-emerald-600" : "text-red-500"}`}>
          {change >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {changeLabel}
        </div>
      )}
    </div>
  );
}

function RecentBookingItem({ booking, onClick }: { booking: Booking; onClick: () => void }) {
  const name = booking.isManualBooking
    ? booking.customerName || 'Manual Booking'
    : [booking.bookingDetails?.customerFirstName, booking.bookingDetails?.customerLastName].filter(Boolean).join(' ') || 'Web Booking';

  const initials =
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || '?';

  const slots = booking.bookingSlots ?? [];
  const firstSlot = slots[0];
  const extraSlots = slots.length - 1;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left"
    >
      <div className="w-10 h-10 shrink-0 rounded-full bg-indigo-50 text-primary-500 flex items-center justify-center text-xs font-bold">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
        <p className="text-xs text-gray-500 truncate">
          {[booking.package, booking.instructor].filter(Boolean).join(' · ') || '—'}
        </p>
      </div>
      <div className="text-right shrink-0">
        {firstSlot ? (
          <>
            <p className="text-xs font-medium text-gray-900">{format(parseBookingTime(firstSlot.startTime), 'd MMM')}</p>
            <p className="text-[11px] text-gray-500">
              {format(parseBookingTime(firstSlot.startTime), 'h:mm a')}
              {extraSlots > 0 && <span className="text-gray-400"> +{extraSlots}</span>}
            </p>
          </>
        ) : (
          <p className="text-xs text-gray-400">—</p>
        )}
      </div>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Student dashboard (unchanged behaviour)                                    */
/* -------------------------------------------------------------------------- */

function StudentDashboard() {
  const { user } = useAuth();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: fetchDashboardMetrics,
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center min-h-[50vh]">
        <Spinner text="Loading dashboard metrics..." />
      </div>
    );
  }

  if (!metrics) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount);

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Welcome back</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <SummaryCard title="Total Lessons Booked" value={(metrics.totalBookings || 0).toLocaleString()} />
        <SummaryCard title="Overall Amount Spent" value={formatCurrency(metrics.totalSpent || 0)} />
      </div>
    </div>
  );
}
