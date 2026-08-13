'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Sparkles, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { BackgroundEffects } from '@/components/ui/BackgroundEffects';

export default function JoinWavePage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState('th');
  useEffect(() => {
    params.then(p => setLocale(p.locale));
  }, [params]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get('code') || '';

  const [code, setCode] = useState(codeFromUrl);
  const [agentName, setAgentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [waveInfo, setWaveInfo] = useState<{ name: string; trainerName: string; totalDays: number } | null>(null);
  const [error, setError] = useState('');

  // Auto verify if code present in URL
  useEffect(() => {
    if (codeFromUrl.trim()) {
      verifyCode(codeFromUrl.trim());
    }
  }, [codeFromUrl]);

  async function verifyCode(inputCode: string) {
    if (!inputCode.trim()) return;
    setVerifying(true);
    setError('');
    try {
      const res = await fetch(`/api/join?code=${encodeURIComponent(inputCode.trim())}`);
      const data = await res.json();
      if (res.ok && data.period) {
        setWaveInfo(data.period);
      } else {
        setWaveInfo(null);
        setError(data.error || 'Invalid invite code');
      }
    } catch {
      setError('Network error checking code');
    } finally {
      setVerifying(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || !agentName.trim()) {
      setError('Please provide both the invite code and your full name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), agentName: agentName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to join wave');
      }

      // Store local session identity
      localStorage.setItem('agent_name', data.agent.name);
      localStorage.setItem('agent_id', data.agent.id);

      // Redirect to training dashboard
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-dvh w-full overflow-y-auto pt-safe pb-safe flex items-center justify-center relative p-4 py-8"
      style={{ background: 'var(--hub-bg)', fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <BackgroundEffects />

      <div className="relative z-10 w-full max-w-[440px] px-2 sm:px-6">
        <Link href={`/${locale}`}
          className="group inline-flex items-center gap-2 min-h-[44px] text-xs font-bold mb-6 transition-all hover:translate-x-[-4px]"
          style={{ color: 'var(--hub-muted)' }}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 group-hover:bg-brand-cyan/10 transition-all">
            <ArrowLeft size={14} className="group-hover:text-brand-cyan transition-colors" />
          </div>
          Back to Portal
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.4), rgba(168,85,247,0.2))',
            borderRadius: 32,
            padding: 1,
            boxShadow: '0 40px 80px -20px rgba(0,0,0,0.25)'
          }}
        >
          <div style={{ background: 'var(--entry-card-bg)', borderRadius: 31, backdropFilter: 'blur(16px)', padding: '32px 28px' }}>
            
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
                <UserPlus size={20} />
              </div>
              <div>
                <h1 className="text-xl font-black text-foreground tracking-tight">Join Training Wave</h1>
                <p className="text-xs text-muted-foreground font-medium">Self-onboarding with Wave Invite Code</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleJoin} className="space-y-4">
              
              {/* Wave Code */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Wave Invite Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={code}
                    onChange={e => {
                      const val = e.target.value.toUpperCase();
                      setCode(val);
                      if (val.length >= 7) verifyCode(val);
                    }}
                    placeholder="e.g. WAVE-8K3P"
                    required
                    className="w-full px-4 min-h-[44px] rounded-2xl text-sm font-black uppercase tracking-wider outline-none transition-all border border-border/60 bg-secondary/30 text-foreground focus:border-blue-500/80"
                  />
                  {verifying && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 size={16} className="animate-spin text-blue-500" />
                    </div>
                  )}
                </div>
              </div>

              {/* Verified Wave Banner */}
              <AnimatePresence>
                {waveInfo && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3"
                  >
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-black text-emerald-600 dark:text-emerald-400">{waveInfo.name}</p>
                      <p className="text-[11px] text-muted-foreground">Trainer: {waveInfo.trainerName} · {waveInfo.totalDays} Days Program</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Trainee Full Name */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Full Name (English)
                </label>
                <input
                  type="text"
                  value={agentName}
                  onChange={e => setAgentName(e.target.value)}
                  placeholder="e.g. John Smith"
                  required
                  className="w-full px-4 min-h-[44px] rounded-2xl text-sm font-medium outline-none transition-all border border-border/60 bg-secondary/30 text-foreground focus:border-blue-500/80"
                />
              </div>

              {/* Error Banner */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20"
                  >
                    <AlertCircle size={14} className="text-red-400" />
                    <span className="text-xs font-bold text-red-400">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {loading ? 'Joining Training Wave...' : 'Join & Start Training'}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
