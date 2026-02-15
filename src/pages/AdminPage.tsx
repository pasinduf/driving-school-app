
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMasterData } from '../context/MasterDataContext';
import { useNavigate } from 'react-router-dom';
import { fetchBookings, fetchHolidays, createHoliday, deleteHoliday, confirmBookingAdmin, cancelBookingAdmin } from '../api/client';
import { format } from 'date-fns';
import { Calendar, Users, LogOut, Plus, Trash2, Check, X } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import Spinner from '../components/Spinner';
import Pagination from '../components/Pagination';
import { toast } from 'sonner';

export default function AdminPage() {
    const { user, logout, loading } = useAuth();
    const { suburbs, testingCenters } = useMasterData();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'bookings' | 'holidays'>('bookings');
    const [bookings, setBookings] = useState<any[]>([]);
    const [holidays, setHolidays] = useState<any[]>([]);

    const [isLoadingData, setIsLoadingData] = useState(false);

    // Filters & Pagination
    const [filterDate, setFilterDate] = useState('');
    const [filterSuburb, setFilterSuburb] = useState('');
    const [filterCenter, setFilterCenter] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalBookings, setTotalBookings] = useState(0);

    // Holiday Form
    const [holidayDate, setHolidayDate] = useState('');
    const [holidayReason, setHolidayReason] = useState('');
    const [holidaySuburb, setHolidaySuburb] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState<'CONFIRM_BOOKING' | 'CANCEL_BOOKING' | 'DELETE_HOLIDAY' | 'LOGOUT' | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const [isConfirming, setIsConfirming] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login', { replace: true });
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user, activeTab]);

    const loadData = async () => {
        setIsLoadingData(true);
        try {
            const [bookingResponse, holidayResponse] = await Promise.all([
                fetchBookings({
                    date: filterDate || undefined,
                    suburbId: filterSuburb || undefined,
                    page,
                    limit
                }),
                fetchHolidays()
            ]);
            setBookings(bookingResponse.data);
            setTotalBookings(bookingResponse.total);
            setHolidays(holidayResponse);
        } catch (error) {
            console.error("Failed to load admin data", error);
        } finally {
            setIsLoadingData(false);
        }
    };


    const loadBookingsOnly = async () => {
        setIsLoadingData(true); // localize logic if needed
        try {
            const bResponse = await fetchBookings({
                date: filterDate || undefined,
                suburbId: filterSuburb || undefined,
                centerId: filterCenter || undefined,
                page,
                limit
            });
            setBookings(bResponse.data);
            setTotalBookings(bResponse.total);
        } catch (error) {
            console.error("Failed to load bookings", error);
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        if (user && activeTab === 'bookings') {
            loadBookingsOnly();
        }
    }, [user, page, filterDate, filterCenter, filterSuburb]); // Trigger on filter/page change

    const handleLogout = () => {
        setModalAction('LOGOUT');
        setIsModalOpen(true);
    };

    const handleAddHoliday = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createHoliday(holidayDate, holidayReason, holidaySuburb || undefined);
            setHolidayDate('');
            setHolidayReason('');
            setHolidaySuburb('');
            const h = await fetchHolidays();
            setHolidays(h);
        } catch (error) {
            console.error("Failed to create holiday", error);
            alert("Failed to create holiday");
        }
    };

    const openModal = (action: 'CONFIRM_BOOKING' | 'CANCEL_BOOKING' | 'DELETE_HOLIDAY', id: string) => {
        setModalAction(action);
        setSelectedId(id);
        setIsModalOpen(true);
    };

    const executeAction = async () => {
        if (!modalAction) return;
        if (modalAction !== 'LOGOUT' && !selectedId) return;

        try {
            if (modalAction === 'DELETE_HOLIDAY' && selectedId) {
                await deleteHoliday(selectedId);
                fetchHolidays();
            } else if (modalAction === 'CONFIRM_BOOKING' && selectedId) {
                setIsConfirming(true);
                await confirmBookingAdmin(selectedId);
                toast.success('Booking confirmed successfully');
                loadBookingsOnly();
            } else if (modalAction === 'CANCEL_BOOKING' && selectedId) {
                setIsConfirming(true);
                await cancelBookingAdmin(selectedId);
                toast.success('Booking cancelled successfully');
                loadBookingsOnly()
            } else if (modalAction === 'LOGOUT') {
                logout();
                navigate('/login');
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Action failed");
        } finally {
            setIsConfirming(false);
            setIsModalOpen(false);
            setModalAction(null);
            setSelectedId(null);
        }
    };

    // Kept for prop drilling compatibility if needed, but updated to use modal
    const handleDeleteHoliday = (id: string) => openModal('DELETE_HOLIDAY', id);
    const handleConfirmBooking = (id: string) => openModal('CONFIRM_BOOKING', id);
    const handleCancelBooking = (id: string) => openModal('CANCEL_BOOKING', id);

    const resetFilters = () => {
        setFilterDate('');
        setFilterCenter('');
        setFilterSuburb('');
        setPage(1);
    };

    if (loading || !user) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-600">Welcome, {user.email}</span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center text-red-600 hover:text-red-800"
                        >
                            <LogOut className="w-5 h-5 mr-1" /> Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                {/* ... existing tabs code ... */}
                <div className="flex space-x-4 mb-6 border-b">
                    <button
                        onClick={() => setActiveTab('bookings')}
                        className={`pb-2 px-4 flex items-center ${activeTab === 'bookings'
                            ? 'border-b-2 border-primary text-primary font-medium'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Users className="w-5 h-5 mr-2" /> Bookings
                    </button>
                    <button
                        onClick={() => setActiveTab('holidays')}
                        className={`pb-2 px-4 flex items-center ${activeTab === 'holidays'
                            ? 'border-b-2 border-primary text-primary font-medium'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Calendar className="w-5 h-5 mr-2" /> Holidays & Leaves
                    </button>
                </div>

                {/* Filters (only for bookings tab) */}
                {activeTab === 'bookings' && (
                    <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Date</label>
                            <input
                                type="date"
                                className="w-full border rounded p-2"
                                value={filterDate}
                                onChange={(e) => { setFilterDate(e.target.value); setPage(1); }}
                            />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Center</label>
                            <select
                                className="w-full border rounded p-2"
                                value={filterCenter}
                                onChange={(e) => { setFilterCenter(e.target.value); setPage(1); }}
                            >
                                <option value="">All Centers</option>
                                {testingCenters.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Suburb</label>
                            <select
                                className="w-full border rounded p-2"
                                value={filterSuburb}
                                onChange={(e) => { setFilterSuburb(e.target.value); setPage(1); }}
                            >
                                <option value="">All Suburbs</option>
                                {suburbs.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.postalcode})</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-none">
                            <button
                                onClick={resetFilters}
                                className="bg-gray-100 text-gray-600 px-4 py-2 rounded hover:bg-gray-200"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                )}

                {isLoadingData ? (
                    <div className="flex justify-center items-center py-12">
                        <Spinner size="lg" text="Loading data..." />
                    </div>
                ) : (
                    <>
                        {activeTab === 'bookings' && (
                            <>
                                <div className="bg-white rounded-lg shadow overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Date & Time</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Center</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Customer</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Suburb</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Package</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Amount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {bookings.map((booking: any) => (
                                                <tr key={booking.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {booking.bookingSlots?.[0] ? format(new Date(booking.bookingSlots[0].startTime), 'PPP') : 'N/A'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {booking.bookingSlots?.[0] ? (
                                                                <>
                                                                    {format(new Date(booking.bookingSlots[0].startTime), 'p')} - {format(new Date(booking.bookingSlots[booking.bookingSlots.length - 1].endTime), 'p')}
                                                                </>
                                                            ) : 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {booking.testingCenter}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900">{booking?.bookingDetails.customerFirstName} {booking?.bookingDetails.customerLastName}</div>
                                                        <div className="text-sm text-gray-500">{booking?.bookingDetails?.customerPhone}</div>
                                                        <div className="text-sm text-gray-500">{booking?.bookingDetails?.pickupAddress}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {booking.suburb?.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {booking.package}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {booking.price}$
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.status === 'CONFIRMED'
                                                            ? 'bg-green-100 text-green-800'
                                                            : booking.status === 'PENDING'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'
                                                            }`}>
                                                            {booking.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                        {booking.status === 'PENDING' && (
                                                            <button
                                                                onClick={() => handleConfirmBooking(booking.id)}
                                                                className="text-green-600 hover:text-green-900"
                                                                title="Confirm Booking"
                                                            >
                                                                <Check className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                        {booking.status !== 'CANCELLED' && (
                                                            <button
                                                                onClick={() => handleCancelBooking(booking.id)}
                                                                className="text-red-600 hover:text-red-900 pl-3"
                                                                title="Cancel Booking"
                                                            >
                                                                <X className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {bookings.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No bookings found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <Pagination
                                    itemCount={bookings.length}
                                    page={page}
                                    setPage={setPage}
                                    total={totalBookings}
                                    limit={limit}
                                />
                            </>
                        )}

                        {activeTab === 'holidays' && (
                            <div className="space-y-6">
                                {/* Add Holiday Form */}
                                <div className="bg-white p-6 rounded-lg shadow">
                                    <h3 className="text-lg font-medium mb-4 flex items-center">
                                        <Plus className="w-5 h-5 mr-2" /> Add Leave / Block Date
                                    </h3>
                                    <form onSubmit={handleAddHoliday} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                            <input
                                                type="date"
                                                className="w-full border rounded p-2"
                                                value={holidayDate}
                                                onChange={e => setHolidayDate(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                                            <input
                                                type="text"
                                                className="w-full border rounded p-2"
                                                placeholder="e.g. Public Holiday, Leave"
                                                value={holidayReason}
                                                onChange={e => setHolidayReason(e.target.value)}
                                                required
                                            />
                                        </div>
                                        {/* <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Suburb (Optional)</label>
                                            <select
                                                className="w-full border rounded p-2"
                                                value={holidaySuburb}
                                                onChange={e => setHolidaySuburb(e.target.value)}
                                            >
                                                <option value="">All Suburbs (Global)</option>
                                                {suburbs.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name} ({s.postalcode})</option>
                                                ))}
                                            </select>
                                        </div> */}
                                        <button
                                            type="submit"
                                            className="bg-primary text-white p-2 rounded hover:bg-red-700"
                                        >
                                            Save
                                        </button>
                                    </form>
                                </div>

                                {/* Holidays List */}
                                <div className="bg-white rounded-lg shadow overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suburb</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {holidays.map((holiday: any) => (
                                                <tr key={holiday.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {format(new Date(holiday.date), 'PPP')}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {holiday.reason}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {holiday.suburbId ? suburbs.find(s => s.id === holiday.suburbId)?.name || 'Unknown Suburb' : 'Global (All Suburbs)'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => handleDeleteHoliday(holiday.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {holidays.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No active blocks found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={executeAction}
                isConfirming={isConfirming}
                title={
                    modalAction === 'CONFIRM_BOOKING'
                        ? 'Confirm Booking'
                        : modalAction === 'CANCEL_BOOKING'
                            ? 'Cancel Booking'
                            : modalAction === 'DELETE_HOLIDAY'
                                ? 'Delete Holiday'
                                : 'Confirm Logout'
                }
                message={
                    modalAction === 'CONFIRM_BOOKING'
                        ? 'Are you sure you want to confirm this booking?'
                        : modalAction === 'CANCEL_BOOKING'
                            ? 'Are you sure you want to cancel this booking? This action cannot be undone.'
                            : modalAction === 'DELETE_HOLIDAY'
                                ? 'Are you sure you want to remove this holiday/block?'
                                : 'Are you sure you want to log out?'
                }
                confirmText={modalAction === 'CONFIRM_BOOKING' ? 'Confirm' : modalAction === 'LOGOUT' ? 'Logout' : 'Proceed'}
                variant={modalAction === 'CONFIRM_BOOKING' ? 'primary' : 'danger'}
            />
        </div>
    );
}
