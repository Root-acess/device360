import { useEffect, useRef, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { auth } from '../../../firebaseClient';

const BACKEND = 'https://device360.onrender.com';

// ✅ SINGLE GLOBAL VERIFIER (VERY IMPORTANT)
let recaptchaVerifier: RecaptchaVerifier | null = null;

function getVerifier() {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-root', {
      size: 'invisible',
    });
  }
  return recaptchaVerifier;
}

interface OTPStepProps {
  phone: string;
  onVerify: (code: string) => void;
  goBack: () => void;
}

export const OTPStep: React.FC<OTPStepProps> = ({
  phone,
  onVerify,
  goBack,
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [confirmation, setConfirmation] =
    useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const hasSentRef = useRef(false);

  // ✅ SEND OTP ONLY ONCE
  useEffect(() => {
    if (hasSentRef.current) return;
    hasSentRef.current = true;
    sendOTP();
  }, []);

  const sendOTP = async () => {
    setLoading(true);
    setError('');

    try {
      const verifier = getVerifier();

      const result = await signInWithPhoneNumber(auth, phone, verifier);

      console.log('✅ OTP SENT');

      setConfirmation(result);
      setSent(true);
    } catch (err: any) {
      console.log('🔥 ERROR:', err.code, err.message);

      if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number');
      } else if (err.code === 'auth/invalid-app-credential') {
        setError('App verification failed. Check domain & reCAPTCHA.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Try later.');
      } else {
        setError(err.message || 'Failed to send OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    const code = otp.join('');
    if (!confirmation || code.length !== 6) return;

    setLoading(true);
    setError('');

    try {
      const cred = await confirmation.confirm(code);
      const token = await cred.user.getIdToken();

      console.log('✅ VERIFIED');

      // backend verify (optional)
      await fetch(`${BACKEND}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token }),
      });

      onVerify(code);
    } catch (err: any) {
      console.log('🔥 VERIFY ERROR:', err.code);

      if (err.code === 'auth/invalid-verification-code') {
        setError('Incorrect OTP');
      } else if (err.code === 'auth/code-expired') {
        setError('OTP expired');
      } else {
        setError('Verification failed');
      }
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

  return (
    <div className="bg-white rounded-2xl p-6 shadow space-y-4 text-center">
      <h3 className="text-xl font-bold">Enter OTP</h3>
      <p className="text-sm text-gray-500">{phone}</p>

      <div className="flex justify-center gap-2">
        {otp.map((d, i) => (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            value={d}
            maxLength={1}
            onChange={(e) => handleChange(i, e.target.value)}
            className="w-10 h-12 text-center border rounded text-lg"
          />
        ))}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button onClick={goBack} className="px-4 py-2 border rounded">
          <ChevronLeft size={16} /> Back
        </button>

        <button
          onClick={verifyOTP}
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 rounded"
        >
          {loading ? 'Please wait…' : 'Verify OTP'}
        </button>
      </div>
    </div>
  );
};