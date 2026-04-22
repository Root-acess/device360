import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Phone, MapPin, User, Clock, Navigation, Zap } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth } from '../../../firebaseClient';

const BACKEND = (import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000') as string;
const IS_DEV = import.meta.env.DEV;

let _verifier: RecaptchaVerifier | null = null;
let _verifierPromise: Promise<RecaptchaVerifier> | null = null;

// Prevent duplicate auto-send in React StrictMode / quick remounts
const autoSendThrottle = new Map<string, number>();

function resetVerifier() {
  try {
    _verifier?.clear();
  } catch {
    // ignore cleanup failures
  }
  _verifier = null;
  _verifierPromise = null;
}

async function getVerifier(): Promise<RecaptchaVerifier> {
  if (_verifier) return _verifier;
  if (_verifierPromise) return _verifierPromise;

  _verifierPromise = (async () => {
    const verifier = new RecaptchaVerifier(auth, 'recaptcha-root', {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => {
        resetVerifier();
      },
    });

    await verifier.render();
    _verifier = verifier;
    return verifier;
  })().catch((err) => {
    resetVerifier();
    throw err;
  });

  return _verifierPromise;
}

// ── PhoneStep ─────────────────────────────────────────────────────────────────
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
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
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
          {loading ? 'Please wait…' : 'Continue'}
        </button>
      </div>
    </form>
  );
};

// ── OTPStep ───────────────────────────────────────────────────────────────────
interface OTPStepProps {
  phone: string;
  onVerify: (code: string) => void;
  goBack: () => void;
}

export const OTPStep: React.FC<OTPStepProps> = ({ phone, onVerify, goBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer === 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  useEffect(() => {
    const now = Date.now();
    const last = autoSendThrottle.get(phone) ?? 0;
    if (!phone || now - last < 1500) return;

    autoSendThrottle.set(phone, now);
    void sendOTP();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone]);

  useEffect(() => {
    return () => {
      resetVerifier();
    };
  }, []);

  const sendOTP = async () => {
    setLoading(true);
    setError('');

    try {
      const verifier = await getVerifier();
      const result = await signInWithPhoneNumber(auth, phone, verifier);
      setConfirmation(result);
      setSent(true);
      setTimer(30);
    } catch (err: any) {
      console.error('sendOTP:', err?.code, err?.message);
      resetVerifier();

      if (err.code === 'auth/too-many-requests') setError('Too many requests. Wait a few minutes.');
      else if (err.code === 'auth/invalid-phone-number') setError('Invalid phone number. Go back and re-enter.');
      else if (err.code === 'auth/quota-exceeded') setError('Daily SMS quota exceeded. Try again tomorrow.');
      else if (err.code === 'auth/captcha-check-failed') {
        setError('Security check failed. Hard-refresh (Ctrl+Shift+R) and retry.');
      } else if (err.code === 'auth/internal-error') {
        setError('Firebase internal error. Check test number, authorized domain, and app verification settings.');
      } else {
        setError(err.message || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    const code = otp.join('');
    if (code.length !== 6 || !confirmation) return;

    setLoading(true);
    setError('');

    try {
      const cred = await confirmation.confirm(code);
      const token = await cred.user.getIdToken();

      const res = await fetch(`${BACKEND}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Verification failed');
      }

      onVerify(code);
    } catch (err: any) {
      if (err.code === 'auth/invalid-verification-code') setError('Incorrect OTP. Check and try again.');
      else if (err.code === 'auth/code-expired') setError('OTP expired. Please resend.');
      else setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const updated = [...otp];
    updated[i] = val.slice(-1);
    setOtp(updated);

    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (p.length === 6) {
      setOtp(p.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5">
      {IS_DEV && (
        <div className="px-3 py-2 rounded-lg bg-yellow-50 border border-yellow-200 text-xs text-yellow-800 text-center font-medium">
          🧪 Dev mode — use your Firebase test phone &amp; its fixed OTP code
        </div>
      )}

      <div className="text-center">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl">
          📱
        </div>
        <h3 className="text-xl font-extrabold text-gray-900 mb-1">Enter OTP</h3>
        <p className="text-sm text-gray-400">
          {sent ? (
            <>
              Sent to <span className="font-semibold text-gray-700">{phone}</span>
            </>
          ) : loading ? (
            'Sending OTP…'
          ) : (
            'Ready'
          )}
        </p>
      </div>

      <div className="flex justify-center gap-2" onPaste={handlePaste}>
        {otp.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            disabled={loading || !sent}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-11 h-12 text-center text-lg font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition-all disabled:opacity-40"
            data-testid={`otp-input-${i}`}
          />
        ))}
      </div>

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}

      <p className="text-sm text-center text-gray-400">
        {timer > 0 ? (
          `Resend OTP in ${timer}s`
        ) : (
          <button
            type="button"
            onClick={sendOTP}
            disabled={loading}
            className="text-blue-600 font-semibold underline disabled:opacity-50"
          >
            Resend OTP
          </button>
        )}
      </p>

      <div className="flex gap-3">
        <button
          onClick={goBack}
          disabled={loading}
          className="flex items-center gap-1.5 px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 disabled:opacity-50"
          data-testid="back-button"
          type="button"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <button
          onClick={verify}
          disabled={otp.join('').length !== 6 || loading || !confirmation}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
            otp.join('').length === 6 && !loading && confirmation
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          data-testid="otp-verify-button"
          type="button"
        >
          {loading ? 'Please wait…' : 'Verify OTP'}
        </button>
      </div>
    </div>
  );
};

// ── NameStep ──────────────────────────────────────────────────────────────────
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

// ── AddressStep ───────────────────────────────────────────────────────────────
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

// ── TimeSlotStep ──────────────────────────────────────────────────────────────
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