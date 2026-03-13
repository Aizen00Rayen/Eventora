import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import EventCard from '../../components/EventCard';
import SkeletonCard from '../../components/SkeletonCard';
import api from '../../utils/axios';

const FEATURES = [
  { icon: '📅', title: 'Event Management', desc: 'Create, customize and manage events with multi-step forms and live theme previews.' },
  { icon: '🎤', title: 'Speakers & Sponsors', desc: 'Showcase your speakers and sponsors on a beautifully designed event page.' },
  { icon: '🎟️', title: 'Smart Ticketing', desc: 'Auto-generate QR-coded PDF tickets sent directly to participants via email.' },
  { icon: '📊', title: 'Analytics', desc: 'Real-time dashboards with registration stats, presence rates, and charts.' },
  { icon: '🔍', title: 'QR Validation', desc: 'Organizers scan QR codes on-site to instantly validate participant presence.' },
  { icon: '📜', title: 'Attestations', desc: 'Generate and download beautiful PDF attestations for every attendee.' },
];

const fadeInUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };

export default function Landing() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/events/?ordering=-created_at')
      .then(({ data }) => setEvents((data.results || data).slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden gradient-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-pill text-sm font-semibold mb-6">
              ✨ The all-in-one event platform
            </span>
            <h1 className="text-5xl sm:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
              Organize.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Connect.</span>
              {' '}Inspire.
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10">
              Eventora makes it effortless to plan academic and professional events — from creation to attestation.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/events" className="btn-primary text-lg px-8 py-3">
                Explore Events
              </Link>
              <Link to="/register" className="btn-secondary text-lg px-8 py-3">
                Create Event
              </Link>
            </div>
          </motion.div>

          {/* Floating cards decoration */}
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-3">Everything you need</h2>
          <p className="text-gray-500 dark:text-gray-400">Powerful tools for every role in your event lifecycle</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -2 }}
              className="card"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-lg mb-1">{f.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Upcoming Events</h2>
          <Link to="/events" className="text-primary font-medium hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading
            ? [1, 2, 3].map((n) => <SkeletonCard key={n} />)
            : events.map((ev) => <EventCard key={ev.id} event={ev} />)
          }
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white font-bold">E</div>
            <span className="font-bold">Eventora</span>
          </div>
          <p className="text-sm text-gray-500">© 2025 Eventora. Organize. Connect. Inspire.</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link to="/events" className="hover:text-primary transition-colors">Events</Link>
            <Link to="/login" className="hover:text-primary transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-primary transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
