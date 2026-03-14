import { useState, useMemo, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, Clock, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createManualBooking, updateManualBooking } from '../api/booking-api';
import SearchableDropdown from './SearchableDropdown';
import { fetchSuburbs } from '../api/misc-api';
import type { Suburb as SuburbType } from '../api/booking-api';
import type { Booking } from '../pages/InstructorBookingsPage';

interface ManualBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    selectedDate: Date | null;
    initialStartTime?: string;
    initialEndTime?: string;
    editingBooking?: Booking | null;
    packages: any[];
}

const START_HOUR = 6;
const END_HOUR = 22;

export default function ManualBookingModal({
    isOpen,
    onClose,
    onSuccess,
    selectedDate: propSelectedDate,
    initialStartTime = '09:00',
    initialEndTime = '10:00',
    editingBooking,
    packages
}: ManualBookingModalProps) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(propSelectedDate);
    const [startTime, setStartTime] = useState<string>(initialStartTime);
    const [endTime, setEndTime] = useState<string>(initialEndTime);
    const [note, setNote] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [selectedSuburb, setSelectedSuburb] = useState<SuburbType | null>(null);
    const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sync with props when modal opens or editingBooking changes
    useEffect(() => {
        if (isOpen) {
            if (editingBooking) {
                const start = parseISO(editingBooking.bookingSlots[0].startTime);
                const end = parseISO(editingBooking.bookingSlots[0].endTime);

                setSelectedDate(start);
                setStartTime(format(start, 'HH:mm'));
                setEndTime(format(end, 'HH:mm'));
                setNote(editingBooking.note || '');
                setCustomerName(editingBooking.customerName || '');

                if (editingBooking.suburbId && editingBooking.suburb) {
                    setSelectedSuburb({
                        id: (editingBooking.suburb.id || editingBooking.suburbId).toString(),
                        name: editingBooking.suburb.name,
                        stateCode: editingBooking.suburb.stateCode || '',
                        postalcode: editingBooking.suburb.postalcode
                    });
                } else {
                    setSelectedSuburb(null);
                }

                const pkg = packages.find((p: any) => p.name === editingBooking.package);
                if (pkg) {
                    setSelectedPackageId(Number(pkg.id));
                }
            } else {
                setSelectedDate(propSelectedDate);
                setStartTime(initialStartTime);
                setEndTime(initialEndTime);
                setNote('');
                setCustomerName('');
                setSelectedSuburb(null);
                setSelectedPackageId(null);
            }
        }
    }, [isOpen, editingBooking, propSelectedDate, initialStartTime, initialEndTime, packages]);

    const timeOptions = useMemo(() => {
        const options = [];
        for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
            for (let min = 0; min < 60; min += 15) {
                if (hour === END_HOUR && min > 0) break;
                const h = hour.toString().padStart(2, '0');
                const m = min.toString().padStart(2, '0');
                const time = `${h}:${m}`;
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour === 0 || hour === 12 ? 12 : hour % 12;
                const displayTime = `${displayHour}:${m} ${ampm}`;
                options.push({ value: time, label: displayTime });
            }
        }
        return options;
    }, []);

    const loadSuburbsData = async (query: string) => {
        const data = await fetchSuburbs(query);
        return data.map((s: SuburbType) => ({
            id: s.id.toString(),
            label: `${s.name}, ${s.stateCode} (${s.postalcode})`,
        }));
    };

    const handleSubmit = async () => {
        if (!selectedDate || !startTime || !endTime) return;

        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);
        const duration = (endH * 60 + endM) - (startH * 60 + startM);

        if (duration <= 0) {
            toast.error('End time must be after start time.');
            return;
        }

        setIsSubmitting(true);
        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const payload = {
                date: dateStr,
                time: startTime,
                duration,
                note,
                customerName,
                suburbId: selectedSuburb?.id ? Number(selectedSuburb.id) : null,
                packageId: selectedPackageId || undefined
            };

            if (editingBooking) {
                await updateManualBooking(editingBooking.id, payload);
                toast.success('Manual booking updated successfully.');
            } else {
                await createManualBooking(payload);
                toast.success('Manual booking added successfully.');
            }
            onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to process manual booking.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/50 backdrop-blur-sm p-4 flex items-start justify-center sm:items-center">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900 pr-8">{editingBooking ? 'Edit Manual Booking' : 'Add Manual Booking'}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Booking Date</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                    className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-10"
                                />
                                <CalendarIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                <div className="relative">
                                    <select
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-10 bg-white"
                                    >
                                        {timeOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                <div className="relative">
                                    <select
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-10 bg-white"
                                    >
                                        {timeOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Enter customer name"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Suburb</label>
                        <SearchableDropdown
                            onSelect={(option) => {
                                if (option) {
                                    setSelectedSuburb({ id: option.id.toString(), name: option.label.split(',')[0] } as any);
                                } else {
                                    setSelectedSuburb(null);
                                }
                            }}
                            fetchOptions={loadSuburbsData}
                            placeholder="Search and select suburb"
                            value={selectedSuburb ? `${selectedSuburb.name}` : ''}
                            hasSelection={!!selectedSuburb}
                            onClear={() => setSelectedSuburb(null)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Package</label>
                        <select
                            value={selectedPackageId || ''}
                            onChange={(e) => setSelectedPackageId(Number(e.target.value))}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            <option value="">Select package</option>
                            {packages.map((pkg: any) => (
                                <option key={pkg.id} value={pkg.id}>
                                    {pkg.name} (${pkg.price})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="e.g. Contact number, address"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
                        />
                    </div>
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors w-28"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark transition-colors flex justify-center items-center gap-2 w-36 disabled:opacity-70"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Save Booking
                    </button>
                </div>
            </div>
        </div>
    );
}
