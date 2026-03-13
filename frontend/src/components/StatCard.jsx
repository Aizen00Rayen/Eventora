import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ label, value, icon, color = 'text-primary', bgColor = 'bg-primary/10' }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center text-2xl`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </motion.div>
  );
}
