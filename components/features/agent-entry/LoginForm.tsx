'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animations';

import { DevMockupSelector, DevMockAgent } from './DevMockupSelector';
import { useSession } from '@/components/providers/SessionProvider';

const CYAN = '#00B4D8';

interface LoginFormProps {
  name: string;
  setName: (name: string) => void;
  error: string;
  setError: (error: string) => void;
  loading: boolean;
  submitting: boolean;
  inputFocused: boolean;
  setInputFocused: (focused: boolean) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  handleSubmit: (e: React.FormEvent) => void;
  t: (key: string) => string;
}

export function LoginForm({
  name, setName, error, setError, loading, submitting,
  inputFocused, setInputFocused, inputRef, handleSubmit, t
}: LoginFormProps) {
  const floatLabel = inputFocused || !!name.trim();
  const canSubmit = !!name.trim() && !loading;
  const { setAgent } = useSession();

  const handleSelectDevAgent = (mock: DevMockAgent) => {
    setAgent({ id: mock.id, name: mock.name, stageName: mock.stageName });
  };

  return (
    <motion.form variants={STAGGER_CONTAINER} onSubmit={handleSubmit} className="space-y-4">
      <motion.div variants={STAGGER_ITEM} className="relative group/input">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={e => { setName(e.target.value); setError(''); }}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          autoComplete="off"
          disabled={loading || submitting}
          className="w-full px-5 rounded-2xl text-base font-medium outline-none transition-all"
          style={{
            paddingTop: floatLabel ? 24 : 16,
            paddingBottom: floatLabel ? 8 : 16,
            background: 'var(--entry-input-bg)',
            border: error ? '1px solid rgba(248,113,113,0.5)' : inputFocused ? `1px solid ${CYAN}80` : '1px solid var(--hub-border)',
            color: 'var(--hub-text)',
            opacity: loading ? 0.6 : 1,
            boxShadow: inputFocused && !error ? `0 0 20px -5px ${CYAN}20` : 'none',
          }}
        />
        <motion.label
          animate={{ 
            top: floatLabel ? 8 : 16, 
            fontSize: floatLabel ? '11px' : '15px',
            x: floatLabel ? 0 : 4
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute left-5 font-bold pointer-events-none tracking-tight"
          style={{ color: floatLabel ? CYAN : 'var(--hub-muted)', lineHeight: 1 }}
        >
          {t('nameLabel')}
        </motion.label>
        <div className={`absolute bottom-0 left-6 right-6 h-[1px] transition-all duration-300 ${inputFocused ? 'opacity-100' : 'opacity-0'}`}
          style={{ background: `linear-gradient(90deg, transparent, ${CYAN}, transparent)` }}
        />
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            key="error-message"
            initial={{ opacity: 0, y: -10, scale: 0.98 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: -10, scale: 0.98 }} 
            transition={{ duration: 0.2 }}
            className="flex items-start gap-3 px-4 py-3 rounded-2xl"
            style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)' }}
          >
            <AlertCircle size={16} className="shrink-0 mt-0.5" style={{ color: '#F87171' }} />
            <span className="text-xs font-bold leading-relaxed" style={{ color: '#F87171' }}>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        variants={STAGGER_ITEM}
        type="submit"
        disabled={!canSubmit || submitting}
        className="group relative w-full flex items-center justify-center gap-2.5 py-4 rounded-[18px] font-black text-base overflow-hidden"
        style={{
          background: canSubmit ? `linear-gradient(135deg, ${CYAN}, #0055F0)` : 'var(--hub-locked-bg)',
          color: canSubmit ? '#fff' : 'var(--hub-dim)',
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          boxShadow: canSubmit ? `0 10px 25px -5px rgba(0,180,216,0.35)` : 'none',
        }}
        whileHover={canSubmit ? { scale: 1.02, y: -1 } : {}}
        whileTap={canSubmit ? { scale: 0.98 } : {}}
      >
        {canSubmit && !submitting && (
          <motion.div 
            className="absolute inset-0 w-1/2 h-full skew-x-[-25deg] pointer-events-none"
            animate={{ left: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}
          />
        )}

        {submitting ? <Loader2 size={20} className="animate-spin" /> : loading ? <><Loader2 size={18} className="animate-spin" /><span>{t('loading')}</span></> : (
          <>
            <span className="tracking-tight">{t('loginBtn')}</span>
            <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1.5" />
          </>
        )}
      </motion.button>

      {/* Developer Mockup Selector */}
      <DevMockupSelector onSelectAgent={handleSelectDevAgent} />
    </motion.form>
  );
}
