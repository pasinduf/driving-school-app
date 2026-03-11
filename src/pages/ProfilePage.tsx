import { useState, useEffect, useCallback } from 'react';
import { getProfile, updateProfile, uploadProfileImage } from '../api/user-api';
import { fetchSuburbs } from '../api/misc-api';
import type { Suburb } from '../api/booking-api';
import SearchableMultiSelect, { type DropdownOption } from '../components/SearchableMultiSelect';
import { useAuth } from '../context/AuthContext';
import { Camera, Loader2, Save } from 'lucide-react';
import ChangePasswordModal from '../components/profile/ChangePasswordModal';
import { toast } from 'sonner';
import Spinner from '../components/Spinner';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedSuburbs, setSelectedSuburbs] = useState<DropdownOption[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        if (data.suburbs) {
          setSelectedSuburbs(data.suburbs.map((s: any) => ({
            id: s.id.toString(),
            label: `${s.name}, ${s.stateCode} (${s.postalcode})`
          })));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setProfile((prev: any) => ({ ...prev, [name]: checked }));
  };

  const handleAddSuburb = (opt: DropdownOption) => {
    setSelectedSuburbs(prev => [...prev, opt]);
  };

  const handleRemoveSuburb = (id: string) => {
    setSelectedSuburbs(prev => prev.filter(s => s.id !== id));
  };

  const loadSuburbsData = useCallback(async (query: string) => {
    const data = await fetchSuburbs(query);
    return data.map((s: Suburb) => ({
      id: s.id.toString(),
      label: `${s.name}, ${s.stateCode} (${s.postalcode})`
    }));
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const field = 'profileImage';
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImageUploading(true);

      const response = await uploadProfileImage(file);
      const url = typeof response === 'string' ? response : response.url;

      setProfile((prev: any) => ({ ...prev, [field]: url }));

    } catch (err: any) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const dataToUpdate = {
        name: profile.name,
        contactNumber: profile.contactNumber,
        address: profile.address,
        profileImage: profile.profileImage,
        showAsInstructor: profile.showAsInstructor,
        transmission: profile.transmission || 'Automatic',
        suburbIds: selectedSuburbs.map(s => Number(s.id)),
        about: profile.about,
        qualifications: profile.qualifications
      };
      const updated = await updateProfile(dataToUpdate);
      setProfile(updated);
      toast.success('Profile updated successfully');

    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const canEditContact = user?.role === 'Instructor' || user?.role === 'Student';

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account details and preferences.</p>
      </div>

      {loading ?
        <div className="flex justify-center p-12">
          <Spinner text="Loading profile..." />
        </div> :
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
                      {profile.name
                        ?.split(" ")
                        .map((n: any) => n.charAt(0).toUpperCase())
                        .join("")}
                    </div>
                  )}

                  {imageUploading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity">
                      <Loader2 size={24} className="text-white animate-spin" />
                    </div>
                  ) : (
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera size={20} className="text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={imageUploading || saving} />
                    </label>
                  )}
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
                    value={profile.name || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={profile.email || ""}
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
                        value={profile.contactNumber || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        placeholder="e.g. +61 400 000 000"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <textarea
                        name="address"
                        value={profile.address || ""}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none"
                        placeholder="Your full street address"
                      />
                    </div>
                  </>
                )}

                {user?.role === "Admin" && (
                  <div className="md:col-span-2 pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Instructor Settings</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            name="showAsInstructor"
                            checked={profile.showAsInstructor !== false}
                            onChange={handleCheckboxChange}
                            className="w-5 h-5 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                          />
                          <span className="text-gray-900 font-medium cursor-pointer select-none">Show as Instructor in Booking</span>
                        </label>
                        <p className="mt-1 ml-8 text-xs text-gray-500">
                          If checked, you will be displayed as an available instructor on the booking page. Otherwise, you will be hidden.
                        </p>
                      </div>

                      {profile.showAsInstructor !== false && (
                        <div className="pt-2 w-1/3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Transmission</label>
                          <select
                            name="transmission"
                            value={profile.transmission || "Automatic"}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                          >
                            <option value="Automatic">Automatic</option>
                            <option value="Manual">Manual</option>
                            <option value="Both">Both (Auto & Manual)</option>
                          </select>
                          <p className="mt-1 text-xs text-gray-500">Select the transmission type you teach.</p>
                        </div>
                      )}

                      {profile.showAsInstructor === true && (
                        <div className="pt-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Suburbs</label>
                          <SearchableMultiSelect
                            placeholder="Search and select suburbs..."
                            fetchOptions={loadSuburbsData}
                            selectedOptions={selectedSuburbs}
                            onAdd={handleAddSuburb}
                            onRemove={handleRemoveSuburb}
                          />
                          <p className="mt-2 text-xs text-gray-500">Select the suburbs where you are available.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {user?.role === "Instructor" && (
                  <div className="md:col-span-2 pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Instructor Settings</h3>
                    <div className="space-y-6">
                      <div className="pt-2 w-1/3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Transmission</label>
                        <select
                          name="transmission"
                          value={profile.transmission || "Automatic"}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        >
                          <option value="Automatic">Automatic</option>
                          <option value="Manual">Manual</option>
                          <option value="Both">Both (Auto & Manual)</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">Select the transmission type you teach.</p>
                      </div>

                      {selectedSuburbs.length > 0 && (
                        <div className="pt-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Suburbs</label>
                          <SearchableMultiSelect
                            placeholder="Search and select suburbs..."
                            fetchOptions={loadSuburbsData}
                            selectedOptions={selectedSuburbs}
                            onAdd={handleAddSuburb}
                            onRemove={handleRemoveSuburb}
                          />
                        </div>
                      )}

                      <div className="md:col-span-2 pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">About Me</label>
                        <textarea
                          name="about"
                          value={profile.about || ""}
                          onChange={handleChange}
                          rows={4}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none"
                          placeholder="Tell students about your teaching experience and style..."
                        />
                      </div>

                      <div className="md:col-span-2 pt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications (Separated by |)</label>
                        <textarea
                         rows={2}
                          name="qualifications"
                          value={profile.qualifications || ""}
                          onChange={(e) => {
                            if (e.target.value.includes(",")) {
                              toast.warning("Commas are not allowed. Please use | as separator.");
                              return;
                            }
                            handleChange(e);
                          }}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                          placeholder="e.g. Cert IV in Transport & Logistics, 10+ Years Experience (no commas allowed)"
                        />
                        <p className="mt-1 text-xs text-gray-500 italic">Example: Cert IV in Transport & Logistics | 10+ Years Experience | Fluent in English</p>
                      </div>
                    </div>
                  </div>
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
      }

      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
    </div>
  );
}
