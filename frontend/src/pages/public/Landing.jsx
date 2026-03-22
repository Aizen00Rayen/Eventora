import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/axios';

const STATS = [
  { value: '1,200+', label: 'EVENTS' },
  { value: '48,000+', label: 'PARTICIPANTS' },
  { value: '320+', label: 'ORGANIZERS' },
  { value: '99%', label: 'SATISFACTION' },
];

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    title: 'Instant QR Check-in',
    desc: 'Fast, reliable entry management with our dedicated organizer app. Scan hundreds in minutes.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Speaker Management',
    desc: 'Onboard speakers, manage bios, and sync schedules automatically with the public event page.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: 'Real-time Analytics',
    desc: 'Monitor ticket sales, attendee demographics, and revenue streams from a centralized dashboard.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    title: 'Global Payments',
    desc: 'Accept payments in 135+ currencies with local payment methods integrated out of the box.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        <line x1="2" y1="22" x2="6" y2="22" />
      </svg>
    ),
    title: 'Branded Pages',
    desc: 'Customizable event pages that match your brand\'s aesthetic. No coding required.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.5 2 2 0 0 1 3.6 1.32h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    title: 'Automated Marketing',
    desc: 'Built-in email tools and social sharing incentives to boost your ticket sales effortlessly.',
  },
];

const SAMPLE_EVENTS = [
  { id: 1, category: 'MUSIC', date: 'DEC 15, 2024', title: 'Neon Nights Music Festival', location: 'Austin, TX', img: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80' },
  { id: 2, category: 'TECH', date: 'JAN 10, 2025', title: 'React Global Summit', location: 'Remote / London', img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80' },
  { id: 3, category: 'ARTS', date: 'FEB 05, 2025', title: 'Abstract Expressionism Expo', location: 'New York, NY', img: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=400&q=80' },
];

export default function Landing() {
  const [events, setEvents] = useState(SAMPLE_EVENTS);
  const [eventIdx, setEventIdx] = useState(0);

  useEffect(() => {
    api.get('/api/events/?ordering=-created_at')
      .then(({ data }) => {
        const list = (data.results || data).slice(0, 3);
        if (list.length > 0) setEvents(list.map((e, i) => ({
          id: e.id,
          category: 'EVENT',
          date: e.date ? new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase() : '',
          title: e.title,
          location: e.location,
          img: e.logo || SAMPLE_EVENTS[i % 3]?.img,
        })));
      })
      .catch(() => {});
  }, []);

  const prev = () => setEventIdx((i) => (i - 1 + events.length) % events.length);
  const next = () => setEventIdx((i) => (i + 1) % events.length);

  const visibleEvents = [
    events[eventIdx % events.length],
    events[(eventIdx + 1) % events.length],
    events[(eventIdx + 2) % events.length],
  ];

  return (
    <div className="min-h-screen bg-[#F4F3FF] font-sans scroll-smooth">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-base">E</div>
            Eventora
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link to="/events" className="hover:text-gray-900 transition-colors">Events</Link>
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors px-3 py-2">Login</Link>
            <Link to="/register" className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-pill hover:bg-primary-dark transition-colors">
              Create Event
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-16 overflow-hidden">
        {/* Floating geometric shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="animate-float absolute top-10 left-[10%] w-16 h-16 rounded-full bg-primary/10 blur-sm" />
          <div className="animate-float-slow absolute top-32 right-[15%] w-24 h-24 rounded-full bg-accent/10 blur-sm" />
          <div className="animate-float-delayed absolute bottom-20 left-[20%] w-12 h-12 rounded-lg bg-primary/15 rotate-45 blur-[2px]" />
          <div className="animate-float absolute top-1/2 right-[8%] w-10 h-10 rounded-full bg-violet-300/20 blur-sm" />
          <div className="animate-float-slow absolute bottom-32 right-[30%] w-20 h-20 rounded-full bg-purple-200/20 blur-md" />
          <div className="animate-float-delayed absolute top-16 left-[45%] w-8 h-8 rounded-md bg-primary/10 rotate-12 blur-[1px]" />
        </div>
        {/* Left */}
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-1.5 rounded-pill text-sm font-medium mb-8 shadow-sm">
            <span className="text-primary">✦</span> The smartest event platform
          </span>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-[1.1] mb-6">
            Organize.<br />Connect.<br />
            <span className="text-primary relative">
              Inspire.
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2.5s_ease-in-out_infinite] bg-[length:200%_100%]" />
            </span>
          </h1>
          <p className="text-gray-500 text-lg max-w-md mb-8 leading-relaxed">
            Eventora centralizes everything — event creation, speaker management, QR ticketing, and real-time stats — in one elegant platform.
          </p>
          <div className="flex items-center gap-4 mb-10">
            <Link to="/register" className="bg-primary text-white font-semibold px-6 py-3 rounded-pill hover:bg-primary-dark transition-colors shadow-md">
              Create your event
            </Link>
            <Link to="/events" className="bg-white text-gray-700 font-semibold px-6 py-3 rounded-pill border border-gray-200 hover:border-primary hover:text-primary transition-colors">
              Explore events
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {['#F5A623', '#F07E6E', '#6C47FF'].map((c, i) => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: c }}>
                  {['A', 'B', '+'][i]}
                </div>
              ))}
            </div>
            <span className="text-sm text-gray-500 font-medium">Joined by 2,000+ top organizers</span>
          </div>
        </motion.div>

        {/* Right — floating dashboard cards */}
        <motion.div
          className="flex-1 relative hidden lg:flex items-center justify-center"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {/* Revenue badge */}
          <div className="absolute top-0 right-8 bg-primary text-white px-5 py-3 rounded-2xl shadow-xl z-20">
            <p className="text-xs font-medium opacity-80 mb-0.5">Real-time Revenue</p>
            <p className="text-2xl font-extrabold">$42,800</p>
          </div>
          {/* Event card */}
          <div className="relative z-10 bg-white rounded-2xl shadow-card p-4 w-64 mt-12">
            <div className="w-full h-32 rounded-xl bg-gradient-to-br from-violet-600 to-purple-900 mb-3 flex items-end p-3">
              <span className="text-white text-xs font-bold uppercase tracking-wider opacity-80">EVENT TECH</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Tech Conf 2024</h3>
            <p className="text-xs text-gray-500 mb-2">San Francisco, CA</p>
            <p className="text-primary font-bold">$199.00</p>
          </div>
          {/* Ticket card */}
          <div className="absolute bottom-4 right-0 bg-white rounded-2xl shadow-card p-4 w-52 z-20">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="#6C47FF" strokeWidth="2" className="w-3.5 h-3.5">
                  <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-700">Valid Ticket</span>
            </div>
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" className="w-10 h-10">
                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">BOOKING ID</p>
            <p className="text-center text-xs font-mono font-semibold text-gray-600">EVT-9928-X</p>
          </div>
        </motion.div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <p className="text-3xl font-extrabold text-primary mb-1">{s.value}</p>
              <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <motion.section
        className="max-w-7xl mx-auto px-6 py-24"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-14">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-3">Everything you need to scale</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            A comprehensive suite of tools designed for modern event creators and large-scale conferences.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-card-hover hover:border-transparent transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/50 via-accent/50 to-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-[1px] scale-[1.02]" />
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                {f.icon}
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Live events near you */}
      <motion.section
        className="max-w-7xl mx-auto px-6 pb-24"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-1">Live events near you</h2>
            <p className="text-primary text-sm font-medium">Discover what's happening in your local community.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={prev} className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button onClick={next} className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visibleEvents.map((ev) => ev && (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className="relative h-44 bg-gray-200 overflow-hidden">
                {ev.img ? (
                  <img src={ev.img} alt={ev.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                <span className="absolute top-3 left-3 bg-white text-gray-700 text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase shadow-sm">
                  {ev.category}
                </span>
              </div>
              <div className="p-4">
                <p className="text-primary text-xs font-semibold uppercase tracking-wider mb-1">{ev.date}</p>
                <h3 className="font-bold text-gray-900 mb-2 text-base leading-snug">{ev.title}</h3>
                <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 shrink-0">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  {ev.location}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-base">E</div>
              <span className="font-bold text-white text-lg">Eventora</span>
            </div>
            <p className="text-sm leading-relaxed mb-5">
              The all-in-one platform for professional event organizers to manage, scale, and inspire.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                </svg>
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-white">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>
          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-3 text-sm">
              {['Features', 'Event Management', 'Ticketing', 'Integrations'].map(l => (
                <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-sm">
              {['About Us', 'Blog', 'Careers', 'Contact'].map(l => (
                <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-3 text-sm">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
                <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
            <span>© {new Date().getFullYear()} Eventora Inc. All rights reserved.</span>
            <div className="flex gap-6">
              <span className="flex items-center gap-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                English (US)
              </span>
              <span className="flex items-center gap-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                USD
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
