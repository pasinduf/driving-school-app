import { useState, useEffect, useCallback } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { fetchSuburbs } from '../../api/misc-api';
import { generateRandomPassword } from '../../util/generateRandomPassword';
import type { Suburb } from '../../api/booking-api';
import SearchableMultiSelect, { type DropdownOption } from '../SearchableMultiSelect';
import { EMAIL_REGEX } from '../../util/const';

interface InstructorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  instructor?: any;
}

interface InstructorFormData {
  name: string;
  email: string;
  password?: string;
  contactNumber: string;
  transmission: string;
  isActive: boolean;
  address: string;
  about?: string;
  qualifications?: string;
}

export default function InstructorModal({ isOpen, onClose, onSave, instructor }: InstructorModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<InstructorFormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      contactNumber: '',
      transmission: 'Automatic',
      isActive: true,
      address: '',
      about: '',
      qualifications: ''
    }
  });

  const [selectedSuburbs, setSelectedSuburbs] = useState<DropdownOption[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (instructor) {
        reset({
          name: instructor.name || '',
          email: instructor.email || '',
          password: '',
          contactNumber: instructor.contactNumber || '',
          transmission: instructor.transmission || 'Automatic',
          isActive: instructor.isActive !== undefined ? instructor.isActive : true,
          address: instructor.address || ''
        });
        if (instructor.suburbs) {
          setSelectedSuburbs(instructor.suburbs.map((s: any) => ({
            id: s.id.toString(),
            label: `${s.name} ${s.stateCode || ''}`.trim()
          })));
        } else {
          setSelectedSuburbs([]);
        }
      } else {
        reset({
          name: '',
          email: '',
          password: '',
          contactNumber: '',
          transmission: 'Automatic',
          isActive: true,
          address: ''
        });
        setSelectedSuburbs([]);
      }
    } else {
      reset();
      setShowPassword(false);
    }
  }, [isOpen, instructor, reset]);

  const onFormSubmit = async (formData: InstructorFormData) => {
    setIsSaving(true);
    try {
      const data: any = {
        name: formData.name,
        email: formData.email,
        contactNumber: formData.contactNumber,
        transmission: formData.transmission,
        address: formData.address,
        suburbIds: selectedSuburbs.map(s => Number(s.id)),
      };

      if (!instructor) {
        data.about = formData.about;
        data.qualifications = formData.qualifications;
        if (formData.password) {
          data.password = formData.password;
        }
      } else {
        data.isActive = formData.isActive === true || String(formData.isActive) === 'true';
      }

      await onSave(data);
      onClose();
    } catch (err) {
      // Error managed by caller usually
    } finally {
      setIsSaving(false);
    }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center overflow-y-auto pt-10 pb-10">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden my-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold">{instructor ? "Edit Instructor" : "Add New Instructor"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                {...register("name", { required: "Name is required" })}
                className="w-full border rounded p-2 focus:ring-primary focus:border-primary"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
              <input
                type="text"
                {...register("contactNumber", { required: "Contact Number is required" })}
                className="w-full border rounded p-2 focus:ring-primary focus:border-primary"
              />
              {errors.contactNumber && <p className="text-red-500 text-sm mt-1">{errors.contactNumber.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: EMAIL_REGEX,
                    message: "Invalid email address",
                  },
                })}
                className="w-full border rounded p-2 focus:ring-primary focus:border-primary"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message as string}</p>}
            </div>

            {!instructor && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">About Me</label>
                  <textarea
                    rows={3}
                    {...register("about")}
                    className="w-full border rounded p-2 resize-y focus:ring-primary focus:border-primary"
                    placeholder="Brief bio about the instructor..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications (Separated by | )</label>
                  <textarea
                    rows={2}
                    {...register("qualifications", {
                      validate: (value) => !value?.includes("|") || "Commas are not allowed. Please use | as separator.",
                    })}
                    className="w-full border rounded p-2 focus:ring-primary focus:border-primary"
                    placeholder="e.g. Cert IV | 10+ Years Experience"
                  />
                  {errors.qualifications && <p className="text-red-500 text-sm mt-1">{errors.qualifications.message as string}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <div className="relative border rounded focus-within:ring-1 focus-within:ring-primary focus-within:border-primary bg-white">
                    <input
                      type={showPassword ? "text" : "password"}
                      {...register("password", {
                        required: "Password is required",
                        minLength: { value: 8, message: "Password must be at least 8 characters" },
                      })}
                      className="w-full outline-none bg-transparent p-2 pr-28 appearance-none"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setValue("password", generateRandomPassword(), { shouldValidate: true });
                          setShowPassword(true);
                        }}
                        className="text-xs text-primary hover:underline font-medium focus:outline-none"
                        tabIndex={-1}
                      >
                        Auto-generate
                      </button>
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message as string}</p>}
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
              <select {...register("transmission")} className="w-full border rounded p-2 focus:ring-primary focus:border-primary">
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
                <option value="Both">Both</option>
              </select>
            </div>

            {instructor && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select {...register("isActive")} className="w-full border rounded p-2 focus:ring-primary focus:border-primary">
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea rows={2} {...register("address")} className="w-full border rounded p-2 resize-y focus:ring-primary focus:border-primary" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Suburbs ({selectedSuburbs.length})</label>
              <SearchableMultiSelect
                placeholder="Search for suburbs to assign..."
                fetchOptions={loadSuburbsData}
                selectedOptions={selectedSuburbs}
                onAdd={handleAddSuburb}
                onRemove={handleRemoveSuburb}
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4 border-t pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 focus:outline-none" disabled={isSaving}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-primary text-white px-6 py-2 rounded hover:bg-red-700 flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {isSaving ? "Saving..." : "Save Instructor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
