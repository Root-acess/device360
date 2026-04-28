import { useMemo, useState } from 'react';
import { ChevronLeft, MapPin, Navigation, Loader2 } from 'lucide-react';
import type { AddressFields } from '../../types';

interface AddressStepProps {
  address?: Partial<AddressFields> | string;
  onSubmit: (address: AddressFields) => void;
  goBack: () => void;
}

const emptyAddress: AddressFields = {
  doorNumber: '',
  street: '',
  floor: '',
  landmark: '',
  city: '',
  pincode: '',
};

const toAddressFields = (value?: Partial<AddressFields> | string): AddressFields => {
  if (!value || typeof value === 'string') return emptyAddress;

  return {
    doorNumber: value.doorNumber || '',
    street: value.street || '',
    floor: value.floor || '',
    landmark: value.landmark || '',
    city: value.city || '',
    pincode: value.pincode || '',
  };
};

export const AddressStep: React.FC<AddressStepProps> = ({ address, onSubmit, goBack }) => {
  const [fields, setFields] = useState<AddressFields>(() => toAddressFields(address));
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');

  const update = (key: keyof AddressFields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const canSubmit = useMemo(
    () => Boolean(fields.doorNumber.trim() && fields.street.trim() && fields.city.trim() && fields.pincode.trim()),
    [fields],
  );

  const handleAutoDetect = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setError('');
    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=jsonv2`,
            { headers: { 'Accept': 'application/json' } },
          );
          const data = await response.json();
          const addr = data?.address || {};

          setFields((prev) => ({
            ...prev,
            street: addr.road || addr.pedestrian || addr.neighbourhood || prev.street,
            city: addr.city || addr.town || addr.village || addr.suburb || prev.city,
            pincode: addr.postcode || prev.pincode,
          }));
        } catch {
          setError('Could not detect your address. Please fill it manually.');
        } finally {
          setLocating(false);
        }
      },
      () => {
        setError('Location access denied. Please enter your address manually.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit(fields);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[28px] border border-gray-200 bg-white p-5 sm:p-6 shadow-sm space-y-5">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 border border-blue-100">
          <MapPin className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-black text-gray-950">Pickup Address</h3>
        <p className="mt-1 text-sm text-gray-500">We will send a porter to collect your device</p>
      </div>

      <button
        type="button"
        onClick={handleAutoDetect}
        disabled={locating}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition-all hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
        {locating ? 'Detecting location…' : 'Auto-detect my location'}
      </button>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Door / Flat No." value={fields.doorNumber} onChange={(v) => update('doorNumber', v)} placeholder="e.g. 12B" />
        <Field label="Street / Area" value={fields.street} onChange={(v) => update('street', v)} placeholder="e.g. 4th Cross, Indiranagar" />
        <Field label="Floor" value={fields.floor} onChange={(v) => update('floor', v)} placeholder="e.g. 2nd Floor" />
        <Field label="Landmark" value={fields.landmark} onChange={(v) => update('landmark', v)} placeholder="Near metro station" />
        <Field label="City" value={fields.city} onChange={(v) => update('city', v)} placeholder="Bengaluru" />
        <Field label="Pincode" value={fields.pincode} onChange={(v) => update('pincode', v)} placeholder="560038" />
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        <button
          type="submit"
          disabled={!canSubmit}
          className="flex-1 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
        >
          Continue →
        </button>
      </div>
    </form>
  );
};

const Field = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => (
  <label className="space-y-2">
    <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
    />
  </label>
);
