import { useEffect, useState } from 'react';
import { fetchAdminInstructors, createInstructor, updateInstructor, deleteInstructor } from '../../api/client';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';
import InstructorModal from './InstructorModal';
import ConfirmationModal from '../ConfirmationModal';

export default function AdminInstructorsTab() {
    const [instructors, setInstructors] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInstructor, setSelectedInstructor] = useState<any>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [instructorToDelete, setInstructorToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadInstructors();
    }, []);

    const loadInstructors = async () => {
        setIsLoading(true);
        try {
            const data = await fetchAdminInstructors();
            setInstructors(data);
        } catch (error) {
            toast.error("Failed to load instructors.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddClick = () => {
        setSelectedInstructor(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (instructor: any) => {
        setSelectedInstructor(instructor);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setInstructorToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleSaveInstructor = async (data: any) => {
        try {
            if (selectedInstructor) {
                await updateInstructor(selectedInstructor.id, data);
                toast.success('Instructor updated successfully');
            } else {
                await createInstructor(data);
                toast.success('Instructor added successfully');
            }
            loadInstructors();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to save instructor');
            throw error; // Re-throw to keep modal open on failure if needed
        }
    };

    const executeDelete = async () => {
        if (!instructorToDelete) return;
        setIsDeleting(true);
        try {
            await deleteInstructor(instructorToDelete);
            toast.success('Instructor deactivated successfully (soft-delete)');
            loadInstructors();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to delete instructor');
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
            setInstructorToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Manage Instructors</h2>
                    <p className="text-gray-500 text-sm">Create, update and deactivate instructors.</p>
                </div>
                <button
                    onClick={handleAddClick}
                    className="bg-primary text-white px-4 py-2 rounded shadow hover:bg-red-700 flex items-center"
                >
                    <Plus className="w-5 h-5 mr-1" /> Add Instructor
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-8 text-gray-500">Loading instructors...</div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Instructor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Contact</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-900 uppercase">Transmission</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-900 uppercase">Suburbs</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-900 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {instructors.map((inst: any) => (
                                <tr key={inst.id} className={!inst.isActive ? 'bg-gray-50 opacity-75' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{inst.name}</div>
                                        <div className="text-sm text-gray-500">{inst.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{inst.contactNumber || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                            {inst.transmission || 'Automatic'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                                        {inst.suburbs?.length || 0} assigned
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${inst.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {inst.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                        <button
                                            onClick={() => handleEditClick(inst)}
                                            className="text-blue-600 hover:text-blue-900"
                                            title="Edit Instructor"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(inst.id)}
                                            className="text-red-600 hover:text-red-900"
                                            title={inst.isActive ? "Deactivate Instructor" : "Delete"}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {instructors.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No instructors found. Click "Add Instructor" to create one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <InstructorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveInstructor}
                instructor={selectedInstructor}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={executeDelete}
                isConfirming={isDeleting}
                title="Deactivate Instructor"
                message="Are you sure you want to deactivate this instructor? They will no longer appear in the booking flow."
                confirmText="Deactivate"
                variant="danger"
            />
        </div>
    );
}
