import { useState } from 'react';
import { ChevronLeft, MapPin, User, Clock, Navigation, Zap } from 'lucide-react';

/* ================= NAME STEP ================= */

interface NameStepProps {
  name: string;
  onSubmit: (n: string) => void;
  goBack: () => void;
}

export const NameStep: React.FC<NameStepProps> = ({ name: init, onSubmit, goBack }) => {
  const [name, setName] = useState(init || '');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim()) onSubmit(name.trim());
      }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5"
    >
      <div className="text-center">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-50 flex items-center justify-center">
          <User className="w-7 h-7 text-blue-600" />
        </div>
        <h3 className="text-xl font-extrabold text-gray-900 mb-1">What's your name?</h3>
        <p className="text-sm text-gray-400">For your booking confirmation</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
          required
        />
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={goBack} className="flex items-center gap-1.5 px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <button
          type="submit"
          disabled={!name.trim()}
          className={`flex-1 py-3 rounded-xl font-bold text-sm ${
            name.trim()
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </form>
  );
};

/* ================= ADDRESS STEP ================= */

interface AddressFields {
  doorNumber: string;
  street: string;
  floor: string;
  landmark: string;
  city: string;
  pincode: string;
}

interface AddressStepProps {
  address?: Partial<AddressFields>; // ✅ FIXED (removed string type)
  onSubmit: (a: AddressFields) => void;
  goBack: () => void;
}

export const AddressStep: React.FC<AddressStepProps> = ({ address, onSubmit, goBack }) => {
  const [fields, setFields] = useState<AddressFields>({
    doorNumber: address?.doorNumber || '',
    street: address?.street || '',
    floor: address?.floor || '',
    landmark: address?.landmark || '',
    city: address?.city || '',
    pincode: address?.pincode || '',
  });

  const [locating, setLocating] = useState(false);
  const [locErr, setLocErr] = useState('');

  const set = (k: keyof AddressFields, v: string) =>
    setFields((f) => ({
      ...f,
      [k]: v,
    }));

  const canSubmit =
    fields.doorNumber.trim() &&
    fields.street.trim() &&
    fields.city.trim() &&
    fields.pincode.length === 6;

  const autoDetect = () => {
    if (!navigator.geolocation) {
      setLocErr('Geolocation not supported.');
      return;
    }

    setLocating(true);
    setLocErr('');

    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const a = data.address || {};

          setFields((f) => ({
            ...f,
            street: a.road || a.street || f.street,
            city: a.city || a.town || a.village || a.suburb || f.city,
            pincode: a.postcode || f.pincode,
          }));
        } catch {
          setLocErr('Could not fetch address.');
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocErr('Location denied.');
        setLocating(false);
      }
    );
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onSubmit(fields);
      }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-4"
    >
      <div className="text-center">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-50 flex items-center justify-center">
          <MapPin className="w-7 h-7 text-blue-600" />
        </div>
        <h3 className="text-xl font-extrabold text-gray-900 mb-1">Pickup address</h3>
      </div>

      <button type="button" onClick={autoDetect} disabled={locating} className="w-full py-2.5 border border-blue-300 rounded-xl text-blue-600">
        {locating ? 'Detecting…' : 'Auto-detect location'}
      </button>

      <input value={fields.doorNumber} onChange={(e) => set('doorNumber', e.target.value)} placeholder="Door No" className="input" />
      <input value={fields.street} onChange={(e) => set('street', e.target.value)} placeholder="Street" className="input" />
      <input value={fields.city} onChange={(e) => set('city', e.target.value)} placeholder="City" className="input" />
      <input value={fields.pincode} onChange={(e) => set('pincode', e.target.value)} placeholder="Pincode" className="input" />

      <div className="flex gap-3">
        <button type="button" onClick={goBack}>Back</button>
        <button type="submit" disabled={!canSubmit}>Continue</button>
      </div>
    </form>
  );
};

/* ================= TIME SLOT ================= */

interface TimeSlotStepProps {
  timeSlot: string;
  onSubmit: (slot: string) => void;
  goBack: () => void;
}

export const TimeSlotStep: React.FC<TimeSlotStepProps> = ({ timeSlot: init, onSubmit, goBack }) => {
  const [selected, setSelected] = useState(init || '');

  const slots = Array.from({ length: 12 }, (_, i) => `${9 + i}:00`);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (selected) onSubmit(selected);
      }}
      className="bg-white p-6 space-y-4"
    >
      <h3>Select Time</h3>

      <div className="grid grid-cols-3 gap-2">
        {slots.map((s) => (
          <button key={s} type="button" onClick={() => setSelected(s)}>
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={goBack}>Back</button>
        <button type="submit" disabled={!selected}>Confirm</button>
      </div>
    </form>
  );
};