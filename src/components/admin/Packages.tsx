import { useState, useEffect } from 'react';
import { fetchAdminPackages, createPackage, updatePackage, deactivatePackage } from '../../api/client';
import { ListChecks, Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import Spinner from '../Spinner';
import ConfirmationModal from '../ConfirmationModal';

interface Package {
    id: number;
    name: string;
    description: string;
    price: number;
    duration: number;
    margin: number;
    maximumSlotsCount: number;
    isHighlight: boolean;
    isActive: boolean;
}

export default function Packages() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Deletion Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [packageToDelete, setPackageToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<Partial<Package>>({
        defaultValues: {
            name: '',
            description: '',
            duration: 45,
            price: 0,
            maximumSlotsCount: 1,
            margin: 15,
            isHighlight: false,
            isActive: true,
        }
    });

    const loadPackages = async () => {
        setIsLoading(true);
        try {
            const data = await fetchAdminPackages();
            setPackages(data);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPackages();
    }, []);

    const formatDuration = (val: number) => {
        if (val === 45) return '45MIN';
        if (val === 60) return '1HR';
        if (val === 90) return '1.5HR';
        if (val === 120) return '2HR';
        return `${val}MIN`;
    };

    const openModal = (mode: 'add' | 'edit', pkg?: Package) => {
        setModalMode(mode);
        if (mode === 'edit' && pkg) {
            setSelectedPackage(pkg);
            reset(pkg);
        } else {
            setSelectedPackage(null);
            reset({
                name: '',
                description: '',
                duration: 45,
                price: 0,
                maximumSlotsCount: 1,
                margin: 15,
                isHighlight: false,
                isActive: true,
            });
        }
        setIsModalOpen(true);
    };

    const onFormSubmit = async (data: Partial<Package>) => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...data,
                price: Number(data.price),
                duration: Number(data.duration),
                maximumSlotsCount: Number(data.maximumSlotsCount),
                margin: Number(data.margin),
            };
            if (data.isActive !== undefined) payload.isActive = String(data.isActive) === 'true';

            if (modalMode === 'add') {
                await createPackage(payload);
                toast.success("Package created successfully");
            } else if (modalMode === 'edit' && selectedPackage) {
                await updatePackage(selectedPackage.id, payload);
                toast.success("Package updated successfully");
            }
            setIsModalOpen(false);
            loadPackages();
        } catch (error: any) {
            toast.error(error.response?.data?.message || `Failed to ${modalMode} package`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeactivateClick = (id: number) => {
        setPackageToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const executeDeactivate = async () => {
        if (packageToDelete === null) return;
        setIsDeleting(true);
        try {
            await deactivatePackage(packageToDelete);
            toast.success("Package deactivated successfully");
            loadPackages();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to deactivate package");
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
            setPackageToDelete(null);
        }
    };

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ListChecks className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Manage Packages</h2>
              <p className="text-sm text-gray-500">Add, edit, or deactivate website packages</p>
            </div>
          </div>
          <button
            onClick={() => openModal("add")}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Package
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
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Duration</th>
                    <th className="px-6 py-4 font-medium">Margin</th>
                    <th className="px-6 py-4 font-medium">Max Slots</th>
                    <th className="px-6 py-4 font-medium">Price</th>
                    <th className="px-6 py-4 font-medium text-center">Highlight</th>
                    <th className="px-6 py-4 font-medium text-center">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {packages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {pkg.name}
                        {pkg.description && <p className="text-xs text-gray-400 font-normal mt-0.5 truncate max-w-[200px]">{pkg.description}</p>}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{formatDuration(pkg.duration)}</td>
                      <td className="px-6 py-4 text-gray-600">{pkg.margin} min</td>
                      <td className="px-6 py-4 text-gray-600">{pkg.maximumSlotsCount}</td>
                      <td className="px-6 py-4 font-medium text-green-700">${pkg.price}</td>
                      <td className="px-6 py-4 text-center">
                        {pkg.isHighlight ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            ★ Best Value
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            pkg.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {pkg.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            title="Edit"
                            onClick={() => openModal("edit", pkg)}
                            className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            title="Deactivate"
                            onClick={() => handleDeactivateClick(pkg.id)}
                            disabled={!pkg.isActive}
                            className={`p-1.5 rounded-md transition-colors ${!pkg.isActive ? "text-gray-300 cursor-not-allowed" : "text-gray-400 hover:text-red-500 hover:bg-red-50"}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {packages.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        No packages found. Click "Add Package" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Form */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <h3 className="text-xl font-bold text-gray-900">{modalMode === "add" ? "Add New Package" : "Edit Package"}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Package Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        {...register("name", { required: "Name is required" })}
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                        placeholder="e.g. 1HR LESSONS"
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message as string}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price ($) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register("price", { required: "Price is required", min: { value: 1, message: "Price must be valid" } })}
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                      />
                      {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message as string}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Bookable Slots/Day <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register("maximumSlotsCount", { required: "Required" })}
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? "Slot" : "Slots"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register("duration", { required: "Duration is required" })}
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                      >
                        <option value={45}>45 MIN</option>
                        <option value={60}>1 HR</option>
                        <option value={90}>1.5 HR</option>
                        <option value={120}>2 HR</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rest Margin (Between bookings)</label>
                      <select
                        {...register("margin", { required: "Margin is required" })}
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                      >
                        <option value={15}>15 Minutes</option>
                        <option value={30}>30 Minutes</option>
                        <option value={60}>60 Minutes</option>
                      </select>
                    </div>
                    <div className="pt-2 flex items-center">
                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <input type="checkbox" {...register("isHighlight")} className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary" />
                        <div>
                          <span className="text-sm font-medium text-gray-900 block group-hover:text-primary transition-colors">
                            Highlight as Special Package
                          </span>
                          <span className="text-xs text-gray-500 block">Max 2 highlights total</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {modalMode === "edit" && (
                  <div className="border-t pt-4">
                    <div className="w-1/2 pr-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select {...register("isActive")} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary">
                        <option value={"true"}>Active</option>
                        <option value={"false"}>Inactive</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary resize-y"
                    placeholder="Enter optional description..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="relative flex items-center justify-center px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-opacity-90 font-medium transition-colors disabled:opacity-50 overflow-hidden min-w-[120px]"
                    disabled={isSubmitting}
                  >
                    <span className={`flex items-center gap-2 transition-opacity ${isSubmitting ? "opacity-0" : "opacity-100"}`}>Save</span>
                    {isSubmitting && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Spinner size="sm" />
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={executeDeactivate}
          isConfirming={isDeleting}
          title="Deactivate Package"
          message="Are you sure you want to deactivate this package? Customers will no longer be able to select it during booking."
          confirmText="Deactivate"
          variant="danger"
        />
      </div>
    );
}
