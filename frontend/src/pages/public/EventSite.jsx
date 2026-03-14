import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../utils/axios';
import { formatDate } from '../../utils/formatters';
import useAuthStore from '../../store/authStore';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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

// ── Loading / Not Found (shared) ───────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
    </div>
  );
}
function NotFoundScreen() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-4 text-white">
      <h2 className="text-2xl font-bold">Event not found</h2>
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
  return (
    <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-5">
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
      <div className="hidden md:flex items-center gap-6 text-sm text-white/70">
        <a href="#about" className="hover:text-white transition-colors">About</a>
        <a href="#speakers" className="hover:text-white transition-colors">Speakers</a>
        <a href="#sponsors" className="hover:text-white transition-colors">Sponsors</a>
        <a href="#register" className="bg-violet-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-violet-700 transition-colors">
          Register
        </a>
      </div>
    </nav>
  );
}

function ModernTheme({ event, onRegister, registering, registered, user }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Background gradient + mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-violet-950 to-gray-900" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 30% 20%, #6C47FF 0%, transparent 50%), radial-gradient(circle at 80% 70%, #00D4AA 0%, transparent 50%)',
          }}
        />
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
            </div>

            <a
              href="#register"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8 py-3.5 rounded-2xl transition-colors text-lg"
            >
              Register Now
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>

          {/* Hero image card */}
          {event.logo && (
            <div className="hidden lg:block ml-12">
              <div className="relative w-72 h-72 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <img src={`${API_BASE}${event.logo}`} alt={event.title} className="w-full h-full object-cover grayscale opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
              </div>
            </div>
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
          <h2 className="text-3xl font-bold mb-2 text-white">About this event</h2>
          <div className="w-12 h-1 bg-violet-600 rounded-full mb-6" />
          <p className="text-gray-300 leading-relaxed text-lg">{event.description}</p>
        </div>
      </section>

      {/* Speakers */}
      {event.speakers?.length > 0 && (
        <section id="speakers" className="bg-gray-950 py-20 px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-2 text-white">Speakers</h2>
            <div className="w-12 h-1 bg-violet-600 rounded-full mb-10" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {event.speakers.map((sp) => (
                <div key={sp.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center hover:border-violet-500/50 transition-colors">
                  {sp.photo ? (
                    <img
                      src={`${API_BASE}${sp.photo}`}
                      alt={sp.first_name}
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-4 grayscale hover:grayscale-0 transition-all border-2 border-gray-700"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-violet-900/50 border-2 border-violet-700/30 flex items-center justify-center text-violet-400 text-2xl font-bold mx-auto mb-4">
                      {sp.first_name[0]}
                    </div>
                  )}
                  <h3 className="font-bold text-white">{sp.first_name} {sp.last_name}</h3>
                  <p className="text-sm text-violet-400 mt-1">{sp.title}</p>
                  {sp.bio && <p className="text-xs text-gray-500 mt-2 line-clamp-3">{sp.bio}</p>}
                </div>
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
                    ? <img src={`${API_BASE}${sp.logo}`} alt={sp.name} className="h-8 object-contain filter brightness-75 hover:brightness-100 transition-all" />
                    : <span className="font-bold text-gray-300">{sp.name}</span>
                  }
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Registration */}
      <section id="register" className="bg-gray-950 py-20 px-8">
        <div className="max-w-lg mx-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8">
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
                <p className="text-gray-400 text-sm">Check your email for the ticket PDF with QR code.</p>
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
        </div>
      </section>

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
  return (
    <nav className="relative z-20 border-b border-yellow-900/30 flex items-center justify-between px-8 py-4 bg-navy-950/80 backdrop-blur-sm">
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
      <div className="hidden md:flex items-center gap-6 text-sm text-yellow-200/70">
        <a href="#about" className="hover:text-yellow-200 transition-colors">Overview</a>
        <a href="#speakers" className="hover:text-yellow-200 transition-colors">Faculty</a>
        <a href="#sponsors" className="hover:text-yellow-200 transition-colors">Partners</a>
        <a href="#register" className="bg-yellow-600 hover:bg-yellow-700 text-gray-950 font-bold px-4 py-2 rounded-xl transition-colors">
          Register
        </a>
      </div>
    </nav>
  );
}

function AcademicTheme({ event, onRegister, registering, registered, user }) {
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
              <img src={`${API_BASE}${event.logo}`} alt={event.title} className="w-full h-full object-cover" />
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
          </div>

          <a
            href="#register"
            className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-gray-950 font-bold px-8 py-3.5 rounded-2xl transition-colors text-base"
          >
            Register as Delegate
          </a>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-16 px-8" style={{ backgroundColor: '#0D1425' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold" style={{ color: '#EDE9D5' }}>Conference Overview</h2>
            <div className="flex-1 h-px bg-yellow-700/20" />
          </div>
          <p className="text-gray-400 leading-relaxed text-base">{event.description}</p>
        </div>
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
              {event.speakers.map((sp) => (
                <div
                  key={sp.id}
                  className="border rounded-2xl p-6 text-center transition-colors"
                  style={{ borderColor: 'rgba(212,160,23,0.2)', backgroundColor: 'rgba(212,160,23,0.03)' }}
                >
                  {sp.photo ? (
                    <img
                      src={`${API_BASE}${sp.photo}`}
                      alt={sp.first_name}
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-4 grayscale border-2"
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
                </div>
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
                    ? <img src={`${API_BASE}${sp.logo}`} alt={sp.name} className="h-8 object-contain opacity-70 hover:opacity-100 transition-opacity" />
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
                  <p className="text-gray-400 text-sm">Your ticket and QR code have been sent to your email.</p>
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
function DefaultTheme({ event, onRegister, registering, registered, user }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className={`bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900 text-white py-24 px-4`}>
        <div className="max-w-4xl mx-auto text-center">
          {event.logo && (
            <img src={`${API_BASE}${event.logo}`} alt={event.title} className="w-20 h-20 rounded-2xl object-cover mx-auto mb-6 border-4 border-white/20" />
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
                    <img src={`${API_BASE}${sp.photo}`} alt={sp.first_name} className="w-20 h-20 rounded-full object-cover mx-auto mb-3" />
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
                    ? <img src={`${API_BASE}${sp.logo}`} alt={sp.name} className="h-10 object-contain" />
                    : <span className="font-bold text-gray-700">{sp.name}</span>
                  }
                </div>
              ))}
            </div>
          </section>
        )}

        <section id="register" className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Register for this event</h2>
          {registered ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" className="w-8 h-8">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">You're registered!</h3>
              <p className="text-gray-500">Check your email for the ticket PDF with QR code.</p>
            </div>
          ) : user ? (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-6">
                Signed in as <strong>{user.first_name} {user.last_name}</strong> ({user.email})
              </p>
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
      </div>
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

  if (loading) return <LoadingScreen />;
  if (!event) return <NotFoundScreen />;

  const props = { event, onRegister, registering, registered, user };

  if (event.theme === 'modern') return <ModernTheme {...props} />;
  if (event.theme === 'academic') return <AcademicTheme {...props} />;
  return <DefaultTheme {...props} />;
}
