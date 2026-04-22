import { useState } from 'react';
import { ChevronLeft, Smartphone } from 'lucide-react';
import { brands } from '../../data/mockData';
import type { StepProps } from '../../types';

export const ModelSelection: React.FC<StepProps> = ({ formData, updateFormData, goToNextStep, goToPreviousStep }) => {
  const [selected, setSelected] = useState(formData.model || '');
  const currentBrand = brands.find((b) => b.id === formData.brand?.id);

  const handleContinue = () => {
    if (selected) {
      updateFormData({ model: selected, issue: null, pricing: null });
      goToNextStep();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
      <div className="text-center">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-50 flex items-center justify-center">
          <Smartphone className="w-7 h-7 text-blue-600" />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-1">Select your model</h2>
        <p className="text-sm text-gray-400">{formData.brand?.name} — choose your device</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
        {currentBrand?.models.map((model) => (
          <button
            key={model}
            onClick={() => setSelected(model)}
            className={`p-3 rounded-xl border-2 text-left text-sm font-medium transition-all ${
              selected === model
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-100 hover:border-blue-200 text-gray-700'
            }`}
            data-testid={`model-option-${model.replace(/\s+/g, '-').toLowerCase()}`}
          >
            {model}
          </button>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={goToPreviousStep} className="flex items-center gap-1.5 px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all" data-testid="back-button">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!selected}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${selected ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          data-testid="continue-button"
        >
          Continue
        </button>
      </div>
    </div>
  );
};
