import React, { useState, useEffect } from 'react';
import { useMasterData } from '../../context/MasterDataContext';
import { X } from 'lucide-react';

interface InstructorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    instructor?: any;
}

export default function InstructorModal({ isOpen, onClose, onSave, instructor }: InstructorModalProps) {
    const { suburbs } = useMasterData();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [transmission, setTransmission] = useState('Automatic');
    const [address, setAddress] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [selectedSuburbs, setSelectedSuburbs] = useState<any[]>([]);

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (instructor) {
                setName(instructor.name || '');
                setEmail(instructor.email || '');
                setContactNumber(instructor.contactNumber || '');
                setTransmission(instructor.transmission || 'Automatic');
                setAddress(instructor.address || '');
                setIsActive(instructor.isActive !== undefined ? instructor.isActive : true);
                if (instructor.suburbs) {
                    setSelectedSuburbs(instructor.suburbs.map((s: any) => s.id));
                } else {
                    setSelectedSuburbs([]);
                }
                setPassword(''); // Don't pre-fill password
            } else {
                setName('');
                setEmail('');
                setPassword('');
                setContactNumber('');
                setTransmission('Automatic');
                setAddress('');
                setIsActive(true);
                setSelectedSuburbs([]);
            }
        }
    }, [isOpen, instructor]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const data: any = {
                name,
                email,
                contactNumber,
                transmission,
                address,
                suburbIds: selectedSuburbs,
            };

            if (instructor) {
                data.isActive = isActive;
                if (password) {
                    data.password = password; // Only send if changed
                }
            } else {
                if (password) {
                    data.password = password;
                }
            }

            await onSave(data);
            onClose();
        } catch (err) {
            // Error managed by caller usually
        } finally {
            setIsSaving(false);
        }
    };

    const handleSuburbToggle = (id: any) => {
        setSelectedSuburbs(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center overflow-y-auto pt-10 pb-10">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden my-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-xl font-bold">
                        {instructor ? 'Edit Instructor' : 'Add New Instructor'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full border rounded p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full border rounded p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {instructor ? 'New Password (leave blank to keep current)' : 'Password (leave blank for auto Password123!)'}
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                minLength={6}
                                className="w-full border rounded p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                            <input
                                type="text"
                                value={contactNumber}
                                onChange={e => setContactNumber(e.target.value)}
                                className="w-full border rounded p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
                            <select
                                value={transmission}
                                onChange={e => setTransmission(e.target.value)}
                                className="w-full border rounded p-2"
                            >
                                <option value="Automatic">Automatic</option>
                                <option value="Manual">Manual</option>
                                <option value="Both">Both</option>
                            </select>
                        </div>
                        {instructor && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={isActive ? 'Active' : 'Inactive'}
                                    onChange={e => setIsActive(e.target.value === 'Active')}
                                    className="w-full border rounded p-2"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        )}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input
                                type="text"
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                className="w-full border rounded p-2"
                            />
                        </div>

                        <div className="md:col-span-2 mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Suburbs ({selectedSuburbs.length})</label>
                            <div className="max-h-48 overflow-y-auto border rounded p-3 grid grid-cols-2 sm:grid-cols-3 gap-2 bg-gray-50">
                                {suburbs.map(suburb => (
                                    <label key={suburb.id} className="flex items-center space-x-2 text-sm bg-white p-2 rounded border cursor-pointer hover:bg-gray-100">
                                        <input
                                            type="checkbox"
                                            checked={selectedSuburbs.includes(suburb.id)}
                                            onChange={() => handleSuburbToggle(suburb.id)}
                                            className="rounded text-primary focus:ring-primary"
                                        />
                                        <span className="truncate" title={`${suburb.name} (${suburb.postalcode})`}>
                                            {suburb.name} <span className="text-gray-400 text-xs">{suburb.postalcode}</span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end space-x-4 border-t pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-primary text-white px-6 py-2 rounded hover:bg-red-700 flex items-center"
                        >
                            {isSaving ? 'Saving...' : 'Save Instructor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
