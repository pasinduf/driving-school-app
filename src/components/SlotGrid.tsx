
import type { Slot } from '../api/client';
import { format, parseISO } from 'date-fns';

interface SlotGridProps {
    slots: Slot[];
    onSelect: (slot: Slot) => void;
    selectedSlot: Slot | null;
    isLoading: boolean;
}

export default function SlotGrid({ slots, onSelect, selectedSlot, isLoading }: SlotGridProps) {
    if (isLoading) {
        return <div className="text-center py-8">Loading available slots...</div>;
    }

    if (slots.length === 0) {
        return <div className="text-center py-8 text-gray-500">No available slots for this date. Try another date.</div>;
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {slots.map((slot) => {
                if (!slot?.startTime) return null;
                const isSelected = selectedSlot?.startTime === slot.startTime;

                return (
                    <button
                        key={slot.startTime}
                        onClick={() => onSelect(slot)}
                        disabled={!slot.available}
                        className={`p-3 rounded-md text-center border transition-colors ${isSelected
                                ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                                : slot.available
                                    ? 'border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 cursor-pointer'
                                    : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {format(parseISO(slot.startTime), 'h:mm a')}
                    </button>
                )
            })}
        </div>
    );
}
