import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAdminInstructors, createInstructor, updateInstructor, deleteInstructor, resetInstructorPassword } from '../../api/instructor-api';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Users, KeyRound, Eye, EyeOff, X } from 'lucide-react';
import InstructorModal from './InstructorModal';
import ConfirmationModal from '../ConfirmationModal';
import Pagination from '../Pagination';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../Spinner';
import { generateRandomPassword } from '../../util/generateRandomPassword';

export default function Instructors() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();
  const [page, setPage] = useState(1);
  const limit = 10;

  // Data Fetching
  const { data, isLoading } = useQuery({
    queryKey: ['adminInstructors', page],
    queryFn: () => fetchAdminInstructors(page, limit),
  });

  const instructors = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<any>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [instructorToDelete, setInstructorToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset password modal state
  const [resetTargetId, setResetTargetId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

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

  const openResetPasswordModal = (id: string) => {
    setResetTargetId(id);
    setResetPassword('');
    setShowResetPassword(false);
  };

  const closeResetPasswordModal = () => {
    setResetTargetId(null);
    setResetPassword('');
  };

  const handleResetPassword = async () => {
    if (!resetTargetId) return;
    if (resetPassword.length < 8 || !/[A-Za-z]/.test(resetPassword) || !/\d/.test(resetPassword)) {
      toast.error('Password must be at least 8 characters and include at least 1 letter and 1 number.');
      return;
    }
    setIsResetting(true);
    try {
      await resetInstructorPassword(resetTargetId, resetPassword);
      toast.success('Password reset successfully.');
      closeResetPasswordModal();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to reset password.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleSaveInstructor = async (data: any) => {
    try {
      if (selectedInstructor) {
        await updateInstructor(selectedInstructor.id, data);
        toast.success('Instructor updated successfully');
      } else {
        await createInstructor(data);
        toast.success('Instructor added successfully');
        updateUser({ existMultipleInstructors: true });
      }
      queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save instructor');
      throw error;
    }
  };

  const executeDelete = async () => {
    if (!instructorToDelete) return;
    setIsDeleting(true);
    try {
      await deleteInstructor(instructorToDelete);
      toast.success('Instructor deactivated successfully');
      queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete instructor');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setInstructorToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Manage Instructors</h2>
            <p className="text-sm text-gray-500">Create, update and deactivate instructors.</p>
          </div>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Instructor
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Spinner text="Loading data..." />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Instructor</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium text-center">Transmission</th>
                  <th className="px-6 py-4 font-medium text-center">Suburbs</th>
                  <th className="px-6 py-4 font-medium text-center">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {instructors.map((inst: any) => (
                  <tr key={inst.id} className={`hover:bg-gray-50 transition-colors ${!inst.isActive ? 'opacity-75 bg-gray-50/50' : ''}`}>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {inst.name}
                      <p className="text-xs text-gray-400 font-normal mt-0.5 truncate max-w-[200px]">{inst.email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {inst.contactNumber || "-"}
                      <div className="text-xs text-gray-400 mt-0.5">{inst.address}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {inst.transmission || "Automatic"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">{inst.suburbs?.length || 0} assigned</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${inst.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {inst.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEditClick(inst)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-md transition-colors" title="Edit Instructor">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openResetPasswordModal(inst.id)}
                          className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                          title="Reset Password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(inst.id)}
                          className={`p-1.5 rounded-md transition-colors ${!inst.isActive ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                          title={inst.isActive ? "Deactivate Instructor" : "Delete"}
                          disabled={!inst.isActive}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <InstructorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveInstructor} instructor={selectedInstructor} />

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

      {/* Reset Password Modal */}
      {resetTargetId && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative">
            <button onClick={closeResetPasswordModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <KeyRound className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-gray-900">Reset Instructor Password</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Set a temporary password. The instructor will be required to change it on next login.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showResetPassword ? 'text' : 'password'}
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-3 pr-24 text-sm focus:ring-primary focus:border-primary"
                  placeholder="Enter temporary password"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { const p = generateRandomPassword(); setResetPassword(p); }}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Generate
                  </button>
                  <button type="button" onClick={() => setShowResetPassword((v) => !v)} className="text-gray-400 hover:text-gray-600">
                    {showResetPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">At least 8 characters, 1 letter and 1 number.</p>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={closeResetPasswordModal} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={isResetting}
                className="px-4 py-2 text-sm text-white bg-primary rounded-md hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {isResetting ? 'Resetting…' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
