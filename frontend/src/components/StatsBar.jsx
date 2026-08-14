/**
 * StatsBar.jsx — Campaign Statistics Bar
 *
 * Shows overview stats at the top of the dashboard:
 * - Total leads count
 * - Qualified count (green)
 * - Not Interested count (red)
 * - Pending count (gray)
 * - Calling count (blue)
 *
 * Numbers animate up with a count-up effect using Framer Motion.
 */

import { motion } from 'framer-motion';
import { Users, CheckCircle, XCircle, Clock, Phone } from 'lucide-react';

function AnimatedCounter({ value }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="text-3xl font-bold font-['Outfit']"
    >
      {value}
    </motion.span>
  );
}

function StatCard({ icon: Icon, label, value, color, iconColor }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 flex items-center gap-4 hover:border-[var(--color-gold-500)]/20 transition-all duration-300"
    >
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={22} className={iconColor} />
      </div>
      <div>
        <AnimatedCounter value={value} />
        <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

export default function StatsBar({ customers }) {
  const total = customers.length;
  const qualified = customers.filter(c => c.status === 'QUALIFIED').length;
  const notInterested = customers.filter(c => c.status === 'NOT_INTERESTED').length;
  const pending = customers.filter(c => c.status === 'PENDING').length;
  const calling = customers.filter(c => c.status === 'CALL_INITIATED').length;
  const failed = customers.filter(c => c.status === 'FAILED').length;

  const stats = [
    { icon: Users, label: 'Total Leads', value: total, color: 'bg-[var(--color-gold-500)]/15', iconColor: 'text-[var(--color-gold-400)]' },
    { icon: CheckCircle, label: 'Qualified', value: qualified, color: 'bg-green-500/15', iconColor: 'text-green-400' },
    { icon: XCircle, label: 'Not Interested', value: notInterested, color: 'bg-red-500/15', iconColor: 'text-red-400' },
    { icon: Phone, label: 'Calling', value: calling, color: 'bg-blue-500/15', iconColor: 'text-blue-400' },
    { icon: Clock, label: 'Pending', value: pending, color: 'bg-gray-500/15', iconColor: 'text-gray-400' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <StatCard {...stat} />
        </motion.div>
      ))}
    </div>
  );
}
