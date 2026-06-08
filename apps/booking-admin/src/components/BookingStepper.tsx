import React from 'react';
import { Check } from 'lucide-react';

interface BookingStepperProps {
    currentStep: number;
    steps: string[];
}

const BookingStepper: React.FC<BookingStepperProps> = ({ currentStep, steps }) => {
    return (
        <div className="mx-auto w-full max-w-3xl">
            <div className="flex items-start justify-between">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isCurrent = stepNumber === currentStep;

                    return (
                        <React.Fragment key={index}>
                            {/* Step node */}
                            <div className="flex flex-shrink-0 flex-col items-center">
                                <div className="relative">
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300 sm:h-11 sm:w-11
                                            ${isCompleted
                                                ? 'border-primary bg-primary text-white'
                                                : isCurrent
                                                    ? 'border-primary bg-primary text-white scale-110 shadow-glow'
                                                    : 'border-line bg-white text-gray-400'}`}
                                    >
                                        {isCompleted ? <Check className="h-5 w-5" /> : stepNumber}
                                    </div>
                                    {isCurrent && (
                                        <span className="pointer-events-none absolute -inset-1 rounded-full border-2 border-primary/30 animate-pulse" />
                                    )}
                                </div>
                                <span
                                    className={`mt-2.5 w-16 text-center text-[11px] font-semibold leading-tight transition-colors sm:w-28 sm:text-xs
                                        ${isCurrent || isCompleted ? 'text-primary' : 'text-gray-400'}`}
                                >
                                    {step}
                                </span>
                            </div>

                            {/* Connector */}
                            {index < steps.length - 1 && (
                                <div className="relative mx-1 mt-5 h-1 flex-1 overflow-hidden rounded-full bg-line sm:mx-2 sm:mt-[22px]">
                                    <div
                                        className={`absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-500 ease-out ${isCompleted ? 'w-full' : 'w-0'}`}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default BookingStepper;
