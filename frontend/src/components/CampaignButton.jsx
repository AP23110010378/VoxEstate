/**
 * CampaignButton.jsx — Launch Campaign Button
 *
 * The "big button" that starts the AI voice campaign.
 * Features:
 * - Gold gradient styling
 * - Pulse animation while campaign is active
 * - Disabled state while loading
 * - Rocket icon with animation
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Loader2, CheckCircle2 } from 'lucide-react';

export default function CampaignButton({ onLaunch, disabled, selectedCompany }) {
  const [state, setState] = useState('idle'); // idle | loading | success

  const handleClick = async () => {
    if (state !== 'idle' || disabled || !selectedCompany) return;

    setState('loading');

    try {
      await onLaunch();
      setState('success');
      setTimeout(() => setState('idle'), 3000);
    } catch (err) {
      console.error('Campaign launch failed:', err);
      setState('idle');
    }
  };

  const isLoading = state === 'loading';
  const isSuccess = state === 'success';

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        id="launch-campaign-btn"
        whileHover={!disabled && state === 'idle' ? { scale: 1.03 } : {}}
        whileTap={!disabled && state === 'idle' ? { scale: 0.97 } : {}}
        onClick={handleClick}
        disabled={disabled || !selectedCompany}
        className={`
          relative overflow-hidden px-8 py-4 rounded-2xl font-semibold text-base
          flex items-center gap-3 transition-all duration-300 cursor-pointer
          ${disabled || !selectedCompany
            ? 'bg-[var(--color-navy-700)] text-[var(--color-text-secondary)] cursor-not-allowed opacity-50'
            : isSuccess
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : isLoading
                ? 'bg-[var(--color-gold-500)]/20 text-[var(--color-gold-400)] border border-[var(--color-gold-500)]/30 campaign-active'
                : 'bg-gradient-to-r from-[var(--color-gold-500)] to-[var(--color-gold-400)] text-[var(--color-navy-950)] hover:shadow-lg hover:shadow-[var(--color-gold-500)]/25'
          }
        `}
      >
        {/* Shimmer effect */}
        {state === 'idle' && !disabled && selectedCompany && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
        )}

        <span className="relative z-10 flex items-center gap-3">
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Calling Leads...
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 size={20} />
              Campaign Launched!
            </>
          ) : (
            <>
              <Rocket size={20} />
              Launch Campaign
            </>
          )}
        </span>
      </motion.button>

      {!selectedCompany && (
        <p className="text-xs text-[var(--color-text-secondary)]">
          Select a company first
        </p>
      )}
    </div>
  );
}
