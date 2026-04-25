import { useEffect, useState } from 'react';
import {
  RefreshCw, Video, Phone, MapPin, Clock, IndianRupee, Filter,
  Plus, Trash2, Edit3, Save, X, Package, Wrench, BarChart3,
  TrendingUp, Users, CheckCircle, AlertCircle, Search, ChevronDown,
  MessageCircle, Menu,
} from 'lucide-react';
import type { Lead } from '../types';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const STATUS_OPTIONS = ['pending', 'confirmed', 'picked_up', 'in_progress', 'completed', 'cancelled'] as const;
type Status = typeof STATUS_OPTIONS[number];

const STATUS_META: Record<Status, { color: string; dot: string; label: string }> = {
  pending:     { color: 'bg-amber-50 text-amber-700 border-amber-200',    dot: 'bg-amber-400',    label: 'Pending'     },
  confirmed:   { color: 'bg-blue-50 text-blue-700 border-blue-200',       dot: 'bg-blue-500',     label: 'Confirmed'   },
  picked_up:   { color: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500',   label: 'Picked Up'   },
  in_progress: { color: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500',   label: 'In Progress' },
  completed:   { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Completed' },
  cancelled:   { color: 'bg-red-50 text-red-700 border-red-200',          dot: 'bg-red-400',      label: 'Cancelled'   },
};

interface ServiceItem {
  id: string; brand: string; issue: string; price: number;
  oldPrice?: number; isLiveRepair: boolean; duration: string; warranty: string;
}

const DEFAULT_SERVICES: ServiceItem[] = [
  { id: '1', brand: 'Apple',   issue: 'Screen Replacement',  price: 2999, oldPrice: 3999, isLiveRepair: true,  duration: '60 min', warranty: '6 months' },
  { id: '2', brand: 'Apple',   issue: 'Battery Replacement', price: 1499, oldPrice: 1999, isLiveRepair: true,  duration: '45 min', warranty: '6 months' },
  { id: '3', brand: 'Samsung', issue: 'Screen Replacement',  price: 2499, oldPrice: 3499, isLiveRepair: true,  duration: '60 min', warranty: '6 months' },
  { id: '4', brand: 'Samsung', issue: 'Battery Replacement', price: 999,  oldPrice: 1499, isLiveRepair: false, duration: '45 min', warranty: '3 months' },
  { id: '5', brand: 'OnePlus', issue: 'Charging Port',       price: 799,  oldPrice: 1199, isLiveRepair: false, duration: '30 min', warranty: '3 months' },
  { id: '6', brand: 'Xiaomi',  issue: 'Back Glass Repair',   price: 699,  oldPrice: 999,  isLiveRepair: false, duration: '45 min', warranty: '3 months' },
];

type AdminTab = 'bookings' | 'pricing' | 'analytics';

// ══════════════════════════════════════════════════════════════════════════════
export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('bookings');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: 'bookings',  label: 'Bookings',          icon: Package    },
    { id: 'pricing',   label: 'Pricing & Services', icon: IndianRupee },
    { id: 'analytics', label: 'Analytics',         icon: BarChart3  },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top header ────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 h-14">
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md shadow-blue-200">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="font-black text-gray-900 text-sm tracking-tight">Device360</span>
                <span className="text-gray-400 font-normal text-sm"> Admin</span>
              </div>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1 ml-4 flex-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </nav>

            {/* Right actions */}
            <div className="ml-auto flex items-center gap-2">
              {/* WhatsApp quick action */}
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-50 border border-green-100 text-green-700 text-xs font-bold hover:bg-green-100 transition-all"
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-green-600" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
              {/* Call */}
              <a
                href="tel:+919876543210"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-all"
                title="Call"
              >
                <Phone className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">Call</span>
              </a>
              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-all"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile tab menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-2 space-y-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { setActiveTab(id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
                    activeTab === id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Mobile bottom tab bar */}
          <div className="md:hidden flex border-t border-gray-100 -mx-4">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold transition-all ${
                  activeTab === id ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <Icon className={`w-4 h-4 ${activeTab === id ? 'text-blue-600' : 'text-gray-400'}`} />
                {label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'bookings'  && <BookingsTab />}
        {activeTab === 'pricing'   && <PricingTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// BOOKINGS TAB
// ══════════════════════════════════════════════════════════════════════════════
const BookingsTab: React.FC = () => {
  const [leads, setLeads]         = useState<Lead[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [updating, setUpdating]   = useState<Record<string, boolean>>({});
  const [videoInputs, setVideoInputs] = useState<Record<string, string>>({});
  const [filter, setFilter]       = useState<'all' | Status>('all');
  const [search, setSearch]       = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Update failed');
      await fetchLeads();
    } catch (e: any) { alert(e.message); }
    finally { setUpdating((u) => ({ ...u, [id]: false })); }
  };

  const stats = {
    total:     leads.length,
    pending:   leads.filter((l) => l.status === 'pending').length,
    active:    leads.filter((l) => ['confirmed','picked_up','in_progress'].includes(l.status)).length,
    completed: leads.filter((l) => l.status === 'completed').length,
    revenue:   leads.filter((l) => l.status === 'completed').reduce((s, l) => s + (l.price || 0), 0),
  };

  const filtered = (filter === 'all' ? leads : leads.filter((l) => l.status === filter))
    .filter((l) =>
      !search ||
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.phone?.includes(search) ||
      l.id?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <>
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total',     val: stats.total,                             icon: Package,     color: 'text-gray-900',    bg: 'bg-white',      border: 'border-gray-100'   },
          { label: 'Pending',   val: stats.pending,                           icon: AlertCircle, color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100'  },
          { label: 'Active',    val: stats.active,                            icon: Clock,       color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-100'   },
          { label: 'Completed', val: stats.completed,                         icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100'},
          { label: 'Revenue',   val: `₹${stats.revenue.toLocaleString()}`,    icon: IndianRupee, color: 'text-violet-600',  bg: 'bg-violet-50',  border: 'border-violet-100' },
        ].map(({ label, val, icon: Icon, color, bg, border }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 flex items-center gap-3 border ${border} shadow-sm`}>
            <div className={`w-9 h-9 rounded-xl ${bg} border ${border} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="min-w-0">
              <p className={`text-lg font-black ${color} truncate`}>{val}</p>
              <p className="text-xs text-gray-500 font-medium">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['all', ...STATUS_OPTIONS] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s as any)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === s
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {s === 'all' ? 'All' : STATUS_META[s as Status].label}
            </button>
          ))}
        </div>
        <button
          onClick={fetchLeads}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 text-xs font-bold hover:border-blue-300 hover:text-blue-600 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {loading && leads.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Package className="w-12 h-12 mb-3 opacity-20" />
          <p className="text-sm font-medium">No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((lead) => {
            const meta = STATUS_META[lead.status as Status] || STATUS_META.pending;
            const isExpanded = expandedId === lead.id;

            return (
              <div key={lead.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Row header */}
                <div
                  className="flex flex-wrap items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50/80 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-2.5 h-2.5 rounded-full ${meta.dot} flex-shrink-0`} />
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{lead.name}</p>
                      <p className="text-xs text-gray-400 font-mono">#{lead.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1 font-medium">
                      <Phone className="w-3 h-3" />{lead.phone}
                    </span>
                    <span className="hidden sm:flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{lead.brand} {lead.model}
                    </span>
                    <span className="hidden md:flex items-center gap-1 font-bold text-gray-700">
                      ₹{lead.price}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {lead.isLiveRepair && (
                      <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-black border border-green-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        LIVE
                      </span>
                    )}
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${meta.color}`}>
                      {meta.label}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/50">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5 text-sm">
                      {[
                        { label: 'Issue',     val: lead.issue },
                        { label: 'Time Slot', val: lead.timeSlot },
                        { label: 'Amount',    val: `₹${lead.price}` },
                        { label: 'Address',   val: lead.address },
                      ].map(({ label, val }) => (
                        <div key={label}>
                          <p className="text-xs text-gray-400 font-semibold mb-1">{label}</p>
                          <p className="font-semibold text-gray-800 text-xs leading-relaxed">{val}</p>
                        </div>
                      ))}
                    </div>

                    {/* Quick contact buttons */}
                    <div className="flex gap-2 mb-4">
                      <a
                        href={`tel:${lead.phone}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-all"
                      >
                        <Phone className="w-3 h-3" /> Call
                      </a>
                      <a
                        href={`https://wa.me/91${lead.phone}?text=${encodeURIComponent(`Hi ${lead.name}, your repair booking #${lead.id} update...`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 border border-green-100 text-green-700 text-xs font-bold hover:bg-green-100 transition-all"
                      >
                        <MessageCircle className="w-3 h-3" /> WhatsApp
                      </a>
                    </div>

                    {/* Actions row */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500 font-semibold">Status:</label>
                        <select
                          value={lead.status}
                          onChange={(e) => updateLead(lead.id, { status: e.target.value as any })}
                          disabled={updating[lead.id]}
                          className="px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 focus:border-blue-400 outline-none disabled:opacity-50 bg-white"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{STATUS_META[s].label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500 font-semibold">Price (₹):</label>
                        <input
                          type="number"
                          defaultValue={lead.price}
                          onBlur={(e) => {
                            const v = parseInt(e.target.value);
                            if (!isNaN(v) && v !== lead.price) updateLead(lead.id, { price: v });
                          }}
                          className="w-24 px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 focus:border-blue-400 outline-none bg-white"
                        />
                      </div>

                      {lead.isLiveRepair && (
                        <div className="flex items-center gap-2 flex-1 min-w-52">
                          <input
                            type="url"
                            placeholder="Paste live video URL…"
                            value={videoInputs[lead.id] ?? lead.videoLink ?? ''}
                            onChange={(e) => setVideoInputs((v) => ({ ...v, [lead.id]: e.target.value }))}
                            className="flex-1 px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-blue-400 bg-white"
                          />
                          <button
                            onClick={() => updateLead(lead.id, { videoLink: videoInputs[lead.id] || null })}
                            disabled={updating[lead.id] || !videoInputs[lead.id]}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 disabled:opacity-50 transition-all"
                          >
                            <Video className="w-3 h-3" /> Set Link
                          </button>
                        </div>
                      )}

                      {updating[lead.id] && (
                        <span className="text-xs text-blue-500 font-bold animate-pulse flex items-center gap-1">
                          <RefreshCw className="w-3 h-3 animate-spin" /> Saving…
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// PRICING TAB
// ══════════════════════════════════════════════════════════════════════════════
const PricingTab: React.FC = () => {
  const [services, setServices]   = useState<ServiceItem[]>(DEFAULT_SERVICES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData]   = useState<Partial<ServiceItem>>({});
  const [showAdd, setShowAdd]     = useState(false);
  const [newService, setNewService] = useState<Partial<ServiceItem>>({
    brand: '', issue: '', price: 0, oldPrice: 0, isLiveRepair: false, duration: '60 min', warranty: '6 months',
  });
  const [filterBrand, setFilterBrand] = useState('all');

  const brands = ['all', ...Array.from(new Set(services.map((s) => s.brand)))];

  const startEdit = (svc: ServiceItem) => { setEditingId(svc.id); setEditData({ ...svc }); };
  const saveEdit = () => {
    if (!editingId) return;
    setServices((prev) => prev.map((s) => s.id === editingId ? { ...s, ...editData } as ServiceItem : s));
    setEditingId(null);
  };
  const deleteService = (id: string) => {
    if (!confirm('Delete this service?')) return;
    setServices((prev) => prev.filter((s) => s.id !== id));
  };
  const addService = () => {
    if (!newService.brand || !newService.issue || !newService.price) {
      alert('Brand, issue, and price are required.'); return;
    }
    setServices((prev) => [...prev, { id: Date.now().toString(), ...newService } as ServiceItem]);
    setShowAdd(false);
    setNewService({ brand:'', issue:'', price:0, oldPrice:0, isLiveRepair:false, duration:'60 min', warranty:'6 months' });
  };

  const filtered = filterBrand === 'all' ? services : services.filter((s) => s.brand === filterBrand);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-gray-900">Pricing & Services</h2>
          <p className="text-sm text-gray-400 mt-0.5">{services.length} services configured</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {/* Brand filter */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {brands.map((b) => (
          <button
            key={b}
            onClick={() => setFilterBrand(b)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize ${
              filterBrand === b
                ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      {/* Add service panel */}
      {showAdd && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-blue-900">New Service</h3>
            <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-xl hover:bg-blue-100 text-blue-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
            {[
              { key: 'brand',    label: 'Brand',        type: 'text',   placeholder: 'e.g. Apple'              },
              { key: 'issue',    label: 'Issue',        type: 'text',   placeholder: 'e.g. Screen Replacement'  },
              { key: 'price',    label: 'Price (₹)',    type: 'number', placeholder: '1999'                     },
              { key: 'oldPrice', label: 'Old Price (₹)',type: 'number', placeholder: '2999'                     },
              { key: 'duration', label: 'Duration',     type: 'text',   placeholder: '60 min'                   },
              { key: 'warranty', label: 'Warranty',     type: 'text',   placeholder: '6 months'                 },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-bold text-blue-800 mb-1">{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={(newService as any)[key] || ''}
                  onChange={(e) => setNewService((p) => ({
                    ...p,
                    [key]: type === 'number' ? parseInt(e.target.value) || 0 : e.target.value,
                  }))}
                  className="w-full px-3 py-2 text-sm border border-blue-200 rounded-xl focus:border-blue-500 outline-none bg-white"
                />
              </div>
            ))}
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newService.isLiveRepair || false}
                  onChange={(e) => setNewService((p) => ({ ...p, isLiveRepair: e.target.checked }))}
                  className="w-4 h-4 rounded accent-blue-600"
                />
                <span className="text-xs font-bold text-blue-800">Live Repair</span>
              </label>
            </div>
          </div>
          <button
            onClick={addService}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all"
          >
            <Save className="w-3.5 h-3.5" /> Save Service
          </button>
        </div>
      )}

      {/* Services table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Brand','Issue','Price','Old Price','Duration','Warranty','Live?','Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((svc) => {
                const isEditing = editingId === svc.id;
                return (
                  <tr key={svc.id} className={`${isEditing ? 'bg-blue-50' : 'hover:bg-gray-50'} transition-colors`}>
                    {isEditing ? (
                      <>
                        {(['brand','issue'] as const).map((f) => (
                          <td key={f} className="px-4 py-2">
                            <input
                              value={(editData as any)[f] || ''}
                              onChange={(e) => setEditData((p) => ({ ...p, [f]: e.target.value }))}
                              className="w-full px-2 py-1 text-xs border border-blue-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                            />
                          </td>
                        ))}
                        {(['price','oldPrice'] as const).map((f) => (
                          <td key={f} className="px-4 py-2">
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-400">₹</span>
                              <input
                                type="number"
                                value={(editData as any)[f] || ''}
                                onChange={(e) => setEditData((p) => ({ ...p, [f]: parseInt(e.target.value)||0 }))}
                                className="w-20 px-2 py-1 text-xs border border-blue-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                              />
                            </div>
                          </td>
                        ))}
                        {(['duration','warranty'] as const).map((f) => (
                          <td key={f} className="px-4 py-2">
                            <input
                              value={(editData as any)[f] || ''}
                              onChange={(e) => setEditData((p) => ({ ...p, [f]: e.target.value }))}
                              className="w-24 px-2 py-1 text-xs border border-blue-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                            />
                          </td>
                        ))}
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={editData.isLiveRepair || false}
                            onChange={(e) => setEditData((p) => ({ ...p, isLiveRepair: e.target.checked }))}
                            className="w-4 h-4 rounded accent-blue-600"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <button onClick={saveEdit} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700">
                              <Save className="w-3 h-3" /> Save
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1 rounded-lg hover:bg-gray-200 text-gray-500">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-bold text-gray-900">{svc.brand}</td>
                        <td className="px-4 py-3 text-gray-700">{svc.issue}</td>
                        <td className="px-4 py-3 font-black text-emerald-700">₹{svc.price.toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-400 line-through text-xs">{svc.oldPrice ? `₹${svc.oldPrice.toLocaleString()}` : '—'}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{svc.duration}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{svc.warranty}</td>
                        <td className="px-4 py-3">
                          {svc.isLiveRepair
                            ? <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200 flex items-center gap-1 w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Yes
                              </span>
                            : <span className="text-gray-300 text-xs">—</span>
                          }
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => startEdit(svc)} className="p-1.5 rounded-xl hover:bg-blue-50 text-blue-400 hover:text-blue-700 transition-all">
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteService(svc.id)} className="p-1.5 rounded-xl hover:bg-red-50 text-red-300 hover:text-red-600 transition-all">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// ANALYTICS TAB
// ══════════════════════════════════════════════════════════════════════════════
const AnalyticsTab: React.FC = () => {
  const weekData = [
    { day: 'Mon', bookings: 8,  revenue: 14200 },
    { day: 'Tue', bookings: 12, revenue: 22800 },
    { day: 'Wed', bookings: 6,  revenue: 9400  },
    { day: 'Thu', bookings: 15, revenue: 28500 },
    { day: 'Fri', bookings: 18, revenue: 35200 },
    { day: 'Sat', bookings: 22, revenue: 41800 },
    { day: 'Sun', bookings: 9,  revenue: 17100 },
  ];

  const topIssues = [
    { name: 'Screen Replacement',  count: 48, pct: 38 },
    { name: 'Battery Replacement', count: 31, pct: 25 },
    { name: 'Charging Port',       count: 19, pct: 15 },
    { name: 'Back Glass',          count: 14, pct: 11 },
    { name: 'Camera Fix',          count: 10, pct: 8  },
    { name: 'Water Damage',        count: 4,  pct: 3  },
  ];

  const topBrands = [
    { name: 'Apple',   pct: 42 },
    { name: 'Samsung', pct: 31 },
    { name: 'OnePlus', pct: 14 },
    { name: 'Xiaomi',  pct: 8  },
    { name: 'Others',  pct: 5  },
  ];

  const maxRevenue = Math.max(...weekData.map((d) => d.revenue));

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-gray-900">Analytics Overview</h2>
          <p className="text-sm text-gray-400 mt-0.5">Last 7 days performance</p>
        </div>
        <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
          This Week
        </span>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Bookings',   val: '90',        trend: '+18%', icon: Package,    color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-100'   },
          { label: 'Revenue',          val: '₹1,69,000', trend: '+24%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100'},
          { label: 'Avg Order Value',  val: '₹1,878',    trend: '+5%',  icon: IndianRupee,color: 'text-violet-600',  bg: 'bg-violet-50',  border: 'border-violet-100' },
          { label: 'Repeat Customers', val: '34',        trend: '+12%', icon: Users,      color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100'  },
        ].map(({ label, val, trend, icon: Icon, color, bg, border }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 border ${border} shadow-sm`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-8 h-8 rounded-xl ${bg} border ${border} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <span className="text-xs font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">{trend}</span>
            </div>
            <p className={`text-2xl font-black ${color}`}>{val}</p>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-black text-gray-900 text-sm mb-5">Daily Revenue</h3>
          <div className="flex items-end gap-2 h-40">
            {weekData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-gray-400 font-bold">₹{Math.round(d.revenue/1000)}k</span>
                <div
                  className="w-full rounded-t-xl bg-gradient-to-t from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 transition-colors cursor-default shadow-sm"
                  style={{ height: `${(d.revenue / maxRevenue) * 100}%`, minHeight: 8 }}
                  title={`₹${d.revenue.toLocaleString()}`}
                />
                <span className="text-[10px] text-gray-400 font-semibold">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top issues */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-black text-gray-900 text-sm mb-5">Top Issues</h3>
          <div className="space-y-3.5">
            {topIssues.map(({ name, count, pct }) => (
              <div key={name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-700 font-bold">{name}</span>
                  <span className="text-xs text-gray-400 font-medium">{count} ({pct}%)</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Brand split */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-black text-gray-900 text-sm mb-5">Repairs by Brand</h3>
          <div className="space-y-3.5">
            {topBrands.map(({ name, pct }, i) => {
              const colors = ['from-blue-500 to-blue-400','from-violet-500 to-violet-400','from-emerald-500 to-emerald-400','from-amber-500 to-amber-400','from-gray-400 to-gray-300'];
              return (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-700 font-bold">{name}</span>
                    <span className="text-xs text-gray-400 font-medium">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${colors[i]} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Booking trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-black text-gray-900 text-sm mb-5">Daily Bookings</h3>
          <div className="flex items-end gap-2 h-28">
            {weekData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-gray-400 font-bold">{d.bookings}</span>
                <div
                  className="w-full rounded-t-xl bg-gradient-to-t from-violet-500 to-violet-300 hover:from-violet-600 hover:to-violet-400 transition-colors shadow-sm"
                  style={{ height: `${(d.bookings / 22) * 100}%`, minHeight: 6 }}
                />
                <span className="text-[10px] text-gray-400 font-semibold">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
