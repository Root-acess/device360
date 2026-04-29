import { useState, useMemo } from 'react';
import { ChevronLeft, User, MapPin, Clock, Navigation, Loader2, Zap } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
interface AddressFields {
  doorNumber: string;
  street: string;
  floor: string;
  landmark: string;
  city: string;
  pincode: string;
}

/* ─────────────────────────────────────────────────────────────
   NAME STEP
───────────────────────────────────────────────────────────── */
interface NameStepProps {
  name: string;
  onSubmit: (n: string) => void;
  goBack: () => void;
}

export const NameStep: React.FC<NameStepProps> = ({ name: init, onSubmit, goBack }) => {
  const [name, setName] = useState(init || '');
  const isValid = name.trim().length >= 2;

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (isValid) onSubmit(name.trim()); }}
      className="p-6 sm:p-8 space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-1">What's your name?</h3>
        <p className="text-sm text-gray-400">For your booking confirmation</p>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Full Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Rahul Sharma"
          autoFocus
          className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none text-base font-semibold text-gray-900 bg-gray-50 focus:bg-white transition-all placeholder:font-normal placeholder:text-gray-400"
          required
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-1.5 px-5 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all"
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
        >
          Continue →
        </button>
      </div>
    </form>
  );
};

/* ─────────────────────────────────────────────────────────────
   ADDRESS STEP
───────────────────────────────────────────────────────────── */
interface AddressStepProps {
  address?: Partial<AddressFields>;
  onSubmit: (a: AddressFields) => void;
  goBack: () => void;
}

export const AddressStep: React.FC<AddressStepProps> = ({ address, onSubmit, goBack }) => {
  const [fields, setFields] = useState<AddressFields>({
    doorNumber: address?.doorNumber || '',
    street:     address?.street    || '',
    floor:      address?.floor     || '',
    landmark:   address?.landmark  || '',
    city:       address?.city      || '',
    pincode:    address?.pincode   || '',
  });
  const [locating, setLocating] = useState(false);
  const [locErr, setLocErr]     = useState('');

  const set = (k: keyof AddressFields, v: string) =>
    setFields((f) => ({ ...f, [k]: v }));

  const canSubmit = useMemo(
    () =>
      fields.doorNumber.trim() &&
      fields.street.trim() &&
      fields.city.trim() &&
      fields.pincode.length >= 5,
    [fields],
  );

  const autoDetect = () => {
    if (!navigator.geolocation) { setLocErr('Geolocation not supported.'); return; }
    setLocating(true); setLocErr('');
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const a    = data.address || {};
          setFields((f) => ({
            ...f,
            street:  a.road || a.street || a.neighbourhood || f.street,
            city:    a.city || a.town || a.village || a.suburb || f.city,
            pincode: a.postcode || f.pincode,
          }));
        } catch { setLocErr('Could not fetch address.'); }
        finally   { setLocating(false); }
      },
      () => { setLocErr('Location access denied. Enter manually.'); setLocating(false); },
    );
  };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (canSubmit) onSubmit(fields); }}
      className="p-6 sm:p-8 space-y-5"
    >
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
          <MapPin className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-1">Pickup Address</h3>
        <p className="text-sm text-gray-400">We'll send our technician to collect your device</p>
      </div>

      {/* Auto-detect */}
      <button
        type="button"
        onClick={autoDetect}
        disabled={locating}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-blue-200 bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-all disabled:opacity-60"
      >
        {locating
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Detecting location…</>
          : <><Navigation className="w-4 h-4" /> Auto-detect my location</>
        }
      </button>

      {locErr && (
        <p className="text-xs text-red-500 text-center">{locErr}</p>
      )}

      {/* Fields grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Door / Flat No. *"    value={fields.doorNumber} onChange={(v) => set('doorNumber', v)} placeholder="e.g. 12B" />
        <Field label="Floor"                value={fields.floor}      onChange={(v) => set('floor', v)}      placeholder="e.g. 2nd Floor" />
        <Field label="Street / Area *"      value={fields.street}     onChange={(v) => set('street', v)}     placeholder="e.g. 4th Cross, Indiranagar" className="sm:col-span-2" />
        <Field label="Landmark"             value={fields.landmark}   onChange={(v) => set('landmark', v)}   placeholder="Near metro / temple" className="sm:col-span-2" />
        <Field label="City *"               value={fields.city}       onChange={(v) => set('city', v)}       placeholder="Bengaluru" />
        <Field label="Pincode *"            value={fields.pincode}    onChange={(v) => set('pincode', v.replace(/\D/g, '').slice(0, 6))} placeholder="560038" inputMode="numeric" />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-1.5 px-5 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className={`flex-1 py-3.5 rounded-2xl font-black text-sm transition-all ${
            canSubmit
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 active:scale-95'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue →
        </button>
      </div>
    </form>
  );
};

/* Reusable field */
const Field: React.FC<{
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; className?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}> = ({ label, value, onChange, placeholder, className = '', inputMode }) => (
  <div className={`space-y-1.5 ${className}`}>
    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest">{label}</label>
    <input
      type="text"
      inputMode={inputMode}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none text-sm font-medium text-gray-900 bg-gray-50 focus:bg-white transition-all placeholder:font-normal placeholder:text-gray-400"
    />
  </div>
);

/* ─────────────────────────────────────────────────────────────
   TIME SLOT STEP
───────────────────────────────────────────────────────────── */
interface TimeSlotStepProps {
  timeSlot: string;
  onSubmit: (slot: string) => void;
  goBack: () => void;
}

// Generate today + tomorrow slots
const generateSlots = () => {
  const now   = new Date();
  const slots: { label: string; value: string; available: boolean }[] = [];

  const days = [
    { label: 'Today',    date: new Date(now) },
    { label: 'Tomorrow', date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) },
  ];

  const hours = [
    { time: '9:00 AM',  h: 9  },
    { time: '11:00 AM', h: 11 },
    { time: '1:00 PM',  h: 13 },
    { time: '3:00 PM',  h: 15 },
    { time: '5:00 PM',  h: 17 },
    { time: '7:00 PM',  h: 19 },
  ];

  days.forEach(({ label: dayLabel, date }) => {
    const dayStr = date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    hours.forEach(({ time, h }) => {
      const slotDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h);
      const available = slotDate > new Date(now.getTime() + 60 * 60 * 1000); // at least 1hr from now
      slots.push({
        label:     `${dayLabel}, ${dayStr} · ${time}`,
        value:     `${dayLabel} ${time}`,
        available,
      });
    });
  });

  return slots;
};

export const TimeSlotStep: React.FC<TimeSlotStepProps> = ({ timeSlot: init, onSubmit, goBack }) => {
  const [selected, setSelected] = useState(init || '');
  const slots = useMemo(() => generateSlots(), []);

  const todaySlots    = slots.slice(0, 6);
  const tomorrowSlots = slots.slice(6);

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (selected) onSubmit(selected); }}
      className="p-6 sm:p-8 space-y-5"
    >
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
          <Clock className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-1">Pick a Pickup Time</h3>
        <p className="text-sm text-gray-400">Our technician will collect your device at this time</p>
      </div>

      {/* 60-min note */}
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-100">
        <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <p className="text-xs text-amber-700 font-medium">
          Repair done within 60 mins of reaching our lab — not of pickup.
        </p>
      </div>

      {/* Today slots */}
      <div>
        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2.5">Today</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {todaySlots.map((slot) => (
            <SlotButton
              key={slot.value}
              slot={slot}
              selected={selected === slot.value}
              onSelect={() => slot.available && setSelected(slot.value)}
            />
          ))}
        </div>
      </div>

      {/* Tomorrow slots */}
      <div>
        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2.5">Tomorrow</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {tomorrowSlots.map((slot) => (
            <SlotButton
              key={slot.value}
              slot={slot}
              selected={selected === slot.value}
              onSelect={() => setSelected(slot.value)}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-1.5 px-5 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          type="submit"
          disabled={!selected}
          className={`flex-1 py-3.5 rounded-2xl font-black text-sm transition-all ${
            selected
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 active:scale-95'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {selected ? 'Confirm Pickup →' : 'Select a time slot'}
        </button>
      </div>
    </form>
  );
};

const SlotButton: React.FC<{
  slot: { label: string; value: string; available: boolean };
  selected: boolean;
  onSelect: () => void;
}> = ({ slot, selected, onSelect }) => {
  // Extract just time part for display
  const timePart = slot.value.split(' ').slice(1).join(' ');
  const dayPart  = slot.value.split(' ')[0];

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!slot.available}
      className={`relative flex flex-col items-center justify-center gap-0.5 py-3 px-2 rounded-2xl border-2 text-center transition-all ${
        !slot.available
          ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
          : selected
          ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100'
          : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/30'
      }`}
    >
      {selected && (
        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 5l2 2 4-4"/>
          </svg>
        </div>
      )}
      <span className={`text-xs font-black ${selected ? 'text-blue-700' : slot.available ? 'text-gray-900' : 'text-gray-300'}`}>
        {timePart}
      </span>
      <span className={`text-[10px] font-medium ${selected ? 'text-blue-500' : slot.available ? 'text-gray-400' : 'text-gray-200'}`}>
        {!slot.available ? 'Passed' : dayPart}
      </span>
    </button>
  );
};
