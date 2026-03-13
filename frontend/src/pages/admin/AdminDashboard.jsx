import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import Modal from '../../components/Modal';
import SkeletonCard from '../../components/SkeletonCard';
import EmptyState from '../../components/EmptyState';
import api from '../../utils/axios';
import { formatDate, getStatusClass } from '../../utils/formatters';

const SIDEBAR_LINKS = [
  { to: '/admin', end: true, icon: '📊', label: 'Dashboard' },
];

function AdminHome() {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/api/admin/dashboard/'),
      api.get('/api/events/'),
    ]).then(([statsRes, eventsRes]) => {
      setStats(statsRes.data);
      setEvents(eventsRes.data.results || eventsRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const openModal = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      const { data } = await api.patch(`/api/events/${id}/approve/`);
      setEvents((prev) => prev.map((e) => (e.id === id ? data : e)));
      setSelectedEvent(data);
      toast.success('Event approved!');
    } catch { toast.error('Failed to approve'); }
    finally { setActionLoading(false); }
  };

  const handleReject = async (id) => {
    setActionLoading(true);
    try {
      const { data } = await api.patch(`/api/events/${id}/reject/`);
      setEvents((prev) => prev.map((e) => (e.id === id ? data : e)));
      setSelectedEvent(data);
      toast.success('Event rejected');
    } catch { toast.error('Failed to reject'); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1,2,3,4].map(n => <div key={n} className="skeleton h-24 rounded-card" />)}
          </div>
        ) : stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Events" value={stats.total_events} icon="📅" />
            <StatCard label="Pending" value={stats.pending_events} icon="⏳" bgColor="bg-yellow-100" />
            <StatCard label="Approved" value={stats.approved_events} icon="✅" bgColor="bg-green-100" />
            <StatCard label="Total Users" value={stats.total_users} icon="👥" bgColor="bg-blue-100" />
          </div>
        )}

        {/* Events table */}
        <div className="card overflow-hidden p-0">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold">All Events</h2>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">{[1,2,3].map(n => <div key={n} className="skeleton h-12 rounded" />)}</div>
          ) : events.length === 0 ? (
            <EmptyState title="No events yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 text-sm">
                  <tr>
                    {['Title', 'Client', 'Date', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {events.map((ev) => (
                    <tr key={ev.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium">{ev.title}</td>
                      <td className="px-6 py-4 text-gray-500">{ev.client?.username}</td>
                      <td className="px-6 py-4 text-gray-500">{formatDate(ev.date)}</td>
                      <td className="px-6 py-4">
                        <span className={getStatusClass(ev.status)}>{ev.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => openModal(ev)} className="text-primary text-sm font-medium hover:underline">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* Event detail modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Event Details" size="lg">
        {selectedEvent && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Title</span><p className="font-semibold mt-0.5">{selectedEvent.title}</p></div>
              <div><span className="text-gray-500">Status</span><p className="mt-0.5"><span className={getStatusClass(selectedEvent.status)}>{selectedEvent.status}</span></p></div>
              <div><span className="text-gray-500">Client</span><p className="font-semibold mt-0.5">{selectedEvent.client?.username}</p></div>
              <div><span className="text-gray-500">Date</span><p className="font-semibold mt-0.5">{formatDate(selectedEvent.date)}</p></div>
              <div><span className="text-gray-500">Location</span><p className="font-semibold mt-0.5">{selectedEvent.location}</p></div>
              <div><span className="text-gray-500">Capacity</span><p className="font-semibold mt-0.5">{selectedEvent.max_capacity}</p></div>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Description</span>
              <p className="mt-1 text-sm">{selectedEvent.description}</p>
            </div>
            {selectedEvent.status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => handleApprove(selectedEvent.id)}
                  disabled={actionLoading}
                  className="btn-primary flex-1 py-2.5"
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => handleReject(selectedEvent.id)}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-danger text-white rounded-pill font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  ❌ Reject
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark">
      <Sidebar links={SIDEBAR_LINKS} title="Administration" />
      <Routes>
        <Route index element={<AdminHome />} />
      </Routes>
    </div>
  );
}
