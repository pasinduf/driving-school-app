import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    wrapperClassName?: string;
};

/**
 * Standardized password field with a show/hide toggle, matching the Drive Me
 * public website. Works with controlled state (value/onChange) and with
 * react-hook-form via `{...register(...)}` (forwards ref + name/onChange/onBlur).
 * The input inherits the global form-control styling from index.css.
 */
const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className = '', wrapperClassName = '', ...rest }, ref) => {
        const [show, setShow] = useState(false);
        return (
            <div className={`relative ${wrapperClassName}`}>
                <input
                    ref={ref}
                    type={show ? 'text' : 'password'}
                    className={`w-full pr-11 ${className}`}
                    {...rest}
                />
                <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-ink focus:outline-none"
                >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        );
    },
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
