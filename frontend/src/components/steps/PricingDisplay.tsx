import { ChevronLeft, CheckCircle, Video, Zap } from 'lucide-react';
import type { StepProps } from '../../types';

export const PricingDisplay: React.FC<StepProps> = ({ formData, goToNextStep, goToPreviousStep }) => {
  const { brand, model, pricing, issue } = formData;
  const isLive = issue?.liveRepair;

  return (
    <div className="space-y-4">
      {/* Price card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <div className="text-center mb-6">
          <h2 className="text-xl font-extrabold text-gray-900 mb-1">Your repair quote</h2>
          <p className="text-sm text-gray-400">Transparent pricing, no hidden charges</p>
        </div>

        {isLive && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200 mb-6">
            <div className="w-9 h-9 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
              <Video className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-green-800 text-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Eligible for LIVE Repair
              </p>
              <p className="text-xs text-green-700 mt-0.5">Watch your repair via real-time video stream</p>
            </div>
          </div>
        )}

        <div className="space-y-4 pb-6 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <p className="text-sm text-gray-400">Device</p>
            <p className="font-bold text-gray-900 text-right">{brand?.name} {model}</p>
          </div>
          <div className="flex justify-between items-start">
            <p className="text-sm text-gray-400">Service</p>
            <div className="text-right">
              <p className="font-bold text-gray-900">{pricing?.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">Est. time: {pricing?.time}</p>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <p className="text-sm text-gray-400 mb-2">Total amount</p>
          <div className="flex items-baseline gap-3 mb-1">
            {pricing?.oldPrice && <span className="text-xl text-gray-400 line-through">₹{pricing.oldPrice}</span>}
            <span className="text-4xl font-extrabold text-gray-900" data-testid="price-amount">₹{pricing?.price}</span>
          </div>
          <p className="text-xs text-gray-400">Includes parts + labour + GST</p>
        </div>

        <div className="mt-6 space-y-2.5 pt-6 border-t border-gray-100">
          {[
            '6-month warranty on all repairs',
            'Genuine parts guaranteed',
            'Free doorstep pickup & delivery',
            ...(isLive ? ['Real-time video tracking included'] : []),
          ].map((item) => (
            <div key={item} className="flex items-center gap-2.5 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="text-gray-600">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 60-min badge */}
      <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-blue-50 border border-blue-100">
        <Zap className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <div>
          <p className="font-bold text-blue-800 text-sm">60-Minute Repair Promise</p>
          <p className="text-xs text-blue-600 mt-0.5">Pickup & drop not included. Repair done within 60 mins of reaching our lab.</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={goToPreviousStep} className="flex items-center gap-1.5 px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all" data-testid="back-button">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={goToNextStep} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-md transition-all" data-testid="proceed-to-fix-button">
          Book This Repair →
        </button>
      </div>
    </div>
  );
};
