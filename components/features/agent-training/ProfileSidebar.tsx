'use client';

import React, { memo, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, CheckCircle2, Lock, Trophy, Target, ChevronRight, RefreshCw } from 'lucide-react';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { FADE_IN, EASE, TRANSITION } from '@/lib/animations';
import { StepState } from '@/lib/training';
import { STEPS, BADGE, BadgeType } from '@/constants/training';
import Link from 'next/link';

interface ProfileSidebarProps {
  agentName: string;
  agentStageName?: string;
  score: number;
  ringColor: string;
  initials: string;
  allDone: boolean;
  currentStep?: typeof STEPS[number];
  badgeCfg: typeof BADGE[BadgeType];
  pct: number;
  derived: Record<string, StepState>;
  onLogout: () => void;
  onSync?: () => Promise<void>;
  t: (key: string, values?: any) => string;
  navT: (key: string) => string;
  locale: string;
}

const SectionDivider = memo(({ label }: { label: string }) => (
  <div className="flex items-center gap-3 w-full max-w-[260px] my-6">
    <div className="flex-1 h-px bg-[color:var(--hub-border)] opacity-60" />
    <span className="text-[10px] font-black uppercase tracking-[0.25em] shrink-0 text-[color:var(--hub-dim)]">
      {label}
    </span>
    <div className="flex-1 h-px bg-[color:var(--hub-border)] opacity-60" />
  </div>
));

SectionDivider.displayName = 'SectionDivider';

export const ProfileSidebar = memo(({
  agentName,
  agentStageName,
  score,
  ringColor,
  initials,
  allDone,
  currentStep,
  badgeCfg,
  pct,
  derived,
  onLogout,
  onSync,
  t,
  navT,
  locale
}: ProfileSidebarProps) => {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    if (!onSync || syncing) return;
    setSyncing(true);
    await onSync();
    setSyncing(false);
  };

  return (
    <motion.div
      variants={FADE_IN}
      initial="initial"
      animate="animate"
      className="relative z-10 flex flex-col items-center shrink-0
        w-full px-7 py-6 lg:py-10
        border-b border-[color:var(--hub-border)]
        lg:w-[300px] lg:px-8 lg:h-full lg:overflow-y-auto
        lg:border-b-0 lg:border-r bg-[color:var(--hub-panel)]"
    >
      <div className="flex flex-col items-center w-full">
        <div className="relative mb-3 lg:mb-4 scale-90 lg:scale-100">
          <div className="absolute inset-0 rounded-full scale-[1.5] blur-[12px]"
            style={{
              background: `radial-gradient(circle, ${ringColor}20 30%, transparent 70%)`,
            }} />
          <ScoreRing score={score} color={ringColor} size={116} />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            <span className="text-2xl font-black leading-none text-[color:var(--hub-text)]">{initials}</span>
            <span className="text-sm font-black" style={{ color: ringColor }}>{score}%</span>
          </div>
        </div>

        <h2 className="text-lg font-black text-center leading-snug mb-0.5 text-[color:var(--hub-text)]">
          {agentName}
        </h2>
        {agentStageName && (
          <p className="text-xs font-semibold text-center mb-1 opacity-85" style={{ color: ringColor }}>
            &quot;{agentStageName}&quot;
          </p>
        )}

        <div className="mb-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
          style={{
            background: allDone ? 'rgba(251,191,36,0.08)' : currentStep ? `${currentStep.color}10` : 'var(--hub-locked-bg)',
            borderColor: allDone ? 'rgba(251,191,36,0.25)' : currentStep ? currentStep.color + '30' : 'var(--hub-dim-border)',
          }}>
          {allDone ? (
            <><CheckCircle2 size={10} style={{ color: '#FBBF24' }} />
              <span className="text-[10px] font-black uppercase tracking-tight" style={{ color: '#FBBF24' }}>{t('pendingFinalEval')}</span></>
          ) : currentStep ? (
            <><currentStep.Icon size={10} style={{ color: currentStep.color }} />
              <span className="text-[10px] font-medium text-[color:var(--hub-dim)]">{t('training')}</span>
              <span className="text-[10px] font-black" style={{ color: currentStep.color }}>{navT(currentStep.labelKey)}</span>
              <span className="text-[9px] font-medium text-[color:var(--hub-dim)]">· {t('step', { step: currentStep.step })}</span></>
          ) : (
            <span className="text-[10px] font-medium text-[color:var(--hub-dim)]">{t('startTraining')}</span>
          )}
        </div>

        <span
          className="text-[11px] px-3.5 py-1.5 rounded-full font-black tracking-wide border"
          style={{ background: badgeCfg.bg, borderColor: badgeCfg.border, color: badgeCfg.color }}
        >
          ★ {badgeCfg.label}
        </span>
      </div>

      {/* Next Action Button */}
      {!allDone && currentStep && (
        <div className="w-full mt-6 px-1">
          <Link 
            href={currentStep.id === 'learn' ? `/${locale}/learn` : currentStep.id === 'quiz' ? `/${locale}/quiz` : `/${locale}/ai-eval`}
            className="flex items-center justify-between w-full p-4 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20">
                <Target size={18} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70 leading-none mb-1">Next Task</p>
                <p className="text-sm font-black leading-none">{navT(currentStep.labelKey)}</p>
              </div>
            </div>
            <ChevronRight size={18} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      )}

      <SectionDivider label={t('progress')} />

      <div className="w-full max-w-[260px]">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--hub-muted)]">
            {t('passedModules')}
          </span>
          <span className="text-[11px] font-black text-[color:var(--hub-text)]">{pct}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden mb-4 bg-[color:var(--hub-progress-bg)]">
          <motion.div className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ delay: 0.5, duration: 1.2, ease: EASE.smooth }}
            style={{ background: 'linear-gradient(90deg, #818CF8, #60A5FA, #F472B6)' }} />
        </div>

        <div className="flex gap-2.5">
          {STEPS.map(s => {
            const st = derived[s.id];
            return (
              <div key={s.id} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center border transition-all duration-300"
                  style={{
                    background: st.passed ? `${s.color}20` : st.locked ? 'var(--hub-locked-bg)' : `${s.color}10`,
                    borderColor: st.passed ? s.color + '55' : st.locked ? 'var(--hub-dim-border)' : s.color + '25',
                    boxShadow: st.passed ? `0 2px 8px ${s.color}22` : 'none',
                  }}>
                  {st.passed
                    ? <CheckCircle2 size={13} style={{ color: s.color }} />
                    : st.locked ? <Lock size={10} style={{ color: 'var(--hub-dim)' }} />
                    : <s.Icon size={12} style={{ color: s.color }} />
                  }
                </div>
                <span className="text-[8px] font-semibold text-center leading-tight"
                  style={{ color: st.locked ? 'var(--hub-dim)' : st.passed ? s.color + 'CC' : 'var(--hub-muted)' }}>
                  {navT(s.labelKey)}
                </span>
              </div>
            );
          })}
        </div>

        {allDone && (
          <div className="flex flex-col gap-2 mt-6">
            <motion.div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl w-full justify-center border"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={TRANSITION.spring}
              style={{ background: 'rgba(251,191,36,0.08)', borderColor: 'rgba(251,191,36,0.22)' }}>
              <Trophy size={14} style={{ color: '#FBBF24' }} />
              <span className="text-[11px] font-black" style={{ color: '#FBBF24' }}>{t('allFinished')}</span>
            </motion.div>
          </div>
        )}
      </div>

      <div className="mt-auto w-full pt-8 flex flex-col gap-3 items-center">
        {onSync && (
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-medium transition-all
              text-[color:var(--hub-muted)] border border-[color:var(--hub-border)]
              hover:text-primary hover:border-primary/30 hover:bg-primary/5 w-full justify-center disabled:opacity-50"
          >
            <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
            <span>{syncing ? 'Syncing...' : 'Sync Progress'}</span>
          </button>
        )}
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-medium transition-all
            text-[color:var(--hub-muted)] border border-[color:var(--hub-border)]
            hover:text-red-500 hover:border-red-300 hover:bg-red-50
            dark:hover:border-red-500/30 dark:hover:bg-red-500/10 w-full justify-center"
        >
          <LogOut size={12} />
          <span>{navT('logout')}</span>
        </button>
      </div>
    </motion.div>
  );
});

ProfileSidebar.displayName = 'ProfileSidebar';
