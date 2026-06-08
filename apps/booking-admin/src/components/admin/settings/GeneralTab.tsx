import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Save, Loader2, Copy, Check, ExternalLink, MapPin, Plus, Trash2 } from 'lucide-react';
import { updateCompanyGeneral } from '../../../api/company-api';
import {
    fetchManagedTestingCenters,
    saveTestingCenters,
    type ManagedTestingCenter,
} from '../../../api/testing-center-api';
import { useCompany } from '../../../context/CompanyContext';

interface GeneralFormData {
    name: string;
    contactEmail: string;
    contactNumber: string;
    address: string;
    terms: string;
}

export default function GeneralTab() {
    const queryClient = useQueryClient();
    const { company } = useCompany();

    const { register, handleSubmit, reset } = useForm<GeneralFormData>({
        defaultValues: {
            name: company?.name || '',
            contactEmail: company?.contactEmail || '',
            contactNumber: company?.contactNumber || '',
            address: company?.address || '',
            terms: company?.terms || ''
        }
    });

    useEffect(() => {
        if (company) {
            reset({
                name: company.name,
                contactEmail: company.contactEmail,
                contactNumber: company.contactNumber,
                address: company.address,
                terms: company.terms
            });
        }
    }, [company, reset]);

    const mutation = useMutation({
      mutationFn: updateCompanyGeneral,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["company"] });
        toast.success("General details updated");
      },
      onError: () => toast.error("Failed to update settings"),
    });

    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-8">
                <div className="space-y-8">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">General Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                <input
                                    type="text"
                                    {...register('name')}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-100 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed font-medium"
                                />
                                <p className="text-[10px] text-gray-400 mt-1 italic">Company name cannot be changed.</p>
                            </div>

                            <div className="md:col-span-2">
                                <h4 className="text-sm font-semibold text-gray-900 mb-4 pt-4 border-t">Contact Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                                        <input
                                            type="email"
                                            {...register('contactEmail')}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                                        <input
                                            type="text"
                                            {...register('contactNumber')}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Physical Address</label>
                                <textarea
                                    rows={2}
                                    {...register('address')}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                />
                            </div>

                            <div className="md:col-span-2 pt-6 border-t">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Portal Links</h3>
                                <div className="grid grid-cols-1 gap-4 mt-4">
                                    <ReadOnlyUrlField label="Admin Panel URL" url={company?.adminPanelUrl} />
                                    <ReadOnlyUrlField label="Website URL" url={company?.websiteUrl} />
                                </div>
                            </div>

                            <div className="md:col-span-2 pt-6 border-t">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal & Policies</h3>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                                <textarea
                                    rows={6}
                                    {...register('terms')}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono text-sm"
                                    placeholder="Write your company terms and conditions here..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t flex justify-end">
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-opacity-90 transition-all font-medium disabled:opacity-50"
                        >
                            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </div>
                </div>
            </form>

            {/* Testing Centers / Locations — managed separately so it can be saved any time */}
            <TestingCentersSection />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Testing Centers / Locations management                                     */
/* -------------------------------------------------------------------------- */

interface CenterRow {
    key: string;
    id?: number;
    name: string;
    postalcode: string;
    latitude: string;
    longitude: string;
    isActive: boolean;
}

let rowSeq = 0;
const newRow = (): CenterRow => ({
    key: `new-${Date.now()}-${rowSeq++}`,
    name: '',
    postalcode: '',
    latitude: '',
    longitude: '',
    isActive: true,
});

function TestingCentersSection() {
    const queryClient = useQueryClient();
    const { company } = useCompany();

    const [enabled, setEnabled] = useState(false);
    const [rows, setRows] = useState<CenterRow[]>([]);
    const [hydrated, setHydrated] = useState(false);

    const { data: centers, isLoading } = useQuery({
        queryKey: ['managedTestingCenters'],
        queryFn: fetchManagedTestingCenters,
    });

    // Seed local state once from the server (enabled flag + existing rows).
    useEffect(() => {
        if (hydrated || isLoading || !centers) return;
        setEnabled(company?.settings?.testingCentersEnabled ?? false);
        setRows(
            centers.map((c) => ({
                key: `row-${c.id}`,
                id: c.id,
                name: c.name,
                postalcode: c.postalcode,
                latitude: String(c.latitude),
                longitude: String(c.longitude),
                isActive: c.isActive,
            })),
        );
        setHydrated(true);
    }, [centers, isLoading, hydrated, company]);

    const mutation = useMutation({
        mutationFn: saveTestingCenters,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['managedTestingCenters'] });
            queryClient.invalidateQueries({ queryKey: ['company'] });
            toast.success('Testing centers saved');
        },
        onError: (err: any) =>
            toast.error(err?.response?.data?.message || 'Failed to save testing centers'),
    });

    const updateRow = (key: string, patch: Partial<CenterRow>) =>
        setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));

    const removeRow = (key: string) => setRows((prev) => prev.filter((r) => r.key !== key));

    const handleToggle = (next: boolean) => {
        setEnabled(next);
        // Enabling with no rows yet → start them off with one empty row.
        if (next && rows.length === 0) setRows([newRow()]);
    };

    const validate = (): string | null => {
        if (!enabled) return null;
        const active = rows.filter((r) => r.isActive);
        if (active.length === 0) return 'Add at least one active testing center, or turn the feature off.';
        for (const r of rows) {
            if (!r.name.trim()) return 'Each testing center needs a name.';
            if (!r.postalcode.trim()) return 'Each testing center needs a postal code.';
            const lat = Number(r.latitude);
            const lng = Number(r.longitude);
            if (r.latitude.trim() === '' || Number.isNaN(lat) || lat < -90 || lat > 90)
                return `Enter a valid latitude (-90 to 90) for "${r.name || 'a center'}".`;
            if (r.longitude.trim() === '' || Number.isNaN(lng) || lng < -180 || lng > 180)
                return `Enter a valid longitude (-180 to 180) for "${r.name || 'a center'}".`;
        }
        return null;
    };

    const handleSave = () => {
        const error = validate();
        if (error) {
            toast.error(error);
            return;
        }
        const payload = {
            enabled,
            centers: rows.map<ManagedTestingCenter>((r) => ({
                id: r.id,
                name: r.name.trim(),
                postalcode: r.postalcode.trim(),
                latitude: Number(r.latitude),
                longitude: Number(r.longitude),
                isActive: r.isActive,
            })),
        };
        mutation.mutate(payload);
    };

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Testing Centers / Locations</h3>
                        <p className="text-sm text-gray-500">Shown as “Our Locations” on your public website.</p>
                    </div>
                </div>
            </div>

            {/* Enable toggle */}
            <label className="mt-5 flex items-center gap-3 cursor-pointer">
                <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => handleToggle(e.target.checked)}
                    className="h-4 w-4 rounded text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-gray-800">Configure Testing Centers / Locations</span>
            </label>

            {isLoading ? (
                <div className="py-8 flex justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
            ) : enabled ? (
                <div className="mt-5 space-y-4">
                    {rows.length === 0 && (
                        <p className="text-sm text-gray-400 italic">No testing centers yet. Add one below.</p>
                    )}

                    {rows.map((row) => (
                        <div
                            key={row.key}
                            className={`rounded-xl border p-4 transition-colors ${row.isActive ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'}`}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Name <span className="text-red-500">*</span></label>
                                    <input
                                        value={row.name}
                                        onChange={(e) => updateRow(row.key, { name: e.target.value })}
                                        placeholder="e.g. Deer Park"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Postal Code <span className="text-red-500">*</span></label>
                                    <input
                                        value={row.postalcode}
                                        onChange={(e) => updateRow(row.key, { postalcode: e.target.value })}
                                        placeholder="e.g. 3023"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Latitude <span className="text-red-500">*</span></label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={row.latitude}
                                            onChange={(e) => updateRow(row.key, { latitude: e.target.value })}
                                            placeholder="-37.7703"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Longitude <span className="text-red-500">*</span></label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={row.longitude}
                                            onChange={(e) => updateRow(row.key, { longitude: e.target.value })}
                                            placeholder="144.7748"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={row.isActive}
                                        onChange={(e) => updateRow(row.key, { isActive: e.target.checked })}
                                        className="h-4 w-4 rounded text-primary focus:ring-primary"
                                    />
                                    <span className="text-xs font-medium text-gray-600">{row.isActive ? 'Active' : 'Inactive'}</span>
                                </label>
                                {!row.id && (
                                    <button
                                        type="button"
                                        onClick={() => removeRow(row.key)}
                                        className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={() => setRows((prev) => [...prev, newRow()])}
                        className="inline-flex items-center gap-2 rounded-lg border border-dashed border-primary/40 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
                    >
                        <Plus className="w-4 h-4" /> Add testing center
                    </button>
                </div>
            ) : (
                <p className="mt-4 text-sm text-gray-500">
                    Testing centers are turned off and won't appear on your website.
                </p>
            )}

            <div className="mt-6 pt-5 border-t flex justify-end">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={mutation.isPending}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-opacity-90 transition-all font-medium disabled:opacity-50"
                >
                    {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Locations
                </button>
            </div>
        </div>
    );
}

/** Read-only label/value URL row with a copy-to-clipboard button. */
function ReadOnlyUrlField({ label, url }: { label: string; url?: string | null }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!url) return;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success('URL copied successfully');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Failed to copy URL');
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="flex items-center gap-2 w-full px-4 py-2 border border-gray-100 bg-gray-50 rounded-lg">
                {url ? (
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-0 truncate text-sm font-medium text-primary hover:underline flex items-center gap-1"
                    >
                        <span className="truncate">{url}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                ) : (
                    <span className="flex-1 min-w-0 text-sm text-gray-400 italic">Not set</span>
                )}
                <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!url}
                    title="Copy URL"
                    className="shrink-0 p-1.5 rounded-md text-gray-500 hover:text-primary hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
}
