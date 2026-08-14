/**
 * CallLogsPanel.jsx — Post-Call Transcript Viewer
 *
 * Displays the call history for the selected company.
 * Each row is expandable to show the full transcript and AI summary.
 * Data comes from the /campaign/call-logs endpoint.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneCall, ChevronDown, Clock, FileText } from 'lucide-react';
import StatusBadge from './StatusBadge';

const OUTCOME_COLORS = {
  QUALIFIED: 'text-green-400',
  NOT_INTERESTED: 'text-red-400',
  FAILED: 'text-yellow-400',
  UNKNOWN: 'text-[var(--color-text-secondary)]',
};

function formatDuration(seconds) {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function LogRow({ log }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-white/5 last:border-0">
      {/* Summary Row */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full grid grid-cols-[1fr_140px_100px_80px_36px] gap-4 px-6 py-4
                   hover:bg-white/[0.02] transition-colors items-center text-left cursor-pointer"
      >
        <span className="text-sm font-medium text-[var(--color-text-primary)] flex items-center gap-2">
          <PhoneCall size={14} className="text-[var(--color-text-secondary)] shrink-0" />
          {log.customer_name}
        </span>
        <span className={`text-sm font-semibold ${OUTCOME_COLORS[log.outcome] || OUTCOME_COLORS.UNKNOWN}`}>
          {log.outcome}
        </span>
        <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
          <Clock size={11} />
          {formatDuration(log.duration_seconds)}
        </span>
        <span className="text-xs text-[var(--color-text-secondary)]">
          {formatDate(log.created_at)}
        </span>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-[var(--color-text-secondary)]"
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>

      {/* Expanded Transcript */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="transcript"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 space-y-3">
              {log.summary && (
                <div className="bg-[var(--color-navy-700)]/40 rounded-xl p-4 border border-white/5">
                  <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <FileText size={11} /> AI Summary
                  </p>
                  <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">
                    {log.summary}
                  </p>
                </div>
              )}
              {log.transcript ? (
                <div className="bg-[var(--color-navy-700)]/20 rounded-xl p-4 border border-white/5">
                  <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
                    Full Transcript
                  </p>
                  <pre className="text-xs text-[var(--color-text-secondary)] whitespace-pre-wrap font-mono leading-relaxed max-h-60 overflow-y-auto">
                    {log.transcript}
                  </pre>
                </div>
              ) : (
                <p className="text-xs text-[var(--color-text-secondary)] italic">
                  No transcript available for this call.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CallLogsPanel({ logs }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-bold font-['Outfit'] text-[var(--color-text-primary)]">
          Call Logs
        </h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-[var(--color-text-secondary)]">
          {logs.length} calls
        </span>
      </div>

      <div className="glass-card overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_140px_100px_80px_36px] gap-4 px-6 py-3
                        bg-[var(--color-navy-700)]/50 border-b border-white/5
                        text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
          <span>Lead</span>
          <span>Outcome</span>
          <span>Duration</span>
          <span>Time</span>
          <span />
        </div>

        {/* Log Rows */}
        <AnimatePresence initial={false}>
          {logs.map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <LogRow log={log} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
