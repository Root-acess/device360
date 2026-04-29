import { useState } from 'react';
import { ChevronLeft, Smartphone } from 'lucide-react';

interface PhoneStepProps {
  phone: string;
  onSubmit: (p: string) => void;
  goBack: () => void;
}

export const PhoneStep: React.FC<PhoneStepProps> = ({ phone: init, onSubmit, goBack }) => {
  const [phone, setPhone] = useState(init.replace('+91', '') || '');
  const [error, setError] = useState('');

  const isValid = phone.length === 10 && /^[6-9]\d{9}$/.test(phone);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setError('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    onSubmit(`+91${phone}`);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
          <Smartphone className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-1">Enter your number</h3>
        <p className="text-sm text-gray-400">We'll send a one-time OTP to verify</p>
      </div>

      {/* Phone input */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
          Mobile Number
        </label>
        <div className="flex items-center gap-0 rounded-2xl border-2 border-gray-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 overflow-hidden transition-all bg-gray-50 focus-within:bg-white">
          {/* Country flag + code */}
          <div className="flex items-center gap-2 px-4 py-3.5 bg-gray-100 border-r border-gray-200 flex-shrink-0">
            <span className="text-lg leading-none">🇮🇳</span>
            <span className="text-sm font-bold text-gray-600">+91</span>
          </div>
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => {
              setError('');
              setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
            }}
            placeholder="10-digit mobile number"
            className="flex-1 px-4 py-3.5 text-base font-semibold text-gray-900 bg-transparent outline-none placeholder:text-gray-400 placeholder:font-normal"
            data-testid="phone-input"
            autoComplete="tel-national"
          />
          {/* Live validation tick */}
          {isValid && (
            <div className="pr-4">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M2 6l3 3 5-5"/>
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Inline validation messages */}
        {phone.length > 0 && !isValid && phone.length < 10 && (
          <p className="text-xs text-gray-400 pl-1">
            {10 - phone.length} more digit{10 - phone.length !== 1 ? 's' : ''} needed
          </p>
        )}
        {phone.length === 10 && !isValid && (
          <p className="text-xs text-red-500 pl-1">
            Number must start with 6, 7, 8 or 9
          </p>
        )}
        {error && <p className="text-xs text-red-500 pl-1">{error}</p>}
      </div>

      {/* Privacy note */}
      <p className="text-[11px] text-gray-400 text-center leading-relaxed">
        🔒 Your number is only used for booking confirmation. We never share it.
      </p>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-1.5 px-5 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
          data-testid="back-button"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <button
          type="submit"
          disabled={!isValid}
          className={`flex-1 py-3.5 rounded-2xl font-black text-sm transition-all ${
            isValid
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 active:scale-95'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          data-testid="phone-submit-button"
        >
          Send OTP →
        </button>
      </div>
    </form>
  );
};
