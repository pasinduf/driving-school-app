import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSlots, lockSlot, confirmBooking, unlockSlot } from '../api/client';
import type { Suburb, Slot } from '../api/client';
import { format, parseISO } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import BookingForm from '../components/BookingForm';
import SlotGrid from '../components/SlotGrid';
import { useMasterData } from '../context/MasterDataContext';

export default function BookingPage() {
    const [step, setStep] = useState(1);
    const [selectedSuburb, setSelectedSuburb] = useState<Suburb | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [duration, setDuration] = useState<number>(60);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [lockToken, setLockToken] = useState<string | null>(null);
    const [lockExpiry, setLockExpiry] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [successData, setSuccessData] = useState<any | null>(null);

    // Fetch Suburbs using useMasterData hook
    const { suburbs, loading: loadingSuburbs } = useMasterData();

    // Fetch Slots (Enabled when suburb and date selected)
    const { data: slots, isLoading: loadingSlots, refetch: refetchSlots } = useQuery({
        queryKey: ['slots', selectedSuburb?.id, selectedDate, duration],
        queryFn: () => fetchSlots(selectedSuburb!.id, selectedDate, duration),
        enabled: !!selectedSuburb && !!selectedDate,
    });

    // Timer Effect
    useEffect(() => {
        if (!lockExpiry) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const diff = lockExpiry - now;

            if (diff <= 0) {
                clearInterval(interval);
                setTimeLeft('0:00');
                toast.error('Session expired. Please select a slot again.', {
                    duration: 5000,
                    cancel: { label: 'Dismiss', onClick: () => { } }
                });
                setStep(1);
                setLockToken(null);
                setLockExpiry(null);
                setSelectedSlot(null);
                refetchSlots();
                return;
            }

            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(interval);
    }, [lockExpiry, refetchSlots]);

    const handleSlotClick = (slot: Slot) => {
        setSelectedSlot(slot);
        // Reset lock if changing slot (though we haven't locked yet in this new flow)
        if (lockToken) {
            setLockToken(null);
            setLockExpiry(null);
        }
    };

    // Handle Next Step (Locking)
    const handleNextStep = async () => {
        if (!selectedSlot || !selectedSuburb) return;

        try {
            const time = format(parseISO(selectedSlot.startTime), 'HH:mm');
            const result = await lockSlot(selectedSuburb.id, selectedDate, time); // API call
            setLockToken(result.token);
            setLockExpiry(result.expiresAt);
            setTimeLeft('5:00'); // Initial display
            setStep(2); // Move to form
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to lock slot. It may be taken.', {
                cancel: { label: 'Dismiss', onClick: () => { } }
            });
            refetchSlots(); // Refresh grid
            setSelectedSlot(null);
        }
    };

    // Handle Booking Confirmation
    const handleConfirm = async (formData: any) => {
        if (!selectedSuburb || !selectedSlot || !lockToken) return;

        try {
            const time = format(parseISO(selectedSlot.startTime), 'HH:mm');
            const result = await confirmBooking({
                suburbId: selectedSuburb.id,
                date: selectedDate,
                time: time,
                duration: duration,
                token: lockToken,
                customerDetails: formData
            });
            setSuccessData(result);
            setStep(3); // Move to success
            toast.success('Your driving lesson request has been submitted.', {
                cancel: { label: 'Dismiss', onClick: () => { } }
            });
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Booking failed. Please try again.', {
                cancel: { label: 'Dismiss', onClick: () => { } }
            });
            // If lock expired, we might need to reset
            if (err.response?.status === 400) {
                setStep(1);
                setLockToken(null);
                setLockExpiry(null);
                setSelectedSlot(null);
                refetchSlots();
            }
        }
    };

    if (step === 3 && successData) {
        return (
            <div className="max-w-2xl mx-auto p-8 text-center">
                <div className="bg-yellow-100 text-yellow-800 p-6 rounded-lg mb-6">
                    <h2 className="text-2xl font-bold mb-2">Booking Submitted!</h2>
                    <p>Your driving lesson request has been submitted and is pending confirmation from an instructor. You will receive an email once confirmed.</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-left bg-white p-6 rounded shadow border">
                    <div><strong>Date:</strong> {format(parseISO(successData.startTime), 'EEEE, MMMM d, yyyy')}</div>
                    <div><strong>Time:</strong> {format(parseISO(successData.startTime), 'h:mm a')}</div>
                    <div><strong>Location:</strong> {selectedSuburb?.name}</div>
                    <div><strong>Pickup:</strong> {successData.pickupAddress}</div>
                </div>
                <button onClick={() => window.location.reload()} className="mt-8 px-6 py-2 bg-primary text-white rounded hover:bg-red-700">
                    Book Another Lesson
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Book a Driving Lesson</h1>

            {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Filters */}
                    <div className="md:col-span-1 space-y-6 bg-white p-6 rounded-lg shadow-sm border h-fit">
                        <div>
                            <label className="block text-sm font-medium mb-1">Suburb</label>
                            {loadingSuburbs ? <Loader2 className="animate-spin text-gray-500" /> : (
                                <select
                                    className="w-full border p-2 rounded"
                                    onChange={(e) => setSelectedSuburb(suburbs?.find(s => s.id === e.target.value) || null)}
                                    value={selectedSuburb?.id || ''}
                                >
                                    <option value="">Select a suburb...</option>
                                    {suburbs?.map(s => <option key={s.id} value={s.id}>{s.name} ({s.postcode})</option>)}
                                </select>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Date</label>
                            <input
                                type="date"
                                className="w-full border p-2 rounded"
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                value={selectedDate}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Duration</label>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => {
                                        setDuration(60);
                                        setSelectedSlot(null);
                                    }}
                                    className={`flex-1 py-2 rounded border ${duration === 60 ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300'}`}
                                >
                                    1 Hour
                                </button>
                                <button
                                    onClick={() => {
                                        setDuration(120);
                                        setSelectedSlot(null);
                                    }}
                                    className={`flex-1 py-2 rounded border ${duration === 120 ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300'}`}
                                >
                                    2 Hours
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Slots */}
                    <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm border min-h-[400px] flex flex-col">
                        <h2 className="text-xl font-semibold mb-4">Available Slots</h2>
                        <div className="flex-grow">
                            {!selectedSuburb || !selectedDate ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                    <p>Please select a suburb and date to view availability.</p>
                                </div>
                            ) : (
                                <SlotGrid
                                    slots={slots || []}
                                    isLoading={loadingSlots}
                                    onSelect={handleSlotClick}
                                    selectedSlot={selectedSlot}
                                />
                            )}
                        </div>

                        {/* Next Button */}
                        <div className="mt-6 pt-4 border-t flex justify-end">
                            <button
                                onClick={handleNextStep}
                                disabled={!selectedSlot}
                                className={`px-6 py-2 rounded-md font-medium transition-colors ${selectedSlot
                                    ? 'bg-primary text-white hover:bg-red-700'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Next Step
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow text-left">
                    <div className="mb-6 pb-4 border-b flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold">Complete Your Booking</h2>
                            <p className="text-gray-500 text-sm">
                                {selectedSuburb?.name} • {selectedDate} • {format(parseISO(selectedSlot!.startTime), 'h:mm a')} ({duration} mins)
                            </p>
                        </div>
                        <div className="text-right text-sm text-red-600 bg-red-50 px-3 py-1 rounded">
                            Expires in {timeLeft}
                        </div>
                    </div>

                    <BookingForm
                        onCancel={async () => {
                            if (selectedSuburb && selectedSlot && lockToken) {
                                try {
                                    const time = format(parseISO(selectedSlot.startTime), 'HH:mm');
                                    await unlockSlot(selectedSuburb.id, selectedDate, time, lockToken);
                                } catch (e) {
                                    console.error('Failed to unlock slot', e);
                                }
                            }
                            setStep(1);
                            setLockToken(null);
                            setLockExpiry(null);
                            setSelectedSlot(null);
                            refetchSlots();
                        }}
                        onSubmit={handleConfirm}
                        isSubmitting={false}
                    />
                </div>
            )}
        </div>
    );
}
