import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchMyBookings } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import Spinner from '../components/Spinner';
import Pagination from '../components/Pagination';

interface Booking {
    id: string;
    testingCenter: string;
    suburb: { name: string; postalcode: string };
    package: string;
    transmission: string;
    createdAt: string;
    status: string;
    price: string;
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

    const { data: bookingData, isLoading, isError } = useQuery<BookingsResponse>({
        queryKey: ['my-bookings', page, limit],
        queryFn: () => fetchMyBookings(page, limit),
        placeholderData: keepPreviousData,
        enabled: !!user,
    });

    const bookings = bookingData?.data || [];
    const total = bookingData?.total || 0;


    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-500">Failed to load bookings. Please try again later.</div>
            </div>
        );
    }

    const totalPages = Math.ceil(total / limit);

    return (
      <main className="w-full">
        {isLoading ? (
          <div>
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
                    <p className="text-sm text-gray-500">Ref: {booking.id.substring(0, 8)}</p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium 
                                            ${
                                              booking.status === "CONFIRMED"
                                                ? "bg-green-100 text-green-800"
                                                : booking.status === "PENDING"
                                                  ? "bg-yellow-100 text-yellow-800"
                                                  : "bg-red-100 text-red-800"
                                            }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <p className="font-medium">Schedule:</p>
                    <ul className="list-disc list-inside ml-2">
                      {booking.bookingSlots.map((slot, idx) => (
                        <li key={idx}>
                          {format(new Date(slot.startTime), "MMMM do yyyy, h:mm a")} - {format(new Date(slot.endTime), "h:mm a")}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p>
                      <span className="font-medium">Location:</span> {booking.suburb?.name} {booking.suburb?.postalcode}
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
              </div>
            ))}

            {/* Pagination */}
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </main>
    );
}
