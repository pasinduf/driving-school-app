import { useEffect, useState } from 'react';
import { fetchMyBookings } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { LogOut } from 'lucide-react';
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
    bookingSlots: { startTime: string; endTime: string }[];
}

export default function StudentBookingsPage() {
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (user) {
            loadBookings();
        }
    }, [user, page]);

    const loadBookings = async () => {
        setIsLoading(true);
        try {
            const data = await fetchMyBookings(page, limit);
            setBookings(data.data);
            setTotal(data.total);
        } catch (error) {
            console.error("Failed to fetch bookings", error);
        } finally {
            setIsLoading(false);
        }
    };

    const signout = () => {
        logout();
        navigate('/login');
    }

    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;

    const totalPages = Math.ceil(total / limit);

    return (

        <div className="min-h-screen bg-gray-50">

            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
                    <div className="flex items-center space-x-4">
                        <span className="h3">Welcome, {user.name}</span>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center text-red-600 hover:text-red-800"
                        >
                            <LogOut className="w-5 h-5 mr-1" /> Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isLoading ? (
                    <div>Loading bookings...</div>
                ) : bookings.length === 0 ? (
                    <div className="text-gray-500">You have no bookings yet.</div>
                ) : (
                    <div className="space-y-6">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="bg-white shadow rounded-lg p-6 border border-gray-200">
                                <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {booking.package || 'Driving Lesson'}
                                        </h3>
                                        <p className="text-sm text-gray-500">Ref: {booking.id.substring(0, 8)}</p>
                                    </div>
                                    <div className="mt-2 md:mt-0">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium 
                                            ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                                booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'}`}>
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
                                                    {format(new Date(slot.startTime), 'MMMM do yyyy, h:mm a')} - {format(new Date(slot.endTime), 'h:mm a')}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <p><span className="font-medium">Location:</span> {booking.suburb?.name} {booking.suburb?.postalcode}</p>
                                        <p><span className="font-medium">Transmission:</span> {booking.transmission}</p>
                                        <p><span className="font-medium">Price:</span> ${booking.price}</p>
                                        {booking.testingCenter && (
                                            <p><span className="font-medium">Testing Center:</span> {booking.testingCenter}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center space-x-2 mt-8">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 border rounded disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2">Page {page} of {totalPages}</span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 border rounded disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>


            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={signout}
                isConfirming={false}
                title="Confirm Logout"
                message="Are you sure you want to log out?"
                confirmText="Logout"
                variant="danger"
            />
        </div>
    );
}
