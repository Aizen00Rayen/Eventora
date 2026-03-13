import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDate, getStatusClass } from '../utils/formatters';

const THEME_COLORS = {
  modern:    'from-violet-600 to-purple-800',
  academic:  'from-blue-800 to-yellow-600',
  corporate: 'from-blue-600 to-blue-900',
  minimal:   'from-gray-400 to-gray-600',
  vibrant:   'from-pink-500 via-purple-500 to-indigo-600',
};

export default function EventCard({ event, actions }) {
  const gradient = THEME_COLORS[event.theme] || THEME_COLORS.modern;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="card overflow-hidden group"
    >
      {/* Header */}
      <div className={`h-32 bg-gradient-to-br ${gradient} flex items-end p-4 -mx-6 -mt-6 mb-4`}>
        {event.logo ? (
          <img src={event.logo} alt={event.title} className="w-12 h-12 rounded-lg object-cover border-2 border-white/30" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-xl">
            {event.title[0]}
          </div>
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

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{event.registrations_count ?? 0}/{event.max_capacity} registered</span>
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
