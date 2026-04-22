import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Eye, CheckCircle, Clock, MapPin, Phone, ArrowLeft, Video, Zap } from 'lucide-react';
import type { Lead } from '../types';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const REPAIR_STEPS = [
  { id: 1, label: 'Booking Confirmed', icon: CheckCircle, statuses: ['pending', 'confirmed', 'picked_up', 'in_progress', 'completed'] },
  { id: 2, label: 'Device Picked Up', icon: Package, statuses: ['picked_up', 'in_progress', 'completed'] },
  { id: 3, label: 'Repair in Progress', icon: Eye, statuses: ['in_progress', 'completed'] },
  { id: 4, label: 'Quality Check', icon: CheckCircle, statuses: ['completed'] },
  { id: 5, label: 'Out for Delivery', icon: MapPin, statuses: ['delivered'] },
];

export const Dashboard: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) return;
    const fetch_ = async () => {
      try {
        const res = await fetch(`${BACKEND}/api/leads/${bookingId}`);
        const data = await res.json();
        if (res.ok) setBooking(data.lead || data);
      } catch { /* silent */ } finally { setLoading(false); }
    };
    fetch_();
    const id = setInterval(fetch_, 30000);
    return () => clearInterval(id);
  }, [bookingId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!booking) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-gray-500">Booking not found.</p>
      <button onClick={() => navigate('/')} className="px-6 py-2 rounded-xl bg-blue-600 text-white font-semibold">Go Home</button>
    </div>
  );

  const isLive = ['Display Replacement', 'Screen Replacement', 'Battery Replacement', 'Back Glass'].includes(booking.issue);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </button>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Header card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Booking ID</p>
                <p className="text-xl font-extrabold text-gray-900">#{booking.id}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                booking.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                booking.status === 'in_progress' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                booking.status === 'picked_up' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                'bg-yellow-100 text-yellow-700 border-yellow-200'
              }`}>
                {booking.status?.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Device</p>
                <p className="font-semibold text-gray-800">{booking.brand} {booking.model}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Issue</p>
                <p className="font-semibold text-gray-800">{booking.issue}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Pickup Time</p>
                <p className="font-semibold text-gray-800">{booking.timeSlot}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Amount</p>
                <p className="font-semibold text-gray-800">₹{booking.price}</p>
              </div>
            </div>
          </div>

          {/* 60-min badge */}
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-blue-50 border border-blue-100">
            <Zap className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <p className="text-xs text-blue-700 font-medium">60-minute repair promise — repair done within 60 mins of reaching our lab.</p>
          </div>

          {/* Live video */}
          {isLive && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <Video className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-gray-900">Live Repair Stream</h3>
              </div>
              {booking.videoLink ? (
                <a href={booking.videoLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all">
                  <Video className="w-4 h-4" /> Watch Your Repair LIVE
                </a>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-dashed border-gray-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-300 animate-pulse flex-shrink-0" />
                  <p className="text-sm text-gray-500">Live link will appear here once technician starts. Auto-refreshes every 30s.</p>
                </div>
              )}
            </div>
          )}

          {/* Progress tracker */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-5">Repair Progress</h3>
            <div className="space-y-4">
              {REPAIR_STEPS.map((s, i) => {
                const Icon = s.icon;
                const done = s.statuses.includes(booking.status);
                const active = s.id === (REPAIR_STEPS.findIndex((x) => x.statuses.includes(booking.status)) + 1);
                return (
                  <div key={s.id} className="flex items-center gap-4">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-500' : active ? 'bg-blue-600 animate-pulse' : 'bg-gray-100'}`}>
                      <Icon className={`w-4 h-4 ${done || active ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${done ? 'text-green-700' : active ? 'text-blue-700' : 'text-gray-400'}`}>{s.label}</p>
                    </div>
                    {done && <span className="text-xs text-green-600 font-semibold">✓ Done</span>}
                    {!done && active && <span className="text-xs text-blue-600 font-semibold animate-pulse">In progress</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500 text-center">
              Need help? <a href="tel:+919876543210" className="text-blue-600 font-bold inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> +91 98765 43210</a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
