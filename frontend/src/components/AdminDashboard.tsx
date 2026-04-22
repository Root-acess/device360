import { useEffect, useState } from 'react';
import { RefreshCw, Video, Phone, MapPin, Clock, IndianRupee, Filter } from 'lucide-react';
import type { Lead } from '../types';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const STATUS_OPTIONS = ['pending', 'confirmed', 'picked_up', 'in_progress', 'completed', 'cancelled'] as const;
type Status = typeof STATUS_OPTIONS[number];

const STATUS_COLORS: Record<Status, string> = {
  pending:     'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed:   'bg-blue-100 text-blue-800 border-blue-200',
  picked_up:   'bg-purple-100 text-purple-800 border-purple-200',
  in_progress: 'bg-orange-100 text-orange-800 border-orange-200',
  completed:   'bg-green-100 text-green-800 border-green-200',
  cancelled:   'bg-red-100 text-red-800 border-red-200',
};

export const AdminDashboard: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [videoInputs, setVideoInputs] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<'all' | Status>('all');

  const fetchLeads = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${BACKEND}/api/leads`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setLeads(data.leads || []);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeads(); }, []);

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    setUpdating((u) => ({ ...u, [id]: true }));
    try {
      const res = await fetch(`${BACKEND}/api/leads/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Update failed');
      await fetchLeads();
    } catch (e: any) { alert(e.message); }
    finally { setUpdating((u) => ({ ...u, [id]: false })); }
  };

  const filtered = filter === 'all' ? leads : leads.filter((l) => l.status === filter);

  const stats = {
    total: leads.length,
    pending: leads.filter((l) => l.status === 'pending').length,
    active: leads.filter((l) => ['confirmed', 'picked_up', 'in_progress'].includes(l.status)).length,
    completed: leads.filter((l) => l.status === 'completed').length,
    revenue: leads.filter((l) => l.status === 'completed').reduce((s, l) => s + (l.price || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage all bookings and repairs</p>
          </div>
          <button onClick={fetchLeads} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total', val: stats.total, color: 'text-gray-900' },
            { label: 'Pending', val: stats.pending, color: 'text-yellow-600' },
            { label: 'Active', val: stats.active, color: 'text-blue-600' },
            { label: 'Completed', val: stats.completed, color: 'text-green-600' },
            { label: 'Revenue', val: `₹${stats.revenue.toLocaleString()}`, color: 'text-purple-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.val}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400" />
          {(['all', ...STATUS_OPTIONS] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        {error && <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

        {loading && leads.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No bookings found.</div>
        ) : (
          <div className="space-y-4">
            {filtered.map((lead) => (
              <div key={lead.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-900">{lead.name}</p>
                      {lead.isLiveRepair && <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200">LIVE</span>}
                    </div>
                    <p className="text-xs text-gray-400">#{lead.id}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[lead.status as Status] || STATUS_COLORS.pending}`}>
                    {lead.status?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-600"><Phone className="w-3.5 h-3.5 text-blue-500" />{lead.phone}</div>
                  <div className="flex items-center gap-1.5 text-gray-600"><Clock className="w-3.5 h-3.5 text-blue-500" />{lead.timeSlot}</div>
                  <div className="flex items-center gap-1.5 text-gray-600"><IndianRupee className="w-3.5 h-3.5 text-green-500" />₹{lead.price}</div>
                  <div className="flex items-center gap-1.5 text-gray-600"><MapPin className="w-3.5 h-3.5 text-red-500" />{lead.brand} {lead.model}</div>
                </div>

                <div className="text-xs text-gray-500 mb-4 bg-gray-50 rounded-lg p-2.5">
                  <span className="font-semibold">{lead.issue}</span> · {lead.address}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Status updater */}
                  <select
                    value={lead.status}
                    onChange={(e) => updateLead(lead.id, { status: e.target.value as any })}
                    disabled={updating[lead.id]}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 focus:border-blue-400 outline-none disabled:opacity-50"
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>

                  {/* Video link input */}
                  {lead.isLiveRepair && (
                    <div className="flex items-center gap-2 flex-1 min-w-48">
                      <input
                        type="url"
                        placeholder="Paste live video URL…"
                        value={videoInputs[lead.id] || lead.videoLink || ''}
                        onChange={(e) => setVideoInputs((v) => ({ ...v, [lead.id]: e.target.value }))}
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-xs outline-none focus:border-blue-400"
                      />
                      <button
                        onClick={() => updateLead(lead.id, { videoLink: videoInputs[lead.id] || null })}
                        disabled={updating[lead.id] || !videoInputs[lead.id]}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700 disabled:opacity-50"
                      >
                        <Video className="w-3.5 h-3.5" /> Set Link
                      </button>
                    </div>
                  )}

                  {updating[lead.id] && <span className="text-xs text-blue-500 font-medium animate-pulse">Updating…</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
