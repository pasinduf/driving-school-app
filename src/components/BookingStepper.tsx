import React from 'react';
import { Check } from 'lucide-react';

interface BookingStepperProps {
    currentStep: number;
    steps: string[];
}

const BookingStepper: React.FC<BookingStepperProps> = ({ currentStep, steps }) => {
    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-center">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isCurrent = stepNumber === currentStep;

                    return (
                        <React.Fragment key={index}>
                            {/* Step Circle */}
                            <div className="flex flex-col items-center relative z-10">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 border-2
                                        ${isCompleted ? 'bg-primary text-white border-primary' :
                                            isCurrent ? 'bg-primary text-white border-primary' :
                                                'bg-white text-gray-400 border-gray-300'
                                        }`}
                                >
                                    {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
                                </div>
                                <div className={`absolute top-12 text-xs font-medium w-32 text-center ${isCurrent ? 'text-primary' : isCompleted ? 'text-primary' : 'text-gray-400'}`}>
                                    {step}
                                </div>
                            </div>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div className={`flex-1 h-1 mx-2 transition-colors duration-300 ${stepNumber < currentStep ? 'bg-primary' : 'bg-gray-200'}`} style={{ minWidth: '3rem' }}></div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default BookingStepper;
