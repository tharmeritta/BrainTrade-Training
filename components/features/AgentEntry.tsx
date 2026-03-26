'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  ArrowRight, Loader2, AlertCircle, Users, Award, Layers, User,
  BookOpen, Settings, CreditCard, Bot, Target, Zap, CheckCircle2, Lock,
} from 'lucide-react';
import { StatCounter } from '@/components/ui/StatCounter';
import { BackgroundEffects } from '@/components/ui/BackgroundEffects';
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
  { Icon: Layers, target: 3,   suffix: '',  labelKey: 'modules' },
];

const MODULES = [
  { Icon: BookOpen,   labelKey: 'product', color: '#818CF8', bg: 'rgba(129,140,248,0.12)' },
  { Icon: Settings,   labelKey: 'process', color: '#22D3EE', bg: 'rgba(34,211,238,0.12)'  },
  { Icon: Bot,        labelKey: 'aiEval',   color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
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
 * FloatingDecoration: Decorative floating glass elements for premium feel.
 */
const FloatingDecoration = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    <motion.div 
      className="absolute top-[15%] left-[5%] p-4 rounded-2xl glass border-white/20 hidden xl:block shadow-2xl"
      animate={{ y: [0, -15, 0], rotate: [0, 2, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-cyan/20 flex items-center justify-center">
          <Award size={16} className="text-brand-cyan" />
        </div>
        <div className="flex flex-col">
          <div className="w-16 h-1.5 bg-brand-cyan/30 rounded-full mb-1" />
          <div className="w-10 h-1.5 bg-brand-cyan/15 rounded-full" />
        </div>
      </div>
    </motion.div>

    <motion.div 
      className="absolute bottom-[20%] left-[8%] p-4 rounded-2xl glass border-white/20 hidden xl:block shadow-2xl"
      animate={{ y: [0, 20, 0], rotate: [0, -3, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <Target size={16} className="text-purple-400" />
        </div>
        <div className="flex flex-col">
          <div className="w-20 h-1.5 bg-purple-400/30 rounded-full mb-1" />
          <div className="w-12 h-1.5 bg-purple-400/15 rounded-full" />
        </div>
      </div>
    </motion.div>
  </div>
);

/**
 * BrandingPanel: The left-side promotional panel for desktop.
 */
const BrandingPanel = () => {
  const t = useTranslations('agentEntry');
  const trustPoints = t.raw('trustPoints') as string[];

  return (
    <div className="relative hidden lg:flex flex-col justify-between flex-1 overflow-hidden px-12 py-12">
      <FloatingDecoration />
      
      <motion.div 
        variants={FADE_IN}
        initial="initial"
        animate="animate"
        className="relative z-10"
      >
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 backdrop-blur-sm">
          <div className="relative w-2 h-2">
            <div className="absolute inset-0 rounded-full animate-ping bg-brand-cyan/60" />
            <div className="relative w-2 h-2 rounded-full bg-brand-cyan shadow-[0_0_8px_rgba(0,180,216,0.6)]" />
          </div>
          <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-brand-cyan">Sales Excellence Academy</span>
        </div>
      </motion.div>

      <div className="relative z-10 flex flex-col gap-10">
        <motion.div 
          variants={FADE_IN}
          initial="initial"
          animate="animate"
        >
          <h1 className="text-5xl xl:text-6xl font-black leading-[1.1] tracking-tight text-[color:var(--hub-text)] mb-4"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))' }}
            dangerouslySetInnerHTML={{ __html: t.raw('title') }}
          />
          <p className="text-base leading-relaxed max-w-[380px] font-medium" style={{ color: 'var(--hub-muted)' }}>
            {t('subtitle')}
          </p>
        </motion.div>

        <motion.div 
          variants={STAGGER_CONTAINER}
          initial="initial"
          animate="animate"
          className="flex gap-4"
        >
          {STATS_CONFIG.map((s, i) => (
            <motion.div 
              key={i} 
              variants={STAGGER_ITEM} 
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group flex flex-col py-5 px-6 rounded-[24px] transition-colors" 
              style={{ background: 'var(--hub-card)', border: '1px solid var(--hub-border)', minWidth: 100, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' }}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3 bg-brand-cyan/10 group-hover:bg-brand-cyan/20 transition-colors">
                <s.Icon size={16} className="text-brand-cyan" />
              </div>
              <div className="text-3xl font-black leading-none mb-1 text-[color:var(--hub-text)]">
                <StatCounter target={s.target} suffix={s.suffix} delay={400 + i * 120} />
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--hub-muted)]">{t(s.labelKey)}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          variants={FADE_IN}
          initial="initial"
          animate="animate"
          className="flex flex-col gap-3.5"
        >
          {trustPoints.map((pt, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center bg-brand-cyan/10 shrink-0">
                <CheckCircle2 size={12} className="text-brand-cyan" />
              </div>
              <span className="text-sm font-medium text-[color:var(--hub-muted)]">{pt}</span>
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
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 opacity-60" style={{ color: 'var(--hub-text)' }}>{t('allCourses')}</p>
        <motion.div 
          variants={STAGGER_CONTAINER}
          className="flex flex-wrap gap-2.5"
        >
          {MODULES.map((m, i) => (
            <motion.span 
              key={i} 
              variants={STAGGER_ITEM}
              whileHover={{ scale: 1.05, y: -2 }}
              className="flex items-center gap-2 text-[11px] px-4 py-2 rounded-full font-bold shadow-sm" 
              style={{ background: m.bg, border: `1px solid ${m.color}25`, color: m.color }}
            >
              <m.Icon size={12} />
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

// --- Main Component ---

export default function AgentEntry({ onAgentSelected }: AgentEntryProps) {
  const t = useTranslations('agentEntry');
  const [agents, setAgents]               = useState<AgentOption[]>([]);
  const [name, setName]                   = useState('');
  const [loading, setLoading]             = useState(true);
  const [submitting, setSubmitting]       = useState(false);
  const [error, setError]                 = useState('');
  const [returning, setReturning]         = useState<{ id: string; name: string; stageName: string } | null>(null);
  const [inputFocused, setInputFocused]   = useState(false);
  const [loginPrompt, setLoginPrompt]     = useState(false);
  const [shakeKey, setShakeKey]           = useState(0);

  const inputRef   = useRef<HTMLInputElement>(null);
  const pathname   = usePathname();
  const searchParams = useSearchParams();
  const router     = useRouter();
  const locale     = pathname?.split('/')[1] || 'th';

  // Detect redirect from guarded nav
  useEffect(() => {
    if (searchParams.get('loginRequired') === '1') {
      setLoginPrompt(true);
      setShakeKey(k => k + 1);
      // Clean the query param from the URL without a full navigation
      router.replace(`/${locale}/dashboard`, { scroll: false });
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const session = getAgentSession();
    if (session) setReturning(session);

    fetch('/api/agents')
      .then(r => r.json())
      .then(d => {
        if (d.error) {
          setError(d.error);
        }
        setAgents(d.agents ?? []);
      })
      .catch((err) => {
        setError(err.message || 'Fetch failed');
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
      if (!error) setError(t('fetchError'));
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
      <div className="relative flex items-center justify-center w-full lg:w-[460px] xl:w-[500px] shrink-0 px-6 py-10 overflow-y-auto z-10">
        <motion.div 
          variants={FADE_IN}
          initial="initial"
          animate="animate"
          className="relative w-full max-w-[400px]"
        >
          {/* Mobile-only header */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 mb-4">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-brand-cyan" />
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-brand-cyan">Sales Excellence Academy</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--hub-text)' }}
              dangerouslySetInnerHTML={{ __html: t.raw('title') }}
            />
          </div>

          <motion.div
            key={shakeKey}
            animate={shakeKey > 0 ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : {}}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            className="relative group"
            style={{ 
              background: `linear-gradient(135deg, rgba(0,180,216,0.4), rgba(124,58,237,0.3), rgba(0,180,216,0.2))`, 
              borderRadius: 32, 
              padding: 1, 
              boxShadow: '0 40px 80px -20px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.05)' 
            }}
          >
            {/* Animated border glow */}
            <div className="absolute -inset-[1px] rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm pointer-events-none"
              style={{ background: `linear-gradient(90deg, transparent, ${CYAN}44, ${PURPLE}44, transparent)` }}
            />

            <div style={{ background: 'var(--entry-card-bg)', borderRadius: 31, backdropFilter: 'blur(32px)', overflow: 'hidden', position: 'relative' }}>
              {/* Dynamic top-bar gradient */}
              <motion.div 
                className="absolute top-0 left-0 right-0 h-[3px]"
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                style={{ 
                  background: `linear-gradient(90deg, ${CYAN}, ${PURPLE}, ${CYAN})`,
                  backgroundSize: '200% 100%'
                }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              />

              <div style={{ padding: '36px 32px' }}>
                {/* Login-required prompt */}
                <AnimatePresence>
                  {loginPrompt && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="mb-6"
                    >
                      <div className="flex items-start gap-3.5 px-4 py-3.5 rounded-2xl" style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.35)', boxShadow: '0 4px 15px rgba(124,58,237,0.1)' }}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm" style={{ background: 'rgba(124,58,237,0.2)' }}>
                          <Lock size={14} style={{ color: '#A78BFA' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold mb-0.5 tracking-tight" style={{ color: '#C4B5FD' }}>
                            {t('loginRequiredTitle')}
                          </p>
                          <p className="text-[11px] leading-relaxed font-medium" style={{ color: 'rgba(196,181,253,0.75)' }}>
                            {t('loginRequiredDesc')}
                          </p>
                        </div>
                        <button
                          onClick={() => setLoginPrompt(false)}
                          className="text-xs shrink-0 mt-0.5 opacity-40 hover:opacity-100 transition-opacity p-1"
                          style={{ color: '#A78BFA' }}
                        >
                          ✕
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

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
                <div className="flex items-center gap-4 mb-8">
                  <div className="relative">
                    <motion.div
                      className="w-14 h-14 rounded-[20px] flex items-center justify-center text-lg font-black shrink-0 overflow-hidden z-10 relative"
                      style={{
                        background: initials ? `linear-gradient(135deg, ${CYAN}, ${PURPLE})` : 'rgba(0,180,216,0.08)',
                        border: `1px solid ${initials ? 'transparent' : 'rgba(0,180,216,0.2)'}`,
                        boxShadow: initials ? `0 8px 20px -5px ${CYAN}66` : 'none',
                      }}
                      initial={{ scale: 0.8, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }} 
                      transition={{ delay: 0.3, ...EASE.spring }}
                    >
                      <AnimatePresence mode="wait">
                        {initials ? (
                          <motion.span key="initials" style={{ color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.12 }}>
                            {initials}
                          </motion.span>
                        ) : (
                          <motion.div key="icon" className="relative" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.12 }}>
                            <User size={24} className="text-brand-cyan" />
                            {/* Scanning line effect */}
                            <motion.div 
                              className="absolute left-0 right-0 h-[2px] bg-brand-cyan/40"
                              animate={{ top: ['0%', '100%', '0%'] }}
                              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                    {!initials && (
                      <div className="absolute -inset-1 rounded-[24px] border border-brand-cyan/20 animate-pulse pointer-events-none" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-black leading-tight tracking-tight" style={{ color: 'var(--hub-text)' }}>{t('welcome')}</h2>
                    <p className="text-sm font-medium" style={{ color: 'var(--hub-muted)' }}>{t('loginDesc')}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative group/input">
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
                    
                    {/* Input focus accent border */}
                    <div className={`absolute bottom-0 left-6 right-6 h-[1px] transition-all duration-300 ${inputFocused ? 'opacity-100' : 'opacity-0'}`}
                      style={{ background: `linear-gradient(90deg, transparent, ${CYAN}, transparent)` }}
                    />
                  </div>

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
                    {/* Shimmer effect */}
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
                </form>

                <div className="mt-8 pt-6 flex items-center justify-between" style={{ borderTop: '1px solid var(--hub-border)' }}>
                  <span className="text-[11px] font-bold opacity-60" style={{ color: 'var(--hub-text)' }}>{t('nameNotFound')}</span>
                  <Link href={`/${locale}/login`} className="text-[11px] font-bold tracking-tight text-brand-cyan hover:underline decoration-2 underline-offset-4 transition-all">{t('staffLogin')}</Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Mobile module chips */}
          <motion.div 
            variants={STAGGER_CONTAINER}
            className="lg:hidden flex flex-wrap gap-2.5 justify-center mt-8"
          >
            {MODULES.map((m, i) => (
              <motion.span 
                key={i} 
                variants={STAGGER_ITEM}
                className="flex items-center gap-2 text-[10px] font-bold px-3.5 py-1.5 rounded-full shadow-sm" 
                style={{ background: m.bg, border: `1px solid ${m.color}25`, color: m.color }}
              >
                <m.Icon size={12} />{t(m.labelKey)}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
