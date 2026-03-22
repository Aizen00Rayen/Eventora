import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDate, getStatusClass } from '../utils/formatters';

const THEME_COLORS = {
  modern:    'from-violet-600 via-purple-700 to-indigo-900',
  academic:  'from-amber-700 via-yellow-600 to-amber-800',
  corporate: 'from-blue-600 via-blue-700 to-slate-900',
  minimal:   'from-slate-600 via-gray-500 to-slate-700',
  vibrant:   'from-violet-500 via-pink-500 to-cyan-500',
};

function getDaysLeft(dateStr) {
  if (!dateStr) return null;
  const eventDate = new Date(dateStr);
  const now = new Date();
  const diffMs = eventDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
}

export default function EventCard({ event, actions }) {
  const gradient = THEME_COLORS[event.theme] || THEME_COLORS.modern;

  const daysLeft = useMemo(() => getDaysLeft(event.date), [event.date]);

  const countdownBadge = useMemo(() => {
    if (daysLeft === null) return null;
    if (daysLeft < 0) {
      return { label: 'Ended', className: 'bg-gray-800/70 text-gray-300' };
    }
    if (daysLeft === 0) {
      return { label: 'Live', className: 'bg-green-500/90 text-white animate-pulse' };
    }
    if (daysLeft <= 3) {
      return { label: `${daysLeft}d left`, className: 'bg-red-500/90 text-white animate-pulse' };
    }
    return { label: `${daysLeft}d left`, className: 'bg-black/50 text-white' };
  }, [daysLeft]);

  const registrationRatio = event.max_capacity
    ? Math.min((event.registrations_count ?? 0) / event.max_capacity, 1)
    : 0;

  const progressColor =
    registrationRatio >= 0.9
      ? 'bg-red-500'
      : registrationRatio >= 0.7
        ? 'bg-amber-500'
        : 'bg-emerald-500';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="card overflow-hidden group"
    >
      {/* Header */}
      <div className="overflow-hidden rounded-t-xl -mx-6 -mt-6 mb-4 relative">
        <div
          className={`h-36 bg-gradient-to-br ${gradient} flex items-end p-4 transition-transform duration-300 group-hover:scale-105 animate-shimmer`}
        >
          {event.logo ? (
            <img
              src={event.logo}
              alt={event.title}
              className="w-12 h-12 rounded-lg object-cover border-2 border-white/30 relative z-10"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl relative z-10">
              {event.title[0]}
            </div>
          )}
        </div>

        {/* Countdown badge */}
        {countdownBadge && (
          <span
            className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${countdownBadge.className}`}
          >
            {countdownBadge.label}
          </span>
        )}

        {/* Price badge */}
        {event.ticket_type === 'paid' && event.price != null && (
          <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white">
            DZD {event.price}
          </span>
        )}
      </div>

      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-lg leading-tight line-clamp-2">{event.title}</h3>
          {event.status && (
            <span className={getStatusClass(event.status)}>{event.status}</span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{event.description}</p>
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
          <span>📅</span> {formatDate(event.date)}
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
          <span>📍</span> {event.location}
        </div>

        {/* Registration progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">
              {event.registrations_count ?? 0}/{event.max_capacity} registered
            </span>
            <span className="text-xs text-gray-400">
              {Math.round(registrationRatio * 100)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${registrationRatio * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          {actions ? actions : (
            <Link to={`/events/${event.slug}`} className="btn-primary text-sm py-1.5 px-4">
              View
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
