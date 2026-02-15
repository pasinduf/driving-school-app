import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isConfirming: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary';
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    isConfirming = false,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'primary'
}: ConfirmationModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            setTimeout(() => setIsVisible(false), 200); // Wait for transition
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
            <div className={`bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 overflow-hidden relative transform transition-all duration-200 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>

                <button
                    onClick={onClose}
                    disabled={isConfirming}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-6 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-500 mb-6 text-sm">{message}</p>

                    <div className="flex justify-center space-x-3">
                        <button
                            onClick={onClose}
                            disabled={isConfirming}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm w-24"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                            }}
                            disabled={isConfirming}
                            className={
                                `px-4 py-2 text-white rounded-md transition-colors font-medium text-sm w-24 ${variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-opacity-90 disabled:opacity-50'}`
                            }
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
