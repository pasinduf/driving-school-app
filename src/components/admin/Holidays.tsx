import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchHolidays, createHoliday, deleteHoliday } from '../../api/client';
import { format } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';
import ConfirmationModal from '../ConfirmationModal';
import Spinner from '../Spinner';
import { toast } from 'sonner';

export default function Holidays() {
    const { user } = useAuth();
    const [holidays, setHolidays] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Holiday Form
    const [holidayDate, setHolidayDate] = useState('');
    const [holidayReason, setHolidayReason] = useState('');
    const [isAddingHoliday, setIsAddingHoliday] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);

    const loadData = async () => {
        setIsLoadingData(true);
        try {
            const data = await fetchHolidays();
            setHolidays(data);
        } catch (error) {
            console.error("Failed to load holidays", error);
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const handleAddHoliday = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAddingHoliday(true);
        try {
            await createHoliday(holidayDate, holidayReason);
            toast.success('Leave/Block date added successfully');
            setHolidayDate('');
            setHolidayReason('');
            const data = await fetchHolidays();
            setHolidays(data);
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
            const data = await fetchHolidays();
            setHolidays(data);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Action failed");
        } finally {
            setIsConfirming(false);
            setIsModalOpen(false);
            setSelectedId(null);
        }
    };

    return (
        <div className="space-y-6">
            {isLoadingData ? (
                <div className="flex justify-center items-center py-12">
                    <Spinner size="lg" text="Loading data..." />
                </div>
            ) : (
                <>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium mb-4 flex items-center">
                            <Plus className="w-5 h-5 mr-2" /> Add Leave / Block Date
                        </h3>
                        <form onSubmit={handleAddHoliday} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    className="w-full border rounded p-2"
                                    value={holidayDate}
                                    onChange={e => setHolidayDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                                <input
                                    type="text"
                                    className="w-full border rounded p-2"
                                    placeholder="e.g. Public Holiday, Leave"
                                    value={holidayReason}
                                    onChange={e => setHolidayReason(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-primary text-white p-2 rounded hover:bg-red-700 disabled:opacity-50"
                                disabled={isAddingHoliday}
                            >
                                Save
                            </button>
                        </form>
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {holidays.map((holiday: any) => (
                                    <tr key={holiday.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {format(new Date(holiday.date), 'PPP')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {holiday.reason}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleDeleteHoliday(holiday.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {holidays.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No active blocks found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
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
