import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { fetchHolidays, createHoliday, deleteHoliday } from '../../api/misc-api';
import { format } from 'date-fns';
import { Plus, Trash2, CalendarOff } from 'lucide-react';
import ConfirmationModal from '../ConfirmationModal';

import { toast } from 'sonner';
import Spinner from '../Spinner';

export default function Holidays() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    // Data Fetching
    const { data: holidays = [], isLoading: isLoadingData } = useQuery({
        queryKey: ['adminHolidays'],
        queryFn: fetchHolidays,
        enabled: !!user,
    });

    // Holiday Form
    const [holidayDate, setHolidayDate] = useState('');
    const [holidayReason, setHolidayReason] = useState('');
    const [isAddingHoliday, setIsAddingHoliday] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);

    const handleAddHoliday = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAddingHoliday(true);
        try {
            await createHoliday(holidayDate, holidayReason);
            toast.success('Leave/Block date added successfully');
            setHolidayDate('');
            setHolidayReason('');
            queryClient.invalidateQueries({ queryKey: ['adminHolidays'] });
        } catch (error) {
            toast.error("Failed to create leave/block date");
        } finally {
            setIsAddingHoliday(false);
        }
    };

    const handleDeleteHoliday = (id: string) => {
        setSelectedId(id);
        setIsModalOpen(true);
    };

    const executeDelete = async () => {
        if (!selectedId) return;
        setIsConfirming(true);
        try {
            await deleteHoliday(selectedId);
            toast.success('Leave/Block date deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['adminHolidays'] });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Action failed");
        } finally {
            setIsConfirming(false);
            setIsModalOpen(false);
            setSelectedId(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <CalendarOff className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Leave / Block Dates</h2>
                        <p className="text-sm text-gray-500">Manage leave days and blocked dates.</p>
                    </div>
                </div>
            </div>

            {/* Add Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Leave / Block Date
                </h3>
                <form onSubmit={handleAddHoliday} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            value={holidayDate}
                            onChange={e => setHolidayDate(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                        <input
                            type="text"
                            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            placeholder="e.g. Public Holiday, Leave"
                            value={holidayReason}
                            onChange={e => setHolidayReason(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium disabled:opacity-50"
                        disabled={isAddingHoliday}
                    >
                        <Plus className="w-4 h-4" /> Save
                    </button>
                </form>
            </div>

            {isLoadingData ? (
                <div className="flex justify-center p-12">
                    <Spinner text="Loading data..." />
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 border-b">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Date</th>
                                    <th className="px-6 py-4 font-medium">Reason</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {holidays.map((holiday: any) => (
                                    <tr key={holiday.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                            {format(new Date(holiday.date), 'PPP')}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {holiday.reason}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteHoliday(holiday.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {holidays.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">No active blocks found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={executeDelete}
                isConfirming={isConfirming}
                title="Delete Leave / Block Date"
                message="Are you sure you want to remove this leave/block?"
                confirmText="Proceed"
                variant="danger"
            />
        </div>
    );
}
