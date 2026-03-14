import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/axios';
import { formatDate, getInitials } from '../../utils/formatters';
import useAuthStore from '../../store/authStore';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconCalendar({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function IconPin({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function IconDownload({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
function IconTicket({ className = 'w-8 h-8' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" />
    </svg>
  );
}
function IconDoc({ className = 'w-12 h-12' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
function IconLogout({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function ParticipantNavbar() {
  const { user, logout } = useAuthStore();
  return (
    <nav className="bg-white border-b border-gray-100 px-6 h-16 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <span className="font-bold text-lg text-primary">Eventora</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
          {getInitials(user)}
        </div>
        <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.first_name} {user?.last_name}</span>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-danger transition-colors ml-2"
        >
          <IconLogout />
          <span className="hidden sm:block">Logout</span>
        </button>
      </div>
    </nav>
  );
}

// ── Ticket Card ───────────────────────────────────────────────────────────────
function TicketCard({ reg }) {
  const ticketId = `TKT-${new Date(reg.created_at || Date.now()).getFullYear()}-${String(reg.id).padStart(4, '0')}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex"
    >
      {/* Left: event info */}
      <div className="flex-1 p-5">
        {/* Category badge */}
        <span className="inline-block text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full mb-3">
          {reg.event?.category || 'EVENT'}
        </span>
        <h3 className="font-bold text-gray-900 text-lg leading-snug mb-3">{reg.event?.title}</h3>
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <IconCalendar className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{formatDate(reg.event?.date)}</span>
          </div>
          {reg.event?.location && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <IconPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>{reg.event.location}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${reg.is_present ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
            {reg.is_present ? 'Attended' : 'Registered'}
          </span>
        </div>
      </div>

      {/* Dashed divider with cutouts */}
      <div className="relative flex items-center">
        {/* Top cutout */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gray-50 border border-gray-100" />
        {/* Bottom cutout */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gray-50 border border-gray-100" />
        <div className="h-full border-l-2 border-dashed border-gray-200 mx-0.5" />
      </div>

      {/* Right: QR code */}
      <div className="w-44 shrink-0 p-5 flex flex-col items-center justify-center bg-gray-50">
        {reg.qr_code ? (
          <img
            src={`${API_BASE}${reg.qr_code}`}
            alt="QR Code"
            className="w-28 h-28 object-contain mb-2"
          />
        ) : (
          <div className="w-28 h-28 bg-gray-200 rounded-xl flex items-center justify-center mb-2">
            <IconTicket className="w-10 h-10 text-gray-400" />
          </div>
        )}
        <p className="text-xs text-gray-400 text-center">Show at door</p>
        <p className="text-xs font-mono font-bold text-gray-600 mt-1 text-center">{ticketId}</p>
      </div>
    </motion.div>
  );
}

// ── Attestation Row ───────────────────────────────────────────────────────────
function AttestationRow({ reg, onDownload }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4"
    >
      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-xl shrink-0 overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
        {reg.event?.logo ? (
          <img src={`${API_BASE}${reg.event.logo}`} alt={reg.event.title} className="w-full h-full object-cover" />
        ) : (
          <IconCalendar className="w-6 h-6 text-primary/50" />
        )}
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 truncate">{reg.event?.title}</h4>
        <p className="text-sm text-gray-500">{formatDate(reg.event?.date)}</p>
        <p className="text-xs text-green-600 font-medium mt-0.5">Attendance verified</p>
      </div>
      {/* Download */}
      <button
        onClick={() => onDownload(reg.id)}
        className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-dark transition-colors shrink-0"
      >
        <IconDownload className="w-4 h-4" />
        Download PDF
      </button>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
const TABS = ['MY TICKETS', 'MY ATTESTATIONS'];

export default function MyTickets() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('MY TICKETS');

  useEffect(() => {
    api.get('/api/my-registrations/')
      .then(({ data }) => setRegistrations(data.results || data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const downloadAttestation = async (regId) => {
    try {
      const response = await api.get(`/api/attestations/${regId}/`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `attestation_${regId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Attestation downloaded!');
    } catch {
      toast.error('Attestation not available yet — attend the event first!');
    }
  };

  const attended = registrations.filter((r) => r.is_present);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ParticipantNavbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Participant Area</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your event tickets and attendance certificates</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-5 py-3 text-sm font-semibold tracking-wide transition-colors ${
                activeTab === tab ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.span
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t"
                />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-40 bg-gray-200 rounded-2xl animate-pulse" />
              ))}
            </motion.div>
          ) : activeTab === 'MY TICKETS' ? (
            <motion.div
              key="tickets"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              {registrations.length === 0 ? (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <IconTicket className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="font-bold text-gray-700 mb-1">No tickets yet</h3>
                  <p className="text-gray-400 text-sm mb-4">Register for events to see your tickets here.</p>
                  <Link
                    to="/events"
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Browse Events →
                  </Link>
                </div>
              ) : (
                registrations.map((reg) => <TicketCard key={reg.id} reg={reg} />)
              )}
            </motion.div>
          ) : (
            <motion.div
              key="attestations"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-3"
            >
              {attended.length === 0 ? (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <IconDoc className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="font-bold text-gray-700 mb-1">No attestations yet</h3>
                  <p className="text-gray-400 text-sm mb-4">Attestations are issued after you attend an event.</p>
                  <Link
                    to="/events"
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Browse Events →
                  </Link>
                </div>
              ) : (
                attended.map((reg) => (
                  <AttestationRow key={reg.id} reg={reg} onDownload={downloadAttestation} />
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Eventora {activeTab === 'MY TICKETS' ? 'Participant Portal' : 'Participant Area'}. All rights reserved.
      </footer>
    </div>
  );
}
