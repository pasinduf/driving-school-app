import { useState, useEffect } from 'react';
import { getAvailableDates } from '../api/client';
import { format, addDays } from 'date-fns';
import Spinner from './Spinner';

interface DateDropdownProps {
    suburbId: string;
    instructorId?: string;
    onSelect: (date: string) => void;
    selectedDate: string;
}

interface DateOption {
    date: string;
    isAvailable: boolean;
    reason?: string;
}

export default function DateDropdown({ suburbId, instructorId, onSelect, selectedDate }: DateDropdownProps) {
    const [dates, setDates] = useState<DateOption[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDates = async () => {
            if (!suburbId) return;
            setLoading(true);
            try {
                const now = new Date();
                const startDate = format(addDays(now, 1), 'yyyy-MM-dd');
                const data = await getAvailableDates(startDate, instructorId);
                setDates(data);
            } catch (error) {
                console.error("Failed to load dates", error);
            } finally {
                setLoading(false);
            }
        };
        loadDates();
    }, [suburbId, instructorId]);

    if (loading) {
        return (
         <div className="flex justify-center"><Spinner /></div>
        )
    }

    return (
        <select
            className="w-full border p-3 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            value={selectedDate}
            onChange={(e) => onSelect(e.target.value)}
        >
            <option value="">Select a date...</option>
            {dates.map((d) => (
                <option
                    key={d.date}
                    value={d.date}
                    disabled={!d.isAvailable}
                    className={!d.isAvailable ? 'text-gray-400 bg-gray-100' : ''}
                >
                    {format(new Date(d.date), 'EEEE, MMMM d, yyyy')}
                    {!d.isAvailable ? ` - ${d.reason || 'Unavailable'}` : ''}
                </option>
            ))}
        </select>
    );
}
