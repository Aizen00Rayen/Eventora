import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../utils/axios';
import { formatDate } from '../../utils/formatters';
import useAuthStore from '../../store/authStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const mediaUrl = (p) => { if (!p) return ''; return p.startsWith('http') ? p : `${API_BASE}${p}`; };

// ── Shared icons ──────────────────────────────────────────────────────────────
function IconCalendar({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function IconPin({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function IconUsers({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

// ── Animated Countdown Timer ──────────────────────────────────────────────────
function useCountdown(targetDate) {
  const calcTimeLeft = useCallback(() => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      expired: false,
    };
  }, [targetDate]);
  const [timeLeft, setTimeLeft] = useState(calcTimeLeft);
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [calcTimeLeft]);
  return timeLeft;
}

function CountdownTimer({ date, variant = 'dark' }) {
  const { days, hours, minutes, seconds, expired } = useCountdown(date);
  if (expired) {
    return (
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold ${variant === 'dark' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-green-100 text-green-700 border border-green-200'}`}>
          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          Event is Live!
        </span>
      </div>
    );
  }
  const isUrgent = days < 3;
  const units = [
    { label: 'Days', value: days },
    { label: 'Hours', value: hours },
    { label: 'Minutes', value: minutes },
    { label: 'Seconds', value: seconds },
  ];
  const cardClass = variant === 'dark'
    ? `bg-white/5 backdrop-blur-sm border ${isUrgent ? 'border-red-500/40' : 'border-white/10'} rounded-xl`
    : `bg-gray-900/5 border ${isUrgent ? 'border-red-300' : 'border-gray-200'} rounded-xl`;
  const numClass = variant === 'dark'
    ? `text-2xl sm:text-3xl font-extrabold tabular-nums ${isUrgent ? 'text-red-400' : 'text-white'}`
    : `text-2xl sm:text-3xl font-extrabold tabular-nums ${isUrgent ? 'text-red-600' : 'text-gray-900'}`;
  const labelClass = variant === 'dark' ? 'text-[10px] uppercase tracking-widest text-gray-400 mt-0.5' : 'text-[10px] uppercase tracking-widest text-gray-500 mt-0.5';

  return (
    <div>
      {isUrgent && (
        <p className={`text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5 ${variant === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-ring-red" />
          Registration closing soon
        </p>
      )}
      <div className="flex gap-2 sm:gap-3">
        {units.map((u) => (
          <div key={u.label} className={`${cardClass} px-3 sm:px-4 py-2.5 text-center min-w-[60px]`}>
            <AnimatePresence mode="popLayout">
              <motion.span
                key={u.value}
                initial={{ rotateX: 90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                exit={{ rotateX: -90, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`block ${numClass}`}
              >
                {String(u.value).padStart(2, '0')}
              </motion.span>
            </AnimatePresence>
            <span className={labelClass}>{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Exhibitor Stand Section (shared across all themes) ────────────────────────
const STAND_OPTIONS = [
  {
    type: 'minimum',
    price: '50,000',
    label: 'Minimum',
    features: ['6 m² stand area', '2 exhibitor passes', 'Company name display', 'Basic setup included'],
  },
  {
    type: 'standard',
    price: '100,000',
    label: 'Standard',
    features: ['12 m² stand area', '5 exhibitor passes', 'Branded backdrop', 'Electrical + WiFi', 'Lunch included'],
    popular: true,
  },
  {
    type: 'premium',
    price: '150,000',
    label: 'Premium',
    features: ['24 m² corner stand', '10 exhibitor passes', 'Full branding package', 'Prime location', 'Promotional materials', 'All meals + VIP access'],
  },
];

function ExhibitorStandSection({
  event,
  onStandRegister,
  standRegistering,
  standRegistered,
  standType,
  setStandType,
  exhibitorCompany,
  setExhibitorCompany,
  exhibitorReceipt,
  setExhibitorReceipt,
  user,
  // theme variants
  dark = false,
  accentColor = '#7C3AED',
  bgCard = '',
  borderCard = '',
  textPrimary = '',
  textSecondary = '',
  inputClass = '',
  buttonClass = '',
  sectionBg = '',
  sectionId = 'exhibitor',
}) {
  return (
    <section id={sectionId} className={`py-20 px-8 ${sectionBg}`}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className={`text-3xl font-bold mb-2 ${textPrimary}`}>Exhibit at this Event</h2>
          <p className={`text-sm ${textSecondary}`}>Showcase your brand — choose the stand that fits your goals.</p>
        </div>

        {/* Stand cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {STAND_OPTIONS.map((opt) => {
            const selected = standType === opt.type;
            return (
              <button
                key={opt.type}
                onClick={() => setStandType(opt.type)}
                className={`relative text-left rounded-2xl p-6 border-2 transition-all focus:outline-none ${
                  selected
                    ? 'border-violet-500 shadow-lg shadow-violet-500/20'
                    : dark
                    ? 'border-white/10 hover:border-white/30'
                    : 'border-gray-200 hover:border-violet-300'
                } ${bgCard}`}
              >
                {opt.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs font-bold px-3 py-0.5 rounded-full">
                    Most Popular
                  </span>
                )}
                <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${selected ? 'text-violet-400' : textSecondary}`}>{opt.label}</p>
                <p className={`text-2xl font-extrabold mb-4 ${textPrimary}`}>
                  DZD {opt.price}
                </p>
                <ul className="space-y-1.5">
                  {opt.features.map((f) => (
                    <li key={f} className={`flex items-center gap-2 text-xs ${textSecondary}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke={selected ? '#7C3AED' : accentColor} strokeWidth="2.5" className="w-3.5 h-3.5 shrink-0">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* Form */}
        <div className={`max-w-lg mx-auto rounded-2xl border p-7 ${bgCard} ${borderCard}`}>
          {standRegistered ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" className="w-7 h-7">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className={`font-bold text-lg mb-1 ${textPrimary}`}>Stand Application Submitted!</p>
              <p className={`text-sm ${textSecondary}`}>Your payment receipt is under review. We'll contact you once approved.</p>
            </div>
          ) : user ? (
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wide mb-1.5 ${textSecondary}`}>
                  Company / Organisation Name
                </label>
                <input
                  value={exhibitorCompany}
                  onChange={(e) => setExhibitorCompany(e.target.value)}
                  placeholder="Acme Corp"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wide mb-1.5 ${textSecondary}`}>
                  Payment Receipt (Required){standType ? ` — ${STAND_OPTIONS.find(o => o.type === standType)?.label} Stand: DZD ${STAND_OPTIONS.find(o => o.type === standType)?.price}` : ' — select a stand above'}
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setExhibitorReceipt(e.target.files[0])}
                  className={inputClass + ' file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:font-semibold ' + (dark ? 'file:bg-violet-600/20 file:text-violet-300' : 'file:bg-violet-100 file:text-violet-700')}
                />
              </div>
              <button
                onClick={onStandRegister}
                disabled={standRegistering || !standType}
                className={`w-full font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 ${buttonClass}`}
              >
                {standRegistering ? 'Submitting...' : `Apply for ${standType ? STAND_OPTIONS.find(o => o.type === standType)?.label : 'a'} Stand`}
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className={`text-sm mb-5 ${textSecondary}`}>Sign in to apply for an exhibitor stand.</p>
              <div className="flex gap-3 justify-center">
                <Link to="/login" className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className={`border font-semibold px-6 py-2.5 rounded-xl transition-colors ${dark ? 'border-white/20 text-white/80 hover:border-white/40' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                  Create Account
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Loading / Not Found (shared) ───────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-violet-500/20 rounded-full" />
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-violet-500 rounded-full animate-spin" />
      </div>
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
        Loading event...
      </div>
    </div>
  );
}
function NotFoundScreen() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-6 text-white px-6">
      <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="#6C47FF" strokeWidth="1.5" className="w-10 h-10">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold">Event not found</h2>
      <p className="text-gray-400 text-sm max-w-xs text-center">The event you're looking for doesn't exist or may have been removed.</p>
      <Link to="/events" className="bg-violet-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-violet-700 transition-colors">
        Browse Events
      </Link>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODERN THEME
// ═══════════════════════════════════════════════════════════════════════════════
function ModernNavbar({ event }) {
  const { user } = useAuthStore();
  const dashPath = user?.role === 'client' ? '/client' : user?.role === 'organizer' ? '/organizer' : user?.role === 'admin' ? '/admin' : '/my-tickets';
  return (
    <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-5">
      <div className="flex items-center gap-4">
        <Link to="/events" className="flex items-center gap-1 text-white/60 hover:text-white text-sm transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="15 18 9 12 15 6"/></svg>
          Events
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <span className="font-bold text-white text-lg">Eventora</span>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-6 text-sm text-white/70">
        <a href="#about" className="hover:text-white transition-colors">About</a>
        <a href="#speakers" className="hover:text-white transition-colors">Speakers</a>
        <a href="#sponsors" className="hover:text-white transition-colors">Sponsors</a>
        <a href="#exhibitor" className="hover:text-white transition-colors">Exhibit</a>
        {user
          ? <Link to={dashPath} className="text-white/70 hover:text-white transition-colors">Dashboard</Link>
          : <Link to="/login" className="text-white/70 hover:text-white transition-colors">Sign In</Link>
        }
        <a href="#register" className="bg-violet-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-violet-700 transition-colors">Register</a>
      </div>
    </nav>
  );
}

function ModernTheme({ event, onRegister, registering, registered, user, paymentReceipt, setPaymentReceipt, onStandRegister, standRegistering, standRegistered, standType, setStandType, exhibitorCompany, setExhibitorCompany, exhibitorReceipt, setExhibitorReceipt }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Background gradient + mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-violet-950 to-gray-900 animate-gradient" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 30% 20%, #6C47FF 0%, transparent 50%), radial-gradient(circle at 80% 70%, #00D4AA 0%, transparent 50%)',
          }}
        />
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-10 w-64 h-64 rounded-full bg-violet-600/10 blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-10 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl animate-float-delayed" />
        <ModernNavbar event={event} />

        <div className="relative z-10 flex-1 flex items-center max-w-6xl mx-auto w-full px-8 pt-24 pb-16">
          <div className="flex-1">
            {/* Category pill */}
            <div className="inline-flex items-center gap-2 bg-violet-600/20 border border-violet-500/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span className="text-sm font-medium text-violet-300">{event.category || 'Conference'}</span>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl sm:text-6xl font-extrabold leading-tight mb-6"
            >
              {event.title}
            </motion.h1>

            {/* Meta pills */}
            <div className="flex flex-wrap gap-3 mb-8">
              <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 text-sm">
                <IconCalendar className="w-4 h-4 text-violet-400" />
                {formatDate(event.date)}
              </span>
              <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 text-sm">
                <IconPin className="w-4 h-4 text-violet-400" />
                {event.location}
              </span>
              <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 text-sm">
                <IconUsers className="w-4 h-4 text-violet-400" />
                {event.registrations_count} / {event.max_capacity} registered
              </span>
              {event.ticket_type === 'paid' && (
                <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 text-sm">
                  DZD {event.price}
                </span>
              )}
            </div>

            {/* Countdown */}
            <div className="mb-8">
              <CountdownTimer date={event.date} variant="dark" />
            </div>

            <a
              href="#register"
              className="group inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8 py-3.5 rounded-2xl transition-all text-lg shadow-lg shadow-violet-600/25 hover:shadow-violet-600/40 hover:scale-[1.02]"
            >
              Register Now
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>

          {/* Hero image card */}
          {event.logo && (
            <motion.div
              className="hidden lg:block ml-12"
              initial={{ opacity: 0, scale: 0.9, rotate: 3 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="relative w-72 h-72 rounded-3xl overflow-hidden border border-white/10 shadow-2xl animate-float-slow group">
                <img src={mediaUrl(event.logo)} alt={event.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                <div className="absolute inset-0 animate-shimmer pointer-events-none" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Scroll indicator */}
        <div className="relative z-10 flex justify-center pb-8">
          <div className="flex flex-col items-center gap-1 text-white/40 text-xs">
            <span>Scroll to explore</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 animate-bounce">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-gray-900 py-20 px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold mb-2 text-white">About this event</h2>
            <div className="w-12 h-1 bg-violet-600 rounded-full mb-6" />
            <p className="text-gray-300 leading-relaxed text-lg">{event.description}</p>
          </motion.div>
        </div>
      </section>

      {/* Speakers */}
      {event.speakers?.length > 0 && (
        <section id="speakers" className="bg-gray-950 py-20 px-8">
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-bold mb-2 text-white">Speakers</h2>
              <div className="w-12 h-1 bg-violet-600 rounded-full mb-10" />
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {event.speakers.map((sp, idx) => (
                <motion.div
                  key={sp.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center hover:border-violet-500/50 transition-colors group"
                >
                  {sp.photo ? (
                    <img
                      src={mediaUrl(sp.photo)}
                      alt={sp.first_name}
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-4 grayscale group-hover:grayscale-0 transition-all duration-500 border-2 border-gray-700 group-hover:border-violet-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-violet-900/50 border-2 border-violet-700/30 flex items-center justify-center text-violet-400 text-2xl font-bold mx-auto mb-4 group-hover:bg-violet-800/60 group-hover:border-violet-500 transition-all">
                      {sp.first_name[0]}
                    </div>
                  )}
                  <h3 className="font-bold text-white">{sp.first_name} {sp.last_name}</h3>
                  <p className="text-sm text-violet-400 mt-1">{sp.title}</p>
                  {sp.bio && <p className="text-xs text-gray-500 mt-2 line-clamp-3">{sp.bio}</p>}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sponsors */}
      {event.sponsors?.length > 0 && (
        <section id="sponsors" className="bg-gray-900 py-16 px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-2">Partners & Sponsors</h2>
            <div className="w-12 h-1 bg-violet-600 rounded-full mb-8" />
            <div className="flex flex-wrap gap-4 items-center">
              {event.sponsors.map((sp) => (
                <div key={sp.id} className="bg-gray-800 border border-gray-700 rounded-2xl px-6 py-4 flex items-center gap-3 hover:border-violet-500/40 transition-colors">
                  {sp.logo
                    ? <img src={mediaUrl(sp.logo)} alt={sp.name} className="h-8 object-contain filter brightness-75 hover:brightness-100 transition-all" />
                    : <span className="font-bold text-gray-300">{sp.name}</span>
                  }
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Registration */}
      <section id="register" className="bg-gray-950 py-20 px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #6C47FF20 0%, transparent 60%)' }} />
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-lg mx-auto relative z-10">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl shadow-violet-500/5">
            <h2 className="text-2xl font-bold text-white mb-1">Secure your spot</h2>
            <p className="text-gray-400 text-sm mb-6">Limited seats available — register now.</p>
            {registered ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-900/40 border border-green-700/30 flex items-center justify-center mx-auto mb-4">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" className="w-8 h-8">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">You're registered!</h3>
                <p className="text-gray-400 text-sm">
                  {event.ticket_type === 'paid'
                    ? 'Your registration is pending payment approval.'
                    : 'Check your email for the ticket PDF with QR code.'}
                </p>
              </div>
            ) : user ? (
              <div>
                <div className="bg-gray-800 rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-violet-700 flex items-center justify-center text-white text-sm font-bold">
                    {user.first_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{user.first_name} {user.last_name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </div>
                {event.ticket_type === 'paid' && (
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Payment Receipt (Required) — Price: DZD {event.price}
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setPaymentReceipt(e.target.files[0])}
                      className="w-full border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-300 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-violet-600/20 file:text-violet-300 file:font-semibold"
                    />
                  </div>
                )}
                <button
                  onClick={onRegister}
                  disabled={registering}
                  className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-2xl transition-colors text-base"
                >
                  {registering ? 'Registering...' : 'Confirm Registration'}
                </button>
              </div>
            ) : (
              <div>
                {event.ticket_type === 'paid' && (
                  <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 mb-4">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2" className="w-4 h-4 shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <p className="text-yellow-300 text-xs">This is a paid event (DZD {event.price}). You will need to upload a payment receipt when registering.</p>
                  </div>
                )}
                <p className="text-gray-400 text-sm mb-5">Sign in to register for this event.</p>
                <div className="flex gap-3">
                  <Link to="/login" className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-2xl text-center transition-colors">
                    Sign In
                  </Link>
                  <Link to="/register" className="flex-1 border border-gray-700 hover:border-gray-500 text-white font-semibold py-3 rounded-2xl text-center transition-colors">
                    Create Account
                  </Link>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {/* Exhibitor Stands */}
      <ExhibitorStandSection
        event={event} onStandRegister={onStandRegister} standRegistering={standRegistering}
        standRegistered={standRegistered} standType={standType} setStandType={setStandType}
        exhibitorCompany={exhibitorCompany} setExhibitorCompany={setExhibitorCompany}
        exhibitorReceipt={exhibitorReceipt} setExhibitorReceipt={setExhibitorReceipt} user={user}
        dark sectionBg="bg-gray-900" bgCard="bg-gray-800" borderCard="border-gray-700"
        textPrimary="text-white" textSecondary="text-gray-400" accentColor="#7C3AED"
        inputClass="w-full bg-transparent border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-violet-500 transition-colors placeholder-gray-600"
        buttonClass="bg-violet-600 hover:bg-violet-700 text-white"
      />

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800 py-8 px-8 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Eventora. All rights reserved.
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ACADEMIC THEME
// ═══════════════════════════════════════════════════════════════════════════════
function AcademicNavbar({ event }) {
  const { user } = useAuthStore();
  const dashPath = user?.role === 'client' ? '/client' : user?.role === 'organizer' ? '/organizer' : user?.role === 'admin' ? '/admin' : '/my-tickets';
  return (
    <nav className="relative z-20 border-b border-yellow-900/30 flex items-center justify-between px-8 py-4 bg-navy-950/80 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <Link to="/events" className="flex items-center gap-1 text-yellow-600 hover:text-yellow-400 text-sm transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="15 18 9 12 15 6"/></svg>
          Events
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-600/20 border border-yellow-600/40 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="#d4a017" strokeWidth="1.5" className="w-5 h-5">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-yellow-200 text-sm leading-none">Eventora</p>
            <p className="text-yellow-600 text-xs">Academic Conference</p>
          </div>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-6 text-sm text-yellow-200/70">
        <a href="#about" className="hover:text-yellow-200 transition-colors">Overview</a>
        <a href="#speakers" className="hover:text-yellow-200 transition-colors">Faculty</a>
        <a href="#sponsors" className="hover:text-yellow-200 transition-colors">Partners</a>
        {user
          ? <Link to={dashPath} className="text-yellow-200/70 hover:text-yellow-200 transition-colors">Dashboard</Link>
          : <Link to="/login" className="text-yellow-200/70 hover:text-yellow-200 transition-colors">Sign In</Link>
        }
        <a href="#register" className="bg-yellow-600 hover:bg-yellow-700 text-gray-950 font-bold px-4 py-2 rounded-xl transition-colors">
          Register
        </a>
      </div>
    </nav>
  );
}

function AcademicTheme({ event, onRegister, registering, registered, user, paymentReceipt, setPaymentReceipt, onStandRegister, standRegistering, standRegistered, standType, setStandType, exhibitorCompany, setExhibitorCompany, exhibitorReceipt, setExhibitorReceipt }) {
  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#0A0F1E' }}>
      <AcademicNavbar event={event} />

      {/* Hero */}
      <section
        className="relative py-24 px-8 overflow-hidden"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(212,160,23,0.06) 0%, transparent 70%),
            linear-gradient(180deg, rgba(10,15,30,1) 0%, rgba(15,22,44,1) 100%)
          `,
        }}
      >
        {/* Globe grid lines decoration */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, #d4a017 0, #d4a017 1px, transparent 0, transparent 50%),
            repeating-linear-gradient(90deg, #d4a017 0, #d4a017 1px, transparent 0, transparent 50%)
          `,
          backgroundSize: '60px 60px',
        }} />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Institution row */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px bg-yellow-700/40 flex-1 max-w-[80px]" />
            <span className="text-yellow-500/80 text-xs font-semibold tracking-[0.3em] uppercase">International Academic Conference</span>
            <div className="h-px bg-yellow-700/40 flex-1 max-w-[80px]" />
          </div>

          {event.logo && (
            <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-6 border-2 border-yellow-600/30">
              <img src={mediaUrl(event.logo)} alt={event.title} className="w-full h-full object-cover" />
            </div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl sm:text-6xl font-extrabold leading-tight mb-4"
            style={{ color: '#EDE9D5' }}
          >
            {event.title}
          </motion.h1>

          <p className="text-yellow-500/80 text-lg mb-8 max-w-xl mx-auto">{event.category || 'International Symposium'}</p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            <span className="flex items-center gap-2 border border-yellow-700/40 bg-yellow-900/10 rounded-full px-5 py-2.5 text-sm text-yellow-300">
              <IconCalendar className="w-4 h-4 text-yellow-500" />
              {formatDate(event.date)}
            </span>
            <span className="flex items-center gap-2 border border-yellow-700/40 bg-yellow-900/10 rounded-full px-5 py-2.5 text-sm text-yellow-300">
              <IconPin className="w-4 h-4 text-yellow-500" />
              {event.location}
            </span>
            <span className="flex items-center gap-2 border border-yellow-700/40 bg-yellow-900/10 rounded-full px-5 py-2.5 text-sm text-yellow-300">
              <IconUsers className="w-4 h-4 text-yellow-500" />
              {event.registrations_count} / {event.max_capacity} delegates
            </span>
            {event.ticket_type === 'paid' && (
              <span className="flex items-center gap-2 border border-yellow-700/40 bg-yellow-900/10 rounded-full px-5 py-2.5 text-sm text-yellow-300">
                DZD {event.price}
              </span>
            )}
          </div>

          {/* Countdown */}
          <div className="mt-8">
            <CountdownTimer date={event.date} variant="dark" />
          </div>

          <a
            href="#register"
            className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-gray-950 font-bold px-8 py-3.5 rounded-2xl transition-all text-base mt-8 shadow-lg shadow-yellow-600/20 hover:scale-[1.02]"
          >
            Register as Delegate
          </a>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-16 px-8" style={{ backgroundColor: '#0D1425' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold" style={{ color: '#EDE9D5' }}>Conference Overview</h2>
            <div className="flex-1 h-px bg-yellow-700/20" />
          </div>
          <p className="text-gray-400 leading-relaxed text-base">{event.description}</p>
        </motion.div>
      </section>

      {/* Distinguished Faculty / Speakers */}
      {event.speakers?.length > 0 && (
        <section id="speakers" className="py-16 px-8" style={{ backgroundColor: '#0A0F1E' }}>
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-10">
              <h2 className="text-2xl font-bold whitespace-nowrap" style={{ color: '#EDE9D5' }}>Distinguished Faculty</h2>
              <div className="flex-1 h-px bg-yellow-700/20" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {event.speakers.map((sp, idx) => (
                <motion.div
                  key={sp.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="border rounded-2xl p-6 text-center transition-colors group"
                  style={{ borderColor: 'rgba(212,160,23,0.2)', backgroundColor: 'rgba(212,160,23,0.03)' }}
                >
                  {sp.photo ? (
                    <img
                      src={mediaUrl(sp.photo)}
                      alt={sp.first_name}
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-4 grayscale group-hover:grayscale-0 transition-all duration-500 border-2 group-hover:scale-110"
                      style={{ borderColor: 'rgba(212,160,23,0.4)' }}
                    />
                  ) : (
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 border-2"
                      style={{ backgroundColor: 'rgba(212,160,23,0.1)', borderColor: 'rgba(212,160,23,0.3)', color: '#d4a017' }}
                    >
                      {sp.first_name[0]}
                    </div>
                  )}
                  <h3 className="font-bold" style={{ color: '#EDE9D5' }}>Prof. {sp.first_name} {sp.last_name}</h3>
                  <p className="text-sm mt-1" style={{ color: '#d4a017' }}>{sp.title}</p>
                  {sp.bio && <p className="text-xs text-gray-500 mt-2 line-clamp-3">{sp.bio}</p>}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Institutional Partners / Sponsors */}
      {event.sponsors?.length > 0 && (
        <section id="sponsors" className="py-14 px-8" style={{ backgroundColor: '#0D1425' }}>
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-xl font-bold whitespace-nowrap" style={{ color: '#EDE9D5' }}>Institutional Partners</h2>
              <div className="flex-1 h-px bg-yellow-700/20" />
            </div>
            <div className="flex flex-wrap gap-4 items-center justify-center">
              {event.sponsors.map((sp) => (
                <div
                  key={sp.id}
                  className="border rounded-2xl px-8 py-4 flex items-center gap-3 transition-colors"
                  style={{ borderColor: 'rgba(212,160,23,0.2)', backgroundColor: 'rgba(212,160,23,0.04)' }}
                >
                  {sp.logo
                    ? <img src={mediaUrl(sp.logo)} alt={sp.name} className="h-8 object-contain opacity-70 hover:opacity-100 transition-opacity" />
                    : <span className="font-bold text-sm" style={{ color: '#d4a017' }}>{sp.name}</span>
                  }
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Registration */}
      <section id="register" className="py-20 px-8" style={{ backgroundColor: '#0A0F1E' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Left: info */}
            <div>
              <h2 className="text-3xl font-bold mb-3" style={{ color: '#EDE9D5' }}>Delegate Registration</h2>
              <p className="text-gray-400 mb-8">
                Join researchers, academics, and industry leaders from around the world at {event.title}.
              </p>
              <div className="space-y-4">
                {[
                  { icon: '📜', label: 'Certificate of participation issued' },
                  { icon: '🎤', label: 'Access to all sessions and workshops' },
                  { icon: '🤝', label: 'Networking with global researchers' },
                  { icon: '📚', label: 'Conference proceedings included' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 text-sm text-gray-300">
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: form */}
            <div
              className="border rounded-2xl p-7"
              style={{ borderColor: 'rgba(212,160,23,0.2)', backgroundColor: 'rgba(212,160,23,0.03)' }}
            >
              <h3 className="font-bold text-lg mb-5" style={{ color: '#EDE9D5' }}>Register Now</h3>
              {registered ? (
                <div className="text-center py-6">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 border-2"
                    style={{ backgroundColor: 'rgba(74,222,128,0.1)', borderColor: 'rgba(74,222,128,0.3)' }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" className="w-7 h-7">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: '#EDE9D5' }}>Registration Confirmed!</h3>
                  <p className="text-gray-400 text-sm">
                    {event.ticket_type === 'paid'
                      ? 'Your registration is pending payment approval.'
                      : 'Your ticket and QR code have been sent to your email.'}
                  </p>
                </div>
              ) : user ? (
                <div>
                  <div
                    className="flex items-center gap-3 rounded-xl px-4 py-3 mb-5 border"
                    style={{ backgroundColor: 'rgba(212,160,23,0.05)', borderColor: 'rgba(212,160,23,0.15)' }}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{ backgroundColor: 'rgba(212,160,23,0.2)', color: '#d4a017' }}
                    >
                      {user.first_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#EDE9D5' }}>{user.first_name} {user.last_name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  {event.ticket_type === 'paid' && (
                    <div className="mb-4">
                      <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'rgba(212,160,23,0.7)' }}>
                        Payment Receipt (Required) — Price: DZD {event.price}
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setPaymentReceipt(e.target.files[0])}
                        className="w-full border rounded-xl px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:font-semibold"
                        style={{ borderColor: 'rgba(212,160,23,0.3)', backgroundColor: 'rgba(212,160,23,0.04)', color: '#EDE9D5', '--file-bg': 'rgba(212,160,23,0.2)' }}
                      />
                    </div>
                  )}
                  <button
                    onClick={onRegister}
                    disabled={registering}
                    className="w-full font-bold py-3.5 rounded-2xl transition-colors disabled:opacity-60 text-gray-950"
                    style={{ backgroundColor: '#d4a017' }}
                  >
                    {registering ? 'Submitting...' : 'Submit Registration'}
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-400 text-sm mb-5">Sign in to complete your delegate registration.</p>
                  <div className="flex gap-3">
                    <Link
                      to="/login"
                      className="flex-1 text-center font-bold py-3 rounded-2xl transition-colors text-gray-950"
                      style={{ backgroundColor: '#d4a017' }}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="flex-1 text-center font-semibold py-3 rounded-2xl border transition-colors text-gray-200"
                      style={{ borderColor: 'rgba(212,160,23,0.3)' }}
                    >
                      Create Account
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Exhibitor Stands */}
      <ExhibitorStandSection
        event={event} onStandRegister={onStandRegister} standRegistering={standRegistering}
        standRegistered={standRegistered} standType={standType} setStandType={setStandType}
        exhibitorCompany={exhibitorCompany} setExhibitorCompany={setExhibitorCompany}
        exhibitorReceipt={exhibitorReceipt} setExhibitorReceipt={setExhibitorReceipt} user={user}
        dark sectionBg="" bgCard="" borderCard="" accentColor="#d4a017"
        textPrimary="text-yellow-200" textSecondary="text-gray-500"
        inputClass="w-full border rounded-xl px-3 py-2.5 text-sm text-yellow-200 focus:outline-none transition-colors"
        buttonClass="font-bold text-gray-950"
        sectionId="exhibitor"
        style={{ backgroundColor: '#0D1425' }}
      />

      {/* Footer */}
      <footer
        className="border-t py-8 px-8 text-center text-sm"
        style={{ borderColor: 'rgba(212,160,23,0.15)', backgroundColor: '#080C18', color: '#4B5563' }}
      >
        © {new Date().getFullYear()} Eventora Academic Conference Platform. All rights reserved.
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT / FALLBACK THEME
// ═══════════════════════════════════════════════════════════════════════════════
function DefaultTheme({ event, onRegister, registering, registered, user, paymentReceipt, setPaymentReceipt, onStandRegister, standRegistering, standRegistered, standType, setStandType, exhibitorCompany, setExhibitorCompany, exhibitorReceipt, setExhibitorReceipt }) {
  const dashPath = user?.role === 'client' ? '/client' : user?.role === 'organizer' ? '/organizer' : user?.role === 'admin' ? '/admin' : '/my-tickets';
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <nav className="bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between">
        <Link to="/events" className="flex items-center gap-1.5 text-gray-500 hover:text-primary text-sm font-medium transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="15 18 9 12 15 6"/></svg>
          All Events
        </Link>
        {user
          ? <Link to={dashPath} className="text-sm text-gray-500 hover:text-primary transition-colors font-medium">My Dashboard</Link>
          : <div className="flex gap-3 text-sm"><Link to="/login" className="text-gray-500 hover:text-primary transition-colors">Sign In</Link><Link to="/register" className="bg-primary text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors">Sign Up</Link></div>
        }
      </nav>
      {/* Hero */}
      <section className={`bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900 text-white py-24 px-4`}>
        <div className="max-w-4xl mx-auto text-center">
          {event.logo && (
            <img src={mediaUrl(event.logo)} alt={event.title} className="w-20 h-20 rounded-2xl object-cover mx-auto mb-6 border-4 border-white/20" />
          )}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-6xl font-extrabold mb-4"
          >
            {event.title}
          </motion.h1>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-violet-200">
            <span className="flex items-center gap-2"><IconCalendar /> {formatDate(event.date)}</span>
            <span className="flex items-center gap-2"><IconPin /> {event.location}</span>
            <span className="flex items-center gap-2"><IconUsers /> {event.registrations_count}/{event.max_capacity}</span>
            {event.ticket_type === 'paid' && (
              <span className="flex items-center gap-2">DZD {event.price}</span>
            )}
          </div>
          {/* Countdown */}
          <div className="mt-8 flex justify-center">
            <CountdownTimer date={event.date} variant="dark" />
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        <section>
          <h2 className="text-2xl font-bold mb-4">About this event</h2>
          <p className="text-gray-600 leading-relaxed text-lg">{event.description}</p>
        </section>

        {event.speakers?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Speakers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {event.speakers.map((sp) => (
                <div key={sp.id} className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
                  {sp.photo ? (
                    <img src={mediaUrl(sp.photo)} alt={sp.first_name} className="w-20 h-20 rounded-full object-cover mx-auto mb-3" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-2xl font-bold mx-auto mb-3">
                      {sp.first_name[0]}
                    </div>
                  )}
                  <h3 className="font-bold">{sp.first_name} {sp.last_name}</h3>
                  <p className="text-sm text-violet-600">{sp.title}</p>
                  {sp.bio && <p className="text-sm text-gray-500 mt-2 line-clamp-3">{sp.bio}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {event.sponsors?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Sponsors</h2>
            <div className="flex flex-wrap gap-4 items-center">
              {event.sponsors.map((sp) => (
                <div key={sp.id} className="bg-white rounded-2xl border border-gray-100 px-6 py-3 shadow-sm flex items-center gap-3">
                  {sp.logo
                    ? <img src={mediaUrl(sp.logo)} alt={sp.name} className="h-10 object-contain" />
                    : <span className="font-bold text-gray-700">{sp.name}</span>
                  }
                </div>
              ))}
            </div>
          </section>
        )}

        <section id="register" className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm" style={{scrollMarginTop:'80px'}}>
          <h2 className="text-2xl font-bold mb-4">Register for this event</h2>
          {registered ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" className="w-8 h-8">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">You're registered!</h3>
              <p className="text-gray-500">
                {event.ticket_type === 'paid'
                  ? 'Your registration is pending payment approval.'
                  : 'Check your email for the ticket PDF with QR code.'}
              </p>
            </div>
          ) : user ? (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-6">
                Signed in as <strong>{user.first_name} {user.last_name}</strong> ({user.email})
              </p>
              {event.ticket_type === 'paid' && (
                <div className="mb-4 text-left">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Payment Receipt (Required) — Price: DZD {event.price}
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setPaymentReceipt(e.target.files[0])}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-violet-100 file:text-violet-700 file:font-semibold"
                  />
                </div>
              )}
              <button
                onClick={onRegister}
                disabled={registering}
                className="bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold px-10 py-3 rounded-2xl transition-colors text-lg"
              >
                {registering ? 'Registering...' : 'Confirm Registration'}
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-6">Sign in to register for this event</p>
              <div className="flex gap-3 justify-center">
                <Link to="/login" className="bg-violet-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-violet-700 transition-colors">Sign In</Link>
                <Link to="/register" className="border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors">Create Account</Link>
              </div>
            </div>
          )}
        </section>

        {/* Exhibitor Stands */}
        <ExhibitorStandSection
          event={event} onStandRegister={onStandRegister} standRegistering={standRegistering}
          standRegistered={standRegistered} standType={standType} setStandType={setStandType}
          exhibitorCompany={exhibitorCompany} setExhibitorCompany={setExhibitorCompany}
          exhibitorReceipt={exhibitorReceipt} setExhibitorReceipt={setExhibitorReceipt} user={user}
          sectionBg="bg-gray-50" bgCard="bg-white" borderCard="border-gray-200"
          textPrimary="text-gray-900" textSecondary="text-gray-400" accentColor="#7C3AED"
          inputClass="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
          buttonClass="bg-violet-600 hover:bg-violet-700 text-white"
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CORPORATE THEME
// ═══════════════════════════════════════════════════════════════════════════════
function CorporateTheme({ event, onRegister, registering, registered, user, paymentReceipt, setPaymentReceipt, onStandRegister, standRegistering, standRegistered, standType, setStandType, exhibitorCompany, setExhibitorCompany, exhibitorReceipt, setExhibitorReceipt }) {
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navbar */}
      <nav className="border-b border-gray-100 px-8 h-16 flex items-center justify-between sticky top-0 z-30 bg-white">
        <div className="flex items-center gap-4">
          <Link to="/events" className="flex items-center gap-1 text-gray-400 hover:text-blue-600 text-sm transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="15 18 9 12 15 6"/></svg>
            Events
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <span className="font-bold text-lg text-gray-900">Eventora</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-7 text-sm text-gray-500 font-medium">
          <a href="#about" className="hover:text-gray-900 transition-colors">About</a>
          <a href="#speakers" className="hover:text-gray-900 transition-colors">Speakers</a>
          <a href="#sponsors" className="hover:text-gray-900 transition-colors">Sponsors</a>
          {user
            ? <Link to={user.role === 'client' ? '/client' : user.role === 'organizer' ? '/organizer' : user.role === 'admin' ? '/admin' : '/my-tickets'} className="text-gray-500 hover:text-gray-900 transition-colors">Dashboard</Link>
            : <Link to="/login" className="text-gray-500 hover:text-gray-900 transition-colors">Sign In</Link>
          }
          <a href="#register" className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition-colors font-semibold">Register Now</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto text-center px-8 pt-20 pb-16">
        <div className="inline-flex items-center gap-2 border border-blue-200 bg-blue-50 rounded-full px-4 py-1.5 mb-7">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">{event.category || 'Annual Leadership Conference'}</span>
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl sm:text-6xl font-extrabold leading-tight mb-5"
        >
          {event.title.split(' ').length > 4
            ? <>{event.title.split(' ').slice(0, Math.ceil(event.title.split(' ').length / 2)).join(' ')}{' '}
              <span className="text-blue-600">{event.title.split(' ').slice(Math.ceil(event.title.split(' ').length / 2)).join(' ')}</span></>
            : event.title
          }
        </motion.h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto mb-8">{event.description?.slice(0, 120)}{event.description?.length > 120 ? '…' : ''}</p>
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <span className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2 text-sm font-medium text-gray-600">
            <IconCalendar className="w-4 h-4 text-blue-600" />{formatDate(event.date)}
          </span>
          <span className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2 text-sm font-medium text-gray-600">
            <IconPin className="w-4 h-4 text-blue-600" />{event.location}
          </span>
          {event.ticket_type === 'paid' && (
            <span className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2 text-sm font-medium text-gray-600">
              DZD {event.price}
            </span>
          )}
        </div>
        {/* Countdown */}
        <div className="mt-6 mb-8 flex justify-center">
          <CountdownTimer date={event.date} variant="light" />
        </div>
        <a href="#register" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-2xl transition-all text-base shadow-lg shadow-blue-600/20 hover:scale-[1.02]">
          Secure Your Spot
        </a>
      </section>

      {/* Venue image */}
      {event.logo ? (
        <div className="max-w-3xl mx-auto px-8 mb-16">
          <img src={mediaUrl(event.logo)} alt={event.title} className="w-full rounded-2xl object-cover max-h-72 border border-gray-100 shadow-sm" />
        </div>
      ) : (
        <div className="max-w-3xl mx-auto px-8 mb-16">
          <div className="w-full h-56 rounded-2xl bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 flex items-center justify-center border border-gray-200">
            <span className="text-white/30 text-sm tracking-widest uppercase">Event Venue</span>
          </div>
        </div>
      )}

      {/* About */}
      <section id="about" className="py-16 px-8 border-t border-gray-100">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-0.5 h-5 bg-blue-600" />
              <h2 className="text-xl font-bold">About the Event</h2>
            </div>
            <p className="text-gray-500 leading-relaxed mb-6">{event.description}</p>
            <div className="space-y-3">
              {[
                { label: 'Expert Keynotes', sub: `Learn from CEOs of Fortune 500 companies.` },
                { label: 'Networking Hubs', sub: 'Dedicated spaces for strategic partnerships.' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.5" className="w-6 h-6"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, value: `${event.registrations_count}+`, label: 'Industry Attendees' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.5" className="w-6 h-6"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>, value: event.ticket_type === 'free' ? 'Free' : 'Hybrid', label: 'Format Experience' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.5" className="w-6 h-6"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>, value: 'Eventora Corp', label: 'Official Organizer' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.5" className="w-6 h-6"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>, value: `${event.speakers?.length || 0}+`, label: 'Speaker Sessions' },
            ].map((s, i) => (
              <div key={i} className="border border-gray-100 rounded-2xl p-5">
                {s.icon}
                <p className="text-xl font-extrabold mt-3">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Speakers */}
      {event.speakers?.length > 0 && (
        <section id="speakers" className="py-16 px-8 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Distinguished Speakers</h2>
              <p className="text-gray-400 mt-2 text-sm">Voices that shape the corporate landscape</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {event.speakers.map((sp) => (
                <div key={sp.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative">
                    {sp.photo ? (
                      <img src={mediaUrl(sp.photo)} alt={sp.first_name} className="w-full h-52 object-cover object-top" />
                    ) : (
                      <div className="w-full h-52 bg-gradient-to-br from-slate-200 to-blue-100 flex items-center justify-center">
                        <span className="text-4xl font-bold text-blue-300">{sp.first_name[0]}</span>
                      </div>
                    )}
                    {sp.schedule_time && (
                      <span className="absolute bottom-3 left-3 bg-blue-900/80 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                        {new Date(sp.schedule_time).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900">{sp.first_name} {sp.last_name}</h3>
                    <p className="text-sm text-blue-600 font-medium mt-0.5">{sp.title}</p>
                    {sp.bio && <p className="text-xs text-gray-400 mt-2 line-clamp-3">{sp.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sponsors */}
      {event.sponsors?.length > 0 && (
        <section id="sponsors" className="py-12 px-8 border-t border-b border-gray-100">
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-7">Our Strategic Partners</p>
            <div className="flex flex-wrap gap-4 items-center justify-center">
              {event.sponsors.map((sp) => (
                <div key={sp.id} className="flex items-center gap-2.5 border border-gray-200 rounded-2xl px-6 py-3 hover:border-blue-200 transition-colors">
                  {sp.logo
                    ? <img src={mediaUrl(sp.logo)} alt={sp.name} className="h-8 object-contain opacity-60 hover:opacity-100 transition-opacity" />
                    : <span className="text-sm font-bold text-gray-500">{sp.name}</span>
                  }
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Registration */}
      <section id="register" className="py-20 px-8" style={{ backgroundColor: '#0F172A' }}>
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Join us at Eventora</h2>
            <p className="text-slate-400 text-sm mb-7">Limited seats available. Register today to secure early bird pricing and exclusive workshop access.</p>
            <div className="space-y-3">
              {['Full event access', 'Premium networking dinner', 'Digital workshop bundle'].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-slate-300">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" className="w-4 h-4 shrink-0"><polyline points="20 6 9 17 4 12" /></svg>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-7">
            {registered ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" className="w-7 h-7"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <h3 className="text-lg font-bold mb-2">You're registered!</h3>
                <p className="text-gray-500 text-sm">
                  {event.ticket_type === 'paid'
                    ? 'Your registration is pending payment approval.'
                    : 'Check your email for the ticket PDF.'}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">First Name</label>
                    <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Surname</label>
                    <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Work Email</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@company.com" type="email"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
                {event.ticket_type === 'paid' && (
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Payment Receipt (Required) — Price: DZD {event.price}
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setPaymentReceipt(e.target.files[0])}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-600 file:font-semibold"
                    />
                  </div>
                )}
                <button onClick={onRegister} disabled={registering}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                  {registering ? 'Registering...' : 'Confirm Registration'}
                </button>
                <p className="text-xs text-gray-400 text-center mt-3">By registering, you agree to our Terms of Service and Privacy Policy.</p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Exhibitor Stands */}
      <ExhibitorStandSection
        event={event} onStandRegister={onStandRegister} standRegistering={standRegistering}
        standRegistered={standRegistered} standType={standType} setStandType={setStandType}
        exhibitorCompany={exhibitorCompany} setExhibitorCompany={setExhibitorCompany}
        exhibitorReceipt={exhibitorReceipt} setExhibitorReceipt={setExhibitorReceipt} user={user}
        sectionBg="bg-gray-50" bgCard="bg-white" borderCard="border-gray-200"
        textPrimary="text-gray-900" textSecondary="text-gray-400" accentColor="#2563EB"
        inputClass="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        buttonClass="bg-blue-600 hover:bg-blue-700 text-white"
      />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 px-8 py-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-3.5 h-3.5">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <span className="font-bold text-sm text-gray-700">Eventora</span>
        </div>
        <div className="flex items-center gap-5 text-sm text-gray-400">
          <a href="/" className="hover:text-gray-600 transition-colors">Privacy</a>
          <a href="/" className="hover:text-gray-600 transition-colors">Terms</a>
          <a href="/" className="hover:text-gray-600 transition-colors">Contact</a>
          <a href="/" className="hover:text-gray-600 transition-colors">Press</a>
        </div>
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} Eventora Corp. All rights reserved.</p>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MINIMAL THEME
// ═══════════════════════════════════════════════════════════════════════════════
function MinimalTheme({ event, onRegister, registering, registered, user, paymentReceipt, setPaymentReceipt, onStandRegister, standRegistering, standRegistered, standType, setStandType, exhibitorCompany, setExhibitorCompany, exhibitorReceipt, setExhibitorReceipt }) {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Navbar */}
      <nav className="border-b border-gray-200 px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/events" className="flex items-center gap-1 text-gray-400 hover:text-gray-700 text-xs font-semibold tracking-wide uppercase transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><polyline points="15 18 9 12 15 6"/></svg>
            Events
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full" style={{ background: 'linear-gradient(135deg,#7C3AED,#00D4AA)' }} />
            <span className="font-semibold text-sm tracking-wide text-gray-900">EVENTORA</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-7 text-xs font-semibold tracking-[0.12em] text-gray-400">
          <a href="#about" className="hover:text-gray-900 transition-colors uppercase">About</a>
          <a href="#speakers" className="hover:text-gray-900 transition-colors uppercase">Speakers</a>
          {user
            ? <Link to={user.role === 'client' ? '/client' : user.role === 'organizer' ? '/organizer' : user.role === 'admin' ? '/admin' : '/my-tickets'} className="hover:text-gray-900 transition-colors uppercase">Dashboard</Link>
            : <Link to="/login" className="hover:text-gray-900 transition-colors uppercase">Sign In</Link>
          }
          <a href="#register" className="border border-gray-900 text-gray-900 px-4 py-1.5 rounded text-xs uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-colors">Register Now</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-8 pt-24 pb-28">
        <div className="flex items-center gap-5 mb-8 text-xs font-semibold tracking-widest text-gray-400 uppercase">
          <span>{formatDate(event.date)}</span>
          <span className="w-px h-4 bg-gray-300" />
          <span>{event.location}</span>
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl sm:text-7xl font-black leading-none tracking-tight text-gray-950 mb-8"
        >
          {event.title.toUpperCase()}.
        </motion.h1>
        <p className="text-gray-400 text-base max-w-lg leading-relaxed mb-10">{event.description?.slice(0, 160)}{event.description?.length > 160 ? '…' : ''}</p>
        <CountdownTimer date={event.date} variant="light" />
      </section>

      {/* About */}
      <section id="about" className="border-t border-b border-gray-200 py-16 px-8">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12">
          <div>
            <p className="text-xs font-semibold text-violet-600 tracking-widest mb-5">01 / THE VISION</p>
            <p className="text-2xl font-semibold leading-snug text-gray-900">{event.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Capacity', value: `${event.max_capacity} Participants` },
              { label: 'Format', value: event.ticket_type === 'free' ? 'Single Track' : 'Multi-Track' },
              { label: 'Organizer', value: 'Eventora' },
              { label: 'Venue', value: event.location },
            ].map((s) => (
              <div key={s.label} className="border border-gray-200 rounded p-4">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                <p className="font-semibold text-sm text-gray-900">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Speakers */}
      {event.speakers?.length > 0 && (
        <section id="speakers" className="py-16 px-8">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-semibold text-violet-600 tracking-widest mb-8">02 / SPEAKERS</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {event.speakers.map((sp) => (
                <div key={sp.id}>
                  {sp.photo ? (
                    <img src={mediaUrl(sp.photo)} alt={sp.first_name}
                      className="w-full aspect-square object-cover object-top rounded mb-3 filter grayscale" />
                  ) : (
                    <div className="w-full aspect-square bg-gray-100 rounded mb-3 flex items-center justify-center">
                      <span className="text-3xl font-black text-gray-300">{sp.first_name[0]}</span>
                    </div>
                  )}
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-900">{sp.first_name} {sp.last_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{sp.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Partners */}
      {event.sponsors?.length > 0 && (
        <section className="border-t border-gray-200 py-10 px-8">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">Partners</p>
            <div className="flex flex-wrap gap-5 items-center">
              {event.sponsors.map((sp) => (
                <div key={sp.id} className="flex items-center gap-2">
                  {sp.logo
                    ? <img src={mediaUrl(sp.logo)} alt={sp.name} className="h-6 object-contain filter grayscale opacity-40" />
                    : <span className="text-sm font-bold text-gray-300">{sp.name}</span>
                  }
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Registration */}
      <section id="register" className="py-24 px-8" style={{ backgroundColor: '#0F172A' }}>
        <div className="max-w-xl mx-auto">
          <p className="text-xs font-semibold text-violet-400 tracking-widest mb-4 text-center uppercase">Join Us</p>
          <h2 className="text-4xl font-black text-white text-center leading-tight mb-10">Reserve your place at the table.</h2>
          {registered ? (
            <div className="text-center py-6">
              <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" className="w-12 h-12 mx-auto mb-3"><polyline points="20 6 9 17 4 12" /></svg>
              <p className="text-white font-bold text-lg">Registration confirmed.</p>
              <p className="text-slate-400 text-sm mt-1">
                {event.ticket_type === 'paid'
                  ? 'Your registration is pending payment approval.'
                  : 'Check your email for details.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-slate-400 uppercase tracking-widest mb-1.5">First Name</label>
                  <input defaultValue={user?.first_name} placeholder="John"
                    className="w-full bg-transparent border border-slate-700 rounded text-white px-3 py-2.5 text-sm focus:outline-none focus:border-white transition-colors placeholder-slate-600" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase tracking-widest mb-1.5">Last Name</label>
                  <input defaultValue={user?.last_name} placeholder="Doe"
                    className="w-full bg-transparent border border-slate-700 rounded text-white px-3 py-2.5 text-sm focus:outline-none focus:border-white transition-colors placeholder-slate-600" />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-xs text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
                <input defaultValue={user?.email} type="email" placeholder="john@example.com"
                  className="w-full bg-transparent border border-slate-700 rounded text-white px-3 py-2.5 text-sm focus:outline-none focus:border-white transition-colors placeholder-slate-600" />
              </div>
              {event.ticket_type === 'paid' && (
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                    Payment Receipt (Required) — Price: DZD {event.price}
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setPaymentReceipt(e.target.files[0])}
                    className="w-full border border-slate-700 rounded px-3 py-2 text-sm text-slate-300 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-violet-600/20 file:text-violet-300 file:font-semibold"
                  />
                </div>
              )}
              <button onClick={onRegister} disabled={registering}
                className="w-full border border-white text-white font-bold py-3 rounded text-xs tracking-widest uppercase hover:bg-white hover:text-gray-900 disabled:opacity-60 transition-all">
                {registering ? 'Registering...' : 'Complete Registration'}
              </button>
            </>
          )}
        </div>
      </section>

      {/* Exhibitor Stands */}
      <ExhibitorStandSection
        event={event} onStandRegister={onStandRegister} standRegistering={standRegistering}
        standRegistered={standRegistered} standType={standType} setStandType={setStandType}
        exhibitorCompany={exhibitorCompany} setExhibitorCompany={setExhibitorCompany}
        exhibitorReceipt={exhibitorReceipt} setExhibitorReceipt={setExhibitorReceipt} user={user}
        dark sectionBg="" bgCard="" borderCard="border-slate-700"
        textPrimary="text-white" textSecondary="text-slate-400" accentColor="#7C3AED"
        inputClass="w-full bg-transparent border border-slate-700 rounded text-white px-3 py-2.5 text-sm focus:outline-none focus:border-white transition-colors placeholder-slate-600"
        buttonClass="border border-white text-white hover:bg-white hover:text-gray-900 text-xs tracking-widest uppercase"
        style={{ backgroundColor: '#0F172A' }}
      />

      {/* Footer */}
      <footer style={{ backgroundColor: '#0F172A' }} className="border-t border-slate-800 px-8 py-5 flex items-center justify-between flex-wrap gap-4">
        <p className="text-xs text-slate-500">© {new Date().getFullYear()} Eventora. All rights reserved.</p>
        <div className="flex gap-5 text-xs text-slate-500">
          <a href="/" className="hover:text-white transition-colors">Privacy</a>
          <a href="/" className="hover:text-white transition-colors">Terms</a>
          <a href="/" className="hover:text-white transition-colors">Twitter</a>
        </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIBRANT THEME
// ═══════════════════════════════════════════════════════════════════════════════
function VibrantTheme({ event, onRegister, registering, registered, user, paymentReceipt, setPaymentReceipt, onStandRegister, standRegistering, standRegistered, standType, setStandType, exhibitorCompany, setExhibitorCompany, exhibitorReceipt, setExhibitorReceipt }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero with gradient */}
      <div style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 40%, #06B6D4 100%)' }}>
        {/* Navbar */}
        <nav className="px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/events" className="flex items-center gap-1 text-white/60 hover:text-white text-sm transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="15 18 9 12 15 6"/></svg>
              Events
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span className="font-bold text-white text-base">Eventora</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-white/80 font-medium">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#speakers" className="hover:text-white transition-colors">Speakers</a>
            <a href="#sponsors" className="hover:text-white transition-colors">Sponsors</a>
            {user
              ? <Link to={user.role === 'client' ? '/client' : user.role === 'organizer' ? '/organizer' : user.role === 'admin' ? '/admin' : '/my-tickets'} className="text-white/80 hover:text-white transition-colors">Dashboard</Link>
              : <Link to="/login" className="text-white/80 hover:text-white transition-colors">Sign In</Link>
            }
            <a href="#register" className="border border-white/50 text-white rounded-full px-5 py-2 hover:bg-white/10 transition-colors font-semibold">Register now</a>
          </div>
        </nav>

        {/* Hero */}
        <section className="max-w-2xl mx-auto text-center px-8 pt-12 pb-20 text-white">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-7">
            <span className="text-xs font-semibold">Coming this {formatDate(event.date).split(' ')[0]} • {new Date().getFullYear()} Edition</span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl sm:text-6xl font-extrabold leading-tight mb-5"
          >
            {event.title}
          </motion.h1>
          <p className="text-white/80 text-base mb-8 max-w-lg mx-auto">{event.description?.slice(0, 140)}{event.description?.length > 140 ? '…' : ''}</p>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <span className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm">
              <IconCalendar className="w-4 h-4" />{formatDate(event.date)}
            </span>
            <span className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm">
              <IconPin className="w-4 h-4" />{event.location}
            </span>
            {event.ticket_type === 'paid' && (
              <span className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm">
                DZD {event.price}
              </span>
            )}
          </div>
          {/* Countdown */}
          <div className="mt-8 mb-6">
            <CountdownTimer date={event.date} variant="dark" />
          </div>
          <a href="#register" className="inline-block border-2 border-white text-white font-semibold px-8 py-3 rounded-full hover:bg-white hover:text-violet-700 transition-all hover:scale-[1.02] shadow-lg shadow-white/10">
            Register now
          </a>
        </section>
      </div>

      {/* About */}
      <section id="about" className="py-16 px-8">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Event</h2>
            <p className="text-gray-500 leading-relaxed mb-6">{event.description}</p>
            <div className="space-y-3">
              {[
                { color: 'bg-violet-500', label: 'Capacity', value: `${event.max_capacity}+ Attendees` },
                { color: 'bg-cyan-500', label: 'Format', value: 'In-person Festival' },
                { color: 'bg-violet-500', label: 'Organizer', value: 'Eventora Labs' },
                { color: 'bg-cyan-500', label: 'Theme', value: 'Vibrant Energy' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className={`w-1 h-8 rounded-full ${s.color} shrink-0`} />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest">{s.label}</p>
                    <p className="font-semibold text-sm text-gray-900">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {event.logo ? (
            <img src={mediaUrl(event.logo)} alt={event.title}
              className="w-full aspect-video object-cover rounded-2xl shadow-sm" />
          ) : (
            <div className="w-full aspect-video rounded-2xl bg-gradient-to-br from-violet-100 to-cyan-100 flex items-center justify-center">
              <IconCalendar className="w-16 h-16 text-violet-300" />
            </div>
          )}
        </div>
      </section>

      {/* Speakers */}
      {event.speakers?.length > 0 && (
        <section id="speakers" className="py-16 px-8 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">World Class Speakers</h2>
              <p className="text-gray-400 mt-2 text-sm">Learn from the pioneers shaping the digital landscape.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {event.speakers.map((sp, idx) => {
                const dayColors = ['bg-violet-600', 'bg-cyan-600', 'bg-emerald-600'];
                const textColors = ['text-violet-600', 'text-cyan-600', 'text-emerald-600'];
                return (
                  <div key={sp.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative">
                      {sp.photo ? (
                        <img src={mediaUrl(sp.photo)} alt={sp.first_name} className="w-full h-52 object-cover object-top" />
                      ) : (
                        <div className="w-full h-52 bg-gradient-to-br from-violet-100 to-cyan-100 flex items-center justify-center">
                          <span className="text-4xl font-bold text-violet-400">{sp.first_name[0]}</span>
                        </div>
                      )}
                      {sp.schedule_time && (
                        <span className={`absolute top-3 left-3 ${dayColors[idx % dayColors.length]} text-white text-xs font-bold px-2.5 py-1 rounded-lg`}>
                          {new Date(sp.schedule_time).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900">{sp.first_name} {sp.last_name}</h3>
                      <p className={`text-sm font-medium mt-0.5 ${textColors[idx % textColors.length]}`}>{sp.title}</p>
                      {sp.bio && <p className="text-xs text-gray-400 mt-2 line-clamp-3">{sp.bio}</p>}
                      <div className="flex gap-2 mt-4">
                        <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-violet-400 transition-colors">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                        </button>
                        <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-violet-400 transition-colors">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Partners */}
      {event.sponsors?.length > 0 && (
        <section className="py-12 px-8 border-t border-gray-100">
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-8">Our Global Partners</p>
            <div className="flex flex-wrap gap-8 items-center justify-center">
              {event.sponsors.map((sp) => (
                <div key={sp.id}>
                  {sp.logo
                    ? <img src={mediaUrl(sp.logo)} alt={sp.name} className="h-7 object-contain filter grayscale opacity-40 hover:opacity-70 transition-opacity" />
                    : <span className="text-sm font-bold text-gray-300">{sp.name}</span>
                  }
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Registration */}
      <section id="register" className="py-16 px-8">
        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">Claim Your Spot</h2>
          <p className="text-gray-400 text-sm text-center mb-7">Early bird registration is open — limited seats.</p>
          {registered ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" className="w-7 h-7"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <p className="font-bold text-lg text-gray-900">You're in!</p>
              <p className="text-gray-400 text-sm mt-1">
                {event.ticket_type === 'paid'
                  ? 'Your registration is pending payment approval.'
                  : 'Ticket details sent to your email.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">First Name</label>
                  <input defaultValue={user?.first_name} placeholder="John"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Surname</label>
                  <input defaultValue={user?.last_name} placeholder="Doe"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all" />
                </div>
              </div>
              <div className="mb-5">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Email Address</label>
                <input defaultValue={user?.email} type="email" placeholder="john@example.com"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all" />
              </div>
              {event.ticket_type === 'paid' && (
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Payment Receipt (Required) — Price: DZD {event.price}
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setPaymentReceipt(e.target.files[0])}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-violet-100 file:text-violet-700 file:font-semibold"
                  />
                </div>
              )}
              <button onClick={onRegister} disabled={registering}
                className="w-full text-white font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}>
                {registering ? 'Registering...' : (
                  <>Complete Registration <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>
                )}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">By registering, you agree to Eventora's Terms of Service and Privacy Policy.</p>
            </>
          )}
        </div>
      </section>

      {/* Exhibitor Stands */}
      <ExhibitorStandSection
        event={event} onStandRegister={onStandRegister} standRegistering={standRegistering}
        standRegistered={standRegistered} standType={standType} setStandType={setStandType}
        exhibitorCompany={exhibitorCompany} setExhibitorCompany={setExhibitorCompany}
        exhibitorReceipt={exhibitorReceipt} setExhibitorReceipt={setExhibitorReceipt} user={user}
        sectionBg="bg-gray-50" bgCard="bg-white" borderCard="border-gray-200"
        textPrimary="text-gray-900" textSecondary="text-gray-400" accentColor="#7C3AED"
        inputClass="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
        buttonClass="bg-violet-600 hover:bg-violet-700 text-white"
      />

      {/* Footer */}
      <footer className="bg-gray-900 px-8 py-7 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-3.5 h-3.5">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <span className="font-bold text-sm text-white">Eventora</span>
        </div>
        <div className="flex gap-5 text-xs text-gray-400">
          <a href="/" className="hover:text-white transition-colors">Privacy</a>
          <a href="/" className="hover:text-white transition-colors">Terms</a>
          <a href="/" className="hover:text-white transition-colors">Support</a>
        </div>
        <p className="text-xs text-gray-500">© {new Date().getFullYear()} Eventora Labs. All rights reserved.</p>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function EventSite() {
  const { slug } = useParams();
  const { user } = useAuthStore();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  // Exhibitor stand state
  const [standType, setStandType] = useState('');
  const [exhibitorCompany, setExhibitorCompany] = useState('');
  const [exhibitorReceipt, setExhibitorReceipt] = useState(null);
  const [standRegistering, setStandRegistering] = useState(false);
  const [standRegistered, setStandRegistered] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/api/public/events/${slug}/`);
        setEvent(data);
      } catch {
        try {
          const { data } = await api.get(`/api/events/${slug}/`);
          setEvent(data);
        } catch {}
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  const onRegister = async () => {
    if (!user) { toast.error('Please sign in to register'); return; }
    if (event.ticket_type === 'paid' && !paymentReceipt) {
      toast.error('Please upload your payment receipt');
      return;
    }
    setRegistering(true);
    try {
      const formData = new FormData();
      if (paymentReceipt) formData.append('payment_receipt', paymentReceipt);
      await api.post(`/api/events/${event.id}/register/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setRegistered(true);
      toast.success(
        event.ticket_type === 'paid'
          ? 'Registration submitted! Awaiting payment approval.'
          : 'Registered! Check your email for the ticket.'
      );
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const onStandRegister = async () => {
    if (!user) { toast.error('Please sign in first'); return; }
    if (!standType) { toast.error('Please select a stand type'); return; }
    if (!exhibitorCompany.trim()) { toast.error('Please enter your company name'); return; }
    if (!exhibitorReceipt) { toast.error('Please upload your payment receipt'); return; }
    setStandRegistering(true);
    try {
      const fd = new FormData();
      fd.append('stand_type', standType);
      fd.append('company_name', exhibitorCompany);
      fd.append('payment_receipt', exhibitorReceipt);
      await api.post(`/api/events/${event.id}/exhibitor/register/`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStandRegistered(true);
      toast.success('Stand application submitted! Awaiting payment approval.');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Stand registration failed');
    } finally {
      setStandRegistering(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!event) return <NotFoundScreen />;

  const props = {
    event, onRegister, registering, registered, user, paymentReceipt, setPaymentReceipt,
    onStandRegister, standRegistering, standRegistered, standType, setStandType,
    exhibitorCompany, setExhibitorCompany, exhibitorReceipt, setExhibitorReceipt,
  };

  if (event.theme === 'modern') return <ModernTheme {...props} />;
  if (event.theme === 'academic') return <AcademicTheme {...props} />;
  if (event.theme === 'corporate') return <CorporateTheme {...props} />;
  if (event.theme === 'minimal') return <MinimalTheme {...props} />;
  if (event.theme === 'vibrant') return <VibrantTheme {...props} />;
  return <DefaultTheme {...props} />;
}
