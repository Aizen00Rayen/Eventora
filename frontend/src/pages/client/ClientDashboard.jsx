import React, { useEffect, useState, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';
import EventCard from '../../components/EventCard';
import SkeletonCard from '../../components/SkeletonCard';
import StatCard from '../../components/StatCard';
import EmptyState from '../../components/EmptyState';
import api from '../../utils/axios';
import { formatDate } from '../../utils/formatters';

const SIDEBAR_LINKS = [
  { to: '/client', end: true, icon: '📅', label: 'My Events' },
  { to: '/client/speakers', icon: '🎤', label: 'Speakers' },
  { to: '/client/sponsors', icon: '🤝', label: 'Sponsors' },
  { to: '/client/organizers', icon: '👷', label: 'Organizers' },
  { to: '/client/stats', icon: '📊', label: 'Statistics' },
];

const THEMES = [
  { value: 'modern',    label: 'Modern',    color: 'from-violet-600 to-purple-800',      desc: 'Dark, vibrant & sleek' },
  { value: 'academic',  label: 'Academic',  color: 'from-blue-800 to-yellow-600',        desc: 'Navy and gold tones' },
  { value: 'corporate', label: 'Corporate', color: 'from-blue-600 to-blue-900',          desc: 'Professional blue' },
  { value: 'minimal',   label: 'Minimal',   color: 'from-gray-300 to-gray-500',          desc: 'Clean and simple' },
  { value: 'vibrant',   label: 'Vibrant',   color: 'from-pink-500 via-purple-500 to-indigo-600', desc: 'Colorful gradient' },
];

const eventSchema = z.object({
  title:        z.string().min(3, 'At least 3 characters'),
  description:  z.string().min(10, 'At least 10 characters'),
  date:         z.string().min(1, 'Date is required'),
  location:     z.string().min(3, 'Location required'),
  max_capacity: z.coerce.number().min(1, 'At least 1'),
  theme:        z.enum(['modern','academic','corporate','minimal','vibrant']),
});

// ── My Events Page ─────────────────────────────────────────────────────────────
function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState('modern');
  const [creating, setCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editEvent, setEditEvent] = useState(null);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: { theme: 'modern', max_capacity: 100 },
  });

  const fetchEvents = useCallback(() => {
    api.get('/api/events/').then(({ data }) => setEvents(data.results || data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const openCreate = () => { reset({ theme: 'modern', max_capacity: 100 }); setStep(1); setSelectedTheme('modern'); setCreateOpen(true); };
  const openEdit = (ev) => {
    setEditEvent(ev);
    reset({ title: ev.title, description: ev.description, date: ev.date?.slice(0,16), location: ev.location, max_capacity: ev.max_capacity, theme: ev.theme });
    setSelectedTheme(ev.theme);
    setCreateOpen(true);
  };

  const formValues = watch();

  const onSubmit = async (data) => {
    setCreating(true);
    try {
      if (editEvent) {
        const res = await api.patch(`/api/events/${editEvent.slug}/`, data);
        setEvents((prev) => prev.map((e) => e.id === editEvent.id ? res.data : e));
        toast.success('Event updated!');
      } else {
        await api.post('/api/events/', data);
        toast.success('Event created! Waiting for admin approval.');
        fetchEvents();
      }
      setCreateOpen(false);
      setEditEvent(null);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save event');
    } finally { setCreating(false); }
  };

  const handleDelete = async (id) => {
    try {
      const ev = events.find(e => e.id === id);
      await api.delete(`/api/events/${ev.slug}/`);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success('Event deleted');
    } catch { toast.error('Delete failed'); }
    setDeleteConfirm(null);
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Events</h1>
        <button onClick={openCreate} className="btn-primary">+ Create Event</button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(n => <SkeletonCard key={n} />)}
        </div>
      ) : events.length === 0 ? (
        <EmptyState title="No events yet" message="Create your first event to get started." action={<button onClick={openCreate} className="btn-primary">Create Event</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <EventCard key={ev.id} event={ev} actions={
              <div className="flex gap-2">
                <a href={`/events/${ev.slug}`} target="_blank" rel="noreferrer" className="btn-ghost text-sm py-1.5 px-3">👁 Site</a>
                <button onClick={() => openEdit(ev)} className="btn-ghost text-sm py-1.5 px-3">✏️</button>
                <button onClick={() => setDeleteConfirm(ev.id)} className="text-sm py-1.5 px-3 text-danger hover:bg-red-50 dark:hover:bg-red-900/20 rounded-input">🗑️</button>
              </div>
            } />
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal open={createOpen} onClose={() => { setCreateOpen(false); setEditEvent(null); }} title={editEvent ? 'Edit Event' : 'Create New Event'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step indicator */}
          {!editEvent && (
            <div className="flex items-center gap-2 mb-6">
              {[1,2,3].map((s) => (
                <React.Fragment key={s}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= s ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>{s}</div>
                  {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`} />}
                </React.Fragment>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {(step === 1 || editEvent) && (
              <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Title</label>
                  <input {...register('title')} className="input" placeholder="Annual Tech Summit" />
                  {errors.title && <p className="text-danger text-xs mt-1">{errors.title.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Description</label>
                  <textarea {...register('description')} rows={3} className="input resize-none" placeholder="Describe your event..." />
                  {errors.description && <p className="text-danger text-xs mt-1">{errors.description.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Date & Time</label>
                    <input {...register('date')} type="datetime-local" className="input" />
                    {errors.date && <p className="text-danger text-xs mt-1">{errors.date.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Max Capacity</label>
                    <input {...register('max_capacity')} type="number" className="input" />
                    {errors.max_capacity && <p className="text-danger text-xs mt-1">{errors.max_capacity.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Location</label>
                  <input {...register('location')} className="input" placeholder="Convention Center, Paris" />
                  {errors.location && <p className="text-danger text-xs mt-1">{errors.location.message}</p>}
                </div>
                {!editEvent && (
                  <div className="flex justify-end pt-2">
                    <button type="button" onClick={() => setStep(2)} className="btn-primary">Next: Choose Theme →</button>
                  </div>
                )}
              </motion.div>
            )}

            {step === 2 && !editEvent && (
              <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h3 className="font-semibold mb-4">Select a Theme</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {THEMES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => { setSelectedTheme(t.value); setValue('theme', t.value); }}
                      className={`rounded-card overflow-hidden border-2 transition-all ${selectedTheme === t.value ? 'border-primary' : 'border-transparent'}`}
                    >
                      <div className={`h-16 bg-gradient-to-br ${t.color}`} />
                      <div className="p-3 text-left bg-white dark:bg-gray-900">
                        <p className="font-semibold text-sm">{t.label}</p>
                        <p className="text-xs text-gray-500">{t.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-ghost flex-1">← Back</button>
                  <button type="button" onClick={() => setStep(3)} className="btn-primary flex-1">Next: Review →</button>
                </div>
              </motion.div>
            )}

            {step === 3 && !editEvent && (
              <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h3 className="font-semibold mb-4">Review & Submit</h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-card p-4 space-y-2 text-sm mb-6">
                  <p><span className="text-gray-500">Title:</span> <strong>{formValues.title}</strong></p>
                  <p><span className="text-gray-500">Date:</span> <strong>{formValues.date}</strong></p>
                  <p><span className="text-gray-500">Location:</span> <strong>{formValues.location}</strong></p>
                  <p><span className="text-gray-500">Capacity:</span> <strong>{formValues.max_capacity}</strong></p>
                  <p><span className="text-gray-500">Theme:</span> <strong className="capitalize">{selectedTheme}</strong></p>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)} className="btn-ghost flex-1">← Back</button>
                  <button type="submit" disabled={creating} className="btn-primary flex-1">
                    {creating ? 'Creating...' : '🚀 Create Event'}
                  </button>
                </div>
              </motion.div>
            )}

            {editEvent && (
              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-4">
                <button type="submit" disabled={creating} className="btn-primary flex-1">
                  {creating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </AnimatePresence>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Event" size="sm">
        <p className="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to delete this event? This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteConfirm(null)} className="btn-ghost flex-1">Cancel</button>
          <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-danger text-white rounded-pill py-2.5 font-semibold hover:opacity-90">Delete</button>
        </div>
      </Modal>
    </div>
  );
}

// ── Speakers Page ──────────────────────────────────────────────────────────────
function SpeakersPage() {
  const [events, setEvents] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

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
      reset();
      setModalOpen(false);
      toast.success('Speaker added!');
    } catch { toast.error('Failed to add speaker'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    await api.delete(`/api/speakers/${id}/`);
    setSpeakers((prev) => prev.filter(s => s.id !== id));
    toast.success('Speaker removed');
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Speakers</h1>
        <button onClick={() => setModalOpen(true)} className="btn-primary" disabled={!selectedEvent}>+ Add Speaker</button>
      </div>
      <div className="mb-6">
        <select className="input max-w-xs" value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}>
          {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
        </select>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(n => <div key={n} className="skeleton h-32 rounded-card" />)}
        </div>
      ) : speakers.length === 0 ? (
        <EmptyState title="No speakers yet" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {speakers.map(sp => (
            <div key={sp.id} className="card flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                {sp.first_name[0]}
              </div>
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
            <div>
              <label className="block text-sm font-medium mb-1.5">First name</label>
              <input {...register('first_name', { required: true })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Last name</label>
              <input {...register('last_name', { required: true })} className="input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Title / Role</label>
            <input {...register('title', { required: true })} className="input" placeholder="AI Research Lead" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Bio</label>
            <textarea {...register('bio')} rows={2} className="input resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Schedule time</label>
            <input {...register('schedule_time')} type="datetime-local" className="input" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Adding...' : 'Add Speaker'}</button>
        </form>
      </Modal>
    </div>
  );
}

// ── Sponsors Page ──────────────────────────────────────────────────────────────
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
      const evs = data.results || data;
      setEvents(evs);
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
      setSponsors((prev) => [...prev, res.data]);
      reset(); setModalOpen(false);
      toast.success('Sponsor added!');
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    await api.delete(`/api/sponsors/${id}/`);
    setSponsors((prev) => prev.filter(s => s.id !== id));
    toast.success('Sponsor removed');
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Sponsors</h1>
        <button onClick={() => setModalOpen(true)} className="btn-primary" disabled={!selectedEvent}>+ Add Sponsor</button>
      </div>
      <div className="mb-6">
        <select className="input max-w-xs" value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}>
          {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
        </select>
      </div>
      {loading ? (
        <div className="flex gap-4 flex-wrap">{[1,2,3].map(n => <div key={n} className="skeleton h-16 w-32 rounded-card" />)}</div>
      ) : sponsors.length === 0 ? (
        <EmptyState title="No sponsors yet" />
      ) : (
        <div className="flex flex-wrap gap-4">
          {sponsors.map(sp => (
            <div key={sp.id} className="card flex items-center gap-3 py-3 px-5">
              <span className="font-bold">{sp.name}</span>
              <button onClick={() => handleDelete(sp.id)} className="text-danger text-sm">🗑️</button>
            </div>
          ))}
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Sponsor">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Sponsor name</label>
            <input {...register('name', { required: true })} className="input" placeholder="TechCorp" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Adding...' : 'Add Sponsor'}</button>
        </form>
      </Modal>
    </div>
  );
}

// ── Organizers Page ────────────────────────────────────────────────────────────
function OrganizersPage() {
  const [events, setEvents] = useState([]);
  const [organizers, setOrganizers] = useState([]);
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
    api.get(`/api/events/${selectedEvent}/organizers/`).then(({ data }) => setOrganizers(data.results || data)).finally(() => setLoading(false));
  }, [selectedEvent]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const res = await api.post(`/api/events/${selectedEvent}/organizers/`, data);
      setOrganizers((prev) => [...prev, res.data]);
      reset(); setModalOpen(false);
      toast.success('Organizer added! Credentials sent by email.');
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Organizers</h1>
        <button onClick={() => setModalOpen(true)} className="btn-primary" disabled={!selectedEvent}>+ Add Organizer</button>
      </div>
      <div className="mb-6">
        <select className="input max-w-xs" value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}>
          {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
        </select>
      </div>
      {organizers.length === 0 ? <EmptyState title="No organizers assigned" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {organizers.map(org => (
            <div key={org.id} className="card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                  {org.user?.first_name?.[0] || 'O'}
                </div>
                <div>
                  <p className="font-semibold">{org.user?.first_name} {org.user?.last_name}</p>
                  <p className="text-xs text-gray-500">{org.user?.email}</p>
                </div>
              </div>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>🚪 Door: <strong>{org.door_number}</strong></span>
                <span>⏰ {org.work_schedule}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Organizer">
        <p className="text-sm text-gray-500 mb-4">A new account will be created and credentials emailed to the organizer.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">First name</label>
              <input {...register('first_name', { required: true })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Last name</label>
              <input {...register('last_name', { required: true })} className="input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input {...register('email', { required: true })} type="email" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Door number</label>
            <input {...register('door_number', { required: true })} className="input" placeholder="A1" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Work schedule</label>
            <input {...register('work_schedule')} className="input" placeholder="09:00-18:00" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Adding...' : 'Add Organizer'}</button>
        </form>
      </Modal>
    </div>
  );
}

// ── Statistics Page ────────────────────────────────────────────────────────────
const PIE_COLORS = ['#6C47FF', '#00D4AA', '#FF5757', '#FFB830'];

function StatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/client/stats/').then(({ data }) => setStats(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex-1 p-8">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[1,2,3].map(n => <div key={n} className="skeleton h-24 rounded-card" />)}
      </div>
      <div className="skeleton h-64 rounded-card" />
    </div>
  );

  if (!stats) return null;

  const pieData = stats.registrations_per_event.map((e) => ({
    name: e.event_title,
    value: e.total,
    present: e.present,
  }));

  const presenceData = stats.registrations_per_event.map((e) => ({
    name: e.event_title.length > 15 ? e.event_title.slice(0,15) + '…' : e.event_title,
    total: e.total,
    present: e.present,
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
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Layout ─────────────────────────────────────────────────────────────────────
export default function ClientDashboard() {
  return (
    <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark">
      <Sidebar links={SIDEBAR_LINKS} title="Client Portal" />
      <Routes>
        <Route index element={<MyEvents />} />
        <Route path="speakers" element={<SpeakersPage />} />
        <Route path="sponsors" element={<SponsorsPage />} />
        <Route path="organizers" element={<OrganizersPage />} />
        <Route path="stats" element={<StatsPage />} />
      </Routes>
    </div>
  );
}
