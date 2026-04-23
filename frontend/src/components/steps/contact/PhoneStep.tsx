import { useState } from 'react';
import { ChevronLeft, Phone } from 'lucide-react';

interface PhoneStepProps {
  phone: string;
  onSubmit: (p: string) => void;
  goBack: () => void;
}

export const PhoneStep: React.FC<PhoneStepProps> = ({ phone: init, onSubmit, goBack }) => {
  const [phone, setPhone] = useState(init.replace('+91', '') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) return;

    setLoading(true);
    setError('');

    try {
      onSubmit(`+91${phone}`);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5"
    >
      <div className="text-center">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-50 flex items-center justify-center">
          <Phone className="w-7 h-7 text-blue-600" />
        </div>
        <h3 className="text-xl font-extrabold text-gray-900 mb-1">Enter your phone</h3>
        <p className="text-sm text-gray-400">We'll send an OTP to verify</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">
            +91
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              setError('');
              setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
            }}
            placeholder="10-digit mobile number"
            className="w-full pl-14 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
            data-testid="phone-input"
            required
          />
        </div>

        {phone.length > 0 && phone.length < 10 && (
          <p className="text-xs text-red-500 mt-1">Enter a valid 10-digit number</p>
        )}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-1.5 px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50"
          data-testid="back-button"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <button
          type="submit"
          disabled={phone.length !== 10 || loading}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
            phone.length === 10 && !loading
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          data-testid="phone-submit-button"
        >
          {loading ? 'Please wait…' : 'Send OTP'}
        </button>
      </div>
    </form>
  );
};