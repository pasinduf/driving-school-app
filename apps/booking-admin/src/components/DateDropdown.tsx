import { useQuery } from '@tanstack/react-query';
import { getAvailableDates } from '../api/booking-api';
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
    const { data: dates = [], isLoading: loading } = useQuery<DateOption[]>({
        queryKey: ['availableDates', suburbId, instructorId],
        queryFn: async () => {
            const now = new Date();
            const startDate = format(addDays(now, 1), 'yyyy-MM-dd');
            return getAvailableDates(startDate, instructorId);
        },
        enabled: !!suburbId,
    });

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
