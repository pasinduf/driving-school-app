import { Loader2 } from 'lucide-react';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    text?: string;
}

export default function Spinner({ size = 'md', className = '', text }: SpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16'
    };

    return (
        <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
            <Loader2 className={`animate-spin text-primary ${sizeClasses[size]}`} />
            {text && <p className="mt-2 text-gray-500 font-medium animate-pulse">{text}</p>}
        </div>
    );
}
