import React, { useEffect, useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import api from '../../utils/axios';
import { formatDate, getStatusClass } from '../../utils/formatters';
import useAuthStore from '../../store/authStore';
import { getInitials } from '../../utils/formatters';

// ── Icons ────────────────────────────────────────────────────────────────────
function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconSettings() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
    </svg>
  );
}

// ── Stat card with colored icon & change badge ───────────────────────────────
function AdminStatCard({ label, value, icon, iconBg, change, positive }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-start justify-between">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-500 text-sm mb-1">{label}</p>
          <p className="text-3xl font-extrabold text-gray-900">{value?.toLocaleString() ?? '—'}</p>
        </div>
      </div>
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${positive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-danger'}`}>
        {change}
      </span>
    </div>
  );
}

const RECENT_ACTIVITY = [
  { dot: 'bg-primary', title: 'New Event Created', desc: 'Summer Gala 2024 by TechCorp Inc.', time: '2 mins ago' },
  { dot: 'bg-green-500', title: 'User Approved', desc: "Sarah Jenkins's vendor account verified.", time: '45 mins ago' },
  { dot: 'bg-blue-500', title: 'Profile Updated', desc: 'Marketing HQ updated their brand assets.', time: '3 hours ago' },
  { dot: 'bg-gray-300', title: 'System Backup', desc: 'Weekly database optimization completed.', time: '6 hours ago' },
];

// ── Admin Sidebar ────────────────────────────────────────────────────────────
function AdminSidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const links = [
    { to: '/admin', end: true, icon: <IconGrid />, label: 'Overview' },
    { to: '/admin/events', icon: <IconCalendar />, label: 'Events' },
    { to: '/admin/users', icon: <IconUsers />, label: 'Users' },
    { to: '/admin/settings', icon: <IconSettings />, label: 'Settings' },
  ];

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-100 flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-5 h-5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <span className="font-bold text-lg">Eventora</span>
        </div>
        <p className="text-xs text-gray-400 font-medium ml-11">Admin Console</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-gray-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-bold overflow-hidden">
          {getInitials(user)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{user?.first_name} {user?.last_name}</p>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
        </div>
      </div>
    </aside>
  );
}

// ── Admin Overview ────────────────────────────────────────────────────────────
function AdminHome() {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const pendingEvents = events.filter((e) => e.status === 'pending');

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      const { data } = await api.patch(`/api/events/${id}/approve/`);
      setEvents((prev) => prev.map((e) => (e.id === id ? data : e)));
      toast.success('Event approved!');
    } catch { toast.error('Failed to approve'); }
    finally { setActionLoading(false); }
  };

  const handleReject = async (id) => {
    setActionLoading(true);
    try {
      const { data } = await api.patch(`/api/events/${id}/reject/`);
      setEvents((prev) => prev.map((e) => (e.id === id ? data : e)));
      toast.success('Event rejected');
    } catch { toast.error('Failed to reject'); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Overview</h1>

        {/* Stat cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1,2,3,4].map((n) => <div key={n} className="skeleton h-28 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <AdminStatCard
              label="Total Events"
              value={stats?.total_events}
              iconBg="bg-primary/10"
              change="+12%"
              positive
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="#6C47FF" strokeWidth="2" className="w-6 h-6">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              }
            />
            <AdminStatCard
              label="Pending Review"
              value={stats?.pending_events}
              iconBg="bg-orange-50"
              change="+5%"
              positive
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" className="w-6 h-6">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              }
            />
            <AdminStatCard
              label="Approved This Month"
              value={stats?.approved_events}
              iconBg="bg-blue-50"
              change="-2%"
              positive={false}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" className="w-6 h-6">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              }
            />
            <AdminStatCard
              label="Total Users"
              value={stats?.total_users}
              iconBg="bg-purple-50"
              change="+18%"
              positive
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" className="w-6 h-6">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
            />
          </div>
        )}

        <div className="flex gap-6">
          {/* Pending Events table */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Pending Events</h2>
              <button
                onClick={() => {/* could navigate to full events list */}}
                className="text-sm font-semibold text-primary hover:underline"
              >
                View All
              </button>
            </div>
            {loading ? (
              <div className="p-6 space-y-3">{[1,2,3].map((n) => <div key={n} className="skeleton h-10 rounded" />)}</div>
            ) : pendingEvents.length === 0 ? (
              <EmptyState title="No pending events" />
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    {['EVENT TITLE', 'CLIENT', 'DATE', 'ACTIONS'].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-bold text-gray-400 tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pendingEvents.map((ev) => (
                    <tr key={ev.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900 text-sm">{ev.title}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{ev.client?.username || ev.client?.first_name}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{formatDate(ev.date)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(ev.id)}
                            disabled={actionLoading}
                            className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors disabled:opacity-50"
                            title="Approve"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleReject(ev.id)}
                            disabled={actionLoading}
                            className="w-8 h-8 rounded-full bg-danger text-white flex items-center justify-center hover:opacity-80 transition-opacity disabled:opacity-50"
                            title="Reject"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Recent Activity */}
          <div className="w-72 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-5">Recent Activity</h2>
            <div className="space-y-5">
              {RECENT_ACTIVITY.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${item.dot}`} />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">{item.desc}</p>
                    <p className="text-xs text-gray-400 mt-1.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Layout ───────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <Routes>
        <Route index element={<AdminHome />} />
        <Route path="events" element={<AdminHome />} />
        <Route path="users" element={<AdminHome />} />
        <Route path="settings" element={<AdminHome />} />
      </Routes>
    </div>
  );
}
