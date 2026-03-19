'use client';

/**
 * EvaluatorDashboard — Sales Simulation evaluation interface.
 * Fully theme-aware (light/dark) and bilingual (TH/EN) using next-intl.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Search, Users, ClipboardCheck, ChevronRight, Save, Check,
  Clock, Edit3, X, ChevronDown, Loader2, Star, BarChart3,
  Activity, TrendingUp, BookOpen, Target, ArrowLeft,
  CheckCircle2, Circle, Zap, AlertTriangle, MessageSquare, LogOut,
} from 'lucide-react';

import ThemeToggle from '@/components/ui/ThemeToggle';
import LangToggle from '@/components/ui/LangToggle';
import { FADE_IN, STAGGER_CONTAINER, STAGGER_ITEM, TRANSITION, EASE } from '@/lib/animations';

import type {
  Agent, AgentEvaluation, AgentStats,
  SalesCallCriteria, SalesCallPerformanceItem,
} from '@/types';

// --- Types & Config ---

const PERFORMANCE_KEYS: (keyof SalesCallCriteria['performance'])[] = [
  'agentStruggle',
  'unhandledQuestions',
  'toneOfVoice',
  'chemistryFriendliness',
];

const RED_FLAG_KEYS: (keyof SalesCallCriteria['redFlags'])[] = [
  'officeLocation',
  'withdrawalAfterDeposit',
  'exaggeratingProfit',
  'actualCommission',
];

const MODULE_ORDER = [
  { key: 'learn',   labelKey: 'learn',   icon: BookOpen,   color: '#60A5FA' },
  { key: 'quiz',    labelKey: 'quiz',    icon: Target,     color: '#FBBF24' },
  { key: 'ai-eval', labelKey: 'aiEval',  icon: Zap,        color: '#A78BFA' },
  { key: 'pitch',   labelKey: 'pitch',   icon: TrendingUp, color: '#FB923C' },
] as const;

// --- Helpers ---

function emptyPerf(): SalesCallPerformanceItem {
  return { agentInvolve: false, comment: '', remark: '' };
}

function emptyCriteria(): SalesCallCriteria {
  return {
    performance: {
      agentStruggle:         emptyPerf(),
      unhandledQuestions:    emptyPerf(),
      toneOfVoice:           emptyPerf(),
      chemistryFriendliness: emptyPerf(),
    },
    qaThoughts: '',
    redFlags: {
      officeLocation:         false,
      withdrawalAfterDeposit: false,
      exaggeratingProfit:     false,
      actualCommission:       false,
    },
    generalRemark: '',
  };
}

function calcScore(criteria: SalesCallCriteria): number {
  const flagCount = Object.values(criteria.redFlags).filter(Boolean).length;
  return Math.max(0, 100 - flagCount * 25);
}

function scoreHex(n: number) {
  return n >= 70 ? '#60A5FA' : n >= 50 ? '#FBBF24' : '#F87171';
}

function timeAgo(iso: string, t: any): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 2)  return t('justNow');
  if (m < 60) return t('minAgo', { m });
  const h = Math.floor(m / 60);
  if (h < 24) return t('hourAgo', { h });
  return t('dayAgo', { d: Math.floor(h / 24) });
}

// --- Sub-components ---

/**
 * ScoreRing: Reusable circular score indicator
 */
const ScoreRing = ({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' }) => {
  const dim  = size === 'sm' ? 56 : 72;
  const r    = size === 'sm' ? 20 : 28;
  const sw   = size === 'sm' ? 4  : 5;
  const fs   = size === 'sm' ? 13 : 16;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const clr  = scoreHex(score);
  
  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: dim, height: dim }}>
      <svg className="absolute inset-0" viewBox={`0 0 ${dim} ${dim}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={dim/2} cy={dim/2} r={r} fill="none" stroke="currentColor" className="text-muted-foreground/15" strokeWidth={sw} />
        <motion.circle
          cx={dim/2} cy={dim/2} r={r} fill="none" stroke={clr} strokeWidth={sw}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: EASE.smooth }}
          style={{ filter: `drop-shadow(0 0 4px ${clr}50)` }}
        />
      </svg>
      <span className="font-black" style={{ color: clr, fontSize: fs }}>
        {score}
      </span>
    </div>
  );
};

/**
 * ModuleSection: Small summary section for training modules
 */
const ModuleSection = ({
  icon: Icon, color, title, completedCount, totalCount, children,
}: {
  icon: React.ElementType; color: string; title: string;
  completedCount: number; totalCount: number; children: React.ReactNode;
}) => {
  const isComplete = completedCount >= totalCount;
  return (
    <div className="rounded-xl overflow-hidden border border-border">
      <div className="px-3 py-2 flex items-center gap-2 border-b border-border" style={{ background: `${color}08` }}>
        <div className="p-1 rounded-md" style={{ background: `${color}18` }}>
          <Icon size={10} style={{ color }} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-foreground">
          {title}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <span className="text-[10px] font-bold" style={{ color: isComplete ? '#60A5FA' : completedCount > 0 ? color : 'hsl(var(--muted-foreground) / 0.3)' }}>
            {completedCount}/{totalCount}
          </span>
          {isComplete
            ? <CheckCircle2 size={10} className="text-blue-500" />
            : <Circle size={10} className="text-muted-foreground/25" />
          }
        </div>
      </div>
      <div className="bg-card px-3 py-2.5 space-y-1.5">
        {children}
      </div>
    </div>
  );
};

/**
 * AgentPerformancePanel: Side panel showing selected agent's training stats
 */
const AgentPerformancePanel = ({
  stats, loading,
}: { stats: AgentStats | null; loading: boolean; }) => {
  const t = useTranslations('evaluator');
  const navT = useTranslations('nav');

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 size={22} className="animate-spin text-blue-500/50" />
    </div>
  );
  if (!stats) return (
    <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground/40">
      <BarChart3 size={24} />
      <p className="text-xs">{t('noTrainingData')}</p>
    </div>
  );

  const BADGE_STYLE: Record<string, { label: string; color: string; bg: string }> = {
    'elite':      { label: 'Elite',      color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
    'strong':     { label: 'Strong',     color: '#60A5FA', bg: 'rgba(96,165,250,0.12)'  },
    'developing': { label: 'Developing', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)'  },
    'needs-work': { label: 'Needs Help', color: '#F87171', bg: 'rgba(248,113,113,0.12)' },
  };
  const badge = BADGE_STYLE[stats.badge] ?? BADGE_STYLE['needs-work'];

  const quizTopics          = ['foundation', 'product', 'process', 'payment'] as const;
  const learnAccessed       = quizTopics.filter(m => !!stats.quiz[m]).length;
  const quizPassedCount     = quizTopics.filter(m => stats.quiz[m]?.passed).length;
  const completedPitchLevels = stats.pitch?.completedLevels ?? [];
  const completedEvalLevels  = stats.evalCompletedLevels ?? [];

  return (
    <motion.div variants={FADE_IN} initial="initial" animate="animate" className="space-y-2.5">
      {/* Overall score */}
      <div className="bg-card border border-border rounded-xl p-3.5 flex items-center gap-3">
        <ScoreRing score={stats.overallScore} />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-muted-foreground mb-1">{t('trainingScore')}</div>
          <div className="text-xs font-bold px-2 py-0.5 rounded-full inline-block" style={{ background: badge.bg, color: badge.color }}>
            {badge.label}
          </div>
          {stats.lastActive && (
            <div className="flex items-center gap-1 mt-1.5">
              <Clock size={9} className="text-muted-foreground/50" />
              <span className="text-[10px] text-muted-foreground/50">{timeAgo(stats.lastActive, t)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Module 1: Learn */}
      <ModuleSection icon={BookOpen} color="#60A5FA" title={`${navT('learn')} — ${t('courses')}`} completedCount={learnAccessed} totalCount={4}>
        {quizTopics.map(m => {
          const accessed = !!stats.quiz[m];
          const passed   = stats.quiz[m]?.passed;
          return (
            <div key={m} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {accessed
                  ? <CheckCircle2 size={9} style={{ color: passed ? '#60A5FA' : '#FBBF24' }} />
                  : <Circle size={9} className="text-muted-foreground/25" />
                }
                <span className="text-[11px] capitalize text-foreground">{m}</span>
              </div>
              <span className="text-[10px] font-medium" style={{ color: accessed ? (passed ? '#60A5FA' : '#FBBF24') : 'hsl(var(--muted-foreground) / 0.3)' }}>
                {accessed ? t('accessed') : t('notStarted')}
              </span>
            </div>
          );
        })}
      </ModuleSection>

      {/* Module 2: Quiz */}
      <ModuleSection icon={Target} color="#FBBF24" title={navT('quiz')} completedCount={quizPassedCount} totalCount={4}>
        {quizTopics.map(m => {
          const qs = stats.quiz[m];
          return (
            <div key={m} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {qs?.passed
                  ? <CheckCircle2 size={9} className="text-blue-500" />
                  : qs ? <AlertTriangle size={9} className="text-amber-400" /> : <Circle size={9} className="text-muted-foreground/25" />
                }
                <span className="text-[11px] capitalize text-foreground">{m}</span>
              </div>
              {qs ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold" style={{ color: qs.passed ? '#60A5FA' : '#F87171' }}>{qs.bestScore}%</span>
                  <span className="text-[9px] px-1 py-0.5 rounded font-medium" style={{ background: qs.passed ? 'rgba(96,165,250,0.1)' : 'rgba(248,113,113,0.1)', color: qs.passed ? '#60A5FA' : '#F87171' }}>
                    {qs.passed ? t('passedLabel') : t('failedLabel')}
                  </span>
                </div>
              ) : <span className="text-[10px] text-muted-foreground/30">—</span>}
            </div>
          );
        })}
      </ModuleSection>

      {/* Module 3: AI Eval */}
      <ModuleSection icon={Zap} color="#A78BFA" title={navT('aiEval')} completedCount={completedEvalLevels.length} totalCount={4}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">{t('aiEvalAvg')}</span>
          {stats.aiEval
            ? <span className="text-[11px] font-bold" style={{ color: scoreHex(stats.aiEval.avgScore) }}>{stats.aiEval.avgScore}/100</span>
            : <span className="text-[10px] text-muted-foreground/30">—</span>
          }
        </div>
        <div className="flex items-center gap-1.5 pt-0.5">
          {[1, 2, 3, 4].map(l => {
            const done = completedEvalLevels.includes(l);
            return (
              <div key={l} className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-black"
                style={{
                  background: done ? 'rgba(167,139,250,0.15)' : 'hsl(var(--secondary))',
                  color: done ? '#A78BFA' : 'hsl(var(--muted-foreground) / 0.3)',
                  border: `1px solid ${done ? 'rgba(167,139,250,0.3)' : 'hsl(var(--border))'}`,
                }}
              >
                {done ? <Check size={7} /> : l}
              </div>
            );
          })}
        </div>
      </ModuleSection>

      {/* Module 4: Pitch */}
      <ModuleSection icon={TrendingUp} color="#FB923C" title={navT('pitch')} completedCount={completedPitchLevels.length} totalCount={3}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">{t('sessions', { count: 0 }).split(' ')[1]}</span>
          <span className="text-[11px] text-foreground">{stats.pitch?.sessionCount ?? 0}</span>
        </div>
        <div className="flex items-center gap-1.5 pt-0.5">
          {[1, 2, 3].map(l => {
            const done = completedPitchLevels.includes(l);
            return (
              <div key={l} className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-black"
                style={{
                  background: done ? 'rgba(251,146,60,0.15)' : 'hsl(var(--secondary))',
                  color: done ? '#FB923C' : 'hsl(var(--muted-foreground) / 0.3)',
                  border: `1px solid ${done ? 'rgba(251,146,60,0.3)' : 'hsl(var(--border))'}`,
                }}
              >
                {done ? <Check size={7} /> : l}
              </div>
            );
          })}
        </div>
      </ModuleSection>
    </motion.div>
  );
};

/**
 * EvalForm: The core evaluation form
 */
const EvalForm = ({
  criteria, onChange,
}: {
  criteria: SalesCallCriteria;
  onChange: (c: SalesCallCriteria) => void;
}) => {
  const t = useTranslations('evaluator');

  function setPerf(key: keyof SalesCallCriteria['performance'], field: keyof SalesCallPerformanceItem, val: unknown) {
    onChange({ ...criteria, performance: { ...criteria.performance, [key]: { ...criteria.performance[key], [field]: val } } });
  }
  function setRedFlag(key: keyof SalesCallCriteria['redFlags'], val: boolean) {
    onChange({ ...criteria, redFlags: { ...criteria.redFlags, [key]: val } });
  }
  const redFlagCount = Object.values(criteria.redFlags).filter(Boolean).length;

  return (
    <motion.div variants={STAGGER_CONTAINER} initial="initial" animate="animate" className="space-y-5">
      {/* Section 1: Agent Performance */}
      <motion.div variants={STAGGER_ITEM} className="rounded-2xl overflow-hidden border border-border shadow-sm">
        <div className="px-4 py-3 bg-blue-500/[0.07] border-b border-border">
          <span className="text-xs font-black text-foreground uppercase tracking-wider">{t('agentPerfHeader')}</span>
        </div>
        <div className="grid px-4 py-2 text-[9px] font-bold text-muted-foreground uppercase tracking-wider bg-secondary/20 border-b border-border" style={{ gridTemplateColumns: '1fr 64px 1fr' }}>
          <span>{t('columnCategory')}</span>
          <span className="text-center">{t('columnInvolve')}</span>
          <span>{t('columnComment')}</span>
        </div>
        {PERFORMANCE_KEYS.map((key, i) => {
          const perf = criteria.performance[key];
          return (
            <div key={key} className={`grid px-4 py-3 gap-3 items-start ${i < PERFORMANCE_KEYS.length - 1 ? 'border-b border-border' : ''} ${i % 2 === 0 ? 'bg-card' : 'bg-secondary/20'}`} style={{ gridTemplateColumns: '1fr 64px 1fr' }}>
              <div>
                <div className="text-xs font-semibold text-foreground">{t(`performanceItems.${key}`)}</div>
              </div>
              <div className="flex flex-col items-center gap-1 pt-0.5">
                <button
                  onClick={() => setPerf(key, 'agentInvolve', !perf.agentInvolve)}
                  className="w-9 h-5 rounded-full relative transition-all"
                  style={{ background: perf.agentInvolve ? 'rgba(96,165,250,0.3)' : 'hsl(var(--secondary))', border: `1px solid ${perf.agentInvolve ? 'rgba(96,165,250,0.6)' : 'hsl(var(--border))'}` }}
                >
                  <motion.span animate={{ x: perf.agentInvolve ? 16 : 2 }} className="absolute top-0.5 w-3.5 h-3.5 rounded-full" style={{ background: perf.agentInvolve ? '#60A5FA' : 'hsl(var(--muted-foreground) / 0.4)' }} />
                </button>
                <span className="text-[9px] text-muted-foreground font-bold">{perf.agentInvolve ? t('yLabel') : t('nLabel')}</span>
              </div>
              <textarea
                value={perf.comment} onChange={e => setPerf(key, 'comment', e.target.value)}
                placeholder={t('commentPlaceholder')} rows={2}
                className="w-full px-2.5 py-2 rounded-lg text-[11px] text-foreground outline-none resize-none transition-colors placeholder:text-muted-foreground/40 bg-secondary/40 border border-border focus:border-blue-500/40"
              />
            </div>
          );
        })}
      </motion.div>

      {/* Section 2: QA Thoughts */}
      <motion.div variants={STAGGER_ITEM} className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
        <div className="px-4 py-3 bg-blue-500/[0.07] border-b border-border">
          <span className="text-xs font-black text-foreground uppercase tracking-wider">{t('qaHeader')}</span>
        </div>
        <div className="p-4">
          <label className="block text-[10px] text-muted-foreground mb-2">{t('qaLabel')}</label>
          <textarea
            value={criteria.qaThoughts} onChange={e => onChange({ ...criteria, qaThoughts: e.target.value })}
            placeholder={t('qaPlaceholder')} rows={4}
            className="w-full px-3 py-2.5 rounded-xl text-xs text-foreground outline-none resize-none transition-colors placeholder:text-muted-foreground/40 bg-secondary/40 border border-border focus:border-blue-500/40"
          />
        </div>
      </motion.div>

      {/* Section 3: Red Flags */}
      <motion.div variants={STAGGER_ITEM} className={`rounded-2xl overflow-hidden border transition-colors shadow-sm ${redFlagCount > 0 ? 'border-red-500/35' : 'border-border'}`}>
        <div className={`px-4 py-3 flex items-center justify-between border-b border-border ${redFlagCount > 0 ? 'bg-red-500/10' : 'bg-red-500/5'}`}>
          <div className="flex items-center gap-2">
            <AlertTriangle size={13} className="text-red-400" />
            <span className="text-xs font-black text-foreground uppercase tracking-wider">{t('redFlagHeader')}</span>
          </div>
          {redFlagCount > 0 && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40">{redFlagCount} FLAG{redFlagCount > 1 ? 'S' : ''}</span>}
        </div>
        <div className="px-4 py-2 text-[10px] text-muted-foreground bg-secondary/10 border-b border-border">{t('redFlagNote')}</div>
        <div>
          {RED_FLAG_KEYS.map((key, i) => {
            const checked = criteria.redFlags[key];
            return (
              <div key={key} className={`px-4 py-3 ${checked ? 'bg-red-500/5' : i % 2 === 0 ? 'bg-card' : 'bg-secondary/20'} ${i < RED_FLAG_KEYS.length - 1 ? 'border-b border-border' : ''}`}>
                <div className="flex items-start gap-3">
                  <button onClick={() => setRedFlag(key, !checked)} className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border ${checked ? 'bg-red-500/30 border-red-500/70' : 'bg-secondary border-border'}`}>
                    {checked && <X size={9} className="text-red-400" />}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold ${checked ? 'text-red-400' : 'text-foreground'}`}>{t(`redFlagItems.${key}.label`)}</span>
                      {checked && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400">RED FLAG</span>}
                    </div>
                    <div className="text-[10px] text-muted-foreground/60 mt-0.5">{t(`redFlagItems.${key}.guideline`)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* General Remark */}
      <motion.div variants={STAGGER_ITEM}>
        <label className="block text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-wider">{t('generalRemarkLabel')}</label>
        <textarea
          value={criteria.generalRemark} onChange={e => onChange({ ...criteria, generalRemark: e.target.value })}
          placeholder={t('generalRemarkPlaceholder')} rows={3}
          className="w-full px-4 py-3 rounded-xl text-sm text-foreground outline-none resize-none bg-secondary/40 border border-border focus:border-blue-500/40"
        />
      </motion.div>
    </motion.div>
  );
};

/**
 * EvalHistoryCard: Expandable card for past evaluations
 */
const EvalHistoryCard = ({
  ev, onEdit,
}: { ev: AgentEvaluation; onEdit: (ev: AgentEvaluation) => void; }) => {
  const [expanded, setExpanded] = useState(false);
  const t = useTranslations('evaluator');
  const c = ev.criteria as SalesCallCriteria;
  const redFlagCount = c?.redFlags ? Object.values(c.redFlags).filter(Boolean).length : 0;

  return (
    <motion.div variants={FADE_IN} className="rounded-2xl overflow-hidden bg-card border border-border shadow-sm">
      <button className="w-full flex items-center gap-4 px-4 py-3.5 text-left hover:bg-secondary/30 transition-colors" onClick={() => setExpanded(v => !v)}>
        <ScoreRing score={ev.totalScore} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-xs font-bold text-foreground">{t('salesSimLabel')}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{ev.evaluatorName}</span>
            {redFlagCount > 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400">{redFlagCount} 🚩</span>}
          </div>
          {c?.generalRemark && <p className="text-[11px] text-muted-foreground truncate">{c.generalRemark}</p>}
          <div className="flex items-center gap-1 mt-1"><Clock size={9} className="text-muted-foreground/40" /><span className="text-[9px] text-muted-foreground/40">{timeAgo(ev.evaluatedAt, t)}</span></div>
        </div>
        <ChevronDown size={12} className={`text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-3 border-t border-border bg-secondary/10">
              {c?.performance && (
                <div className="pt-3 space-y-2">
                  <div className="text-[9px] font-bold text-muted-foreground uppercase">{t('agentPerfSection')}</div>
                  {PERFORMANCE_KEYS.map(key => {
                    const p = c.performance[key];
                    if (!p?.comment && !p?.agentInvolve) return null;
                    return (
                      <div key={key} className="flex items-start gap-2">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${p.agentInvolve ? 'bg-blue-500/10 text-blue-500' : 'bg-secondary text-muted-foreground'}`}>{p.agentInvolve ? t('yLabel') : t('nLabel')}</span>
                        <div>
                          <div className="text-[10px] text-muted-foreground">{t(`performanceItems.${key}`)}</div>
                          {p.comment && <div className="text-[11px] text-foreground mt-0.5">{p.comment}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {c?.qaThoughts && (
                <div className="rounded-xl p-2.5 bg-card border border-border">
                  <div className="text-[9px] font-bold text-muted-foreground uppercase mb-1">{t('qaSection')}</div>
                  <p className="text-[11px] text-foreground whitespace-pre-wrap">{c.qaThoughts}</p>
                </div>
              )}
              <button onClick={() => onEdit(ev)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors pt-2"><Edit3 size={11} /> {t('editLabel')}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * AgentOverviewCard: Summary card for each agent in the overview grid
 */
const AgentOverviewCard = ({
  stats, evaluatedByMe, onEvaluate,
}: {
  stats: AgentStats;
  evaluatedByMe: boolean;
  onEvaluate: (agent: Agent) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const t = useTranslations('evaluator');

  const BADGE_STYLE: Record<string, { label: string; color: string; bg: string }> = {
    'elite':      { label: 'Elite',      color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
    'strong':     { label: 'Strong',     color: '#60A5FA', bg: 'rgba(96,165,250,0.12)'  },
    'developing': { label: 'Developing', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)'  },
    'needs-work': { label: 'Needs Help', color: '#F87171', bg: 'rgba(248,113,113,0.12)' },
  };
  const badge = BADGE_STYLE[stats.badge] ?? BADGE_STYLE['needs-work'];

  function moduleScore(key: string): number {
    if (key === 'learn')   return Object.keys(stats.quiz).length > 0 ? 100 : 0;
    if (key === 'quiz')    return Math.round((['foundation', 'product', 'process', 'payment'] as const).filter(m => stats.quiz[m]?.passed).length / 4 * 100);
    if (key === 'ai-eval') return stats.aiEval ? Math.min(100, Math.round(stats.aiEval.count / 4 * 100)) : 0;
    if (key === 'pitch')   return Math.round((stats.pitch?.completedLevels?.length ?? 0) / 3 * 100);
    return 0;
  }

  return (
    <motion.div variants={STAGGER_ITEM} className="bg-card/60 backdrop-blur-md border border-border rounded-2xl overflow-hidden hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 relative group">
      <div className="p-4 flex items-start gap-3">
        <ScoreRing score={stats.overallScore} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-black text-foreground truncate">{stats.agent.name}</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
            {evaluatedByMe && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">✓ {t('evaluated')}</span>}
          </div>
          <div className="flex gap-1.5 mt-2">
            {MODULE_ORDER.map(mod => {
              const pct = moduleScore(mod.key);
              return (
                <div key={mod.key} className="flex-1">
                  <div className="h-1 rounded-full bg-secondary overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full rounded-full" style={{ background: pct === 100 ? '#60A5FA' : mod.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-4 pb-3 flex items-center gap-2">
        <button onClick={() => onEvaluate(stats.agent)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]"><ClipboardCheck size={12} />{t('evaluate')}</button>
        <button onClick={() => setExpanded(v => !v)} className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${expanded ? 'bg-secondary border-border text-foreground' : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}>{t('viewDetails')}<ChevronDown size={11} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} /></button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-border bg-secondary/5">
            <div className="px-4 pb-4 pt-3 space-y-3">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5"><BookOpen size={9} className="text-blue-400" /><span className="text-[9px] font-bold text-muted-foreground uppercase">{t('courses')}</span></div>
                <div className="flex gap-1.5 flex-wrap">
                  {(['product', 'process', 'payment'] as const).map(m => {
                    const accessed = !!stats.quiz[m];
                    return (
                      <div key={m} className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-medium border ${accessed ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-secondary border-transparent text-muted-foreground/40'}`}>
                        {accessed ? <CheckCircle2 size={7} /> : <Circle size={7} />}<span className="capitalize ml-0.5">{m}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 rounded-lg p-2 bg-secondary/30">
                  <div className="flex items-center gap-1 mb-1.5"><Zap size={9} className="text-purple-400" /><span className="text-[9px] font-bold text-muted-foreground uppercase">AI Eval</span></div>
                  {stats.aiEval ? <span className="text-[11px] font-bold" style={{ color: scoreHex(stats.aiEval.avgScore) }}>{stats.aiEval.avgScore}/100</span> : <span className="text-[10px] text-muted-foreground/40">—</span>}
                </div>
                <div className="flex-1 rounded-lg p-2 bg-secondary/30">
                  <div className="flex items-center gap-1 mb-1.5"><TrendingUp size={9} className="text-orange-400" /><span className="text-[9px] font-bold text-muted-foreground uppercase">Pitch</span></div>
                  <span className="text-[11px] font-bold text-foreground">{stats.pitch?.sessionCount ?? 0} <span className="text-[9px] font-normal text-muted-foreground">sessions</span></span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * OverviewPanel: The main dashboard landing view
 */
const OverviewPanel = ({
  myEvals, agents, allAgentStats, onEvaluate,
}: {
  myEvals: AgentEvaluation[];
  agents: Agent[];
  allAgentStats: AgentStats[];
  onEvaluate: (agent: Agent) => void;
}) => {
  const t = useTranslations('evaluator');
  const evaluatedIds = new Set(myEvals.map(e => e.agentId));
  const recent       = myEvals.slice(0, 5);

  const stats = [
    { label: t('totalEvals'), value: myEvals.length, icon: ClipboardCheck, color: '#A78BFA' },
    { label: t('todayEvals'), value: myEvals.filter(e => new Date(e.evaluatedAt).toDateString() === new Date().toDateString()).length, icon: Activity, color: '#60A5FA' },
    { label: t('avgScore'), value: myEvals.length > 0 ? `${Math.round(myEvals.reduce((s, e) => s + e.totalScore, 0) / myEvals.length)}/100` : '—', icon: Star, color: '#FBBF24' },
    { label: t('trainingTeamAvg'), value: allAgentStats.length > 0 ? `${Math.round(allAgentStats.reduce((s, a) => s + a.overallScore, 0) / allAgentStats.length)}/100` : '—', icon: Users, color: '#10B981' },
  ];

  return (
    <motion.div variants={STAGGER_CONTAINER} initial="initial" animate="animate" className="p-6 space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((k, i) => (
          <motion.div key={i} variants={STAGGER_ITEM} className="bg-card/60 backdrop-blur-md border border-border rounded-2xl p-4 shadow-sm group hover:border-primary/20 transition-colors">
            <div className="p-2 rounded-xl w-fit mb-3" style={{ background: `${k.color}15` }}><k.icon size={16} style={{ color: k.color }} /></div>
            <div className="text-2xl font-black text-foreground">{k.value}</div>
            <div className="text-[11px] font-medium text-muted-foreground">{k.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Agents Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between"><div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('agentsGrid')}</div><span className="text-[10px] text-muted-foreground/60">{t('agentCount', { count: allAgentStats.length })}</span></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {allAgentStats.map(s => <AgentOverviewCard key={s.agent.id} stats={s} evaluatedByMe={evaluatedIds.has(s.agent.id)} onEvaluate={onEvaluate} />)}
        </div>
      </div>

      {/* Recent Activity */}
      {recent.length > 0 && (
        <div className="space-y-4">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('recentEvals')}</div>
          <div className="space-y-2">
            {recent.map(ev => (
              <motion.div key={ev.id} variants={STAGGER_ITEM} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/20 border border-border hover:bg-secondary/30 transition-colors">
                <ScoreRing score={ev.totalScore} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><span className="text-xs font-semibold text-foreground truncate">{agents.find(a => a.id === ev.agentId)?.name ?? ev.agentName}</span></div>
                  <div className="text-[10px] text-muted-foreground truncate">{ev.comments || '—'}</div>
                </div>
                <div className="text-[10px] text-muted-foreground/50 shrink-0">{timeAgo(ev.evaluatedAt, t)}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

/**
 * ChangePasswordModal: Security update interface
 */
const ChangePasswordModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const t = useTranslations('evaluator');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSave() {
    if (newPassword.length < 4) { setError(t('pwMinLength')); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/admin/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ newPassword }) });
      if (res.ok) { setSuccess(true); setTimeout(() => { onClose(); setSuccess(false); setNewPassword(''); }, 1500); }
      else { const d = await res.json(); setError(d.error || 'Failed to change password'); }
    } catch { setError('Network error'); } finally { setSaving(false); }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={e => e.target === e.currentTarget && onClose()}>
          <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-card border border-border rounded-3xl p-8 w-full max-w-sm shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
            <h3 className="font-black text-xl text-foreground mb-2">{t('changePw')}</h3>
            <p className="text-sm text-muted-foreground mb-6">{t('changePwDesc')}</p>
            <div className="space-y-4">
              <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground" placeholder={t('newPw')} />
              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
              {success && <p className="text-xs text-emerald-500 font-medium">{t('pwUpdateSuccess')}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving || success || !newPassword} className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">{saving ? t('updating') : t('updatePw')}</button>
                <button onClick={onClose} className="px-6 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:bg-secondary transition-all">{t('cancel')}</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Main Component ---

interface EvaluatorDashboardProps {
  evaluatorId: string;
  evaluatorName: string;
  passwordChanged: boolean;
}

export default function EvaluatorDashboard({ evaluatorId, evaluatorName, passwordChanged }: EvaluatorDashboardProps) {
  const t        = useTranslations('evaluator');

  const [isPwModalOpen, setIsPwModalOpen] = useState(!passwordChanged);
  const [agents, setAgents]               = useState<Agent[]>([]);
  const [agentSearch, setAgentSearch]     = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [tab, setTab]                     = useState<'new' | 'history'>('new');
  const [agentStats, setAgentStats]       = useState<AgentStats | null>(null);
  const [loadingStats, setLoadingStats]   = useState(false);
  const [allAgentStats, setAllAgentStats] = useState<AgentStats[]>([]);
  const [myEvals, setMyEvals]             = useState<AgentEvaluation[]>([]);
  const [agentEvals, setAgentEvals]       = useState<AgentEvaluation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [criteria, setCriteria]           = useState<SalesCallCriteria>(emptyCriteria());
  const [saving, setSaving]               = useState(false);
  const [saveSuccess, setSaveSuccess]     = useState(false);
  const [editingEval, setEditingEval]     = useState<AgentEvaluation | null>(null);

  const [isLive, setIsLive]               = useState(false);
  const pollTimer                         = useRef<NodeJS.Timeout | null>(null);

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLive(true);
    try {
      const [agentsRes, evalsRes, statsRes] = await Promise.all([
        fetch('/api/agents'),
        fetch(`/api/evaluator/evaluations?evaluatorId=${evaluatorId}`),
        fetch('/api/evaluator/all-agent-stats')
      ]);

      if (agentsRes.ok) {
        const d = await agentsRes.json();
        setAgents(d.agents ?? []);
      }
      if (evalsRes.ok) {
        const d = await evalsRes.json();
        setMyEvals(d.evaluations ?? []);
      }
      if (statsRes.ok) {
        const d = await statsRes.json();
        setAllAgentStats(d.stats ?? []);
      }
    } catch { /* silent */ } finally {
      if (!isSilent) setTimeout(() => setIsLive(false), 2000);
    }
  }, [evaluatorId]);

  useEffect(() => {
    loadData();
    pollTimer.current = setInterval(() => loadData(true), 5000);
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [loadData]);

  const fetchAgentHistory = useCallback(async (agentId: string) => {
    setLoadingHistory(true);
    try { const d = await fetch(`/api/evaluator/evaluations?agentId=${agentId}`).then(r => r.json()); setAgentEvals(d.evaluations ?? []); }
    catch { setAgentEvals([]); } finally { setLoadingHistory(false); }
  }, []);

  const fetchAgentStats = useCallback(async (agentId: string) => {
    setLoadingStats(true);
    try { const d = await fetch(`/api/evaluator/agent-stats?agentId=${agentId}`).then(r => r.json()); setAgentStats(d.stats ?? null); }
    catch { setAgentStats(null); } finally { setLoadingStats(false); }
  }, []);

  useEffect(() => { if (selectedAgent && tab === 'history') fetchAgentHistory(selectedAgent.id); }, [selectedAgent, tab, fetchAgentHistory]);

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgent(agent); setTab('new'); setCriteria(emptyCriteria()); setSaveSuccess(false); setEditingEval(null); fetchAgentStats(agent.id);
  };

  const handleSave = async () => {
    if (!selectedAgent) return;
    setSaving(true);
    const totalScore = calcScore(criteria);
    try {
      const body = { agentId: selectedAgent.id, agentName: selectedAgent.name, evaluatorId, evaluatorName, criteria, totalScore, comments: criteria.generalRemark || criteria.qaThoughts, sessionNotes: '', sessionType: 'roleplay' };
      if (editingEval) { await fetch(`/api/evaluator/evaluations/${editingEval.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); }
      else { const data = await fetch('/api/evaluator/evaluations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json()); if (data.evaluation) setMyEvals(prev => [data.evaluation, ...prev]); }
      setSaveSuccess(true);
      setTimeout(() => { setCriteria(emptyCriteria()); setSaveSuccess(false); setEditingEval(null); fetchAgentHistory(selectedAgent.id); }, 1400);
    } catch { /* silent */ } finally { setSaving(false); }
  };

  const filteredAgents = agents.filter(a => a.name.toLowerCase().includes(agentSearch.toLowerCase()));
  const evaluatedIds   = new Set(myEvals.map(e => e.agentId));

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <ChangePasswordModal isOpen={isPwModalOpen} onClose={() => setIsPwModalOpen(false)} />

      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="px-5 py-4 flex items-center gap-4 shrink-0 bg-card/60 backdrop-blur-xl border-b border-border shadow-sm z-20 sticky top-0">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20"><ClipboardCheck size={20} className="text-white" /></div>
        <div className="flex flex-col">
          <span className="font-black text-xl leading-none">{t('panelTitle')}</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{t('roleLabel')}</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
            <div className={`w-1.5 h-1.5 rounded-full bg-blue-500 ${isLive ? 'animate-pulse' : ''}`} />
            <span className="text-xs font-black text-blue-600 dark:text-blue-400">{evaluatorName}</span>
            {isLive && <Loader2 size={10} className="animate-spin text-blue-500/50" />}
          </div>
          <LangToggle /><ThemeToggle />
          <button onClick={() => { fetch('/api/auth/session', { method: 'DELETE' }); window.location.replace('/login'); }} className="p-2 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"><LogOut size={18} /></button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Sidebar */}
        <aside className="w-64 xl:w-72 shrink-0 flex flex-col bg-card/40 backdrop-blur-md border-r border-border">
          <div className="p-4 space-y-4">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
              <input type="text" value={agentSearch} onChange={e => setAgentSearch(e.target.value)} placeholder={t('searchPlaceholder')} className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-secondary/40 border border-border focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
            </div>
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('agentCount', { count: filteredAgents.length })}</div>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
            {filteredAgents.map(agent => (
              <button key={agent.id} onClick={() => handleSelectAgent(agent)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${selectedAgent?.id === agent.id ? 'bg-primary/10 border-primary/20 text-primary' : 'hover:bg-secondary/40 text-muted-foreground hover:text-foreground'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${selectedAgent?.id === agent.id ? 'bg-primary/20' : 'bg-secondary'}`}>{agent.name.slice(0, 2).toUpperCase()}</div>
                <span className="text-sm font-bold truncate flex-1">{agent.name}</span>
                {evaluatedIds.has(agent.id) && <CheckCircle2 size={12} className="text-primary/60" />}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-secondary/10">
          {!selectedAgent ? (
            <OverviewPanel myEvals={myEvals} agents={agents} allAgentStats={allAgentStats} onEvaluate={handleSelectAgent} />
          ) : (
            <div className="h-full flex flex-col">
              <div className="px-6 py-4 flex items-center gap-4 bg-card/60 backdrop-blur-md border-b border-border sticky top-0 z-10">
                <button onClick={() => setSelectedAgent(null)} className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors"><ArrowLeft size={20} /></button>
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black">{selectedAgent.name.slice(0, 2).toUpperCase()}</div>
                <div className="flex-1 min-w-0"><h2 className="text-lg font-black truncate">{selectedAgent.name}</h2><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('salesEvalSubtitle')}</p></div>
                <div className="flex gap-1 p-1 rounded-xl bg-secondary/40 border border-border">
                  {(['new', 'history'] as const).map(tabId => <button key={tabId} onClick={() => setTab(tabId)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${tab === tabId ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{tabId === 'new' ? t('tabNew') : (agentEvals.length > 0 ? t('tabHistory', { count: agentEvals.length }) : t('tabHistoryEmpty'))}</button>)}
                </div>
              </div>

              <div className="flex-1 p-6">
                <div className="max-w-5xl mx-auto">
                  <AnimatePresence mode="wait">
                    {tab === 'new' ? (
                      <motion.div key="new" variants={FADE_IN} initial="initial" animate="animate" exit="exit" className="flex flex-col lg:flex-row gap-8">
                        <div className="w-full lg:w-80 shrink-0"><AgentPerformancePanel stats={agentStats} loading={loadingStats} /></div>
                        <div className="flex-1 space-y-6">
                          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-primary/5 border border-primary/10"><Activity size={18} className="text-primary" /><span className="text-sm font-bold text-primary">{t('salesSimBadge')}</span></div>
                          {editingEval && <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold"><span>{t('editBanner')}</span><button onClick={() => { setCriteria(emptyCriteria()); setEditingEval(null); }}><X size={16} /></button></div>}
                          <EvalForm criteria={criteria} onChange={setCriteria} />
                          <button onClick={handleSave} disabled={saving || saveSuccess} className={`w-full py-4 rounded-2xl font-black text-sm transition-all shadow-xl ${saveSuccess ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-primary text-white shadow-primary/20 hover:scale-[1.01] active:scale-[0.99]'}`}>{saving ? <Loader2 className="animate-spin mx-auto" size={20} /> : saveSuccess ? <Check className="mx-auto" size={20} /> : (editingEval ? t('saveBtnEdit') : t('saveBtnNew', { score: calcScore(criteria) }))}</button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="history" variants={FADE_IN} initial="initial" animate="animate" exit="exit" className="max-w-2xl mx-auto space-y-4">
                        {loadingHistory ? <div className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-primary/40" size={32} /></div> : agentEvals.length === 0 ? <div className="py-12 text-center opacity-40"><ClipboardCheck className="mx-auto mb-4" size={48} /><p>{t('noHistory')}</p></div> : agentEvals.map(ev => <EvalHistoryCard key={ev.id} ev={ev} onEdit={ev => { setEditingEval(ev); setCriteria(ev.criteria as SalesCallCriteria); setTab('new'); }} />)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
