import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import api from '../../utils/axios';
import { formatDate } from '../../utils/formatters';
import useAuthStore from '../../store/authStore';

const THEMES = {
  modern:    { hero: 'from-violet-900 via-purple-800 to-indigo-900', text: 'text-white', accent: 'text-violet-300' },
  academic:  { hero: 'from-blue-900 via-blue-800 to-yellow-700',      text: 'text-white', accent: 'text-yellow-300' },
  corporate: { hero: 'from-blue-700 via-blue-600 to-blue-900',         text: 'text-white', accent: 'text-blue-200' },
  minimal:   { hero: 'from-gray-100 to-gray-200',                      text: 'text-gray-900', accent: 'text-gray-600' },
  vibrant:   { hero: 'from-pink-600 via-purple-600 to-indigo-600',     text: 'text-white', accent: 'text-pink-200' },
};

const registerSchema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name:  z.string().min(1, 'Required'),
  email:      z.string().email('Valid email required'),
});

export default function EventSite() {
  const { slug } = useParams();
  const { user } = useAuthStore();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  const theme = THEMES[event?.theme] || THEMES.modern;

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { first_name: user?.first_name || '', last_name: user?.last_name || '', email: user?.email || '' },
  });

  useEffect(() => {
    api.get(`/api/public/events/${slug}/`)
      .then(({ data }) => setEvent(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const onRegister = async () => {
    if (!user) { toast.error('Please sign in to register'); return; }
    setRegistering(true);
    try {
      await api.post(`/api/events/${event.id}/register/`);
      setRegistered(true);
      toast.success('Registered! Check your email for the ticket.');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <h2 className="text-2xl font-bold">Event not found</h2>
          <Link to="/events" className="btn-primary">Browse Events</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
      <Navbar />

      {/* Hero */}
      <section className={`bg-gradient-to-br ${theme.hero} ${theme.text} py-24 px-4`}>
        <div className="max-w-4xl mx-auto text-center">
          {event.logo && (
            <img src={event.logo} alt={event.title} className="w-20 h-20 rounded-2xl object-cover mx-auto mb-6 border-4 border-white/20" />
          )}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-6xl font-extrabold mb-4"
          >
            {event.title}
          </motion.h1>
          <div className={`flex flex-wrap items-center justify-center gap-6 mt-6 ${theme.accent}`}>
            <span className="flex items-center gap-2 text-lg">📅 {formatDate(event.date)}</span>
            <span className="flex items-center gap-2 text-lg">📍 {event.location}</span>
            <span className="flex items-center gap-2 text-lg">👥 {event.registrations_count}/{event.max_capacity}</span>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">

        {/* About */}
        <section>
          <h2 className="text-2xl font-bold mb-4">About this event</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">{event.description}</p>
        </section>

        {/* Speakers */}
        {event.speakers?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Speakers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {event.speakers.map((sp) => (
                <div key={sp.id} className="card text-center">
                  {sp.photo ? (
                    <img src={sp.photo} alt={sp.first_name} className="w-20 h-20 rounded-full object-cover mx-auto mb-3" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold mx-auto mb-3">
                      {sp.first_name[0]}
                    </div>
                  )}
                  <h3 className="font-bold">{sp.first_name} {sp.last_name}</h3>
                  <p className="text-sm text-primary">{sp.title}</p>
                  {sp.bio && <p className="text-sm text-gray-500 mt-2 line-clamp-3">{sp.bio}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sponsors */}
        {event.sponsors?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Sponsors</h2>
            <div className="flex flex-wrap gap-6 items-center">
              {event.sponsors.map((sp) => (
                <div key={sp.id} className="card flex items-center gap-3 py-3 px-5">
                  {sp.logo
                    ? <img src={sp.logo} alt={sp.name} className="h-10 object-contain" />
                    : <span className="font-bold text-gray-700 dark:text-gray-200">{sp.name}</span>
                  }
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Registration */}
        <section className="card">
          <h2 className="text-2xl font-bold mb-4">Register for this event</h2>
          {registered ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-4xl mx-auto mb-4">✅</div>
              <h3 className="text-xl font-bold mb-2">You're registered!</h3>
              <p className="text-gray-500">Check your email for the ticket PDF with QR code.</p>
            </div>
          ) : user ? (
            <div className="text-center py-6">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Signed in as <strong>{user.first_name} {user.last_name}</strong> ({user.email})
              </p>
              <button
                onClick={onRegister}
                disabled={registering}
                className="btn-primary text-lg px-10 py-3"
              >
                {registering ? 'Registering...' : 'Confirm Registration'}
              </button>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-600 dark:text-gray-300 mb-6">Sign in to register for this event</p>
              <div className="flex gap-3 justify-center">
                <Link to="/login" className="btn-primary">Sign In</Link>
                <Link to="/register" className="btn-secondary">Create Account</Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
