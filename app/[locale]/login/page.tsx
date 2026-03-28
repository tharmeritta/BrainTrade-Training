'use client';

import { useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Lock, ClipboardCheck, GraduationCap, ArrowLeft, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, signInWithCustomToken } from 'firebase/auth';
import { BackgroundEffects } from '@/components/ui/BackgroundEffects';

type Tab = 'admin' | 'trainer' | 'evaluator' | 'hr';

const CYAN = '#00B4D8';
const PURPLE = '#7C3AED';

export default function LoginPage() {
  const t = useTranslations('auth');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] ?? 'th';
  
  const [role, setRole]         = useState<Tab>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  const TABS = useMemo(() => ({
    admin: {
      Icon: Lock,
      label: t('roles.manager.label'),
      accent: '#00B4D8',
      glow: 'rgba(0,180,216,0.12)',
      redirect: `/${locale}/admin`,
      desc: t('roles.manager.desc'),
    },
    hr: {
      Icon: ClipboardCheck,
      label: t('roles.hr.label'),
      accent: '#8B5CF6',
      glow: 'rgba(139,92,246,0.12)',
      redirect: `/${locale}/admin`,
      desc: t('roles.hr.desc'),
    },
    trainer: {
      Icon: GraduationCap,
      label: t('roles.trainer.label'),
      accent: '#F59E0B',
      glow: 'rgba(245,158,11,0.12)',
      redirect: `/${locale}/admin`,
      desc: t('roles.trainer.desc'),
    },
    evaluator: {
      Icon: ClipboardCheck,
      label: t('roles.evaluator.label'),
      accent: '#34D399',
      glow: 'rgba(52,211,153,0.12)',
      redirect: `/${locale}/evaluator`,
      desc: t('roles.evaluator.desc'),
    },
  }), [t, locale]);

  const cfg = TABS[role];

  function switchRole(r: Tab) {
    setRole(r);
    setError('');
    setUsername('');
    setPassword('');
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();

      // Sign in to Firebase Client SDK
      if (data.firebaseToken) {
        try {
          await signInWithCustomToken(auth, data.firebaseToken);
        } catch (fbErr) {
          console.warn('Firebase Custom Token Sign-in failed:', fbErr);
        }
      }

      const redirect = (['manager', 'admin', 'trainer', 'hr', 'it'].includes(data.role)) ? `/${locale}/admin` : cfg.redirect;
      router.push(redirect);
    } catch {
      setError(t('invalid'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="h-screen w-screen overflow-hidden flex items-center justify-center relative"
      style={{ background: 'var(--hub-bg)', fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <BackgroundEffects />

      <div className="relative z-10 w-full max-w-[440px] px-6">
        <Link href={`/${locale}`}
          className="group inline-flex items-center gap-2 text-xs font-bold mb-8 transition-all hover:translate-x-[-4px]"
          style={{ color: 'var(--hub-muted)' }}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 group-hover:bg-brand-cyan/10 group-hover:border-brand-cyan/20 transition-all">
            <ArrowLeft size={14} className="group-hover:text-brand-cyan transition-colors" />
          </div>
          {t('backToMain')}
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group"
          style={{ 
            background: `linear-gradient(135deg, ${cfg.accent}66, ${PURPLE}33)`, 
            borderRadius: 32, 
            padding: 1, 
            boxShadow: '0 40px 80px -20px rgba(0,0,0,0.25)' 
          }}
        >
          {/* Animated border glow */}
          <div className="absolute -inset-[1px] rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm pointer-events-none"
            style={{ background: `linear-gradient(90deg, transparent, ${cfg.accent}44, transparent)` }}
          />

          <div style={{ background: 'var(--entry-card-bg)', borderRadius: 31, backdropFilter: 'blur(32px)', overflow: 'hidden', position: 'relative' }}>
            {/* Dynamic top-bar gradient */}
            <motion.div 
              className="absolute top-0 left-0 right-0 h-[3px]"
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              style={{ 
                background: `linear-gradient(90deg, ${cfg.accent}, ${PURPLE}, ${cfg.accent})`,
                backgroundSize: '200% 100%'
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />

            <div style={{ padding: '36px 32px' }}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${cfg.accent}, #0050E0)` }}>B</div>
                <div>
                  <h1 className="text-xl font-black tracking-tight" style={{ color: 'var(--hub-text)' }}>BrainTrade</h1>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60" style={{ color: 'var(--hub-text)' }}>Training Platform</p>
                </div>
              </div>

              <div className="flex gap-1.5 p-1.5 rounded-2xl mb-8"
                style={{ background: 'var(--entry-input-bg)', border: '1px solid var(--hub-border)' }}>
                {(['admin', 'hr', 'trainer', 'evaluator'] as Tab[]).map(r => {
                  const c = TABS[r];
                  const Icon = c.Icon;
                  const active = role === r;
                  return (
                    <button key={r} onClick={() => switchRole(r)}
                      className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all relative overflow-hidden"
                      style={{
                        background: active ? 'var(--hub-card)' : 'transparent',
                        color: active ? c.accent : 'var(--hub-muted)',
                        boxShadow: active ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                      }}>
                      <Icon size={16} />
                      <span className="text-[10px] font-black uppercase tracking-wider">{c.label}</span>
                      {active && (
                        <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: c.accent }} />
                      )}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={role}
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
                  className="mb-6">
                  <h2 className="text-lg font-black tracking-tight mb-1" style={{ color: 'var(--hub-text)' }}>
                    {t('loginAs', { role: cfg.label })}
                  </h2>
                  <p className="text-xs font-medium" style={{ color: 'var(--hub-muted)' }}>{cfg.desc}</p>
                </motion.div>
              </AnimatePresence>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider ml-1"
                    style={{ color: 'var(--hub-muted)' }}>{t('username')}</label>
                  <input
                    type="text" value={username} onChange={e => setUsername(e.target.value)}
                    placeholder={t('usernamePlaceholder')} required
                    className="w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none transition-all"
                    style={{ background: 'var(--entry-input-bg)', border: '1px solid var(--hub-border)', color: 'var(--hub-text)' }}
                    onFocus={e => { e.currentTarget.style.borderColor = cfg.accent + '80'; e.currentTarget.style.boxShadow = `0 0 20px -5px ${cfg.accent}20`; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--hub-border)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider ml-1"
                    style={{ color: 'var(--hub-muted)' }}>{t('password')}</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={t('passwordPlaceholder')} required
                      className="w-full px-4 py-3 pr-12 rounded-2xl text-sm font-medium outline-none transition-all"
                      style={{ background: 'var(--entry-input-bg)', border: '1px solid var(--hub-border)', color: 'var(--hub-text)' }}
                      onFocus={e => { e.currentTarget.style.borderColor = cfg.accent + '80'; e.currentTarget.style.boxShadow = `0 0 20px -5px ${cfg.accent}20`; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'var(--hub-border)'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:text-white"
                      style={{ color: 'var(--hub-muted)' }}>
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20"
                    >
                      <AlertCircle size={14} className="text-red-400" />
                      <span className="text-xs font-bold text-red-400">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit" disabled={loading}
                  className="group relative w-full flex items-center justify-center gap-2.5 py-4 rounded-[18px] font-black text-base mt-2 overflow-hidden transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${cfg.accent}, ${role === 'admin' ? '#0050E0' : role === 'trainer' ? '#D97706' : '#059669'})`,
                    color: '#fff',
                    boxShadow: `0 10px 25px -5px ${cfg.accent}40`,
                  }}
                  whileHover={!loading ? { scale: 1.02, y: -1 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                >
                  {/* Shimmer effect */}
                  {!loading && (
                    <motion.div 
                      className="absolute inset-0 w-1/2 h-full skew-x-[-25deg] pointer-events-none"
                      animate={{ left: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}
                    />
                  )}
                  {loading ? <Loader2 size={20} className="animate-spin" /> : t('signIn')}
                </motion.button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
