'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  ArrowRight, Loader2, AlertCircle, User,
  Bot, BookOpen, Settings, Lock, ArrowLeft
} from 'lucide-react';
import { BackgroundEffects } from '@/components/ui/BackgroundEffects';
import { EASE, FADE_IN, STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animations';
import { getAgentSession, MOCKUP_AGENT_ID } from '@/lib/agent-session';
import { useSession } from '@/components/features/SessionProvider';

// Sub-components
import { BrandingPanel } from './agent-entry/BrandingPanel';
import { ReturningUserBanner } from './agent-entry/ReturningUserBanner';

const CYAN = '#00B4D8';
const PURPLE = '#7C3AED';

interface AgentEntryProps {
  onAgentSelected: (id: string, name: string, stageName: string) => void;
}

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

export default function AgentEntry({ onAgentSelected }: AgentEntryProps) {
  const t = useTranslations('agentEntry');
  const tCommon = useTranslations('common');
  const { setAgent, logoutAgent } = useSession();
  const [name, setName]                   = useState('');
  const [loading, setLoading]             = useState(true);
  const [submitting, setSubmitting]       = useState(false);
  const [error, setError]                 = useState('');
  const [returning, setReturning]         = useState<{ id: string; name: string; stageName: string } | null>(null);
  const [inputFocused, setInputFocused]   = useState(false);
  const [loginPrompt, setLoginPrompt]     = useState(false);
  const [shakeKey, setShakeKey]           = useState(0);
  const [features, setFeatures]           = useState<{ allowMockupMode: boolean }>({ allowMockupMode: true });

  const inputRef     = useRef<HTMLInputElement>(null);
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const router       = useRouter();
  const locale       = pathname?.split('/')[1] || 'th';

  useEffect(() => {
    // Detect redirect from guarded nav
    if (searchParams.get('loginRequired') === '1') {
      setLoginPrompt(true);
      setShakeKey(k => k + 1);
      router.replace(`/${locale}/login/agent`, { scroll: false });
      setTimeout(() => inputRef.current?.focus(), 400);
    }

    // Load session
    const session = getAgentSession();
    if (session) setReturning(session);

    // Fetch public features config only (removed /api/agents fetch)
    fetch('/api/config/public')
      .then(r => r.json())
      .then(d => {
        if (d.features) setFeatures(d.features);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    setTimeout(() => inputRef.current?.focus(), 500);
  }, [searchParams, locale, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanName = normalizeName(name);
    if (!cleanName || submitting) return;
    
    setSubmitting(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/agent-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error === 'Agent not found' ? t('matchError') : (data.error || 'Login failed'));
        setSubmitting(false);
        return;
      }

      setAgent({ id: data.id, name: data.name, stageName: data.stageName });
      onAgentSelected(data.id, data.name, data.stageName);
    } catch (err: any) {
      setError('Connection error');
      setSubmitting(false);
    }
  }

  async function handleMockupLogin() {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 600));
    const mockName = t('mockupName');
    setAgent({ id: MOCKUP_AGENT_ID, name: mockName, stageName: 'Demo Agent' });
    onAgentSelected(MOCKUP_AGENT_ID, mockName, 'Demo Agent');
  }

  const handleClearReturning = () => {
    logoutAgent();
    setReturning(null);
  };

  const canSubmit  = !!name.trim() && !loading;
  const initials   = name.trim().length >= 2 ? getInitials(name) : null;
  const floatLabel = inputFocused || !!name.trim();

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      variants={STAGGER_CONTAINER}
      className="relative w-full h-full overflow-hidden flex" 
      style={{ background: 'var(--hub-bg)', fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <BackgroundEffects />

      {/* LEFT PANEL: Branding (Extracted) */}
      <BrandingPanel />

      {/* RIGHT PANEL: Login */}
      <div className="relative flex items-center justify-center w-full lg:w-[460px] xl:w-[500px] shrink-0 px-6 py-10 overflow-y-auto z-10">
        <div className="relative w-full max-w-[400px]">
          {/* Mobile-only header */}
          <motion.div variants={FADE_IN} className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 mb-4">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-brand-cyan" />
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-brand-cyan">{tCommon('appName')}</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--hub-text)' }}
              dangerouslySetInnerHTML={{ __html: t.raw('title') }}
            />
          </motion.div>

          <motion.div variants={FADE_IN}>
            <Link href={`/${locale}`}
              className="group inline-flex items-center gap-2 text-xs font-bold mb-6 transition-all hover:translate-x-[-4px]"
              style={{ color: 'var(--hub-muted)' }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 group-hover:bg-brand-cyan/10 group-hover:border-brand-cyan/20 transition-all">
                <ArrowLeft size={14} className="group-hover:text-brand-cyan transition-colors" />
              </div>
              {t('back')}
            </Link>
          </motion.div>

          <motion.div
            variants={FADE_IN}
            className="relative group"
            style={{ 
              background: `linear-gradient(135deg, rgba(0,180,216,0.3), rgba(124,58,237,0.2), rgba(0,180,216,0.1))`, 
              borderRadius: 36, 
              padding: 1, 
              boxShadow: `
                0 40px 80px -20px rgba(0,0,0,0.3),
                0 0 0 1px rgba(255,255,255,0.05),
                inset 0 0 20px rgba(255,255,255,0.02)
              `
            }}
          >
            {/* Animated border glow - Simplified */}
            <motion.div 
              className="absolute -inset-[1px] rounded-[36px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{ 
                background: `linear-gradient(45deg, ${CYAN}33, ${PURPLE}33, ${CYAN}33)`,
                filter: 'blur(4px)',
                willChange: 'opacity'
              }}
            />

            <div style={{ background: 'var(--entry-card-bg)', borderRadius: 31, backdropFilter: 'blur(16px)', overflow: 'hidden', position: 'relative' }}>
              {/* Top-bar gradient - Optimized with will-change */}
              <motion.div 
                className="absolute top-0 left-0 right-0 h-[3px] z-20"
                animate={{ 
                  opacity: [0.7, 1, 0.7]
                }}
                style={{ 
                  background: `linear-gradient(90deg, ${CYAN}, ${PURPLE}, ${CYAN})`,
                  backgroundSize: '200% 100%',
                  willChange: 'opacity'
                }}
                transition={{ 
                  opacity: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                }}
              />

              <div style={{ padding: '36px 32px' }}>
                {/* Login-required prompt */}
                <AnimatePresence>
                  {loginPrompt && (
                    <motion.div
                      key="login-prompt"
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
                <motion.div 
                  variants={STAGGER_CONTAINER}
                  className="flex items-center gap-5 mb-10"
                >
                  <div className="relative">
                    <motion.div
                      variants={STAGGER_ITEM}
                      className="w-16 h-16 rounded-[24px] flex items-center justify-center text-xl font-black shrink-0 overflow-hidden z-10 relative"
                      style={{
                        background: initials ? `linear-gradient(135deg, ${CYAN}, ${PURPLE})` : 'rgba(0,180,216,0.05)',
                        border: `1px solid ${initials ? 'transparent' : 'rgba(0,180,216,0.15)'}`,
                        boxShadow: initials ? `0 12px 24px -6px ${CYAN}66` : 'none',
                      }}
                    >
                      <AnimatePresence mode="wait">
                        {initials ? (
                          <motion.span key="initials" style={{ color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.12 }}>
                            {initials}
                          </motion.span>
                        ) : (
                          <motion.div key="icon" className="relative flex items-center justify-center w-full h-full" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.12 }}>
                            <User size={28} className="text-brand-cyan/80" />
                            <motion.div 
                              className="absolute left-0 right-0 h-[3px] bg-brand-cyan shadow-[0_0_10px_rgba(0,180,216,0.8)]"
                              animate={{ top: ['-10%', '110%', '-10%'] }}
                              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                            />
                            <motion.div 
                              className="absolute inset-0 border-2 border-brand-cyan/20 rounded-[24px]"
                              animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                  <motion.div variants={STAGGER_ITEM}>
                    <h2 className="text-2xl font-black leading-tight tracking-tight text-[color:var(--hub-text)]">{t('welcome')}</h2>
                    <p className="text-sm font-bold opacity-60" style={{ color: 'var(--hub-muted)' }}>{t('loginDesc')}</p>
                  </motion.div>
                </motion.div>

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
                </motion.form>

                <motion.div variants={STAGGER_ITEM} className="mt-8 pt-6 flex items-center justify-between" style={{ borderTop: '1px solid var(--hub-border)' }}>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold opacity-60" style={{ color: 'var(--hub-text)' }}>{t('nameNotFound')}</span>
                    {features.allowMockupMode && (
                      <button 
                        type="button"
                        onClick={handleMockupLogin}
                        className="text-[11px] font-black text-brand-cyan hover:brightness-125 transition-all text-left uppercase tracking-wider"
                      >
                        {t('mockupBtn')}
                      </button>
                    )}
                  </div>
                </motion.div>
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
        </div>
      </div>
    </motion.div>
  );
}
