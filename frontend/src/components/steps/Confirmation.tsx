import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Phone, Clock, MapPin, MessageCircle, Video, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { StepProps, AddressFields } from '../../types';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const Confirmation: React.FC<StepProps> = ({ formData }) => {
  const navigate = useNavigate();
  const isLive = formData.issue?.liveRepair;
  const [videoLink, setVideoLink] = useState<string | null>(null);

  useEffect(() => {
    if (!isLive || !formData.bookingId) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND}/api/leads/${formData.bookingId}`);
        const data = await res.json();
        if (data.lead?.videoLink) { setVideoLink(data.lead.videoLink); clearInterval(id); }
      } catch { /* silent */ }
    }, 15000);
    return () => clearInterval(id);
  }, [isLive, formData.bookingId]);

  const addrStr = (() => {
    const a = formData.address;
    if (typeof a === 'object') {
      const f = a as AddressFields;
      return `${f.doorNumber}, ${f.floor ? f.floor + ', ' : ''}${f.street}, ${f.city} - ${f.pincode}`;
    }
    return a as string;
  })();

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`Hi! Booking confirmed.\nID: #${formData.bookingId}\nDevice: ${formData.brand?.name} ${formData.model}\nIssue: ${formData.issue?.name}\nPickup: ${formData.timeSlot}\nAddress: ${addrStr}`);
    window.open(`https://wa.me/919876543210?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-5">
      {/* Success animation */}
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.5 }} className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
      </motion.div>

      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-gray-900">Booking Confirmed!</h2>
        <p className="text-gray-400 mt-1">Thank you, {formData.name}. We've received your request.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Booking ID</p>
          <p className="text-2xl font-extrabold text-gray-900" data-testid="booking-id">#{formData.bookingId || 'PENDING'}</p>
        </div>

        {/* 60-min badge */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
          <Zap className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <p className="text-xs text-blue-700 font-medium">60-minute repair promise. Pickup & drop not included.</p>
        </div>

        {/* Live repair */}
        {isLive && (
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <div className="flex items-start gap-3">
              <Video className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-bold text-green-800 text-sm">✅ Eligible for LIVE Repair</p>
                {videoLink ? (
                  <a href={videoLink} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700">
                    <Video className="w-3.5 h-3.5" /> Watch Live Repair
                  </a>
                ) : (
                  <p className="text-xs text-green-700 mt-1">You'll receive a live video link via SMS & WhatsApp once repair starts.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Details */}
        <div className="space-y-3 pt-3 border-t border-gray-100">
          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-800 text-sm">We'll call you soon</p>
              <p className="text-xs text-gray-400">Team will confirm via {formData.phone} within 15 min</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-800 text-sm">Pickup at {formData.timeSlot}</p>
              <p className="text-xs text-gray-400">{addrStr}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-800 text-sm">Estimated: {formData.pricing?.time}</p>
              <p className="text-xs text-gray-400">{formData.issue?.name} on {formData.brand?.name} {formData.model}</p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">Need help? <a href="tel:+919876543210" className="text-blue-600 font-semibold">+91 98765 43210</a></p>
        </div>
      </div>

      <div className="space-y-3">
        <button onClick={handleWhatsApp}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#25D366] text-white font-bold hover:bg-[#1fb855] transition-all shadow-md"
          data-testid="whatsapp-chat-button">
          <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
        </button>
        {formData.bookingId && (
          <button onClick={() => navigate(`/dashboard/${formData.bookingId}`)}
            className="w-full py-3 rounded-xl border-2 border-blue-200 text-blue-600 font-bold hover:bg-blue-50 transition-all text-sm"
            data-testid="track-repair-button">
            Track Repair Status →
          </button>
        )}
      </div>
    </div>
  );
};
