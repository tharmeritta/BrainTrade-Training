'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  ArrowRight, Loader2, AlertCircle, Users, Award, Layers, User,
  BookOpen, Settings, CreditCard, Bot, Target, Zap, CheckCircle2,
} from 'lucide-react';
import { StatCounter } from '@/components/ui/StatCounter';
import { EASE, TRANSITION, FADE_IN, STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animations';
import { getAgentSession, setAgentSession, clearAgentSession } from '@/lib/agent-session';

// --- Constants & Types ---
const CYAN = '#00B4D8';
const PURPLE = '#7C3AED';

interface AgentOption {
  id: string;
  name: string;
  stageName?: string;
}

interface AgentEntryProps {
  onAgentSelected: (id: string, name: string, stageName: string) => void;
}

const STATS_CONFIG = [
  { Icon: Users,  target: 100, suffix: '+', labelKey: 'agents' },
  { Icon: Award,  target: 89,  suffix: '%', labelKey: 'passed' },
  { Icon: Layers, target: 4,   suffix: '',  labelKey: 'modules' },
];

const MODULES = [
  { Icon: BookOpen,   labelKey: 'product', color: '#818CF8', bg: 'rgba(129,140,248,0.12)' },
  { Icon: Settings,   labelKey: 'process', color: '#22D3EE', bg: 'rgba(34,211,238,0.12)'  },
  { Icon: Bot,        labelKey: 'aiEval',   color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
  { Icon: Target,     labelKey: 'pitch',     color: '#F472B6', bg: 'rgba(244,114,182,0.12)' },
];

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

// --- Sub-components ---

/**
 * BackgroundEffects: Renders the ambient background orbs and grid.
 */
const BackgroundEffects = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* Top-left cyan orb */}
    <motion.div className="absolute rounded-full"
      style={{ width: 800, height: 800, top: -250, left: -200,
        background: `radial-gradient(circle, rgba(0,180,216,0.08) 0%, transparent 65%)` }}
      animate={{ x: [0, 55, 0], y: [0, 65, 0] }}
      transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
    />
    {/* Bottom-right purple orb */}
    <motion.div className="absolute rounded-full"
      style={{ width: 600, height: 600, bottom: -120, right: -100,
        background: `radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 65%)` }}
      animate={{ x: [0, -40, 0], y: [0, -50, 0] }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
    />
    {/* Center bridge orb */}
    <motion.div className="absolute rounded-full hidden lg:block"
      style={{ width: 500, height: 500, top: '50%', left: '55%', transform: 'translate(-50%,-50%)',
        background: `radial-gradient(circle, rgba(0,180,216,0.05) 0%, rgba(124,58,237,0.04) 50%, transparent 70%)` }}
      animate={{ scale: [1, 1.08, 1] }}
      transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
    />
    {/* Subtle grid */}
    <div className="absolute inset-0 opacity-[0.016]" style={{
      backgroundImage: `linear-gradient(var(--hub-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--hub-grid-color) 1px, transparent 1px)`,
      backgroundSize: '56px 56px',
    }} />
    {/* Soft vertical seam */}
    <div className="hidden lg:block" style={{
      position: 'absolute',
      top: '10%', bottom: '10%',
      right: 420,
      width: 1,
      background: `linear-gradient(180deg, transparent 0%, rgba(0,180,216,0.18) 30%, rgba(124,58,237,0.14) 70%, transparent 100%)`,
      filter: 'blur(0.5px)',
    }} />
  </div>
);

/**
 * BrandingPanel: The left-side promotional panel for desktop.
 */
const BrandingPanel = () => {
  const t = useTranslations('agentEntry');
  const trustPoints = t.raw('trustPoints') as string[];

  return (
    <div className="relative hidden lg:flex flex-col justify-between flex-1 overflow-hidden px-12 py-10">
      <motion.div 
        variants={FADE_IN}
        initial="initial"
        animate="animate"
        className="relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/20">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-brand-cyan" />
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-brand-cyan">Sales Excellence Academy</span>
        </div>
      </motion.div>

      <div className="relative z-10 flex flex-col gap-8">
        <motion.div 
          variants={FADE_IN}
          initial="initial"
          animate="animate"
        >
          <h1 className="text-4xl md:text-5xl lg:text-5xl font-black leading-tight tracking-tight text-[color:var(--hub-text)] mb-3"
            dangerouslySetInnerHTML={{ __html: t.raw('title') }}
          />
          <p className="text-sm leading-relaxed max-w-[340px]" style={{ color: 'var(--hub-muted)' }}>
            {t('subtitle')}
          </p>
        </motion.div>

        <motion.div 
          variants={STAGGER_CONTAINER}
          initial="initial"
          animate="animate"
          className="flex gap-3"
        >
          {STATS_CONFIG.map((s, i) => (
            <motion.div key={i} variants={STAGGER_ITEM} className="flex flex-col py-4 px-5 rounded-2xl" style={{ background: 'var(--hub-card)', border: '1px solid var(--hub-border)', minWidth: 88 }}>
              <div className="w-6 h-6 rounded-lg flex items-center justify-center mb-2 bg-brand-cyan/10">
                <s.Icon size={12} className="text-brand-cyan" />
              </div>
              <div className="text-2xl font-black leading-none mb-0.5 text-[color:var(--hub-text)]">
                <StatCounter target={s.target} suffix={s.suffix} delay={400 + i * 120} />
              </div>
              <div className="text-[10px] font-medium text-[color:var(--hub-muted)]">{t(s.labelKey)}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          variants={FADE_IN}
          initial="initial"
          animate="animate"
          className="flex flex-col gap-2.5"
        >
          {trustPoints.map((pt, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <CheckCircle2 size={13} className="text-brand-cyan shrink-0" />
              <span className="text-xs text-[color:var(--hub-muted)]">{pt}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div 
        variants={FADE_IN}
        initial="initial"
        animate="animate"
        className="relative z-10"
      >
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] mb-2.5" style={{ color: 'var(--hub-dim)' }}>{t('allCourses')}</p>
        <motion.div 
          variants={STAGGER_CONTAINER}
          className="flex flex-wrap gap-2"
        >
          {MODULES.map((m, i) => (
            <motion.span 
              key={i} 
              variants={STAGGER_ITEM}
              whileHover={{ scale: 1.04 }}
              className="flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-full font-medium" 
              style={{ background: m.bg, border: `1px solid ${m.color}22`, color: m.color }}
            >
              <m.Icon size={10} />
              {t(m.labelKey)}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

/**
 * ReturningUserBanner: Shortcut for agents who have already logged in.
 */
const ReturningUserBanner = ({ user, onContinue, onClear }: { user: { id: string, name: string, stageName: string }, onContinue: () => void, onClear: () => void }) => {
  const t = useTranslations('agentEntry');
  return (
    <motion.div
      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
      animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3 }}
      style={{ overflow: 'hidden' }}
    >
      <div className="rounded-2xl p-3.5" style={{ background: 'rgba(0,180,216,0.06)', border: '1px solid rgba(0,180,216,0.18)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-black" style={{ background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})`, color: '#fff' }}>
            {getInitials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wider mb-0.5 text-brand-cyan">{t('welcomeBack')}</div>
            <div className="text-sm font-bold truncate" style={{ color: 'var(--hub-text)' }}>{user.name}</div>
            {user.stageName && (
              <div className="text-[10px] font-medium truncate text-brand-cyan/80">&quot;{user.stageName}&quot;</div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <motion.button
            onClick={onContinue}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold"
            style={{ background: `linear-gradient(135deg, ${CYAN}, #0055F0)`, color: '#fff', boxShadow: `0 4px 12px rgba(0,180,216,0.25)` }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
          >
            <Zap size={11} />{t('continueBtn')}
          </motion.button>
          <button
            onClick={onClear}
            className="px-3 py-2 rounded-xl text-xs font-medium transition-opacity hover:opacity-70"
            style={{ background: 'var(--entry-input-bg)', color: 'var(--hub-muted)', border: '1px solid var(--hub-border)' }}
          >
            {t('changeBtn')}
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <div className="flex-1 h-px" style={{ background: 'var(--hub-border)' }} />
        <span className="text-[9px] font-medium uppercase tracking-widest" style={{ color: 'var(--hub-dim)' }}>{t('orLoginNew')}</span>
        <div className="flex-1 h-px" style={{ background: 'var(--hub-border)' }} />
      </div>
    </motion.div>
  );
};

// --- Main Component ---

export default function AgentEntry({ onAgentSelected }: AgentEntryProps) {
  const t = useTranslations('agentEntry');
  const [agents, setAgents]             = useState<AgentOption[]>([]);
  const [name, setName]                 = useState('');
  const [loading, setLoading]           = useState(true);
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState('');
  const [returning, setReturning]       = useState<{ id: string; name: string; stageName: string } | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const locale   = pathname?.split('/')[1] || 'th';

  useEffect(() => {
    const session = getAgentSession();
    if (session) setReturning(session);

    fetch('/api/agents')
      .then(r => r.json())
      .then(d => setAgents(d.agents ?? []))
      .catch(() => {
        // Silently handle fetch errors, match will fail in handleSubmit
      })
      .finally(() => setLoading(false));

    setTimeout(() => inputRef.current?.focus(), 500);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanName = normalizeName(name);
    if (!cleanName || submitting) return;
    
    setSubmitting(true);
    setError('');
    
    // Simulate minor delay for better UX feel
    await new Promise(r => setTimeout(r, 450));
    
    if (agents.length === 0 && !loading) {
      setError(t('fetchError'));
      setSubmitting(false);
      return;
    }

    const match = agents.find(
      a => normalizeName(a.name).toLowerCase() === cleanName.toLowerCase()
    );

    if (!match) {
      setError(t('matchError'));
      setSubmitting(false);
      return;
    }

    const stageName = match.stageName ?? '';
    setAgentSession({ id: match.id, name: match.name, stageName });
    onAgentSelected(match.id, match.name, stageName);
    // Note: submitting state remains true as we expect the component to unmount
  }

  const handleClearReturning = () => {
    clearAgentSession();
    setReturning(null);
  };

  const canSubmit  = !!name.trim() && !loading;
  const initials   = name.trim().length >= 2 ? getInitials(name) : null;
  const floatLabel = inputFocused || !!name.trim();

  return (
    <div className="relative w-full h-full overflow-hidden flex" style={{ background: 'var(--hub-bg)', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <BackgroundEffects />

      {/* LEFT PANEL: Branding */}
      <BrandingPanel />

      {/* RIGHT PANEL: Login */}
      <div className="relative flex items-center justify-center w-full lg:w-[420px] xl:w-[460px] shrink-0 px-6 py-10 overflow-y-auto">
        <motion.div 
          variants={FADE_IN}
          initial="initial"
          animate="animate"
          className="relative z-10 w-full max-w-[380px]"
        >
          {/* Mobile-only header */}
          <div className="lg:hidden mb-6 text-center">
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-1 text-brand-cyan">Sales Excellence Academy</p>
            <h1 className="text-xl font-black" style={{ color: 'var(--hub-text)' }}
              dangerouslySetInnerHTML={{ __html: t.raw('title') }}
            />
          </div>

          <div style={{ background: `linear-gradient(135deg, rgba(0,180,216,0.35), rgba(124,58,237,0.28), rgba(0,180,216,0.18))`, borderRadius: 25, padding: 1, boxShadow: '0 24px 64px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.03)' }}>
            <div style={{ background: 'var(--entry-card-bg)', borderRadius: 24, backdropFilter: 'blur(24px)', overflow: 'hidden' }}>
              <div style={{ height: 3, background: `linear-gradient(90deg, ${CYAN} 0%, ${PURPLE} 50%, ${CYAN} 100%)` }} />

              <div style={{ padding: '28px' }}>
                <AnimatePresence>
                  {returning && (
                    <ReturningUserBanner
                      user={returning}
                      onContinue={() => onAgentSelected(returning.id, returning.name, returning.stageName)}
                      onClear={handleClearReturning}
                    />
                  )}
                </AnimatePresence>

                {/* Avatar / greeting */}
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black shrink-0 overflow-hidden"
                    style={{
                      background: initials ? `linear-gradient(135deg, ${CYAN}, ${PURPLE})` : 'rgba(0,180,216,0.1)',
                      border: '1px solid rgba(0,180,216,0.2)',
                      transition: 'background 0.3s',
                    }}
                    initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, ...EASE.spring }}
                  >
                    <AnimatePresence mode="wait">
                      {initials ? (
                        <motion.span key="initials" style={{ color: '#fff' }} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.12 }}>
                          {initials}
                        </motion.span>
                      ) : (
                        <motion.div key="icon" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.12 }}>
                          <User size={20} className="text-brand-cyan" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <div>
                    <h2 className="text-base font-black leading-tight" style={{ color: 'var(--hub-text)' }}>{t('welcome')}</h2>
                    <p className="text-xs" style={{ color: 'var(--hub-muted)' }}>{t('loginDesc')}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={name}
                      onChange={e => { setName(e.target.value); setError(''); }}
                      onFocus={() => setInputFocused(true)}
                      onBlur={() => setInputFocused(false)}
                      autoComplete="off"
                      disabled={loading || submitting}
                      className="w-full px-4 rounded-xl text-sm outline-none transition-all"
                      style={{
                        paddingTop: floatLabel ? 20 : 13,
                        paddingBottom: 12,
                        background: 'var(--entry-input-bg)',
                        border: error ? '1px solid rgba(248,113,113,0.5)' : inputFocused ? `1px solid ${CYAN}60` : '1px solid var(--hub-border)',
                        color: 'var(--hub-text)',
                        opacity: loading ? 0.6 : 1,
                        boxShadow: inputFocused && !error ? `0 0 0 3px rgba(0,180,216,0.08)` : 'none',
                      }}
                    />
                    <motion.label
                      animate={{ top: floatLabel ? 7 : 13, fontSize: floatLabel ? '10px' : '14px' }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-4 font-medium pointer-events-none"
                      style={{ color: floatLabel ? CYAN : 'var(--hub-muted)', lineHeight: 1 }}
                    >
                      {t('nameLabel')}
                    </motion.label>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        key="error-message"
                        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
                        className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
                        style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}
                      >
                        <AlertCircle size={14} className="shrink-0 mt-0.5" style={{ color: '#F87171' }} />
                        <span className="text-xs leading-relaxed" style={{ color: '#F87171' }}>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    disabled={!canSubmit || submitting}
                    className="group w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm"
                    style={{
                      background: canSubmit ? `linear-gradient(135deg, ${CYAN}, #0055F0)` : 'var(--hub-locked-bg)',
                      color: canSubmit ? '#fff' : 'var(--hub-dim)',
                      cursor: canSubmit ? 'pointer' : 'not-allowed',
                      boxShadow: canSubmit ? `0 6px 20px rgba(0,180,216,0.22)` : 'none',
                    }}
                    whileHover={canSubmit ? { scale: 1.01 } : {}}
                    whileTap={canSubmit ? { scale: 0.98 } : {}}
                  >
                    {submitting ? <Loader2 size={15} className="animate-spin" /> : loading ? <><Loader2 size={13} className="animate-spin" /><span>{t('loading')}</span></> : (
                      <>
                        <span>{t('loginBtn')}</span>
                        <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
                      </>
                    )}
                  </motion.button>
                </form>

                <div className="mt-5 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--hub-border)' }}>
                  <span className="text-[10px]" style={{ color: 'var(--hub-dim)' }}>{t('nameNotFound')}</span>
                  <Link href={`/${locale}/login`} className="text-[10px] transition-opacity hover:opacity-80" style={{ color: 'var(--hub-muted)' }}>{t('staffLogin')}</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile module chips */}
          <motion.div 
            variants={STAGGER_CONTAINER}
            className="lg:hidden flex flex-wrap gap-2 justify-center mt-5"
          >
            {MODULES.map((m, i) => (
              <motion.span 
                key={i} 
                variants={STAGGER_ITEM}
                className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full" 
                style={{ background: m.bg, border: `1px solid ${m.color}22`, color: m.color }}
              >
                <m.Icon size={10} />{t(m.labelKey)}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
