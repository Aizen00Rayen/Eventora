import React from 'react';

export default function EmptyState({ title = 'Nothing here yet', message = '', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="mb-6 opacity-30">
        <circle cx="60" cy="60" r="50" stroke="#6C47FF" strokeWidth="3" strokeDasharray="8 4" />
        <rect x="38" y="44" width="44" height="36" rx="6" fill="#6C47FF" fillOpacity="0.15" stroke="#6C47FF" strokeWidth="2" />
        <line x1="46" y1="56" x2="74" y2="56" stroke="#6C47FF" strokeWidth="2" strokeLinecap="round" />
        <line x1="46" y1="64" x2="66" y2="64" stroke="#6C47FF" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">{title}</h3>
      {message && <p className="text-sm text-gray-500 mb-4">{message}</p>}
      {action}
    </div>
  );
}
