import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchMyBookings, cancelMyBooking } from '../api/booking-api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { parseBookingTime } from '../util/parseBookingTime';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Spinner from '../components/Spinner';
import Pagination from '../components/Pagination';
import ConfirmationModal from '../components/ConfirmationModal';

interface Booking {
  id: string;
  testingCenter: string;
  suburb: { name: string; postalcode: string };
  package: string;
  transmission: string;
  createdAt: string;
  status: string;
  price: string;
  instructor: string | null;
  bookingSlots: { startTime: string; endTime: string }[];
}

interface BookingsResponse {
  data: Booking[];
  total: number;
}

export default function StudentBookingsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data: bookingData, isLoading, isFetching, isError, refetch } = useQuery<BookingsResponse>({
    queryKey: ['my-bookings', page, limit],
    queryFn: () => fetchMyBookings(page, limit),
    placeholderData: keepPreviousData,
    enabled: !!user,
  });

  // keepPreviousData leaves isLoading false after the first fetch, so also rely on
  // isFetching to show the spinner during pagination and refetches.
  const isBookingsLoading = isLoading || isFetching;

  const bookings = bookingData?.data || [];
  const total = bookingData?.total || 0;

  // Cancellation State
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;
    setIsCancelling(true);
    try {
      await cancelMyBooking(bookingToCancel);
      toast.success('Booking cancelled successfully.');
      setIsCancelModalOpen(false);
      setBookingToCancel(null);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setIsCancelling(false);
    }
  };


  if (isError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 border border-red-100 rounded-xl p-8 max-w-md w-full shadow-sm flex flex-col items-center">
          <div className="flex justify-center mb-4 bg-red-100 p-3 rounded-full">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Bookings</h3>
          <p className="text-red-600 text-sm">Please try again later.</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h1>
      <main className="w-full">
        {isBookingsLoading ? (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Spinner size="lg" text="Loading bookings..." />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-gray-500">You have no bookings yet.</div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white shadow rounded-lg p-6 border border-gray-200">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{booking.package || "Driving Lesson"}</h3>
                    <p className="text-sm text-gray-500">Ref: {booking.id.substring(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <span
                      className={`px-3 py-1 inline-flex text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm border ${
                        booking.status === "CANCELLED"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : booking.status === "COMPLETED"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : booking.status === "PENDING"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-green-50 text-green-700 border-green-200"
                      }`}
                    >
                      {booking.status === "CONFIRMED" ? "PENDING" : booking.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <p className="font-medium">Schedule:</p>
                    <ul className="list-disc list-inside ml-2">
                      {booking.bookingSlots.map((slot, idx) => (
                        <li key={idx}>
                          {format(parseBookingTime(slot.startTime), "MMMM do yyyy, h:mm a")} - {format(parseBookingTime(slot.endTime), "h:mm a")}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p>
                      <span className="font-medium">Instructor:</span> {booking.instructor}
                    </p>
                    <p>
                      <span className="font-medium">Suburb:</span> {booking.suburb?.name} {booking.suburb?.postalcode}
                    </p>
                    <p>
                      <span className="font-medium">Transmission:</span> {booking.transmission}
                    </p>
                    <p>
                      <span className="font-medium">Price:</span> ${booking.price}
                    </p>
                    {booking.testingCenter && (
                      <p>
                        <span className="font-medium">Testing Center:</span> {booking.testingCenter}
                      </p>
                    )}
                  </div>
                </div>

                {booking.status === "CONFIRMED" && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={() => {
                        setBookingToCancel(booking.id);
                        setIsCancelModalOpen(true);
                      }}
                      className="px-4 py-2 text-sm font-bold rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      Cancel Booking
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Pagination */}
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </main>

      {/* Cancel Booking Confirmation Modal */}
      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setBookingToCancel(null);
        }}
        onConfirm={handleCancelBooking}
        isConfirming={isCancelling}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmText="Cancel"
        cancelText="Keep"
        variant="danger"
      />
    </>
  );
}
