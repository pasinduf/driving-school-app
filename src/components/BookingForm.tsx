import { useForm } from 'react-hook-form';
import type { Suburb } from '../api/client';
import { useMasterData } from '../context/MasterDataContext';
import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { generateRandomPassword } from '../util/generateRandomPassword';

interface BookingFormProps {
    onSubmit: (data: any) => void;
    isSubmitting: boolean;
    onCancel: () => void;
    selectedSuburb: Suburb | null;
}

export default function BookingForm({
    onSubmit,
    isSubmitting,
    onCancel,
    selectedSuburb
}: BookingFormProps) {

    const { suburbs } = useMasterData();
    const relations = ['Parent', 'Guardian', 'Grandparent', 'Partner', 'Other']
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register, handleSubmit, setValue, watch, resetField, formState: { errors } } = useForm({
        defaultValues: {
            suburb: '',
            registerFor: 'myself',
            transmission: 'Automatic',
            pickupAddress: '',
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            contactPersonFirstName: '',
            contactPersonLastName: '',
            contactPersonEmail: '',
            contactPersonPhone: '',
            relation: '',
            notes: '',
            terms: false,
            password: '',
            confirmPassword: ''
        }
    });

    useEffect(() => {
        if (selectedSuburb) {
            setValue("suburb", selectedSuburb.id);
        }
    }, [selectedSuburb, setValue]);

    const registerFor = watch('registerFor');
    const termsAccepted = watch('terms');

    useEffect(() => {
        if (registerFor === "myself") {
            resetField("contactPersonFirstName");
            resetField("contactPersonLastName");
            resetField("contactPersonEmail");
            resetField("contactPersonPhone");
            resetField("relation");
        }
    }, [registerFor, resetField]);



    const generatePassword = () => {
        const password = generateRandomPassword();
        setValue("password", password, { shouldValidate: true });
        setValue("confirmPassword", password, { shouldValidate: true });
    };

    const handleFormSubmit = (data: any) => onSubmit(data);

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 text-left">
            <div>
                <h3 className="font-semibold mb-2">Who are you registering for?</h3>
                <div className="flex flex-col space-y-2">
                    <label className="flex items-center space-x-2">
                        <input
                            type="radio"
                            value="myself"
                            {...register("registerFor")}
                            className="text-primary focus:ring-primary"
                        />
                        <span>Myself</span>
                    </label>
                    <label className="flex items-center space-x-2">
                        <input
                            type="radio"
                            value="someone_else"
                            {...register("registerFor")}
                            className="text-primary focus:ring-primary"
                        />
                        <span>Someone else (e.g. child, partner, grandchild, other)</span>
                    </label>
                </div>
            </div>

            <div className="border-t pt-5">
                <h3 className="text-gray-500 mb-4 font-semibold uppercase text-sm tracking-wide">
                    {registerFor === 'myself' ? 'Please enter your pick up details' : "Please enter learner's pick up details"}
                </h3>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Suburb <span className="text-red-500">*</span></label>
                    <select
                        className="w-full border p-2 rounded disabled:bg-gray-100 disabled:text-gray-400"
                        {...register('suburb', { required: 'Please select a suburb' })}
                    >
                        <option value="">Select a suburb</option>
                        {suburbs.map(s => <option key={s.id} value={s.id}>{s.name} ({s.postalcode})</option>)}
                    </select>
                    {errors.suburb && <p className="text-red-500 text-sm mt-1">{errors.suburb.message as string}</p>}
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Pick up address <span className="text-red-500">*</span></label>
                        <input
                            {...register('pickupAddress', { required: 'Address is required' })}
                            placeholder="Enter a complete address (including street)"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary"
                        />
                        {errors.pickupAddress && <p className="text-red-500 text-sm mt-1">{errors.pickupAddress.message as string}</p>}
                    </div>
                </div>
            </div>

            <div className="border-t pt-4">
                <h3 className="text-gray-500 mb-4 font-semibold uppercase text-sm tracking-wide">
                    {registerFor === 'myself' ? 'Please provide your personal details' : "Please provide learner's personal details"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">First name <span className="text-red-500">*</span></label>
                        <input
                            {...register('firstName', { required: 'First name is required' })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary"
                        />
                        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message as string}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Last name <span className="text-red-500">*</span></label>
                        <input
                            {...register('lastName', { required: 'Last name is required' })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary"
                        />
                        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message as string}</p>}
                    </div>
                    {registerFor === 'myself' &&
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                            <input
                                {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: "Invalid email" } })}
                                type="email"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary"
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message as string}</p>}
                        </div>
                    }
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone number <span className="text-red-500">*</span></label>
                        <input
                            {...register('phone', { required: 'Phone number is required' })}
                            placeholder="0400 000 000"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary"
                        />
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message as string}</p>}
                    </div>
                    {registerFor === 'myself' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' } })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 pr-24 focus:ring-primary focus:border-primary"
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                                        <button
                                            type="button"
                                            onClick={generatePassword}
                                            className="text-xs text-primary hover:underline font-medium"
                                        >
                                            Auto-generate
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message as string}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Confirm Password <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        {...register('confirmPassword', {
                                            required: 'Please confirm your password',
                                            validate: (val) => watch('password') === val || "Passwords do not match"
                                        })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 pr-10 focus:ring-primary focus:border-primary"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message as string}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-sm text-gray-500 bg-yellow-50 p-2 rounded border border-blue-100">
                                    <span className="font-semibold">Note:</span> Use the above email and password to log in to the portal.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>


            {registerFor !== 'myself' &&
                <div className="border-t pt-4">
                    <h3 className="text-gray-500 mb-4 font-semibold uppercase text-sm tracking-wide">
                        Please provide your details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">First name <span className="text-red-500">*</span></label>
                            <input
                                {...register('contactPersonFirstName', { required: 'First name is required' })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary"
                            />
                            {errors.contactPersonFirstName && <p className="text-red-500 text-sm mt-1">{errors.contactPersonFirstName.message as string}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Last name <span className="text-red-500">*</span></label>
                            <input
                                {...register('contactPersonLastName', { required: 'Last name is required' })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary"
                            />
                            {errors.contactPersonLastName && <p className="text-red-500 text-sm mt-1">{errors.contactPersonLastName.message as string}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                            <input
                                {...register('contactPersonEmail', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: "Invalid email" } })}
                                type="email"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary"
                            />
                            {errors.contactPersonEmail && <p className="text-red-500 text-sm mt-1">{errors.contactPersonEmail.message as string}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone number <span className="text-red-500">*</span></label>
                            <input
                                {...register('contactPersonPhone', { required: 'Phone number is required' })}
                                placeholder="0400 000 000"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary"
                            />
                            {errors.contactPersonPhone && <p className="text-red-500 text-sm mt-1">{errors.contactPersonPhone.message as string}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 pr-24 focus:ring-primary focus:border-primary"
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                                    <button
                                        type="button"
                                        onClick={generatePassword}
                                        className="text-xs text-primary hover:underline font-medium"
                                    >
                                        Auto-generate
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message as string}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirm Password <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    {...register('confirmPassword', {
                                        required: 'Please confirm your password',
                                        validate: (val) => watch('password') === val || "Passwords do not match"
                                    })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 pr-10 focus:ring-primary focus:border-primary"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message as string}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-sm text-gray-500 bg-blue-50 p-2 rounded border border-blue-100">
                                <span className="font-semibold">Note:</span> Use the above email and password to log in to the portal.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1"> Relationship to learner <span className="text-red-500">*</span></label>
                            <select
                                {...register('relation', { required: 'Please select a relation' })}
                                className="w-full border p-2 rounded disabled:bg-gray-100 disabled:text-gray-400"
                            >
                                <option value="">Please select </option>
                                {relations.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            {errors.relation && <p className="text-red-500 text-sm mt-1">{errors.relation.message as string}</p>}
                        </div>
                    </div>
                </div>

            }

            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                <textarea
                    {...register('notes')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-primary focus:border-primary"
                    rows={2}
                />
            </div>

            <div className="pt-4">
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        {...register('terms', { required: 'You must agree to the terms and conditions' })}
                        className="text-primary focus:ring-primary rounded h-4 w-4"
                    />
                    <span className="text-sm">
                        I agree to the <a href="#" className="text-primary hover:underline">Learner Driver Terms & Conditions</a>
                    </span>
                </label>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className={`px-8 py-2 bg-primary text-white rounded-md hover:bg-primary font-medium ${isSubmitting || !termsAccepted ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isSubmitting || !termsAccepted}
                >
                    {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                </button>
            </div>
        </form>
    );
}
