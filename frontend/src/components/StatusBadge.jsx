/**
 * StatusBadge.jsx — Status indicator pill
 *
 * Shows the current status of a lead with color coding:
 * - PENDING → gray
 * - CALL_INITIATED → blue (pulsing)
 * - QUALIFIED → green
 * - NOT_INTERESTED → red
 * - FAILED → orange
 */

import { motion, AnimatePresence } from 'framer-motion';

const STATUS_CONFIG = {
  PENDING: {
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    dot: 'bg-gray-400',
    label: 'Pending',
  },
  CALL_INITIATED: {
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    dot: 'bg-blue-400',
    label: 'Calling...',
    pulse: true,
  },
  QUALIFIED: {
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    dot: 'bg-green-400',
    label: 'Qualified',
  },
  NOT_INTERESTED: {
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    dot: 'bg-red-400',
    label: 'Not Interested',
  },
  FAILED: {
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    dot: 'bg-orange-400',
    label: 'Failed',
  },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={status}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${config.color}`}
      >
        <span className={`w-2 h-2 rounded-full ${config.dot} ${config.pulse ? 'animate-pulse' : ''}`} />
        {config.label}
      </motion.span>
    </AnimatePresence>
  );
}
