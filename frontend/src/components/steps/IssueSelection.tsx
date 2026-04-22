import { useState } from 'react';
import { ChevronLeft, Video } from 'lucide-react';
import * as Icons from 'lucide-react';
import { issues, getPriceForRepair } from '../../data/mockData';
import type { StepProps, Issue } from '../../types';

export const IssueSelection: React.FC<StepProps> = ({ formData, updateFormData, goToNextStep, goToPreviousStep }) => {
  const [selected, setSelected] = useState<Issue | null>(formData.issue || null);

  const liveIssues = issues.filter((i) => i.category === 'live');
  const otherIssues = issues.filter((i) => i.category === 'other');

  const handleContinue = () => {
    if (selected && formData.brand) {
      const pricing = getPriceForRepair(formData.brand.id, formData.model, selected.id);
      updateFormData({ issue: selected, pricing });
      goToNextStep();
    }
  };

  const IssueCard: React.FC<{ issue: Issue; isLive?: boolean }> = ({ issue, isLive }) => {
    const IconComponent = (Icons as any)[issue.icon] as React.FC<any>;
    const isSelected = selected?.id === issue.id;

    return (
      <button
        onClick={() => setSelected(issue)}
        className={`relative p-4 rounded-xl border-2 text-left transition-all ${
          isSelected
            ? isLive ? 'border-green-500 bg-green-50' : 'border-blue-500 bg-blue-50'
            : 'border-gray-100 hover:border-gray-300 bg-white'
        }`}
        data-testid={`issue-option-${issue.id}`}
      >
        {isLive && (
          <span className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            LIVE
          </span>
        )}
        {isSelected && (
          <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">✓</span>
        )}
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${isSelected ? (isLive ? 'bg-green-100' : 'bg-blue-100') : 'bg-gray-100'}`}>
          {IconComponent && <IconComponent className={`w-5 h-5 ${isSelected ? (isLive ? 'text-green-600' : 'text-blue-600') : 'text-gray-500'}`} />}
        </div>
        <p className={`font-semibold text-sm ${isSelected ? (isLive ? 'text-green-700' : 'text-blue-700') : 'text-gray-800'}`}>{issue.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{issue.time}</p>
      </button>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-extrabold text-gray-900 mb-1">What's the issue?</h2>
        <p className="text-sm text-gray-400">{formData.brand?.name} {formData.model}</p>
      </div>

      {/* Live repair section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Video className="w-4 h-4 text-green-600" />
          <span className="text-sm font-bold text-gray-800">LIVE Repair — Watch it happen</span>
          <span className="ml-auto text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">60 mins</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {liveIssues.map((issue) => <IssueCard key={issue.id} issue={issue} isLive />)}
        </div>
      </div>

      {/* Standard repair */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-bold text-gray-800">Standard Repairs</span>
          <span className="ml-auto text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">2–5 hours</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {otherIssues.map((issue) => <IssueCard key={issue.id} issue={issue} />)}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={goToPreviousStep} className="flex items-center gap-1.5 px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all" data-testid="back-button">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!selected}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${selected ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          data-testid="continue-button"
        >
          See Price
        </button>
      </div>
    </div>
  );
};
