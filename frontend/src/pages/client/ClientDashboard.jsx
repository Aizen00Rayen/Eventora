import React, { useEffect, useState, useCallback } from 'react';
import { Routes, Route, useNavigate, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import Modal from '../../components/Modal';
import SkeletonCard from '../../components/SkeletonCard';
import StatCard from '../../components/StatCard';
import EmptyState from '../../components/EmptyState';
import api from '../../utils/axios';
import { formatDate } from '../../utils/formatters';
import useAuthStore from '../../store/authStore';
import { getInitials } from '../../utils/formatters';
import CreateEvent from './CreateEvent';

// ── Icons ───────────────────────────────────────────────────────────────────
function IconCalendar({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function IconPlus({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function IconUsers({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconStar({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function IconBarChart({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}
function IconBell({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
function IconSearch({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function IconPin({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}

const SIDEBAR_LINKS = [
  { to: '/client', end: true, icon: <IconCalendar />, label: 'My Events' },
  { to: '/client/create', icon: <IconPlus />, label: 'Create Event' },
  { to: '/client/speakers', icon: <IconUsers />, label: 'Speakers' },
  { to: '/client/sponsors', icon: <IconStar />, label: 'Sponsors' },
  { to: '/client/organizers', icon: <IconUsers />, label: 'Organizers' },
  { to: '/client/stats', icon: <IconBarChart />, label: 'Statistics' },
];

// ── Sidebar ─────────────────────────────────────────────────────────────────
function ClientSidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-100 flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <span className="font-bold text-lg text-primary">Eventora</span>
        </div>
      </div>
      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {SIDEBAR_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>
      {/* Pro plan banner */}
      <div className="mx-3 mb-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
        <p className="text-xs font-bold text-primary tracking-wider uppercase mb-0.5">Pro Plan</p>
        <p className="text-xs text-gray-500 mb-3">Upgrade for unlimited attendees</p>
        <button className="w-full bg-primary text-white text-xs font-semibold py-2 rounded-pill hover:bg-primary-dark transition-colors">
          Upgrade Now
        </button>
      </div>
    </aside>
  );
}

// ── Top Navbar ───────────────────────────────────────────────────────────────
function TopNavbar() {
  const { user } = useAuthStore();
  return (
    <div className="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 shrink-0">
      <div className="flex-1 relative max-w-lg">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          placeholder="Search events, venues..."
          className="w-full bg-gray-50 border border-gray-200 rounded-pill pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>
      <div className="ml-auto flex items-center gap-4">
        <button className="relative w-9 h-9 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
          <IconBell className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-danger rounded-full border-2 border-white" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">{user?.first_name} {user?.last_name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role === 'client' ? 'Event Lead' : user?.role}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
            {getInitials(user)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Status badge helper ──────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    approved: 'bg-green-500 text-white',
    pending:  'bg-orange-400 text-white',
    rejected: 'bg-danger text-white',
  };
  return (
    <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded ${map[status] || 'bg-gray-400 text-white'}`}>
      {status}
    </span>
  );
}

// ── My Events Page ───────────────────────────────────────────────────────────
const TABS = ['All Events', 'Pending', 'Approved', 'Rejected'];

function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('All Events');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  const fetchEvents = useCallback(() => {
    api.get('/api/events/')
      .then(({ data }) => setEvents(data.results || data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const filtered = tab === 'All Events'
    ? events
    : events.filter((e) => e.status === tab.toLowerCase());

  const handleDelete = async (id) => {
    try {
      const ev = events.find((e) => e.id === id);
      await api.delete(`/api/events/${ev.slug}/`);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success('Event deleted');
    } catch { toast.error('Delete failed'); }
    setDeleteConfirm(null);
  };

  const CATEGORY_COLORS = [
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-green-100 text-green-700',
    'bg-orange-100 text-orange-700',
  ];

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">My Events</h1>
          <p className="text-gray-500 mt-1">Manage and track your upcoming conferences and workshops.</p>
        </div>
        <button
          onClick={() => navigate('/client/create')}
          className="flex items-center gap-2 bg-primary text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-dark transition-colors shadow-sm"
        >
          <IconPlus className="w-4 h-4" />
          New Event
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6 mt-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium transition-all relative ${
              tab === t
                ? 'text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
            {tab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t" />}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[1,2,3,4].map((n) => <SkeletonCard key={n} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No events"
          message={tab === 'All Events' ? 'Create your first event to get started.' : `No ${tab.toLowerCase()} events.`}
          action={tab === 'All Events' && (
            <button onClick={() => navigate('/client/create')} className="btn-primary">Create Event</button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((ev, idx) => {
            const capacity = ev.max_capacity > 0 ? Math.round((ev.registrations_count || 0) / ev.max_capacity * 100) : 0;
            const catColor = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
            return (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-card-hover transition-shadow overflow-hidden flex"
              >
                {/* Image */}
                <div className="relative w-36 shrink-0">
                  {ev.logo ? (
                    <img src={ev.logo} alt={ev.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <IconCalendar className="w-10 h-10 text-primary/40" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={ev.status} />
                  </div>
                </div>
                {/* Content */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${catColor}`}>
                      {ev.category || 'Conference'}
                    </span>
                    <div className="flex -space-x-1.5">
                      {[...Array(Math.min(ev.registrations_count || 0, 3))].map((_, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white" />
                      ))}
                      {(ev.registrations_count || 0) > 3 && (
                        <div className="w-6 h-6 rounded-full bg-primary text-white border-2 border-white flex items-center justify-center text-xs font-bold">
                          +{ev.registrations_count - 3}
                        </div>
                      )}
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-base leading-snug mb-2">{ev.title}</h3>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <IconCalendar className="w-3.5 h-3.5" />
                      {formatDate(ev.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <IconPin />
                      {ev.location}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Capacity</span>
                      <span className="font-semibold text-gray-700">
                        {ev.registrations_count || 0} / {ev.max_capacity}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min(capacity, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Delete confirm */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Event" size="sm">
        <p className="text-gray-600 mb-6">Are you sure you want to delete this event? This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteConfirm(null)} className="btn-ghost flex-1">Cancel</button>
          <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-danger text-white rounded-pill py-2.5 font-semibold hover:opacity-90">Delete</button>
        </div>
      </Modal>
    </div>
  );
}

// ── Speakers Page ────────────────────────────────────────────────────────────
function SpeakersPage() {
  const [events, setEvents] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    api.get('/api/events/').then(({ data }) => {
      const evs = data.results || data;
      setEvents(evs);
      if (evs.length > 0) setSelectedEvent(evs[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    setLoading(true);
    api.get(`/api/events/${selectedEvent}/speakers/`).then(({ data }) => setSpeakers(data.results || data)).finally(() => setLoading(false));
  }, [selectedEvent]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const res = await api.post(`/api/events/${selectedEvent}/speakers/`, data);
      setSpeakers((prev) => [...prev, res.data]);
      reset(); setModalOpen(false);
      toast.success('Speaker added!');
    } catch { toast.error('Failed to add speaker'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    await api.delete(`/api/speakers/${id}/`);
    setSpeakers((prev) => prev.filter((s) => s.id !== id));
    toast.success('Speaker removed');
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Speakers</h1>
        <button onClick={() => setModalOpen(true)} className="btn-primary" disabled={!selectedEvent}>+ Add Speaker</button>
      </div>
      <select className="input max-w-xs mb-6" value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}>
        {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
      </select>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map((n) => <div key={n} className="skeleton h-32 rounded-card" />)}
        </div>
      ) : speakers.length === 0 ? <EmptyState title="No speakers yet" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {speakers.map((sp) => (
            <div key={sp.id} className="card flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">{sp.first_name[0]}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{sp.first_name} {sp.last_name}</p>
                <p className="text-sm text-primary">{sp.title}</p>
                <p className="text-xs text-gray-500 line-clamp-2 mt-1">{sp.bio}</p>
              </div>
              <button onClick={() => handleDelete(sp.id)} className="text-danger hover:opacity-70 text-sm shrink-0">🗑️</button>
            </div>
          ))}
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Speaker">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1.5">First name</label><input {...register('first_name', { required: true })} className="input" /></div>
            <div><label className="block text-sm font-medium mb-1.5">Last name</label><input {...register('last_name', { required: true })} className="input" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1.5">Title / Role</label><input {...register('title', { required: true })} className="input" placeholder="AI Research Lead" /></div>
          <div><label className="block text-sm font-medium mb-1.5">Bio</label><textarea {...register('bio')} rows={2} className="input resize-none" /></div>
          <div><label className="block text-sm font-medium mb-1.5">Schedule time</label><input {...register('schedule_time')} type="datetime-local" className="input" /></div>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Adding...' : 'Add Speaker'}</button>
        </form>
      </Modal>
    </div>
  );
}

// ── Sponsors Page ────────────────────────────────────────────────────────────
function SponsorsPage() {
  const [events, setEvents] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    api.get('/api/events/').then(({ data }) => {
      const evs = data.results || data; setEvents(evs);
      if (evs.length > 0) setSelectedEvent(evs[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    setLoading(true);
    api.get(`/api/events/${selectedEvent}/sponsors/`).then(({ data }) => setSponsors(data.results || data)).finally(() => setLoading(false));
  }, [selectedEvent]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const res = await api.post(`/api/events/${selectedEvent}/sponsors/`, data);
      setSponsors((prev) => [...prev, res.data]); reset(); setModalOpen(false);
      toast.success('Sponsor added!');
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Sponsors</h1>
        <button onClick={() => setModalOpen(true)} className="btn-primary" disabled={!selectedEvent}>+ Add Sponsor</button>
      </div>
      <select className="input max-w-xs mb-6" value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}>
        {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
      </select>
      {loading ? <div className="flex gap-4">{[1,2,3].map((n) => <div key={n} className="skeleton h-16 w-32 rounded-card" />)}</div>
        : sponsors.length === 0 ? <EmptyState title="No sponsors yet" />
        : (
          <div className="flex flex-wrap gap-4">
            {sponsors.map((sp) => (
              <div key={sp.id} className="card flex items-center gap-3 py-3 px-5">
                <span className="font-bold">{sp.name}</span>
                <button onClick={async () => { await api.delete(`/api/sponsors/${sp.id}/`); setSponsors((p) => p.filter((s) => s.id !== sp.id)); toast.success('Removed'); }} className="text-danger text-sm">🗑️</button>
              </div>
            ))}
          </div>
        )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Sponsor">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1.5">Sponsor name</label><input {...register('name', { required: true })} className="input" placeholder="TechCorp" /></div>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Adding...' : 'Add Sponsor'}</button>
        </form>
      </Modal>
    </div>
  );
}

// ── Organizers Page ──────────────────────────────────────────────────────────
function OrganizersPage() {
  const [events, setEvents] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    api.get('/api/events/').then(({ data }) => {
      const evs = data.results || data; setEvents(evs);
      if (evs.length > 0) setSelectedEvent(evs[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    api.get(`/api/events/${selectedEvent}/organizers/`).then(({ data }) => setOrganizers(data.results || data));
  }, [selectedEvent]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const res = await api.post(`/api/events/${selectedEvent}/organizers/`, data);
      setOrganizers((prev) => [...prev, res.data]); reset(); setModalOpen(false);
      toast.success('Organizer added! Credentials sent by email.');
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Organizers</h1>
        <button onClick={() => setModalOpen(true)} className="btn-primary" disabled={!selectedEvent}>+ Add Organizer</button>
      </div>
      <select className="input max-w-xs mb-6" value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}>
        {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
      </select>
      {organizers.length === 0 ? <EmptyState title="No organizers assigned" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {organizers.map((org) => (
            <div key={org.id} className="card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">{org.user?.first_name?.[0] || 'O'}</div>
                <div><p className="font-semibold">{org.user?.first_name} {org.user?.last_name}</p><p className="text-xs text-gray-500">{org.user?.email}</p></div>
              </div>
              <div className="flex gap-4 text-sm text-gray-500"><span>🚪 Door: <strong>{org.door_number}</strong></span><span>⏰ {org.work_schedule}</span></div>
            </div>
          ))}
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Organizer">
        <p className="text-sm text-gray-500 mb-4">A new account will be created and credentials emailed.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1.5">First name</label><input {...register('first_name', { required: true })} className="input" /></div>
            <div><label className="block text-sm font-medium mb-1.5">Last name</label><input {...register('last_name', { required: true })} className="input" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1.5">Email</label><input {...register('email', { required: true })} type="email" className="input" /></div>
          <div><label className="block text-sm font-medium mb-1.5">Door number</label><input {...register('door_number', { required: true })} className="input" placeholder="A1" /></div>
          <div><label className="block text-sm font-medium mb-1.5">Work schedule</label><input {...register('work_schedule')} className="input" placeholder="09:00-18:00" /></div>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Adding...' : 'Add Organizer'}</button>
        </form>
      </Modal>
    </div>
  );
}

// ── Statistics Page ──────────────────────────────────────────────────────────
const PIE_COLORS = ['#6C47FF', '#00D4AA', '#FF5757', '#FFB830'];

function StatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/client/stats/').then(({ data }) => setStats(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex-1 p-8">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">{[1,2,3].map((n) => <div key={n} className="skeleton h-24 rounded-card" />)}</div>
      <div className="skeleton h-64 rounded-card" />
    </div>
  );
  if (!stats) return null;

  const pieData = stats.registrations_per_event.map((e) => ({ name: e.event_title, value: e.total, present: e.present }));
  const presenceData = stats.registrations_per_event.map((e) => ({
    name: e.event_title.length > 15 ? e.event_title.slice(0,15) + '…' : e.event_title,
    total: e.total, present: e.present,
  }));

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6">Statistics</h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Events" value={stats.total_events} icon="📅" />
        <StatCard label="Approved" value={stats.approved_events} icon="✅" bgColor="bg-green-100" />
        <StatCard label="Pending Review" value={stats.pending_events} icon="⏳" bgColor="bg-yellow-100" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-bold mb-4">Registrations per Event</h3>
          {presenceData.length === 0 ? <EmptyState title="No data yet" /> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={presenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="total" name="Registered" fill="#6C47FF" radius={[4,4,0,0]} />
                <Bar dataKey="present" name="Present" fill="#00D4AA" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card">
          <h3 className="font-bold mb-4">Presence Rate</h3>
          {pieData.length === 0 ? <EmptyState title="No data yet" /> : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Layout ───────────────────────────────────────────────────────────────────
export default function ClientDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <ClientSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar />
        <Routes>
          <Route index element={<MyEvents />} />
          <Route path="create" element={<CreateEvent />} />
          <Route path="speakers" element={<SpeakersPage />} />
          <Route path="sponsors" element={<SponsorsPage />} />
          <Route path="organizers" element={<OrganizersPage />} />
          <Route path="stats" element={<StatsPage />} />
        </Routes>
      </div>
    </div>
  );
}
