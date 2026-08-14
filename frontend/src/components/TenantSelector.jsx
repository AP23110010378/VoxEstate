/**
 * TenantSelector.jsx — Company Selector Cards
 *
 * Shows a list of company cards. When the user clicks one,
 * it becomes the "active" company and the leads table updates.
 *
 * Each card shows:
 * - Company name
 * - Building icon
 * - Gold border when selected
 */

import { motion } from 'framer-motion';
import { Building2, ChevronRight } from 'lucide-react';

export default function TenantSelector({ companies, selectedCompany, onSelect }) {
  if (!companies.length) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-[var(--color-text-secondary)]">No companies found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4 flex items-center gap-2">
        <Building2 size={16} />
        Companies
      </h3>

      {companies.map((company, i) => {
        const isSelected = selectedCompany?.id === company.id;

        return (
          <motion.button
            key={company.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(company)}
            className={`w-full text-left p-4 rounded-xl transition-all duration-300 cursor-pointer group ${
              isSelected
                ? 'bg-[var(--color-gold-500)]/10 border-2 border-[var(--color-gold-500)]/50 gold-glow'
                : 'glass-card hover:border-[var(--color-gold-500)]/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${
                  isSelected
                    ? 'bg-[var(--color-gold-500)]/20'
                    : 'bg-[var(--color-navy-600)]/50'
                }`}>
                  <Building2
                    size={20}
                    className={isSelected ? 'text-[var(--color-gold-400)]' : 'text-[var(--color-text-secondary)]'}
                  />
                </div>
                <div>
                  <p className={`font-semibold text-sm ${
                    isSelected ? 'text-[var(--color-gold-400)]' : 'text-[var(--color-text-primary)]'
                  }`}>
                    {company.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 truncate max-w-[160px]">
                    {company.prompt.substring(0, 50)}...
                  </p>
                </div>
              </div>
              <ChevronRight
                size={16}
                className={`transition-transform ${
                  isSelected ? 'text-[var(--color-gold-400)] translate-x-0' : 'text-[var(--color-text-secondary)] -translate-x-1 group-hover:translate-x-0'
                }`}
              />
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
