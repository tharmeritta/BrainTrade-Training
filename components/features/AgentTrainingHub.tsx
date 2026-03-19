'use client';

import React, { useMemo, memo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  CheckCircle2, XCircle, Lock, GraduationCap, ClipboardList, Mic, PlayCircle,
  Trophy, RotateCcw, ArrowRight, LogOut, Zap, type LucideIcon,
} from 'lucide-react';

import type { AgentStats } from '@/types';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { EASE, TRANSITION, FADE_IN, STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animations';

// ─── Constants & Types ────────────────────────────────────────────────────────

const STEPS = [
  { id: 'learn'   as const, step: 1, labelKey: 'learn',  sublabelKey: 'study',   descKey: 'productProcess', Icon: GraduationCap, color: '#818CF8', glow: 'rgba(129,140,248,0.18)' },
  { id: 'quiz'    as const, step: 2, labelKey: 'quiz',   sublabelKey: 'test',    descKey: 'quizDesc',  Icon: ClipboardList, color: '#60A5FA', glow: 'rgba(96,165,250,0.15)'  },
  { id: 'ai-eval' as const, step: 3, labelKey: 'aiEval', sublabelKey: 'analyse', descKey: 'aiEvalDesc',   Icon: Mic,           color: '#F472B6', glow: 'rgba(244,114,182,0.15)' },
  { id: 'pitch'   as const, step: 4, labelKey: 'pitch',  sublabelKey: 'sell',    descKey: 'pitchDesc',    Icon: PlayCircle,    color: '#FB923C', glow: 'rgba(251,146,60,0.15)'  },
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
  const anyQ = !!(stats?.quiz?.foundation?.passed || stats?.quiz?.product?.passed || stats?.quiz?.process?.passed);
  const allQ = !!(stats?.quiz?.foundation?.passed && stats?.quiz?.product?.passed && stats?.quiz?.process?.passed);
  const aiOk = (stats?.aiEval?.count ?? 0) > 0;
  const piOk = (stats?.pitch?.sessionCount ?? 0) > 0;
  
  const qs = [
    stats?.quiz?.foundation?.bestScore,
    stats?.quiz?.product?.bestScore, 
    stats?.quiz?.process?.bestScore
  ].filter((s): s is number => s !== undefined);
  
  const avgQ = qs.length ? Math.round(qs.reduce((a, b) => a + b, 0) / qs.length) : undefined;

  return {
    learn:     { locked: false,  passed: anyQ, score: stats?.quiz?.product?.bestScore },
    quiz:      { locked: false,  passed: allQ, score: avgQ },
    'ai-eval': { locked: !anyQ, passed: aiOk, score: stats?.aiEval ? Math.round(stats.aiEval.avgScore) : undefined },
    pitch:     { locked: !aiOk, passed: piOk, score: stats?.pitch ? (stats.pitch.highestLevel >= 3 ? 100 : stats.pitch.highestLevel * 33) : undefined },
  };
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

/**
 * BackgroundEffects: Renders animated orbs and the grid background.
 */
const BackgroundEffects = memo(({ badgeColor }: { badgeColor: string }) => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <motion.div 
      className="absolute w-[600px] h-[600px] -top-[150px] -left-[150px] rounded-full"
      style={{
        background: `radial-gradient(circle, ${badgeColor}08 0%, transparent 65%)`,
      }}
      animate={{ x: [0, 30, 0], y: [0, 40, 0] }}
      transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
    />
    <motion.div 
      className="absolute w-[400px] h-[400px] bottom-0 right-0 rounded-full"
      style={{
        background: `radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 70%)`,
      }}
      animate={{ x: [0, -20, 0], y: [0, -30, 0] }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
    />
    <div 
      className="absolute inset-0 opacity-[0.012]"
      style={{
        backgroundImage: `linear-gradient(var(--hub-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--hub-grid-color) 1px, transparent 1px)`,
        backgroundSize: '56px 56px',
      }} 
    />
  </div>
));

BackgroundEffects.displayName = 'BackgroundEffects';

/**
 * SectionDivider: A simple labeled divider.
 */
const SectionDivider = memo(({ label }: { label: string }) => (
  <div className="flex items-center gap-2 w-full max-w-[260px] my-4">
    <div className="flex-1 h-px bg-[color:var(--hub-border)]" />
    <span className="text-[9px] font-black uppercase tracking-[0.22em] shrink-0 text-[color:var(--hub-dim)]">
      {label}
    </span>
    <div className="flex-1 h-px bg-[color:var(--hub-border)]" />
  </div>
));

SectionDivider.displayName = 'SectionDivider';

/**
 * ModuleCard: Displays an individual training module with its status and progress.
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
      className="group relative flex items-stretch rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: locked ? 'var(--hub-locked-bg)' : 'var(--hub-card)',
        border: `1px solid ${locked ? 'var(--hub-dim-border)' : passed ? color + '38' : hasFailed ? 'rgba(248,113,113,0.35)' : isNext ? color + '28' : 'var(--hub-border)'}`,
        opacity: locked ? 0.52 : 1,
        boxShadow: passed ? `0 4px 28px ${color}12` : hasFailed ? '0 4px 20px rgba(248,113,113,0.12)' : isNext ? `0 4px 20px ${glow}` : 'none',
      }}
    >
      <div className="relative flex flex-col items-center justify-center w-[72px] shrink-0 gap-1.5 py-5 border-r"
        style={{
          background: locked
            ? 'var(--hub-locked-icon)'
            : passed ? `linear-gradient(160deg, ${color}28 0%, ${color}10 100%)`
            : hasFailed ? 'linear-gradient(160deg, rgba(248,113,113,0.20) 0%, rgba(248,113,113,0.07) 100%)'
            : isNext ? `linear-gradient(160deg, ${color}20 0%, ${color}08 100%)`
            : `linear-gradient(160deg, ${color}12 0%, ${color}04 100%)`,
          borderColor: locked ? 'var(--hub-dim-border)' : hasFailed ? 'rgba(248,113,113,0.22)' : color + '18',
        }}
      >
        <span className="text-[9px] font-black leading-none tracking-wider"
          style={{ color: locked ? 'var(--hub-dim)' : color + 'BB' }}>
          {stepNum < 10 ? `0${stepNum}` : stepNum}
        </span>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm"
          style={{
            background: locked ? 'rgba(0,0,0,0.06)' : `${color}1A`,
            borderColor: locked ? 'var(--hub-dim-border)' : color + '35',
          }}>
          {passed
            ? <CheckCircle2 size={20} style={{ color }} />
            : locked ? <Lock size={15} style={{ color: 'var(--hub-dim)' }} />
            : hasFailed ? <XCircle size={20} style={{ color: '#F87171' }} />
            : <Icon size={20} style={{ color }} />
          }
        </div>
        <span className="text-[8px] font-semibold uppercase tracking-widest"
          style={{ color: locked ? 'var(--hub-dim)' : color + '88' }}>
          {t(sublabelKey)}
        </span>
      </div>

      <div className="flex-1 min-w-0 px-4 py-4 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-bold text-sm leading-tight text-[color:var(--hub-text)]"
            style={{ color: locked ? 'var(--hub-dim)' : undefined }}>
            {navT(labelKey)}
          </span>
          {passed && (
            <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wide border"
              style={{ background: `${color}18`, color, borderColor: color + '35' }}>
              ✓ {t('passed')}
            </span>
          )}
          {hasFailed && (
            <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wide flex items-center gap-1 border border-red-400/30"
              style={{ background: 'rgba(248,113,113,0.12)', color: '#F87171' }}>
              ✕ {t('failed')}
            </span>
          )}
          {isNext && (
            <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wide flex items-center gap-1"
              style={{ background: `${color}12`, color: color + 'BB' }}>
              <Zap size={8} /> {t('next')}
            </span>
          )}
        </div>
        <p className="text-xs mb-2 text-[color:var(--hub-muted)]" style={{ color: locked ? 'var(--hub-dim)' : undefined }}>
          {t(descKey)}
        </p>
        {score !== undefined && !locked && (
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-[color:var(--hub-progress-bg)]">
              <motion.div className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ delay: 0.5 + index * 0.07, duration: 0.9, ease: 'easeOut' }}
                style={{ background: hasFailed
                  ? 'linear-gradient(90deg, rgba(248,113,113,0.6), #F87171)'
                  : `linear-gradient(90deg, ${color}70, ${color})` }} />
            </div>
            <span className="text-[11px] font-black shrink-0"
              style={{ color: hasFailed ? '#F87171' : scoreColor(score) }}>
              {score}%
            </span>
          </div>
        )}
      </div>

      <div className="shrink-0 flex items-center pr-4 pl-2">
        {locked ? (
          <div className="flex items-center gap-1.5 text-[10px] px-3 py-2 rounded-xl bg-[color:var(--hub-locked-bg)] border border-[color:var(--hub-dim-border)] text-[color:var(--hub-dim)]">
            <Lock size={10} /> {t('locked')}
          </div>
        ) : (
          <Link href={href}
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-150 whitespace-nowrap border"
            style={{ background: `${color}18`, borderColor: color + '45', color }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${color}30`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${color}18`; }}
          >
            {passed
              ? <><RotateCcw size={12} className="group-hover:rotate-180 transition-transform duration-500" />{t('retake')}</>
              : <>{t('startNow')}<ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" /></>
            }
          </Link>
        )}
      </div>
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
              <span className="text-[10px] font-black" style={{ color: '#FBBF24' }}>{t('allPassed')}</span></>
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

      <div className="mt-auto w-full pt-6 flex justify-center">
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-medium transition-all
            text-[color:var(--hub-muted)] border border-[color:var(--hub-border)]
            hover:text-red-500 hover:border-red-300 hover:bg-red-50
            dark:hover:border-red-500/30 dark:hover:bg-red-500/10"
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
            Training Modules
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

export default function AgentTrainingHub({ agentName, agentStageName, stats, onLogout }: Props) {
  const pathname  = usePathname();
  const locale    = pathname.split('/')[1] ?? 'th';
  
  const derived = useMemo(() => deriveSteps(stats), [stats]);

  const hrefs: Record<StepId, string> = useMemo(() => ({
    learn:     `/${locale}/learn`,
    quiz:      `/${locale}/quiz`,
    'ai-eval': `/${locale}/ai-eval`,
    pitch:     `/${locale}/pitch`,
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
  const allDone     = doneCount === STEPS.length;
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

        <div className="px-4 py-5 lg:px-6">
          <motion.div 
            variants={STAGGER_CONTAINER}
            initial="initial"
            animate="animate"
            className="flex flex-col gap-3 pb-6"
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
