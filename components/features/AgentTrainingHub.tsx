'use client';

import React, { useMemo, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  CheckCircle2, XCircle, Lock, GraduationCap, ClipboardList, Mic,
  Trophy, RotateCcw, ArrowRight, LogOut, Zap
} from 'lucide-react';

import type { AgentStats } from '@/types';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { EASE, TRANSITION, FADE_IN, STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animations';
import { getCompletionStatus } from '@/lib/completion';


// ─── Constants & Types ────────────────────────────────────────────────────────

const STEPS = [
  { id: 'learn'   as const, step: 1, labelKey: 'learn',  sublabelKey: 'study',   descKey: 'productProcess', Icon: GraduationCap, color: '#818CF8', glow: 'rgba(129,140,248,0.18)' },
  { id: 'quiz'    as const, step: 2, labelKey: 'quiz',   sublabelKey: 'test',    descKey: 'quizDesc',  Icon: ClipboardList, color: '#60A5FA', glow: 'rgba(96,165,250,0.15)'  },
  { id: 'ai-eval' as const, step: 3, labelKey: 'aiEval', sublabelKey: 'analyse', descKey: 'aiEvalDesc',   Icon: Mic,           color: '#F472B6', glow: 'rgba(244,114,182,0.15)' },
] as const;

type StepId = typeof STEPS[number]['id'];

interface StepState { 
  locked: boolean; 
  passed: boolean; 
  score?: number; 
}

const BADGE = {
  elite:        { color: '#FBBF24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)',  label: 'Elite'      },
  strong:       { color: '#60A5FA', bg: 'rgba(96,165,250,0.10)',  border: 'rgba(96,165,250,0.3)',  label: 'Strong'     },
  developing:   { color: '#818CF8', bg: 'rgba(129,140,248,0.10)', border: 'rgba(129,140,248,0.3)', label: 'Developing' },
  'needs-work': { color: '#F87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)',label: 'Needs Work' },
} as const;

type BadgeType = keyof typeof BADGE;

// ─── Interfaces ─────────────────────────────────────────────────────────────

interface Props {
  agentName: string;
  agentId: string;
  agentStageName?: string;
  stats: AgentStats | null;
  onLogout: () => void;
}

interface ModuleCardProps {
  step: typeof STEPS[number];
  state: StepState;
  index: number;
  href: string;
}

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
  derived: Record<StepId, StepState>;
  onLogout: () => void;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function scoreColor(n: number) { 
  return n >= 70 ? '#60A5FA' : n >= 50 ? '#FBBF24' : '#F87171'; 
}

function deriveSteps(stats: AgentStats | null): Record<StepId, StepState> {
  const learnedCount = stats?.learnedModules?.length ?? 0;
  // product, kyc, website
  const isLearnPassed = learnedCount >= 3;
  
  const REQUIRED = ['foundation', 'product', 'process', 'payment'];
  const allQ = REQUIRED.every(id => !!stats?.quiz?.[id]?.passed);
  
  // AI Eval is done if they have completed level 4
  const completedLevels = stats?.evalCompletedLevels ?? [];
  const maxL = completedLevels.length > 0 ? Math.max(...completedLevels) : 0;
  // Step 3 is "passed" once they reach the max level (usually 4)
  const aiOk = maxL >= 4;
  
  const qs = REQUIRED
    .map(id => stats?.quiz?.[id]?.bestScore)
    .filter((s): s is number => s !== undefined);
  
  const avgQ = qs.length ? Math.round(qs.reduce((a, b) => a + b, 0) / qs.length) : undefined;

  // Level-based score: 25% per level, max 100%
  let aiScore = stats?.aiEval ? Math.round(stats.aiEval.avgScore) : undefined;
  if (completedLevels.length > 0) {
     aiScore = Math.min(100, maxL * 25);
  }

  return {
    learn:     { locked: false, passed: isLearnPassed, score: stats?.learnedModules && stats.learnedModules.length > 0 ? Math.round((stats.learnedModules.length / 3) * 100) : undefined },
    quiz:      { locked: false, passed: allQ,          score: avgQ },
    'ai-eval': { locked: false, passed: aiOk,          score: aiScore },
  };
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

/**
 * BackgroundEffects: Renders animated orbs, fractal noise, and a drifting grid.
 */
const BackgroundEffects = memo(({ badgeColor }: { badgeColor: string }) => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    {/* Noise Texture Overlay */}
    <div 
      className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] contrast-125 brightness-100 mix-blend-overlay" 
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
    />

    <motion.div 
      className="absolute w-[800px] h-[800px] -top-[200px] -left-[200px] rounded-full"
      style={{
        background: `radial-gradient(circle, ${badgeColor}0A 0%, transparent 70%)`,
      }}
      animate={{ x: [0, 40, 0], y: [0, 60, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div 
      className="absolute w-[600px] h-[600px] bottom-[-100px] right-[-100px] rounded-full"
      style={{
        background: `radial-gradient(circle, rgba(96,165,250,0.08) 0%, transparent 75%)`,
      }}
      animate={{ x: [0, -30, 0], y: [0, -50, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
    />
    
    <motion.div 
      className="absolute inset-0 opacity-[0.02]"
      style={{
        backgroundImage: `linear-gradient(var(--hub-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--hub-grid-color) 1px, transparent 1px)`,
        backgroundSize: '64px 64px',
      }}
      animate={{ backgroundPosition: ['0px 0px', '64px 64px'] }}
      transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
    />
  </div>
));

BackgroundEffects.displayName = 'BackgroundEffects';

/**
 * SectionDivider: A simple labeled divider.
 */
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

/**
 * ModuleCard: Displays an individual training module with its status and progress.
 * Redesigned as a vertical card for better grid layout and visual hierarchy.
 */
const ModuleCard = memo(({ step, state, index, href }: ModuleCardProps) => {
  const t = useTranslations('trainingHub');
  const navT = useTranslations('nav');
  const { Icon, color, glow, labelKey, sublabelKey, descKey, step: stepNum } = step;
  const { locked, passed, score } = state;
  const isNext    = !locked && !passed && score === undefined;
  const hasFailed = !locked && !passed && score !== undefined && score < 70;

  return (
    <motion.div
      variants={STAGGER_ITEM}
      className="group relative flex flex-col rounded-[2rem] overflow-hidden transition-all duration-500 h-full border"
      style={{
        background: locked ? 'var(--hub-locked-bg)' : 'var(--hub-card)',
        borderColor: locked 
          ? 'var(--hub-dim-border)' 
          : passed ? color + '40' 
          : hasFailed ? 'rgba(248,113,113,0.4)' 
          : isNext ? color + '30' 
          : 'var(--hub-border)',
        opacity: locked ? 0.65 : 1,
        boxShadow: isNext ? `0 12px 40px -12px ${color}25` : 'none',
      }}
    >
      {/* Top Section: Icon & Step */}
      <div className="p-7 pb-5 flex items-start justify-between relative z-10">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
          style={{
            background: locked ? 'rgba(0,0,0,0.04)' : `${color}15`,
            borderColor: locked ? 'var(--hub-dim-border)' : color + '30',
          }}>
          {passed
            ? <CheckCircle2 size={28} style={{ color }} />
            : locked ? <Lock size={20} style={{ color: 'var(--hub-dim)' }} />
            : hasFailed ? <XCircle size={28} style={{ color: '#F87171' }} />
            : <Icon size={28} style={{ color }} />
          }
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black tracking-[0.25em] opacity-40 uppercase mb-1"
            style={{ color: locked ? 'var(--hub-dim)' : color }}>
            Step {stepNum < 10 ? `0${stepNum}` : stepNum}
          </span>
          {isNext && (
            <motion.span 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg shadow-sm" 
              style={{ background: color, color: '#fff' }}>
              <Zap size={9} fill="currentColor" /> {t('next')}
            </motion.span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="px-7 flex-1 flex flex-col relative z-10">
        <div className="mb-1.5">
           <span className="text-[10px] font-black uppercase tracking-[0.18em] opacity-60" style={{ color: locked ? 'var(--hub-dim)' : color }}>
             {t(sublabelKey)}
           </span>
        </div>
        <h3 className="text-xl font-black text-[color:var(--hub-text)] mb-2.5 leading-tight group-hover:translate-x-1 transition-transform duration-300">
          {navT(labelKey)}
        </h3>
        <p className="text-[13px] leading-relaxed text-[color:var(--hub-muted)] mb-8 font-medium">
          {t(descKey)}
        </p>

        {/* Status badges for non-locked */}
        {!locked && (
           <div className="flex flex-wrap gap-2 mb-8">
             {passed && (
                <div className="px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-2"
                     style={{ background: `${color}10`, color, borderColor: color + '30' }}>
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
                  {t('passed')}
                </div>
             )}
             {hasFailed && (
                <div className="px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-500/20 flex items-center gap-2"
                     style={{ background: 'rgba(248,113,113,0.1)', color: '#F87171' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  {t('failed')}
                </div>
             )}
           </div>
        )}
      </div>

      {/* Bottom Section: Progress & Action */}
      <div className="p-7 pt-0 mt-auto relative z-10">
        {score !== undefined && !locked && (
          <div className="mb-6">
            <div className="flex justify-between items-end mb-2.5">
              <span className="text-[10px] font-black text-[color:var(--hub-dim)] uppercase tracking-widest">Performance</span>
              <span className="text-sm font-black" style={{ color: hasFailed ? '#F87171' : scoreColor(score) }}>{score}%</span>
            </div>
            <div className="h-2 rounded-full bg-[color:var(--hub-progress-bg)] overflow-hidden p-0.5 border border-white/5 shadow-inner">
               <motion.div 
                 className="h-full rounded-full shadow-[0_0_12px_rgba(0,0,0,0.1)]"
                 initial={{ width: 0 }}
                 animate={{ width: `${score}%` }}
                 transition={{ delay: 0.3, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                 style={{ background: hasFailed ? 'linear-gradient(90deg, #F87171, #EF4444)' : `linear-gradient(90deg, ${color}80, ${color})` }}
               />
            </div>
          </div>
        )}

        {locked ? (
          <div className="w-full flex items-center justify-center gap-2.5 py-4.5 rounded-2xl bg-[color:var(--hub-locked-bg)] border border-[color:var(--hub-dim-border)] text-[color:var(--hub-dim)] text-xs font-black uppercase tracking-widest opacity-80">
            <Lock size={14} /> {t('locked')}
          </div>
        ) : (
          <Link href={href}
            className="group/btn w-full flex items-center justify-center gap-2.5 py-4.5 rounded-2xl text-sm font-black transition-all duration-300 border shadow-sm hover:shadow-xl"
            style={{ 
              background: isNext ? color : `${color}12`,
              borderColor: isNext ? color : color + '40',
              color: isNext ? '#fff' : color,
              boxShadow: isNext ? `0 10px 25px -5px ${color}40` : 'none'
            }}
          >
            {passed ? (
              <><RotateCcw size={16} className="group-hover/btn:rotate-180 transition-transform duration-700" />{t('retake')}</>
            ) : (
              <>{t('startNow')}<ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1.5" /></>
            )}
          </Link>
        )}
      </div>

      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 w-32 h-32 blur-[80px] rounded-full opacity-20 pointer-events-none"
           style={{ background: color }} />
    </motion.div>
  );
});

ModuleCard.displayName = 'ModuleCard';

/**
 * ProfileSidebar: The left panel displaying agent info, badge, and overall progress.
 */
const ProfileSidebar = memo(({
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
  onLogout
}: ProfileSidebarProps) => {
  const t = useTranslations('trainingHub');
  const navT = useTranslations('nav');

  return (
    <motion.div
      variants={FADE_IN}
      initial="initial"
      animate="animate"
      className="relative z-10 flex flex-col items-center shrink-0
        w-full px-7 py-8
        border-b border-[color:var(--hub-border)]
        lg:w-[300px] lg:px-8 lg:py-10 lg:h-full lg:overflow-y-auto
        lg:border-b-0 lg:border-r bg-[color:var(--hub-panel)]"
    >
      <div className="flex flex-col items-center w-full">
        <div className="relative mb-4">
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
          <motion.div className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-2xl w-full justify-center border"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={TRANSITION.spring}
            style={{ background: 'rgba(251,191,36,0.08)', borderColor: 'rgba(251,191,36,0.22)' }}>
            <Trophy size={14} style={{ color: '#FBBF24' }} />
            <span className="text-[11px] font-black" style={{ color: '#FBBF24' }}>{t('allFinished')}</span>
          </motion.div>
        )}
      </div>

      <div className="mt-auto w-full pt-8 flex flex-col gap-3 items-center">
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

/**
 * ModuleHeader: The header section for the training modules list.
 */
const ModuleHeader = memo(({ doneCount }: { doneCount: number }) => {
  const t = useTranslations('trainingHub');
  return (
    <motion.div
      variants={FADE_IN}
      initial="initial"
      animate="animate"
      className="shrink-0 px-5 py-4 lg:px-6 border-b bg-[color:var(--hub-panel)]"
      style={{ borderColor: 'var(--hub-border)' }}
    >
      <div className="flex items-center gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.28em] mb-0.5 text-[color:var(--hub-dim)]">
            {t('progress')}
          </p>
          <h2 className="text-base font-black leading-none text-[color:var(--hub-text)]">
            {t('trainingModules')}
          </h2>
        </div>
        <div className="flex-1 h-px ml-1 bg-[color:var(--hub-border)]" />
        <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0 border bg-[color:var(--hub-card)] text-[color:var(--hub-muted)]"
          style={{ borderColor: 'var(--hub-border)' }}>
          {t('modulesPassed', { done: doneCount, total: STEPS.length })}
        </span>
      </div>
    </motion.div>
  );
});

ModuleHeader.displayName = 'ModuleHeader';

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function AgentTrainingHub({ agentName, agentId, agentStageName, stats, onLogout }: Props) {
  const t         = useTranslations('trainingHub');
  const pathname  = usePathname();
  const locale    = pathname.split('/')[1] ?? 'th';
  
  const derived = useMemo(() => deriveSteps(stats), [stats]);

  const hrefs: Record<StepId, string> = useMemo(() => ({
    learn:     `/${locale}/learn`,
    quiz:      `/${locale}/quiz`,
    'ai-eval': `/${locale}/ai-eval`,
  }), [locale]);

  const doneCount   = useMemo(() => STEPS.filter(s => derived[s.id].passed).length, [derived]);
  const pct         = Math.round((doneCount / STEPS.length) * 100);
  const badge       = (stats?.badge ?? 'developing') as BadgeType;
  const badgeCfg    = BADGE[badge];
  const score       = stats?.overallScore ?? 0;
  const ringColor   = useMemo(() => scoreColor(score), [score]);
  const initials    = useMemo(() => {
    const parts = agentName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [agentName]);
  
  const allDone = useMemo(() => {
    if (!stats) return false;
    const { trainingComplete } = getCompletionStatus(stats, stats.activeScenariosCount);
    return trainingComplete;
  }, [stats]);

  const currentStep = useMemo(() => STEPS.find(s => !derived[s.id].passed && !derived[s.id].locked), [derived]);

  return (
    <div
      className="w-full h-full flex flex-col lg:flex-row bg-[color:var(--hub-bg)]"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <BackgroundEffects badgeColor={badgeCfg.color} />

      {/* ══ LEFT — Agent Profile ══ */}
      <ProfileSidebar
        agentName={agentName}
        agentStageName={agentStageName}
        score={score}
        ringColor={ringColor}
        initials={initials}
        allDone={allDone}
        currentStep={currentStep}
        badgeCfg={badgeCfg}
        pct={pct}
        derived={derived}
        onLogout={onLogout}
      />

      {/* ══ RIGHT — Training Modules ══ */}
      <div className="relative z-10 flex-1 flex flex-col lg:overflow-y-auto">
        <ModuleHeader doneCount={doneCount} />

        <div className="px-6 py-8 lg:px-10 lg:py-12">
          {allDone && (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="mb-10 p-10 rounded-[2.5rem] border border-amber-500/30 bg-amber-500/5 flex flex-col items-center text-center relative overflow-hidden"
             >
                {/* Decorative background element */}
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none"
                     style={{ backgroundImage: `radial-gradient(circle at 50% 50%, #FBBF24 0%, transparent 70%)` }} />
                
                <div className="w-20 h-20 rounded-3xl bg-amber-500/20 flex items-center justify-center mb-6 border border-amber-500/30 shadow-lg shadow-amber-500/10 relative z-10">
                  <Trophy size={40} className="text-amber-500" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-black text-amber-500 mb-3 relative z-10 tracking-tight">
                  {t('pendingFinalEval')}
                </h3>
                <p className="text-base text-[color:var(--hub-muted)] font-bold max-w-lg relative z-10 leading-relaxed">
                  {t('pendingEvalDesc')}
                </p>

                <div className="mt-8 flex items-center gap-3 px-6 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 relative z-10">
                   <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                   <span className="text-xs font-black uppercase tracking-widest text-amber-600">Waiting for Evaluator</span>
                </div>
             </motion.div>
          )}

          <motion.div 
            variants={STAGGER_CONTAINER}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 pb-10"
          >
            {STEPS.map((step, i) => (
              <ModuleCard
                key={step.id}
                step={step}
                state={derived[step.id]}
                index={i}
                href={hrefs[step.id]}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
