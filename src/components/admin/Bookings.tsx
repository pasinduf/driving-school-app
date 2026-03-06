import  { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchBookings, searchInstructorsDropdown } from '../../api/client';
import { format } from 'date-fns';
import Spinner from '../Spinner';
import Pagination from '../Pagination';
import SearchableDropdown from '../SearchableDropdown';

export default function Bookings() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Filters & Pagination
    const [filterDate, setFilterDate] = useState('');
    const [filterInstructorId, setFilterInstructorId] = useState('');
    const [searchInstructorText, setSearchInstructorText] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalBookings, setTotalBookings] = useState(0);

    const loadInstructorOptions = useCallback(async (query: string) => {
        try {
            const data = await searchInstructorsDropdown(query);
            return data.map((inst: any) => ({ id: inst.id, label: inst.name }));
        } catch {
            return [];
        }
    }, []);

    const loadBookingsOnly = async () => {
        setIsLoadingData(true);
        try {
            const bResponse = await fetchBookings({
                date: filterDate || undefined,
                instructorId: filterInstructorId || undefined,
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
        if (user) {
            loadBookingsOnly();
        }
    }, [user, page, filterDate, filterInstructorId]);

    const resetFilters = () => {
        setFilterDate('');
        setFilterInstructorId('');
        setSearchInstructorText('');
        setPage(1);
    };

    return (
        <div className="w-full">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Instructor</label>
                    <SearchableDropdown
                        placeholder="Search instructor..."
                        fetchOptions={loadInstructorOptions}
                        value={searchInstructorText}
                        hasSelection={!!filterInstructorId}
                        onClear={() => {
                            setFilterInstructorId('');
                            setSearchInstructorText('');
                        }}
                        onSelect={(opt: any) => {
                            if (opt) {
                                setFilterInstructorId(opt.id);
                                setSearchInstructorText(opt.label);
                            }
                        }}
                    />
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

            {isLoadingData ? (
                <div className="flex justify-center items-center py-12">
                    <Spinner size="lg" text="Loading data..." />
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Date & Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Instructor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Suburb</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Package</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {bookings.map((booking: any) => (
                                    <tr key={booking.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {booking.bookingSlots.map((slot: any, idx: number) => (
                                                    <div key={idx} className='py-1'>
                                                        <>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {slot ? format(new Date(slot.startTime), 'PPP') : 'N/A'}
                                                            </div>
                                                            {format(new Date(slot.startTime), 'h:mm a')} - {format(new Date(slot.endTime), 'h:mm a')}
                                                        </>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            {booking.instructor?.name || '-'}
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
                                    </tr>
                                ))}
                                {bookings.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500">No bookings found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        currentPage={page}
                        totalPages={Math.ceil(totalBookings / limit)}
                        onPageChange={setPage}
                    />
                </>
            )}
        </div>
    );
}
