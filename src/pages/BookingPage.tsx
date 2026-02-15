
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSlots, lockSlots, createBooking, unlockSlots } from '../api/client';
import type { Suburb, Slot, TestingCenter } from '../api/client';
import { format, parseISO } from 'date-fns';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import BookingForm from '../components/BookingForm';
import PackageSelect from '../components/PackageSelect';
import DateDropdown from '../components/DateDropdown';
import { useMasterData } from '../context/MasterDataContext';
import BookingStepper from '../components/BookingStepper';
import Spinner from '../components/Spinner';

interface Package {
    id: string;
    name: string;
    description: string;
    price: number;
    maximumSlotsCount: number;
}

interface BookingSlot {
    date: string;
    time: string;
}

export default function BookingPage() {
    const [step, setStep] = useState(1);

    // Step 1: Location
    const [selectedCenter, setSelectedCenter] = useState<TestingCenter | null>(null);
    const [selectedSuburb, setSelectedSuburb] = useState<Suburb | null>(null);
    const { suburbs, testingCenters, loading: loadingData } = useMasterData();

    // Step 2: Package
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

    // Step 3: Date & Time
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedSlots, setSelectedSlots] = useState<BookingSlot[]>([]);
    const [selectedSlotDetails, setSelectedSlotDetails] = useState<Slot[]>([]); // To store full slot objects for display

    // Step 4: Booking
    const [lockToken, setLockToken] = useState<string | null>(null);
    const [lockExpiry, setLockExpiry] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successData, setSuccessData] = useState<any | null>(null);

    // Derived State
    // Derived State
    const maxSlots = (() => {
        if (!selectedPackage) return 1;
        if (selectedPackage.name.includes('5 X 1HR')) return 5;
        if (selectedPackage.name.includes('10 X 1HR')) return 10;
        if (selectedPackage.name.includes('3 X 1HR')) return 3;
        if (['45MIN LESSON', '1HR LESSON', '1.5HR LESSON', '2HR LESSON'].includes(selectedPackage.name)) {
            return 10; // Allow multiple selection for single lessons
        }
        return 1;
    })();

    const getMargin = (pkgName: string) => {
        // Specific Single Lesson Rules
        if (pkgName === '45MIN LESSON') return 15;
        if (pkgName === '1HR LESSON') return 15;
        if (pkgName === '1.5HR LESSON') return 30;
        if (pkgName === '2HR LESSON') return 30;

        // Packages usually default to 15 unless specified (e.g. 2HR package?)
        // Assuming 15 for standard packages matches the component lesson margin.
        if (pkgName.includes('2HR')) return 30;
        return 15;
    };

    const getDuration = (pkgName: string) => {
        if (pkgName.includes('45MIN')) return 45;
        if (pkgName.includes('1.5HR')) return 90;
        if (pkgName.includes('2HR')) return 120;
        return 60; // Default 1HR
    };

    const margin = selectedPackage ? getMargin(selectedPackage.name) : 15;
    const duration = selectedPackage ? getDuration(selectedPackage.name) : 60;

    // Fetch Slots
    const { data: rawSlots, isLoading: loadingSlots, refetch: refetchSlots } = useQuery({
        queryKey: ['slots', selectedSuburb?.id, selectedDate, duration, margin],
        queryFn: () => {
            if (!selectedSuburb || !selectedDate) return [];
            // Fetch finer grid (e.g. 15 min steps) to verify adjacency
            // But we primarily want to display the "Standard" grid to start.
            // Actually, to support "No Gap", we need to know if [SelectedEndTime] is a valid StartTime.
            // If we fetch with step=15, we get ALL 15m slots.
            // Then we filter for display.
            return fetchSlots(selectedDate, duration, margin, 15);
        },
        enabled: !!selectedSuburb && !!selectedDate && step === 3,
    });

    // Process slots for display
    // Timer Effect
    useEffect(() => {
        if (!lockExpiry) return;
        const interval = setInterval(() => {
            const now = Date.now();
            const diff = lockExpiry - now;
            if (diff <= 0) {
                clearInterval(interval);
                handleExpire();
            } else {
                const minutes = Math.floor(diff / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [lockExpiry]);

    // Process slots for display
    const displaySlots = (() => {
        if (!rawSlots) return [];

        const totalStep = duration + margin;

        const getMinutes = (d: string | Date) => {
            const date = typeof d === 'string' ? new Date(d) : d;
            return date.getHours() * 60 + date.getMinutes();
        };

        // Derive selected slots from rawSlots to ensure consistency
        const currentSelectedSlots = rawSlots.filter(s => selectedSlots.some(sel => sel.time === s.startTime));

        // Find the LATEST end time among selected slots to re-anchor the grid
        let lastEndMinutes: number | null = null;
        if (currentSelectedSlots.length > 0) {
            const maxEnd = currentSelectedSlots.reduce((max, slot) => {
                const sEnd = getMinutes(slot.endTime);
                return sEnd > max ? sEnd : max;
            }, 0);
            lastEndMinutes = maxEnd;
        }

        return rawSlots.filter(slot => {
            // 1. Is Selected? Always show.
            if (selectedSlots.some(s => s.time === slot.startTime)) return true;

            // 2. Availability Check
            if (!slot.available) return false;

            const slotStart = getMinutes(slot.startTime);
            const slotEnd = getMinutes(slot.endTime);

            // 3. Overlap Check
            if (currentSelectedSlots.length > 0) {
                const isOverlapping = currentSelectedSlots.some(selected => {
                    const selStart = getMinutes(selected.startTime);
                    const selEnd = getMinutes(selected.endTime);
                    // Standard overlap
                    return slotStart < selEnd && slotEnd > selStart;
                });
                if (isOverlapping) return false;
            }

            // 4. Re-anchoring Logic (Consecutive)
            if (lastEndMinutes !== null) {
                if (slotStart >= lastEndMinutes) {
                    const diff = slotStart - lastEndMinutes;
                    return diff % totalStep === 0;
                }
            }

            // 5. Standard Grid Check (With Gap / Margin)
            // Ensure slots align with the start of the day + multiples of (duration + margin)
            const onStandardGrid = (slotStart - 480) % totalStep === 0;

            if (onStandardGrid) return true;

            // 6. Post-Booking Availability Check (Edge Detection)
            const step = 15;
            const prevTime = slotStart - step;
            const prevSlot = rawSlots.find(s => getMinutes(s.startTime) === prevTime);

            if (prevSlot && !prevSlot.available) {
                return true;
            }

            return false;
        });
    })();

    const handleExpire = () => {
        if (selectedSlots.length > 0) {
            unlockSlots(selectedSlots, lockToken!);
        }
        setTimeLeft('0:00');
        toast.error('Session expired. Please start over.');
        setStep(1);
        setLockToken(null);
        setLockExpiry(null);
        setSelectedSlots([]);
        setSelectedSlotDetails([]);
    };

    const handleSlotClick = (slot: Slot) => {
        // Check if already selected
        const isSelected = selectedSlots.some(s => s.time === slot.startTime);

        if (isSelected) {
            // Remove
            setSelectedSlots(prev => prev.filter(s => s.time !== slot.startTime));
            setSelectedSlotDetails(prev => prev.filter(s => s.startTime !== slot.startTime));
        } else {
            // Add
            if (selectedSlots.length >= maxSlots) {
                toast.error(`You can only select ${maxSlots} slots for this package.`);
                return;
            }
            setSelectedSlots(prev => [...prev, { date: selectedDate, time: slot.startTime }]);
            setSelectedSlotDetails(prev => [...prev, slot]);
        }
    };

    const getPrice = () => {
        if (!selectedPackage) return 0;

        const isSingle = ['45MIN LESSON', '1HR LESSON', '1.5HR LESSON', '2HR LESSON'].includes(selectedPackage.name);

        if (isSingle) {
            return selectedPackage.price * (selectedSlots.length || 1);
        }
        return selectedPackage.price;
    };

    const handleStep1Next = () => {
        if (selectedSuburb) setStep(2);
    };

    const handleStep2Next = () => {
        if (selectedPackage) {
            // Reset slots if package changed
            setSelectedSlots([]);
            setSelectedSlotDetails([]);
            setStep(3);
        }
    };

    const handleStep3Next = async () => {
        if (selectedSlots.length > 0) {
            // Lock slots
            try {
                // We use the first slot time for the "time" param if needed, but we should use lockSlots endpoint
                const result = await lockSlots(selectedSlots);
                setLockToken(result.token);
                setLockExpiry(result.expiresAt);
                setTimeLeft(`${result.sessionDuration}`);
                setStep(4);
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Failed to lock slots.');
                refetchSlots();
            }
        }
    };

    const handleConfirm = async (formData: any) => {
        setIsSubmitting(true);
        try {
            const payload = {
                testingCenterId: selectedCenter?.id,
                suburbId: +formData.suburb,
                packageId: selectedPackage?.id,
                duration: duration,
                lockToken: lockToken!,
                customerDetails: formData,
                slots: selectedSlots,
            }
            const result = await createBooking(payload);
            setSuccessData(result);
            setLockToken(null);
            setLockExpiry(null);
            setSelectedSlots([]);
            setSelectedSlotDetails([]);
            setStep(5);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Booking failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // SUCCESS VIEW
    if (successData) {
        return (
            <div className="max-w-2xl mx-auto p-8 text-center space-y-6">
                <div className="bg-green-100 text-green-800 p-6 rounded-lg">
                    <h2 className="text-2xl font-bold mb-2">Booking Submitted!</h2>
                    <p className="mb-4">Your booking has been submitted successfully. An instructor will contact you shortly.</p>

                    {successData.instructor && (
                        <div className="bg-white p-4 rounded-md shadow-sm inline-block text-left mt-4 border border-green-200">
                            <h3 className="font-semibold text-gray-900 mb-2">Assigned Instructor</h3>
                            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                                <span className="text-gray-500">Name:</span>
                                <span className="font-medium">{successData.instructor.name}</span>
                                <span className="text-gray-500">Contact:</span>
                                <span className="font-medium">{successData.instructor.contact}</span>
                            </div>
                        </div>
                    )}
                </div>
                <button onClick={() => window.location.reload()} className="px-6 py-2 bg-primary text-white rounded hover:bg-opacity-90 transition-colors">
                    Book Another
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Progress Bar or Title */}
            <h1 className="text-3xl font-bold mb-8 text-center">Book a Driving Lesson</h1>
            <BookingStepper currentStep={step} steps={['Location', 'Package', 'Date & Time', 'Details']} />

            <div className='my-12'>
                {/* Step 1: Location */}
                {step === 1 && (
                    <div className="max-w-md mx-auto pt-12">
                        <div className="space-y-4">
                            {/* Testing Center Selection */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Testing Center</label>
                                {loadingData ? <Loader2 className="animate-spin" /> : (
                                    <select
                                        className="w-full border p-2 rounded"
                                        onChange={(e) => {
                                            const center = testingCenters?.find(tc => tc.id.toString() === e.target.value) || null;
                                            setSelectedCenter(center);
                                            setSelectedSuburb(null); // Reset suburb when center changes
                                        }}
                                        value={selectedCenter?.id || ''}
                                    >
                                        <option value="">Select a testing center...</option>
                                        {testingCenters?.map(tc => <option key={tc.id} value={tc.id}>{tc.name}</option>)}
                                    </select>
                                )}
                            </div>

                            {/* Suburb Selection */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Your Suburb</label>
                                <select
                                    className="w-full border p-2 rounded disabled:bg-gray-100 disabled:text-gray-400"
                                    onChange={(e) => setSelectedSuburb(suburbs?.find(s => s.id.toString() === e.target.value) || null)}
                                    value={selectedSuburb?.id || ''}
                                    disabled={!selectedCenter}
                                >
                                    <option value="">{selectedCenter ? 'Select a suburb...' : 'Select a testing center first'}</option>
                                    {suburbs.map(s => <option key={s.id} value={s.id}>{s.name} ({s.postalcode})</option>)}
                                </select>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleStep1Next}
                                    disabled={!selectedSuburb}
                                    className="px-6 py-2 bg-primary text-white rounded disabled:bg-gray-300"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Package */}
                {step === 2 && (
                    <div>
                        <PackageSelect
                            onSelect={setSelectedPackage}
                            selectedPackage={selectedPackage}
                        />
                        <div className="flex justify-between items-center pt-6">
                            <button
                                onClick={() => setStep(1)}
                                className="text-sm text-gray-500 hover:text-gray-700 ml-2"
                            >
                                Back
                            </button>

                            <button
                                onClick={handleStep2Next}
                                disabled={!selectedPackage}
                                className="px-6 py-2 bg-primary text-white rounded disabled:bg-gray-300"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Date & Slots */}
                {step === 3 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1 space-y-6">

                            <div className="bg-blue-50 p-4 rounded-lg border border-primary mb-4">
                                <h3 className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">Selected Package</h3>
                                <p className="text-lg font-medium text-primary">{selectedPackage?.name}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Select Date</label>
                                <DateDropdown
                                    suburbId={selectedSuburb!.id}
                                    selectedDate={selectedDate}
                                    onSelect={setSelectedDate}
                                />
                            </div>

                            {/* Selected Slots List */}
                            <div className="bg-gray-50 p-4 rounded-lg border">
                                {selectedPackage && (selectedPackage.name.includes('PACKAGE') || selectedPackage.name.includes('DRIVE TEST')) ?
                                    <h3 className="font-semibold mb-2">Selected Slots ({selectedSlots.length}/{maxSlots})</h3> :
                                    <h3 className="font-semibold mb-2">{selectedSlots.length} Slot Selected</h3>
                                }

                                {selectedSlotDetails.length === 0 && <p className="text-sm text-gray-400">No slots selected.</p>}
                                <div className="space-y-2">
                                    {[...selectedSlotDetails]
                                        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                                        .map((slot, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-white p-2 rounded shadow-sm text-sm">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{format(parseISO(slot.startTime), 'EEE, d MMM yyyy')}</span>
                                                    <span className="text-gray-600">{format(parseISO(slot.startTime), 'h:mm a')} - {format(parseISO(slot.endTime), 'h:mm a')}</span>
                                                </div>
                                                <button onClick={() => handleSlotClick(slot)} className="text-red-500 hover:text-red-700 p-1">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                </div>
                                <div className="mt-4 pt-4 border-t flex justify-between items-center font-bold">
                                    <span>Total:</span>
                                    <span>${getPrice()}</span>
                                </div>
                            </div>
                            <button onClick={() => setStep(2)} className="text-sm text-gray-500 hover:text-gray-700 mb-2 ml-2">Back</button>

                        </div>

                        <div className="md:col-span-2">
                            {/* Render Slots */}
                            {loadingSlots ? <div className="p-8 text-center">
                                <Spinner size="lg" text="Loading slots..." />
                            </div> : (
                                <>
                                    <h2 className="text-xl font-semibold mt-8 mb-4">Available Time Slots</h2>

                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                        {displaySlots.map((slot: Slot) => {
                                            const isSelected = selectedSlots.some(s => s.time === slot.startTime);
                                            return (
                                                <button
                                                    key={slot.startTime}
                                                    onClick={() => handleSlotClick(slot)}
                                                    disabled={!slot.available && !isSelected}
                                                    className={`p-3 rounded border text-sm font-medium transition-colors ${isSelected ? 'bg-primary text-white border-primary' :
                                                        slot.available ? 'bg-white text-primary border-primary hover:border-primary hover:shadow-md' :
                                                            'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                        } `}
                                                >
                                                    {format(parseISO(slot.startTime), 'h:mm a')}
                                                    <span className="block text-xs font-normal opacity-75">
                                                        to {format(parseISO(slot.endTime), 'h:mm a')}
                                                    </span>
                                                </button>
                                            )
                                        })}
                                        {(!displaySlots || displaySlots.length === 0) && selectedDate && (
                                            <div className="col-span-full text-center py-10 text-gray-500">
                                                No available slots for this date.
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                            <div className="flex justify-end py-6">
                                <button
                                    onClick={handleStep3Next}
                                    disabled={selectedSlots.length === 0}
                                    className="px-6 py-2 bg-primary text-white rounded disabled:bg-gray-300"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Details */}
                {step === 4 && (
                    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow border">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b">
                            <h2 className="text-xl font-bold">Finalize Booking</h2>
                            <div className="text-red-600 font-medium bg-red-50 px-3 py-1 rounded">Time Remaining: {timeLeft}</div>
                        </div>

                        <div className="mb-6 p-4 bg-blue-100 rounded text-sm text-primary space-y-1">
                            <p><strong>Package:</strong> {selectedPackage?.name}</p>
                            <p><strong>Date:</strong> {selectedDate}</p>
                            <p><strong>Slots:</strong> {selectedSlotDetails.map(s => format(parseISO(s.startTime), 'h:mm a')).join(', ')}</p>
                            <p className="font-bold pt-2">Total Amount: ${getPrice()}</p>
                        </div>

                        <BookingForm
                            onSubmit={handleConfirm}
                            isSubmitting={isSubmitting}
                            onCancel={async () => {
                                if (lockToken && selectedSuburb && selectedDate) {
                                    try {
                                        // Unlock all slots
                                        if (selectedSlots.length > 0) {
                                            await unlockSlots(selectedSlots, lockToken);
                                        }
                                    } catch (e) {
                                        console.error('Failed to unlock slots', e);
                                    }
                                }
                                setStep(3);
                                setLockToken(null);
                                setLockExpiry(null);
                                setTimeLeft('');
                            }}
                            selectedSuburb={selectedSuburb}
                        />
                    </div>
                )}
            </div>

        </div>
    );
}
