import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Html5Qrcode } from 'html5-qrcode';
import Modal from '../../components/Modal';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/axios';
import { formatDateTime } from '../../utils/formatters';
import useAuthStore from '../../store/authStore';

const SIDEBAR_LINKS = [
  { to: '/organizer', end: true, icon: '🔍', label: 'Scan QR' },
];

function OrganizerHome() {
  const { user } = useAuthStore();
  const [orgInfo, setOrgInfo] = useState(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [scannerRunning, setScannerRunning] = useState(false);
  const [history, setHistory] = useState([]);
  const [lastResult, setLastResult] = useState(null);
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);

  useEffect(() => {
    api.get('/api/organizers/me/').then(({ data }) => setOrgInfo(data)).catch(() => {});
  }, []);

  const startScanner = async () => {
    setScanOpen(true);
    setScannerRunning(true);
    setTimeout(async () => {
      try {
        html5QrRef.current = new Html5Qrcode('qr-reader');
        await html5QrRef.current.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            await html5QrRef.current.stop();
            setScannerRunning(false);
            handleScan(decodedText);
          },
          () => {}
        );
      } catch (err) {
        toast.error('Camera access denied');
        setScannerRunning(false);
      }
    }, 200);
  };

  const stopScanner = async () => {
    if (html5QrRef.current && scannerRunning) {
      try { await html5QrRef.current.stop(); } catch {}
      setScannerRunning(false);
    }
    setScanOpen(false);
    setLastResult(null);
  };

  const handleScan = async (token) => {
    try {
      const { data } = await api.post('/api/registrations/validate-token/', { token });
      const entry = { timestamp: new Date(), participant: data.participant, event: data.event, status: 'success' };
      setHistory((prev) => [entry, ...prev]);
      setLastResult({ success: true, ...data });
      toast.success(`✅ ${data.participant} validated!`);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Invalid QR code';
      const entry = { timestamp: new Date(), participant: detail, event: '—', status: 'error' };
      setHistory((prev) => [entry, ...prev]);
      setLastResult({ success: false, detail });
      toast.error(detail);
    }
  };

  const handleManualScan = () => {
    const token = prompt('Enter QR token manually:');
    if (token) handleScan(token);
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-6">Organizer Dashboard</h1>

        {/* Profile card */}
        {orgInfo && (
          <div className="card mb-6 flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl">👷</div>
            <div>
              <h2 className="text-xl font-bold">{orgInfo.user?.first_name} {orgInfo.user?.last_name}</h2>
              <p className="text-gray-500">{orgInfo.event?.title}</p>
              <div className="flex gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                <span>🚪 Door <strong>{orgInfo.door_number}</strong></span>
                <span>⏰ <strong>{orgInfo.work_schedule}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Scan button */}
        <div className="card mb-8 text-center py-10">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-5xl mx-auto mb-4">📱</div>
          <h3 className="text-xl font-bold mb-2">Validate Participant</h3>
          <p className="text-gray-500 mb-6">Scan a participant's QR code to mark their attendance</p>
          <div className="flex gap-3 justify-center">
            <button onClick={startScanner} className="btn-primary text-lg px-10 py-3">
              📷 Scan QR Code
            </button>
            <button onClick={handleManualScan} className="btn-ghost">Manual Input</button>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="card overflow-hidden p-0">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-bold">Validation History</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {history.map((h, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3">
                  <span className="text-xl">{h.status === 'success' ? '✅' : '❌'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{h.participant}</p>
                    <p className="text-xs text-gray-500">{h.event}</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{formatDateTime(h.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* QR Scanner Modal */}
      <Modal open={scanOpen} onClose={stopScanner} title="Scan QR Code" size="md">
        <div className="text-center">
          <div id="qr-reader" className="w-full rounded-card overflow-hidden mb-4" style={{ minHeight: 300 }} />
          {lastResult && (
            <div className={`p-4 rounded-card mb-4 ${lastResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {lastResult.success ? (
                <div>
                  <p className="font-bold text-lg">✅ Validated!</p>
                  <p>{lastResult.participant}</p>
                </div>
              ) : (
                <div>
                  <p className="font-bold">❌ Failed</p>
                  <p>{lastResult.detail}</p>
                </div>
              )}
            </div>
          )}
          {scannerRunning && <p className="text-gray-500 text-sm">Point camera at QR code...</p>}
          <div className="flex gap-3 mt-4 justify-center">
            {!scannerRunning && lastResult && (
              <button onClick={startScanner} className="btn-primary">Scan Another</button>
            )}
            <button onClick={stopScanner} className="btn-ghost">Close</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function OrganizerDashboard() {
  return (
    <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark">
      <Sidebar links={SIDEBAR_LINKS} title="Organizer" />
      <OrganizerHome />
    </div>
  );
}
