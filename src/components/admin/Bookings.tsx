import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { fetchBookings } from '../../api/booking-api';
import { searchInstructorsDropdown } from '../../api/instructor-api';
import { format } from 'date-fns';
import Spinner from '../Spinner';
import Pagination from '../Pagination';
import SearchableDropdown from '../SearchableDropdown';
import type { Booking } from '../../api/types/booking-response';
import BookingDetailsModal from '../BookingDetailsModal';

export default function Bookings() {
    const { user } = useAuth();

    // Filters & Pagination
    const [filterDate, setFilterDate] = useState('');
    const [filterInstructorId, setFilterInstructorId] = useState('');
    const [searchInstructorText, setSearchInstructorText] = useState('');
    const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<Booking | null>(null);
    const [page, setPage] = useState(1);
    const limit = 10;

    const loadInstructorOptions = useCallback(async (query: string) => {
        try {
            const data = await searchInstructorsDropdown(query);
            return data.map((inst: any) => ({ id: inst.id, label: inst.name }));
        } catch {
            return [];
        }
    }, []);

    // Data Fetching
    const { data, isLoading: isLoadingData } = useQuery({
        queryKey: ['adminBookings', page, filterDate, filterInstructorId],
        queryFn: () => fetchBookings({
            date: filterDate || undefined,
            instructorId: filterInstructorId || undefined,
            page,
            limit
        }),
        enabled: !!user,
    });

    const bookings = data?.data || [];
    const totalBookings = data?.total || 0;

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
              onChange={(e) => {
                setFilterDate(e.target.value);
                setPage(1);
              }}
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
                setFilterInstructorId("");
                setSearchInstructorText("");
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
            <button onClick={resetFilters} className="bg-gray-100 text-gray-600 px-4 py-2 rounded hover:bg-gray-200">
              Reset
            </button>
          </div>
        </div>

        {isLoadingData ? (
          <div className="flex justify-center items-center py-12">
            <Spinner text="Loading bookings..." />
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500  uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500  uppercase tracking-wider">Instructor</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500  uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500  uppercase tracking-wider">Suburb</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500  uppercase tracking-wider">Package</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500  uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500  uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking: any) => (
                    <tr
                      key={booking.id}
                      // className={booking.isManualBooking ? "bg-yellow-100" : ""}
                      className={`hover:bg-primary/[0.02] transition-colors cursor-pointer group ${booking.isManualBooking ? "bg-yellow-50/20" : ""}`}
                      onClick={() => setSelectedBookingForDetails(booking)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {booking.bookingSlots.map((slot: any, idx: number) => (
                            <div key={idx} className="py-1">
                              <>
                                <div className="text-sm font-medium text-gray-900">{slot ? format(new Date(slot.startTime), "PPP") : "N/A"}</div>
                                {format(new Date(slot.startTime), "h:mm a")} - {format(new Date(slot.endTime), "h:mm a")}
                              </>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{booking.instructor || "-"}</td>
                      <td className="px-6 py-4">
                        {booking.isManualBooking ? (
                          <div className="text-sm text-gray-900 font-medium">{booking.customerName || "-"}</div>
                        ) : (
                          <>
                            <div className="text-sm text-gray-900">
                              {booking?.bookingDetails?.customerFirstName} {booking?.bookingDetails?.customerLastName}
                            </div>
                            <div className="text-sm text-gray-500">{booking?.bookingDetails?.customerPhone}</div>
                            <div className="text-sm text-gray-500">{booking?.bookingDetails?.pickupAddress}</div>
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.suburb?.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-600 uppercase tracking-wide">
                          {booking.package}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-black text-primary">${booking.price}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm border ${booking.status === "CANCELLED" ? "bg-red-50 text-red-700 border-red-200" : booking.isManualBooking ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-green-50 text-green-700 border-green-200"}`}
                        >
                          {booking.isManualBooking ? "Manual" : booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        No bookings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination currentPage={page} totalPages={Math.ceil(totalBookings / limit)} onPageChange={setPage} />
          </>
        )}

        {selectedBookingForDetails && (
          <BookingDetailsModal
            isOpen ={true}
            onClose={setSelectedBookingForDetails}
            booking={selectedBookingForDetails}
          />
        )}
      </div>
    );
}
