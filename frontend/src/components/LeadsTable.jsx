/**
 * LeadsTable.jsx — Customer Leads Table
 *
 * Shows all leads for the selected company in a styled table.
 * Each row shows: name, phone (masked), status badge.
 * Rows animate in when switching companies.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, Hash } from 'lucide-react';
import StatusBadge from './StatusBadge';



export default function LeadsTable({ customers, loading }) {
  if (loading) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="inline-flex items-center gap-3 text-[var(--color-text-secondary)]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 border-2 border-[var(--color-gold-500)] border-t-transparent rounded-full"
          />
          Loading leads...
        </div>
      </div>
    );
  }

  if (!customers.length) {
    return (
      <div className="glass-card p-8 text-center">
        <User size={40} className="mx-auto text-[var(--color-text-secondary)] mb-3 opacity-50" />
        <p className="text-[var(--color-text-secondary)]">Select a company to view leads</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-[50px_1fr_1fr_140px] gap-4 px-6 py-3 bg-[var(--color-navy-700)]/50 border-b border-white/5 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
        <span className="flex items-center gap-1.5"><Hash size={12} />#</span>
        <span className="flex items-center gap-1.5"><User size={12} />Name</span>
        <span className="flex items-center gap-1.5"><Phone size={12} />Phone</span>
        <span>Status</span>
      </div>

      {/* Table Rows */}
      <AnimatePresence mode="popLayout">
        {customers.map((customer, index) => (
          <motion.div
            key={customer.id}
            layout
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="grid grid-cols-[50px_1fr_1fr_140px] gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors items-center"
          >
            <span className="text-sm text-[var(--color-text-secondary)] font-mono">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              {customer.name}
            </span>
            <span className="text-sm text-[var(--color-text-secondary)] font-mono">
              {customer.phone}
            </span>
            <StatusBadge status={customer.status} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
