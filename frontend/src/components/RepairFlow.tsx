import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { BrandSelection } from './steps/BrandSelection';
import { ModelSelection } from './steps/ModelSelection';
import { IssueSelection } from './steps/IssueSelection';
import { PricingDisplay } from './steps/PricingDisplay';
import { LeadCapture } from './steps/LeadCapture';
import { Confirmation } from './steps/Confirmation';
import type { FormData } from '../types';

const STEPS = [
  { id: 1, name: 'Brand' },
  { id: 2, name: 'Model' },
  { id: 3, name: 'Issue' },
  { id: 4, name: 'Price' },
  { id: 5, name: 'Contact' },
  { id: 6, name: 'Done' },
];

const STEP_COMPONENTS: Record<number, React.ComponentType<any>> = {
  1: BrandSelection,
  2: ModelSelection,
  3: IssueSelection,
  4: PricingDisplay,
  5: LeadCapture,
  6: Confirmation,
};

export const RepairFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    brand: null,
    model: '',
    issue: null,
    pricing: null,
    name: '',
    phone: '',
    address: { doorNumber: '', street: '', floor: '', landmark: '', city: '', pincode: '' },
    timeSlot: '',
    doorstepPickup: true,
    bookingId: null,
  });

  const updateFormData = (data: Partial<FormData>) => setFormData((prev) => ({ ...prev, ...data }));

  const goToNextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const CurrentStep = STEP_COMPONENTS[currentStep];
  const showStickyPrice = currentStep >= 4 && currentStep < 6 && formData.pricing;

  return (
    <div className="min-h-screen bg-gray-50 py-10 pb-32">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-extrabold text-2xl sm:text-3xl text-gray-900 mb-6 text-center">Book a Repair</h1>

          {/* Step indicators */}
          <div className="flex items-center">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    currentStep > step.id ? 'bg-green-500 text-white' :
                    currentStep === step.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' :
                    'bg-white text-gray-400 border-2 border-gray-200'
                  }`}>
                    {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  <span className="text-xs mt-1.5 font-medium text-gray-400 hidden sm:block">{step.name}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-1 transition-all ${currentStep > step.id ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
          >
            <CurrentStep
              formData={formData}
              updateFormData={updateFormData}
              goToNextStep={goToNextStep}
              goToPreviousStep={goToPreviousStep}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sticky price bar */}
      {showStickyPrice && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-xl">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400 font-medium">Your quote</p>
              <div className="flex items-baseline gap-2">
                {formData.pricing?.oldPrice && (
                  <span className="text-base text-gray-400 line-through">₹{formData.pricing.oldPrice}</span>
                )}
                <span className="text-2xl font-extrabold text-gray-900">₹{formData.pricing?.price}</span>
              </div>
            </div>
            <button
              onClick={goToNextStep}
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-md flex items-center gap-2"
            >
              {currentStep === 4 ? 'Book Now' : 'Continue'} →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
