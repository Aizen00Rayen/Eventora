import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import EmptyState from '../../components/EmptyState';
import SkeletonCard from '../../components/SkeletonCard';
import api from '../../utils/axios';
import { formatDate } from '../../utils/formatters';

export default function MyTickets() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } catch {
      toast.error('Attestation not available yet — attend the event first!');
    }
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Tickets</h1>
          <p className="text-gray-500">Your registered events and QR tickets</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1,2,3].map(n => <SkeletonCard key={n} />)}
          </div>
        ) : registrations.length === 0 ? (
          <EmptyState
            title="No tickets yet"
            message="Browse events and register to see your tickets here."
            action={<a href="/events" className="btn-primary">Browse Events</a>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {registrations.map((reg, i) => (
              <motion.div
                key={reg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="card overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{reg.event?.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">📅 {formatDate(reg.event?.date)}</p>
                    <p className="text-sm text-gray-500">📍 {reg.event?.location}</p>
                  </div>
                  <span className={`badge ${reg.is_present ? 'badge-approved' : 'bg-blue-100 text-blue-700'}`}>
                    {reg.is_present ? 'Attended' : 'Registered'}
                  </span>
                </div>

                {/* QR Code */}
                {reg.qr_code && (
                  <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-800 rounded-card p-4 mb-4">
                    <img
                      src={`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${reg.qr_code}`}
                      alt="QR Code"
                      className="w-36 h-36 object-contain"
                    />
                    <p className="text-xs text-gray-400 mt-2">Show this at the door</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <a
                    href={`/events/${reg.event?.slug}`}
                    className="btn-ghost flex-1 text-center text-sm py-2"
                  >
                    View Event
                  </a>
                  {reg.is_present && (
                    <button
                      onClick={() => downloadAttestation(reg.id)}
                      className="btn-primary flex-1 text-sm py-2"
                    >
                      📜 Attestation
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
