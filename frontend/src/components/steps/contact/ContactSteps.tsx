import { useState } from 'react';
import { ChevronLeft, MapPin, User, Clock, Navigation, Zap } from 'lucide-react';

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
          data-testid="name-input"
          required
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-1.5 px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm"
          data-testid="back-button"
        >
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
          data-testid="name-submit-button"
        >
          Continue
        </button>
      </div>
    </form>
  );
};

interface AddressFields {
  doorNumber: string;
  street: string;
  floor: string;
  landmark: string;
  city: string;
  pincode: string;
}

interface AddressStepProps {
  address: AddressFields | string;
  onSubmit: (a: AddressFields) => void;
  goBack: () => void;
}

export const AddressStep: React.FC<AddressStepProps> = ({ address: init, onSubmit, goBack }) => {
  const [fields, setFields] = useState<AddressFields>({
    doorNumber: '',
    street: '',
    floor: '',
    landmark: '',
    city: '',
    pincode: '',
    ...(typeof init === 'object' ? init : {}),
  });
  const [locating, setLocating] = useState(false);
  const [locErr, setLocErr] = useState('');

  const set = (k: keyof AddressFields, v: string) =>
    setFields((f) => ({
      ...f,
      [k]: v,
    }));

  const canSubmit =
    fields.doorNumber.trim() && fields.street.trim() && fields.city.trim() && fields.pincode.length === 6;

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
          setLocErr('Could not fetch address. Fill manually.');
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocErr('Location denied. Fill manually.');
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
        <p className="text-sm text-gray-400">We'll send a porter to collect your device</p>
      </div>

      <button
        type="button"
        onClick={autoDetect}
        disabled={locating}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-blue-300 text-blue-600 font-semibold text-sm hover:bg-blue-50 transition-all disabled:opacity-50"
        data-testid="auto-detect-location"
      >
        <Navigation className="w-4 h-4" />
        {locating ? 'Detecting…' : 'Auto-detect my location'}
      </button>

      {locErr && <p className="text-xs text-red-500">{locErr}</p>}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Door / Flat No. *</label>
          <input
            value={fields.doorNumber}
            onChange={(e) => set('doorNumber', e.target.value)}
            placeholder="e.g. 4B"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm"
            data-testid="address-door"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Floor</label>
          <input
            value={fields.floor}
            onChange={(e) => set('floor', e.target.value)}
            placeholder="e.g. 3rd"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm"
            data-testid="address-floor"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Street / Area *</label>
        <input
          value={fields.street}
          onChange={(e) => set('street', e.target.value)}
          placeholder="e.g. MG Road, Koramangala"
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm"
          data-testid="address-street"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Landmark</label>
        <input
          value={fields.landmark}
          onChange={(e) => set('landmark', e.target.value)}
          placeholder="e.g. Near Cafe Coffee Day"
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm"
          data-testid="address-landmark"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">City *</label>
          <input
            value={fields.city}
            onChange={(e) => set('city', e.target.value)}
            placeholder="Bengaluru"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm"
            data-testid="address-city"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Pincode *</label>
          <input
            value={fields.pincode}
            onChange={(e) => set('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="560001"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm"
            data-testid="address-pincode"
            required
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-1.5 px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm"
          data-testid="back-button"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <button
          type="submit"
          disabled={!canSubmit}
          className={`flex-1 py-3 rounded-xl font-bold text-sm ${
            canSubmit
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          data-testid="address-submit-button"
        >
          Continue
        </button>
      </div>
    </form>
  );
};

interface TimeSlotStepProps {
  timeSlot: string;
  onSubmit: (slot: string) => void;
  goBack: () => void;
}

export const TimeSlotStep: React.FC<TimeSlotStepProps> = ({ timeSlot: init, onSubmit, goBack }) => {
  const [selected, setSelected] = useState(init || '');

  const [slots] = useState(() => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const result: { value: string; display: string }[] = [];

    for (let hour = 9; hour <= 20; hour++) {
      for (const min of [0, 30]) {
        if (hour === h && min <= m) continue;
        if (hour > h || (hour === h && min > m + 30)) {
          const period = hour >= 12 ? 'PM' : 'AM';
          const dh = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
          result.push({
            value: `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
            display: `${dh}:${String(min).padStart(2, '0')} ${period}`,
          });
        }
      }
    }

    return result;
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (selected) onSubmit(selected);
      }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5"
    >
      <div className="text-center">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-50 flex items-center justify-center">
          <Clock className="w-7 h-7 text-blue-600" />
        </div>
        <h3 className="text-xl font-extrabold text-gray-900 mb-1">Select pickup time</h3>
        <p className="text-sm text-gray-400">When should we collect your device?</p>
      </div>

      <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
        <Zap className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <p className="text-xs text-blue-700 font-medium">
          60-minute repair promise. Repair done within 60 mins of reaching our lab.
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
        {slots.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setSelected(s.value)}
            className={`py-2.5 rounded-xl border-2 font-medium text-xs transition-all ${
              selected === s.value
                ? 'border-blue-500 bg-blue-600 text-white'
                : 'border-gray-200 text-gray-700 hover:border-blue-300'
            }`}
            data-testid={`time-slot-${s.value}`}
          >
            {s.display}
          </button>
        ))}

        {slots.length === 0 && (
          <p className="col-span-full text-center text-gray-400 text-sm py-6">
            No slots today. Please call us.
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-1.5 px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm"
          data-testid="back-button"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <button
          type="submit"
          disabled={!selected}
          className={`flex-1 py-3 rounded-xl font-bold text-sm ${
            selected
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          data-testid="time-slot-submit-button"
        >
          Confirm Booking
        </button>
      </div>
    </form>
  );
};