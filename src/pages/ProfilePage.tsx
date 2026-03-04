import { useState, useEffect } from 'react';
import { getProfile, updateProfile, uploadProfileImage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Camera, Loader2, Save } from 'lucide-react';
import ChangePasswordModal from '../components/profile/ChangePasswordModal';

export default function ProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getProfile();
                setProfile(data);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile((prev: any) => ({ ...prev, [name]: value }));
        setError('');
        setSuccess('');
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const field = 'profileImage';
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setSaving(true);
            const { url } = await uploadProfileImage(file);
            setProfile((prev: any) => ({ ...prev, [field]: url }));
            // Instantly save the URL
            await updateProfile({ [field]: url });
            setSuccess('Image updated successfully');

            // Optionally refresh global auth context state if profileImage maps there
            if (field === 'profileImage' && user) {
                // If context user object holds the image, an auth refresh or manual patch could be done here
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Upload failed');
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const dataToUpdate = {
                name: profile.name,
                contactNumber: profile.contactNumber,
                address: profile.address,
            };
            const updated = await updateProfile(dataToUpdate);
            setProfile(updated);
            setSuccess('Profile updated successfully');

            // If the name changed, refresh local user state partially since name is tracked in JWT
            if (updated.name !== user?.name) {
                // Notice: In a real system the JWT is generated on the server and returned on login. 
                // Updating profile should ideally return a new JWT to persist changes cleanly natively.
                // For now, we will just inform the user.
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[500px]">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (!profile) return null;

    const canEditContact = user?.role === 'Instructor' || user?.role === 'Student';

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-500 mt-1">Manage your account details and preferences.</p>
            </div>

            {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
            {success && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg text-sm">{success}</div>}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                {/* Profile Header section */}
                <div className="px-8 pb-8 pt-8 relative">
                    <div className="flex justify-between items-end">
                        <div className="relative mb-4">
                            <div className="w-32 h-32 rounded-full border-4 border-gray-50 bg-white shadow-md relative group overflow-hidden">
                                {profile.profileImage ? (
                                    <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center text-4xl font-bold">
                                        {profile.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera size={20} className="text-white" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                            </div>
                        </div>

                        <div className="pb-4">
                            <button
                                onClick={() => setIsPasswordModalOpen(true)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center transition-colors"
                            >
                                Change Password
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={profile.name || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={profile.email || ''}
                                    className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed text-sm"
                                    disabled
                                />
                            </div>

                            {canEditContact && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                                        <input
                                            type="tel"
                                            name="contactNumber"
                                            value={profile.contactNumber || ''}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                            placeholder="e.g. +61 400 000 000"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                        <textarea
                                            name="address"
                                            value={profile.address || ''}
                                            onChange={handleChange}
                                            rows={3}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none"
                                            placeholder="Your full street address"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 flex items-center transition-colors disabled:opacity-50"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />
        </div>
    );
}
