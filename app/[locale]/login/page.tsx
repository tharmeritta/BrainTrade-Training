'use client';

import { useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Lock, ClipboardCheck, GraduationCap, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';

type Tab = 'admin' | 'trainer' | 'evaluator';

const T = {
  bg:     '#070D1A',
  card:   'rgba(10,20,36,0.92)',
  border: 'rgba(255,255,255,0.08)',
  text:   '#E8F4FF',
  sub:    '#4A6A8A',
  dim:    '#1E3550',
};

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
      // manager, admin, and trainer all use the admin panel
      const redirect = (['manager', 'admin', 'trainer'].includes(data.role)) ? `/${locale}/admin` : cfg.redirect;
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
      style={{ background: T.bg, fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      {/* Background orb */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: 'absolute', width: 480, height: 480,
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${cfg.glow}, transparent 70%)`,
          borderRadius: '50%',
          transition: 'background 0.5s',
        }} />
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.022,
          backgroundImage: `linear-gradient(rgba(0,180,216,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,216,0.8) 1px, transparent 1px)`,
          backgroundSize: '52px 52px',
        }} />
      </div>

      <div className="relative z-10 w-full max-w-sm px-4">
        {/* Back link */}
        <Link href={`/${locale}/dashboard`}
          className="flex items-center gap-1.5 text-xs mb-6 transition-colors"
          style={{ color: T.sub }}
          onMouseEnter={e => { e.currentTarget.style.color = T.text; }}
          onMouseLeave={e => { e.currentTarget.style.color = T.sub; }}>
          <ArrowLeft size={12} /> {t('backToMain')}
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-7">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #00B4D8, #0050E0)' }}>B</div>
          <span className="font-black text-base" style={{ color: T.text }}>BrainTrade Training</span>
        </div>

        {/* Card */}
        <div className="rounded-3xl overflow-hidden" style={{
          background: T.card,
          border: `1px solid ${cfg.accent}20`,
          backdropFilter: 'blur(20px)',
          boxShadow: `0 24px 64px rgba(0,0,0,0.45)`,
          transition: 'border-color 0.4s',
          padding: '28px',
        }}>
          {/* Tab switcher */}
          <div className="flex gap-1 p-1 rounded-xl mb-6"
            style={{ background: 'rgba(255,255,255,0.04)' }}>
            {(['admin', 'trainer', 'evaluator'] as Tab[]).map(r => {
              const c = TABS[r];
              const Icon = c.Icon;
              const active = role === r;
              return (
                <button key={r} onClick={() => switchRole(r)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                    color: active ? c.accent : T.sub,
                    border: `1px solid ${active ? c.accent + '28' : 'transparent'}`,
                  }}>
                  <Icon size={13} />
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* Heading */}
          <AnimatePresence mode="wait">
            <motion.div key={role}
              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.18 }}
              className="mb-5">
              <h2 className="text-lg font-black mb-1" style={{ color: T.text }}>
                {t('loginAs', { role: cfg.label })}
              </h2>
              <p className="text-xs" style={{ color: T.sub }}>{cfg.desc}</p>
            </motion.div>
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-wider mb-1.5"
                style={{ color: T.sub }}>{t('username')}</label>
              <input
                type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder={t('usernamePlaceholder')} required
                className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white outline-none transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                onFocus={e => { e.currentTarget.style.borderColor = cfg.accent + '40'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium uppercase tracking-wider mb-1.5"
                style={{ color: T.sub }}>{t('password')}</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')} required
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm text-white outline-none transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onFocus={e => { e.currentTarget.style.borderColor = cfg.accent + '40'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: T.sub }}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} className="text-xs text-red-400 pt-0.5">
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold mt-1"
              style={{
                background: `linear-gradient(135deg, ${cfg.accent}, ${role === 'admin' ? '#0050E0' : role === 'trainer' ? '#D97706' : '#059669'})`,
                color: '#fff',
                boxShadow: `0 6px 20px ${cfg.glow}`,
                opacity: loading ? 0.7 : 1,
              }}
              whileHover={!loading ? { scale: 1.01 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              {loading ? <Loader2 size={15} className="animate-spin" />
                : t('signIn')}
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
}
