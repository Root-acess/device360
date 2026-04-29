import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ShieldCheck, RefreshCw } from 'lucide-react';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { auth } from '../../../firebaseClient';

const BACKEND = 'https://device360.onrender.com';
const OTP_EXPIRY_SECS = 60; // Firebase OTP valid for 60s

// ── Verifier management ────────────────────────────────────────────────────
// We keep ONE verifier per container ID. On error we destroy and recreate.
let _verifier: RecaptchaVerifier | null = null;

function destroyVerifier() {
  try { _verifier?.clear(); } catch { /* ignore */ }
  _verifier = null;
}

function getOrCreateVerifier(): RecaptchaVerifier {
  if (!_verifier) {
    _verifier = new RecaptchaVerifier(auth, 'recaptcha-root', {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => { destroyVerifier(); },
    });
  }
  return _verifier;
}

interface OTPStepProps {
  phone: string;
  onVerify: (code: string) => void;
  goBack: () => void;
}

export const OTPStep: React.FC<OTPStepProps> = ({ phone, onVerify, goBack }) => {
  const [otp, setOtp]                     = useState(['', '', '', '', '', '']);
  const [confirmation, setConfirmation]   = useState<ConfirmationResult | null>(null);
  const [loading, setLoading]             = useState(false);
  const [verifying, setVerifying]         = useState(false);
  const [error, setError]                 = useState('');
  const [sent, setSent]                   = useState(false);
  const [countdown, setCountdown]         = useState(OTP_EXPIRY_SECS);
  const [canResend, setCanResend]         = useState(false);

  const inputRefs   = useRef<(HTMLInputElement | null)[]>([]);
  const hasSentRef  = useRef(false);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Start countdown ──────────────────────────────────────────────────────
  const startCountdown = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(OTP_EXPIRY_SECS);
    setCanResend(false);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          setCanResend(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // ── Send OTP once on mount ───────────────────────────────────────────────
  useEffect(() => {
    if (hasSentRef.current) return;
    hasSentRef.current = true;
    sendOTP();
  }, []);

  // ── Auto-submit when all 6 digits filled ────────────────────────────────
  useEffect(() => {
    if (otp.every((d) => d !== '') && confirmation && !verifying) {
      verifyOTP(otp.join(''));
    }
  }, [otp]);

  // ── Send / Resend OTP ────────────────────────────────────────────────────
  const sendOTP = async () => {
    setLoading(true);
    setError('');
    setSent(false);

    try {
      // Always get a fresh verifier on (re)send to avoid stale state
      destroyVerifier();
      const verifier = getOrCreateVerifier();
      const result   = await signInWithPhoneNumber(auth, phone, verifier);

      setConfirmation(result);
      setSent(true);
      startCountdown();
      // Focus first input
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      destroyVerifier(); // always clean up on error
      const code = err?.code ?? '';
      if (code === 'auth/invalid-phone-number')    setError('Invalid phone number. Go back and check.');
      else if (code === 'auth/too-many-requests')  setError('Too many attempts. Please wait a few minutes.');
      else if (code === 'auth/invalid-app-credential') setError('App credential error. Refresh and try again.');
      else setError(err.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    hasSentRef.current = false; // allow re-send
    setOtp(['', '', '', '', '', '']);
    setError('');
    sendOTP();
  };

  // ── Verify OTP ───────────────────────────────────────────────────────────
  // KEY FIX: call onVerify IMMEDIATELY after Firebase confirms — don't wait for backend
  const verifyOTP = async (code: string) => {
    if (!confirmation || code.length !== 6) return;

    setVerifying(true);
    setError('');

    try {
      const cred  = await confirmation.confirm(code);
      const token = await cred.user.getIdToken();

      // ✅ Call onVerify RIGHT AWAY — don't block on backend
      onVerify(code);

      // Fire-and-forget backend notification (Render cold start doesn't block user)
      fetch(`${BACKEND}/api/auth/verify-otp`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ idToken: token }),
      }).catch(() => { /* non-critical */ });

    } catch (err: any) {
      const code_ = err?.code ?? '';
      if (code_ === 'auth/invalid-verification-code') {
        setError('Incorrect OTP. Please check and try again.');
      } else if (code_ === 'auth/code-expired') {
        setError('OTP expired. Tap "Resend OTP" to get a new one.');
        setCanResend(true);
        if (timerRef.current) clearInterval(timerRef.current);
        setCountdown(0);
      } else {
        setError('Verification failed. Try resending OTP.');
      }
      // Clear inputs on error so user can retype
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setVerifying(false);
    }
  };

  // ── Input handling ───────────────────────────────────────────────────────
  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const updated = [...otp];
    updated[i] = val.slice(-1);
    setOtp(updated);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  // Handle paste (e.g. from SMS autofill)
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (digits.length === 6) {
      setOtp(digits.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const isComplete = otp.every((d) => d !== '');

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* Hidden recaptcha container */}
      <div id="recaptcha-root" />

      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
          <ShieldCheck className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-1">Verify your number</h3>
        <p className="text-sm text-gray-400">
          {loading && !sent
            ? 'Sending OTP…'
            : sent
            ? <>OTP sent to <span className="font-bold text-gray-700">{phone}</span></>
            : 'Getting ready…'
          }
        </p>
      </div>

      {/* OTP Inputs */}
      <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={loading || verifying}
            className={`w-11 h-14 sm:w-12 sm:h-14 text-center text-2xl font-black rounded-2xl border-2 outline-none transition-all
              ${digit ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-gray-50 text-gray-900'}
              ${(loading || verifying) ? 'opacity-50 cursor-not-allowed' : 'focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50'}
              ${error ? 'border-red-300 bg-red-50' : ''}
            `}
          />
        ))}
      </div>

      {/* Countdown / Resend */}
      <div className="text-center">
        {verifying ? (
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold">Verifying…</span>
          </div>
        ) : canResend ? (
          <button
            onClick={handleResend}
            disabled={loading}
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {loading ? 'Sending…' : 'Resend OTP'}
          </button>
        ) : sent ? (
          <p className="text-xs text-gray-400">
            Resend OTP in{' '}
            <span className={`font-bold ${countdown <= 10 ? 'text-red-500' : 'text-gray-600'}`}>
              {countdown}s
            </span>
          </p>
        ) : null}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-red-50 border border-red-100">
          <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-[10px] font-black">!</span>
          </div>
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Verify button (shown when all filled but not yet auto-submitting) */}
      {isComplete && !verifying && !error && (
        <div className="flex items-center justify-center gap-2 text-green-600">
          <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold">Verifying automatically…</span>
        </div>
      )}

      {/* Manual verify button (fallback for errors) */}
      {error && isComplete && (
        <button
          onClick={() => verifyOTP(otp.join(''))}
          disabled={verifying}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black text-sm hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
        >
          {verifying ? 'Verifying…' : 'Try Again'}
        </button>
      )}

      {/* Back */}
      <button
        onClick={goBack}
        disabled={loading || verifying}
        className="w-full flex items-center justify-center gap-1.5 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all disabled:opacity-40"
      >
        <ChevronLeft className="w-4 h-4" /> Change number
      </button>
    </div>
  );
};
