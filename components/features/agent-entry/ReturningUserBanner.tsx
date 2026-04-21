'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Zap } from 'lucide-react';

const CYAN = '#00B4D8';
const PURPLE = '#7C3AED';

interface ReturningUserBannerProps {
  user: { id: string; name: string; stageName: string };
  onContinue: () => void;
  onClear: () => void;
}

/**
 * Normalizes a name by trimming and collapsing multiple spaces.
 */
function normalizeName(n: string) {
  return n.trim().replace(/\s+/g, ' ');
}

function getInitials(n: string) {
  const parts = normalizeName(n).split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const ReturningUserBanner = ({ user, onContinue, onClear }: ReturningUserBannerProps) => {
  const t = useTranslations('agentEntry');
  return (
    <motion.div
      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
      animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3 }}
      style={{ overflow: 'hidden' }}
    >
      <div className="rounded-[24px] p-4" style={{ background: 'rgba(0,180,216,0.06)', border: '1px solid rgba(0,180,216,0.18)', boxShadow: '0 4px 15px rgba(0,180,216,0.05)' }}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-xs font-black shadow-sm" style={{ background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})`, color: '#fff' }}>
            {getInitials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.1em] mb-0.5 text-brand-cyan">{t('welcomeBack')}</div>
            <div className="text-sm font-black truncate tracking-tight" style={{ color: 'var(--hub-text)' }}>{user.name}</div>
            {user.stageName && (
              <div className="text-[11px] font-bold truncate text-brand-cyan/80">&quot;{user.stageName}&quot;</div>
            )}
          </div>
        </div>
        <div className="flex gap-2.5">
          <motion.button
            onClick={onContinue}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black"
            style={{ background: `linear-gradient(135deg, ${CYAN}, #0055F0)`, color: '#fff', boxShadow: `0 4px 12px rgba(0,180,216,0.25)` }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Zap size={12} fill="currentColor" />{t('continueBtn')}
          </motion.button>
          <button
            onClick={onClear}
            className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-white/5"
            style={{ background: 'var(--entry-input-bg)', color: 'var(--hub-muted)', border: '1px solid var(--hub-border)' }}
          >
            {t('changeBtn')}
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-5">
        <div className="flex-1 h-px" style={{ background: 'var(--hub-border)' }} />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40" style={{ color: 'var(--hub-text)' }}>{t('orLoginNew')}</span>
        <div className="flex-1 h-px" style={{ background: 'var(--hub-border)' }} />
      </div>
    </motion.div>
  );
};
