import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../../utils/axios';
import useAuthStore from '../../store/authStore';

// ── QR Scan Modal ─────────────────────────────────────────────────────────────
function QRScanModal({ open, onClose, onSuccess, onError }) {
  const html5QrRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!open) { setResult(null); return; }
    startCamera();
    return () => { stopCamera(); };
  }, [open]);

  const startCamera = async () => {
    setRunning(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 150));
    try {
      html5QrRef.current = new Html5Qrcode('qr-reader-organizer');
      await html5QrRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        async (text) => {
          await stopCamera();
          await handleValidate(text);
        },
        () => {}
      );
    } catch {
      toast.error('Camera access denied');
      setRunning(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrRef.current) {
      try { await html5QrRef.current.stop(); } catch {}
      html5QrRef.current = null;
    }
    setRunning(false);
  };

  const handleValidate = async (token) => {
    try {
      const { data } = await api.post('/api/registrations/validate-token/', { token });
      setResult({ success: true, name: data.participant, detail: 'VIP Pass' });
      onSuccess({ participant: data.participant, event: data.event });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid QR code';
      setResult({ success: false, detail: msg });
      onError(msg);
    }
  };

  const handleClose = async () => {
    await stopCamera();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2B45]/80">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="#6C47FF" strokeWidth="2" className="w-5 h-5">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            <span className="font-bold text-gray-900">Scan QR Code</span>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Camera area */}
        <div className="px-6 pt-5 pb-2">
          <div className="relative rounded-2xl overflow-hidden bg-gray-200" style={{ aspectRatio: '4/3' }}>
            <div id="qr-reader-organizer" className="w-full h-full" />
            {/* Corner bracket overlays */}
            {running && !result && (
              <>
                <div className="absolute top-4 left-4 w-8 h-8 pointer-events-none" style={{ borderTop: '3px solid #6C47FF', borderLeft: '3px solid #6C47FF', borderRadius: '4px 0 0 0' }} />
                <div className="absolute top-4 right-4 w-8 h-8 pointer-events-none" style={{ borderTop: '3px solid #6C47FF', borderRight: '3px solid #6C47FF', borderRadius: '0 4px 0 0' }} />
                <div className="absolute bottom-4 left-4 w-8 h-8 pointer-events-none" style={{ borderBottom: '3px solid #6C47FF', borderLeft: '3px solid #6C47FF', borderRadius: '0 0 0 4px' }} />
                <div className="absolute bottom-4 right-4 w-8 h-8 pointer-events-none" style={{ borderBottom: '3px solid #6C47FF', borderRight: '3px solid #6C47FF', borderRadius: '0 0 4px 0' }} />
              </>
            )}
            {result && (
              <div className={`absolute inset-0 flex items-center justify-center ${result.success ? 'bg-green-500/90' : 'bg-red-500/90'}`}>
                <div className="text-center text-white p-4">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2">
                    {result.success
                      ? <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-7 h-7"><polyline points="20 6 9 17 4 12" /></svg>
                      : <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-7 h-7"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    }
                  </div>
                  <p className="font-bold">{result.success ? result.name : 'Invalid Ticket'}</p>
                  <p className="text-sm opacity-80">{result.detail}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status text */}
        <div className="text-center px-6 py-3">
          {!result && (
            <>
              <p className="font-semibold text-gray-800 mb-0.5">{running ? 'Scanning...' : 'Initializing...'}</p>
              <p className="text-sm text-gray-400">Point the camera at the participant's QR code</p>
            </>
          )}
          {result && (
            <p className={`font-semibold text-sm ${result.success ? 'text-green-600' : 'text-danger'}`}>
              {result.success ? 'Check-in successful!' : 'Scan failed'}
            </p>
          )}
        </div>

        {/* Action button */}
        <div className="px-6 pb-4">
          {result ? (
            <button onClick={startCamera} className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-dark transition-colors">
              Scan Next
            </button>
          ) : (
            <button onClick={handleClose} className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors">
              Cancel
            </button>
          )}
        </div>

        {/* Flash / Switch */}
        <div className="flex items-center justify-center gap-6 pb-5 text-sm text-gray-400">
          <button className="flex items-center gap-1.5 hover:text-gray-700 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Flash
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <button className="flex items-center gap-1.5 hover:text-gray-700 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M23 4v6h-6" /><path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Switch
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Scan toast card ───────────────────────────────────────────────────────────
function ScanToast({ type, title, subtitle }) {
  return (
    <motion.div
      initial={{ x: -120, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -120, opacity: 0 }}
      className={`flex items-center gap-3 bg-white rounded-2xl shadow-lg border-2 px-4 py-3 min-w-[220px] ${
        type === 'success' ? 'border-green-400' : 'border-danger'
      }`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
        {type === 'success'
          ? <svg viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" className="w-4 h-4"><polyline points="20 6 9 17 4 12" /></svg>
          : <svg viewBox="0 0 24 24" fill="none" stroke="#FF5757" strokeWidth="2.5" className="w-4 h-4"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
        }
      </div>
      <div>
        <p className="text-sm font-bold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function OrganizerDashboard() {
  const { user, logout } = useAuthStore();
  const [orgInfo, setOrgInfo] = useState(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [validatedCount, setValidatedCount] = useState(0);

  useEffect(() => {
    api.get('/api/organizers/me/')
      .then(({ data }) => {
        setOrgInfo(data);
        setValidatedCount(data.validated_today || 0);
      })
      .catch(() => {});
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const addToast = (type, title, subtitle) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, subtitle }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const handleSuccess = (data) => {
    const entry = {
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      participant: data.participant,
      door: orgInfo?.door_number || '—',
    };
    setHistory(prev => [entry, ...prev]);
    setValidatedCount(c => c + 1);
    addToast('success', 'Check-in Success', `${data.participant} • VIP Pass`);
    setScanOpen(false);
  };

  const handleError = (msg) => {
    addToast('error', 'Invalid Ticket', 'Code already used or expired');
    setScanOpen(false);
  };

  const totalCapacity = orgInfo?.event?.max_capacity || 150;
  const pct = Math.min((validatedCount / totalCapacity) * 100, 100);

  return (
    <div className="min-h-screen bg-[#F0EFFA] font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-4 h-4">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-lg">Eventora</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            {user?.first_name} {user?.last_name}
          </div>
          <button
            onClick={logout}
            className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-primary-dark transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Main card */}
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-5">
            {/* Banner */}
            <div className="h-44 bg-gradient-to-br from-gray-700 to-gray-900 overflow-hidden">
              {orgInfo?.event?.logo && (
                <img src={orgInfo.event.logo} alt="" className="w-full h-full object-cover opacity-80" />
              )}
            </div>

            <div className="p-6">
              <h1 className="text-2xl font-extrabold text-gray-900 mb-1">{greeting()}, {user?.first_name}</h1>
              <p className="text-primary font-semibold text-base mb-4">{orgInfo?.event?.title || '—'}</p>

              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" />
                </svg>
                Door {orgInfo?.door_number || '—'} · {orgInfo?.work_schedule || '09:00–17:00'}
              </div>

              {/* Progress */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 text-sm">Validated today</span>
                  <span className="text-2xl font-extrabold text-gray-900">{validatedCount} / {totalCapacity}</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
                </div>
              </div>

              {/* Scan button */}
              <button
                onClick={() => setScanOpen(true)}
                className="w-full flex items-center justify-center gap-3 bg-primary text-white font-bold text-lg py-4 rounded-2xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                  <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                Scan QR Code
              </button>
            </div>
          </div>

          {/* Validation History */}
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-lg">Validation History</h2>
              <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Live Updates
              </span>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No validations yet. Start scanning to see activity.
              </div>
            ) : (
              <>
                <table className="w-full">
                  <thead>
                    <tr>
                      {['Timestamp', 'Participant', 'Door', 'Status'].map(h => (
                        <th key={h} className="text-left pb-3 text-xs font-semibold text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {history.slice(0, 5).map((h, i) => (
                      <tr key={i}>
                        <td className="py-3 text-primary text-sm font-medium">{h.time}</td>
                        <td className="py-3 text-gray-700 text-sm">{h.participant}</td>
                        <td className="py-3 text-gray-500 text-sm">{h.door}</td>
                        <td className="py-3">
                          <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">Validated</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {history.length > 5 && (
                  <div className="text-center mt-4">
                    <button className="text-primary text-sm font-semibold hover:underline">View all activity</button>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {scanOpen && (
          <QRScanModal
            open={scanOpen}
            onClose={() => setScanOpen(false)}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        )}
      </AnimatePresence>

      {/* Scan result toasts */}
      <div className="fixed bottom-6 left-6 space-y-2 z-40">
        <AnimatePresence>
          {toasts.map(t => (
            <ScanToast key={t.id} type={t.type} title={t.title} subtitle={t.subtitle} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
