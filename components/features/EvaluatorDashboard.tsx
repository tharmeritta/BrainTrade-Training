'use client';

/**
 * EvaluatorDashboard — Sales Simulation evaluation interface.
 * Fully theme-aware (light/dark) and bilingual (TH/EN) using next-intl.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Search, Users, ClipboardCheck, Check, Clock, Edit3, X,
  ChevronDown, Loader2, Star, BarChart3, Activity, TrendingUp,
  BookOpen, Target, ArrowLeft, CheckCircle2, Circle, Zap,
  AlertTriangle, LogOut, ChevronRight, ShieldCheck, AlertCircle,
  Flag,
} from 'lucide-react';

import ThemeToggle from '@/components/ui/ThemeToggle';
import LangToggle from '@/components/ui/LangToggle';
import { FADE_IN, STAGGER_CONTAINER, STAGGER_ITEM, EASE } from '@/lib/animations';
import { getCompletionStatus, type CompletionStatus } from '@/lib/completion';
import { BADGE_CONFIG } from '@/components/features/admin/AdminHelpers';
import ChangePasswordModal from '@/components/features/admin/ChangePasswordModal';
import { StatusPipeline } from '@/components/features/admin/AdminComponents';

import type {
  Agent, AgentEvaluation, AgentStats,
  SalesCallCriteria, SalesCallPerformanceItem,
} from '@/types';

// --- Config ---

const PERFORMANCE_KEYS: (keyof SalesCallCriteria['performance'])[] = [
  'agentStruggle', 'unhandledQuestions', 'toneOfVoice', 'chemistryFriendliness',
];

const RED_FLAG_KEYS: (keyof SalesCallCriteria['redFlags'])[] = [
  'officeLocation', 'withdrawalAfterDeposit', 'exaggeratingProfit', 'actualCommission',
];

const STATUS_CFG: Record<CompletionStatus, { color: string; bg: string; border: string; dot: string; label: string }> = {
  'needs-eval':  { color: 'text-amber-400',       bg: 'bg-amber-500/10',    border: 'border-amber-500/25',   dot: 'bg-amber-400',              label: 'Needs Eval'  },
  'cleared':     { color: 'text-emerald-400',      bg: 'bg-emerald-500/10',  border: 'border-emerald-500/25', dot: 'bg-emerald-400',            label: 'Cleared'     },
  'in-progress': { color: 'text-blue-400',         bg: 'bg-blue-500/10',     border: 'border-blue-500/25',    dot: 'bg-blue-400',               label: 'In Progress' },
  'not-started': { color: 'text-muted-foreground', bg: 'bg-secondary/30',    border: 'border-border',         dot: 'bg-muted-foreground/30',    label: 'Not Started' },
};

const STATUS_ORDER: Record<CompletionStatus, number> = {
  'needs-eval': 0, 'in-progress': 1, 'cleared': 2, 'not-started': 3,
};

// --- Helpers ---

function emptyPerf(): SalesCallPerformanceItem {
  return { agentInvolve: false, comment: '', remark: '' };
}

function emptyCriteria(): SalesCallCriteria {
  return {
    performance: {
      agentStruggle: emptyPerf(), unhandledQuestions: emptyPerf(),
      toneOfVoice: emptyPerf(), chemistryFriendliness: emptyPerf(),
    },
    qaThoughts: '',
    qaImpact: 'none',
    redFlags: {
      officeLocation: false, withdrawalAfterDeposit: false,
      exaggeratingProfit: false, actualCommission: false,
    },
    generalRemark: '',
    finalResult: 'passed',
    failReason: '',
  };
}

function calcScore(criteria: SalesCallCriteria): number {
  if (criteria.finalResult === 'failed') return 0;
  return Math.max(0, 100 - Object.values(criteria.redFlags).filter(Boolean).length * 25);
}

function scoreHex(n: number) {
  return n >= 70 ? '#60A5FA' : n >= 50 ? '#FBBF24' : '#F87171';
}

function timeAgo(iso: string | null, t: (key: string, p?: any) => string): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 2)  return t('justNow');
  if (m < 60) return t('minAgo', { m });
  const h = Math.floor(m / 60);
  if (h < 24) return t('hourAgo', { h });
  return t('dayAgo', { d: Math.floor(h / 24) });
}

// --- ScoreRing ---

const ScoreRing = ({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' }) => {
  const dim  = size === 'sm' ? 52 : 68;
  const r    = size === 'sm' ? 18 : 26;
  const sw   = size === 'sm' ? 3.5 : 4.5;
  const fs   = size === 'sm' ? 12 : 15;
  const circ = 2 * Math.PI * r;
  const clr  = scoreHex(score);
  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: dim, height: dim }}>
      <svg className="absolute inset-0" viewBox={`0 0 ${dim} ${dim}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={dim/2} cy={dim/2} r={r} fill="none" stroke="currentColor" className="text-muted-foreground/15" strokeWidth={sw} />
        <motion.circle
          cx={dim/2} cy={dim/2} r={r} fill="none" stroke={clr} strokeWidth={sw}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (score / 100) * circ }}
          transition={{ duration: 1.2, ease: EASE.smooth }}
          style={{ filter: `drop-shadow(0 0 4px ${clr}50)` }}
        />
      </svg>
      <span className="font-black tabular-nums" style={{ color: clr, fontSize: fs }}>{score}</span>
    </div>
  );
};

// --- AgentPerformancePanel ---

const AgentPerformancePanel = ({
  stats, loading,
}: {
  stats: AgentStats | null;
  loading: boolean;
}) => {
  const t      = useTranslations('evaluator');
  const navT   = useTranslations('nav');
  const adminT = useTranslations('admin');
  const [activeTab, setActiveTab] = useState<'overview' | 'quiz' | 'ai' | 'qa'>('overview');

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 size={22} className="animate-spin text-blue-500/40" />
    </div>
  );
  if (!stats) return (
    <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground/40">
      <BarChart3 size={28} />
      <p className="text-sm">{t('noTrainingData')}</p>
    </div>
  );

  const badge               = BADGE_CONFIG[stats.badge] ?? BADGE_CONFIG['needs-work'];
  const quizTopics          = ['foundation', 'product', 'process', 'payment'] as const;
  const quizPassedCount     = quizTopics.filter(m => stats.quiz[m]?.passed).length;
  const completedEvalLevels = stats.evalCompletedLevels ?? [];
  const aiHistory           = stats.aiEval?.history ?? [];
  const qaHistory           = stats.humanEvaluations ?? [];

  const tabs = [
    { id: 'overview' as const, label: t('tabOverview'), icon: BarChart3 },
    { id: 'quiz'     as const, label: t('tabQuiz'),     icon: Target },
    { id: 'ai'       as const, label: t('tabAiEval'),   icon: Zap },
    { id: 'qa'       as const, label: t('tabQa'),       icon: ClipboardCheck },
  ];

  return (
    <motion.div variants={FADE_IN} initial="initial" animate="animate" className="space-y-3">

      {/* Score header */}
      <div className="bg-card border border-border rounded-2xl p-3 flex items-center gap-3">
        <ScoreRing score={stats.overallScore} />
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground mb-1">{t('trainingScore')}</div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full inline-block ${badge.bg} ${badge.text}`}>
            {adminT(`badges.${stats.badge}`)}
          </span>
          {stats.lastActive && (
            <div className="flex items-center gap-1 mt-1.5">
              <Clock size={10} className="text-muted-foreground/40" />
              <span className="text-xs text-muted-foreground/50">{timeAgo(stats.lastActive, t)}</span>
            </div>
          )}
        </div>
        {/* Quick module status chips */}
        <div className="flex flex-col gap-1.5 shrink-0 items-end">
          <div className="flex items-center gap-1">
            <Target size={10} className="text-amber-400" />
            <span className="text-[10px] font-bold text-foreground">{quizPassedCount}/4</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded flex items-center justify-center"
              style={{
                background: (completedEvalLevels.length > 0) ? 'rgba(167,139,250,0.18)' : 'hsl(var(--secondary))',
                color: (completedEvalLevels.length > 0) ? '#A78BFA' : 'hsl(var(--muted-foreground) / 0.3)',
                border: `1px solid ${(completedEvalLevels.length > 0) ? 'rgba(167,139,250,0.35)' : 'hsl(var(--border))'}`,
              }}
            >
              {(completedEvalLevels.length > 0) && <Check size={8} />}
            </div>
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">AI Eval</span>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-0.5 p-1 bg-secondary/30 border border-border rounded-xl">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
              activeTab === tab.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon size={10} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-2">

          {/* ── Overview ── */}
          {activeTab === 'overview' && (
            <>
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-3 py-2 border-b border-border bg-secondary/20">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{t('trainingProgress')}</span>
                </div>
                <div className="p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target size={12} className="text-amber-400" />
                      <span className="text-xs font-semibold text-foreground">{navT('quiz')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">{quizPassedCount}/4</span>
                      <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${quizPassedCount / 4 * 100}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap size={12} className="text-purple-400" />
                      <span className="text-xs font-semibold text-foreground">{navT('aiEval')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {stats.aiEval
                        ? <span className="text-xs font-bold" style={{ color: scoreHex(stats.aiEval.avgScore) }}>{stats.aiEval.avgScore}/100</span>
                        : <span className="text-xs text-muted-foreground/40">—</span>
                      }
                      <div className="w-4 h-4 rounded flex items-center justify-center"
                        style={{
                          background: (completedEvalLevels.length > 0) ? 'rgba(167,139,250,0.18)' : 'hsl(var(--secondary))',
                          color: (completedEvalLevels.length > 0) ? '#A78BFA' : 'hsl(var(--muted-foreground) / 0.3)',
                          border: `1px solid ${(completedEvalLevels.length > 0) ? 'rgba(167,139,250,0.35)' : 'hsl(var(--border))'}`,
                        }}
                      >
                        {(completedEvalLevels.length > 0) && <Check size={8} />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Quiz summary */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-3 py-2 border-b border-border bg-secondary/20">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{t('quizScores')}</span>
                </div>
                <div className="p-3 space-y-2">
                  {quizTopics.map(m => {
                    const qs = stats.quiz[m];
                    return (
                      <div key={m} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {qs?.passed
                            ? <CheckCircle2 size={11} className="text-blue-500" />
                            : qs ? <AlertTriangle size={11} className="text-amber-400" />
                                 : <Circle size={11} className="text-muted-foreground/25" />
                          }
                          <span className="text-xs capitalize text-foreground">{adminT(`modules.${m}`)}</span>
                        </div>
                        {qs ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold" style={{ color: qs.passed ? '#60A5FA' : '#F87171' }}>{qs.bestScore}%</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                              style={{ background: qs.passed ? 'rgba(96,165,250,0.1)' : 'rgba(248,113,113,0.1)', color: qs.passed ? '#60A5FA' : '#F87171' }}>
                              {qs.passed ? t('passedLabel') : t('failedLabel')}
                            </span>
                          </div>
                        ) : <span className="text-xs text-muted-foreground/30">—</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ── Quiz Detail ── */}
          {activeTab === 'quiz' && (
            <div className="space-y-2">
              {quizTopics.map(m => {
                const qs      = stats.quiz[m];
                const history = qs?.history ?? [];
                return (
                  <div key={m} className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 bg-secondary/20 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        {qs?.passed
                          ? <CheckCircle2 size={11} className="text-blue-500" />
                          : qs ? <AlertTriangle size={11} className="text-amber-400" />
                               : <Circle size={11} className="text-muted-foreground/25" />
                        }
                        <span className="text-xs font-bold capitalize text-foreground">{adminT(`modules.${m}`)}</span>
                      </div>
                      {qs ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold" style={{ color: qs.passed ? '#60A5FA' : '#F87171' }}>{qs.bestScore}%</span>
                          <span className="text-[9px] text-muted-foreground/50">{qs.attempts} att.</span>
                        </div>
                      ) : <span className="text-[10px] text-muted-foreground/30">—</span>}
                    </div>
                    {history.length > 0 ? (
                      <div className="p-2 space-y-1">
                        {history.map((h, i) => (
                          <div key={i} className="flex items-center justify-between px-2 py-1 rounded-lg bg-secondary/30 text-[10px]">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${h.passed ? 'bg-blue-500' : 'bg-red-500'}`} />
                              <span className="font-semibold text-foreground">{h.score}/{h.total}</span>
                              <span className="text-muted-foreground">({Math.round(h.score / h.total * 100)}%)</span>
                            </div>
                            <span className="text-muted-foreground/60">{new Date(h.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-3 py-2 text-[10px] text-muted-foreground/40 italic">{adminT('agentDetail.noAttempts')}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── AI Eval Detail — unified history ── */}
          {activeTab === 'ai' && (
            <div className="space-y-2">
              {aiHistory.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground/40 text-xs rounded-xl border border-dashed border-border">
                  {adminT('agentDetail.noAiSessions')}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="bg-card border border-border p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('aiEvalAvg')}</div>
                        <div className="text-xl font-black text-foreground">{stats.aiEval?.avgScore}/100</div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-black ${(completedEvalLevels.length > 0) ? 'bg-purple-500/15 text-purple-400' : 'bg-secondary text-muted-foreground'}`}>
                        {(completedEvalLevels.length > 0) ? t('passedLabel') : adminT('agentDetail.inProgress')}
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      {aiHistory.map((h, i) => (
                        <div key={i} className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-secondary/30 border border-border/50">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-2 h-2 rounded-full ${h.passed ? 'bg-purple-400 shadow-[0_0_8px_rgba(167,139,250,0.5)]' : 'bg-amber-400'}`} />
                            <span className="font-bold" style={{ color: scoreHex(h.score) }}>{h.score}/100</span>
                            {h.passed && <span className="text-[10px] font-black text-purple-400 uppercase ml-1">Passed</span>}
                          </div>
                          <span className="text-muted-foreground/60 text-[10px]">{new Date(h.timestamp).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── QA / Human Eval Detail ── */}
          {activeTab === 'qa' && (
            <div className="space-y-2">
              {qaHistory.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground/40 text-xs rounded-xl border border-dashed border-border">
                  {adminT('agentDetail.noHumanEvals')}
                </div>
              ) : qaHistory.map((ev, i) => {
                const c     = ev.criteria as SalesCallCriteria;
                const flags = c?.redFlags ? Object.values(c.redFlags).filter(Boolean).length : 0;
                return (
                  <div key={ev.id ?? i} className="bg-card border border-border rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-3">
                      <ScoreRing score={ev.totalScore} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-foreground">{ev.evaluatorName}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${c?.finalResult === 'failed' ? 'bg-red-500/15 text-red-500' : 'bg-emerald-500/15 text-emerald-500'}`}>
                            {c?.finalResult === 'failed' ? t('failedCaps') : t('passedCaps')}
                          </span>
                          {flags > 0 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 flex items-center gap-0.5 shrink-0">
                              <Flag size={7} /> {flags}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock size={9} className="text-muted-foreground/40" />
                          <span className="text-[10px] text-muted-foreground/40">{timeAgo(ev.evaluatedAt, t)}</span>
                        </div>
                      </div>
                    </div>
                    {c?.generalRemark && (
                      <p className="text-[10px] text-muted-foreground/70 leading-snug pl-2 border-l-2 border-border">{c.generalRemark}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

// --- EvalForm ---

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
        <div className="px-4 py-3 bg-blue-500/[0.07] border-b border-border flex items-center justify-between">
          <span className="text-xs font-black text-foreground uppercase tracking-wider">{t('agentPerfHeader')}</span>
          {(() => {
            const n = PERFORMANCE_KEYS.filter(k => criteria.performance[k].agentInvolve || criteria.performance[k].comment).length;
            const done = n === PERFORMANCE_KEYS.length;
            return (
              <span className={`text-[10px] font-semibold flex items-center gap-1 ${done ? 'text-emerald-400' : 'text-muted-foreground/40'}`}>
                {done && <Check size={9} />}
                {t('itemsFilled', { n, total: PERFORMANCE_KEYS.length })}
              </span>
            );
          })()}
        </div>
        <div className="p-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PERFORMANCE_KEYS.map((key) => {
            const perf = criteria.performance[key];
            const isUnhandled = key === 'unhandledQuestions';
            const isActive = perf.agentInvolve;

            const activeBorder    = isUnhandled ? 'border-red-500/30' : 'border-blue-500/30';
            const activeBg        = isUnhandled ? 'bg-red-500/[0.04]' : 'bg-blue-500/[0.04]';
            const activeText      = isUnhandled ? 'text-red-400' : 'text-blue-400';
            const activeToggleBg  = isUnhandled ? 'bg-red-500' : 'bg-blue-500';

            return (
              <div key={key}
                className={`rounded-xl border p-3 space-y-2 transition-colors ${isActive ? `${activeBorder} ${activeBg}` : 'border-border bg-card'}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-semibold leading-snug ${isActive ? activeText : 'text-foreground'}`}>
                    {t(`performanceItems.${key}`)}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] font-black ${isActive ? activeText : 'text-muted-foreground/50'}`}>
                      {isActive ? t('yLabel') : t('nLabel')}
                    </span>
                    <button
                      onClick={() => setPerf(key, 'agentInvolve', !perf.agentInvolve)}
                      className={`w-9 h-5 rounded-full relative transition-all shadow-inner ${isActive ? activeToggleBg : 'bg-secondary border border-border'}`}
                    >
                      <motion.div
                        animate={{ x: isActive ? 17 : 2 }}
                        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center"
                      >
                        {isActive ? <Check size={7} className={isUnhandled ? 'text-red-500' : 'text-blue-500'} /> : <X size={7} className="text-muted-foreground" />}
                      </motion.div>
                    </button>
                  </div>
                </div>
                <textarea
                  value={perf.comment} onChange={e => setPerf(key, 'comment', e.target.value)}
                  placeholder={t('commentPlaceholder')} rows={1}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-xs text-foreground outline-none resize-none transition-colors placeholder:text-muted-foreground/40 bg-secondary/40 border border-border ${isActive && isUnhandled ? 'focus:border-red-500/40' : 'focus:border-blue-500/40'}`}
                />
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Section 2: QA Thoughts */}
      <motion.div variants={STAGGER_ITEM} className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
        <div className="px-4 py-3 bg-blue-500/[0.07] border-b border-border flex items-center justify-between">
          <span className="text-xs font-black text-foreground uppercase tracking-wider">{t('qaHeader')}</span>
          {criteria.qaThoughts.trim() && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />}
        </div>
        <div className="p-3 space-y-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">{t('qaLabel')}</label>
            <textarea
              value={criteria.qaThoughts} onChange={e => onChange({ ...criteria, qaThoughts: e.target.value })}
              placeholder={t('qaPlaceholder')} rows={3}
              className="w-full px-3 py-2 rounded-xl text-sm text-foreground outline-none resize-none transition-colors placeholder:text-muted-foreground/40 bg-secondary/40 border border-border focus:border-blue-500/40"
            />
          </div>

          <div className="pt-1.5 border-t border-border/50">
            <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">{t('qaImpactLabel')}</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['none', 'notify_improve', 'immediate_fail'] as const).map(impact => {
                const isActive = criteria.qaImpact === impact;
                let activeClass = 'bg-primary/10 border-primary text-primary shadow-sm';
                if (impact === 'immediate_fail') activeClass = 'bg-red-500/10 border-red-500 text-red-500 shadow-sm';
                else if (impact === 'notify_improve') activeClass = 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-sm';

                return (
                  <button
                    key={impact}
                    onClick={() => onChange({ ...criteria, qaImpact: impact })}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center gap-1 ${isActive ? activeClass : 'bg-secondary/40 border-border text-muted-foreground hover:bg-secondary/60'}`}
                  >
                    {impact === 'none' && <Activity size={10} />}
                    {impact === 'notify_improve' && <Zap size={10} />}
                    {impact === 'immediate_fail' && <AlertTriangle size={10} />}
                    {t(impact === 'none' ? 'qaImpactNone' : impact === 'notify_improve' ? 'qaImpactNotifyImprove' : 'qaImpactImmediateFail')}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section 3: Red Flags */}
      <motion.div variants={STAGGER_ITEM} className={`rounded-2xl overflow-hidden border transition-colors shadow-sm ${redFlagCount === 4 ? 'border-red-500/60' : redFlagCount > 0 ? 'border-red-500/35' : 'border-border'}`}>
        <div className={`px-4 py-3 flex items-center justify-between border-b border-border ${redFlagCount === 4 ? 'bg-red-500/20' : redFlagCount > 0 ? 'bg-red-500/10' : 'bg-red-500/5'}`}>
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-400" />
            <span className="text-xs font-black text-foreground uppercase tracking-wider">{t('redFlagHeader')}</span>
          </div>
          <div className="flex items-center gap-2">
            {redFlagCount > 0 && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40">
                −{redFlagCount * 25} pts
              </span>
            )}
            {redFlagCount === 4 && (
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-red-600/30 text-red-300 border border-red-500/50 animate-pulse">
                {t('failedCaps')}
              </span>
            )}
          </div>
        </div>
        <div className="px-4 py-2 text-xs text-muted-foreground bg-secondary/10 border-b border-border">{t('redFlagNote')}</div>
        <div>
          {RED_FLAG_KEYS.map((key, i) => {
            const checked = criteria.redFlags[key];
            return (
              <div key={key} className={`px-4 py-3 ${checked ? 'bg-red-500/5' : i % 2 === 0 ? 'bg-card' : 'bg-secondary/20'} ${i < RED_FLAG_KEYS.length - 1 ? 'border-b border-border' : ''}`}>
                <div className="flex items-start gap-3">
                  <button onClick={() => setRedFlag(key, !checked)}
                    className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border shrink-0 ${checked ? 'bg-red-500/30 border-red-500/70' : 'bg-secondary border-border'}`}>
                    {checked && <X size={9} className="text-red-400" />}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-semibold ${checked ? 'text-red-400' : 'text-foreground'}`}>{t(`redFlagItems.${key}.label`)}</span>
                      {checked
                        ? <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400">{t('redFlagPts')}</span>
                        : <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-secondary text-muted-foreground/35">{t('ptsIfFlagged')}</span>
                      }
                    </div>
                    <div className="text-xs text-muted-foreground/60 mt-0.5">{t(`redFlagItems.${key}.guideline`)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Section 4: Final Evaluation Result */}
      <motion.div variants={STAGGER_ITEM} className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
        <div className="px-4 py-3 bg-primary/5 border-b border-border flex items-center justify-between">
          <span className="text-xs font-black text-foreground uppercase tracking-wider">{t('finalResultHeader')}</span>
        </div>
        <div className="p-3 space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => onChange({ ...criteria, finalResult: 'passed' })}
              className={`flex-1 py-2.5 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${criteria.finalResult === 'passed' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 shadow-lg shadow-emerald-500/10' : 'border-border bg-secondary/20 text-muted-foreground opacity-60 hover:opacity-100'}`}
            >
              <CheckCircle2 size={16} />
              <span className="text-sm font-black">{t('finalResultPassed')}</span>
            </button>
            <button
              onClick={() => onChange({ ...criteria, finalResult: 'failed' })}
              className={`flex-1 py-2.5 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${criteria.finalResult === 'failed' ? 'border-red-500 bg-red-500/10 text-red-600 shadow-lg shadow-red-500/10' : 'border-border bg-secondary/20 text-muted-foreground opacity-60 hover:opacity-100'}`}
            >
              <AlertCircle size={16} />
              <span className="text-sm font-black">{t('finalResultFailed')}</span>
            </button>
          </div>

          {criteria.finalResult === 'failed' && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
              <label className="text-xs font-bold text-red-500 uppercase tracking-widest">{t('failReasonLabel')}</label>
              <textarea
                value={criteria.failReason || ''}
                onChange={e => onChange({ ...criteria, failReason: e.target.value })}
                placeholder={t('failReasonPlaceholder')}
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-sm text-foreground outline-none resize-none bg-red-500/[0.03] border border-red-500/20 focus:border-red-500/40"
              />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* General Remark */}
      <motion.div variants={STAGGER_ITEM}>
        <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">
          {t('generalRemarkLabel')}
          {criteria.generalRemark.trim() && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />}
        </label>
        <textarea
          value={criteria.generalRemark} onChange={e => onChange({ ...criteria, generalRemark: e.target.value })}
          placeholder={t('generalRemarkPlaceholder')} rows={2}
          className="w-full px-3 py-2 rounded-xl text-sm text-foreground outline-none resize-none bg-secondary/40 border border-border focus:border-blue-500/40"
        />
      </motion.div>
    </motion.div>
  );
};

// --- EvalHistoryCard ---

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
        <div className="relative shrink-0">
          <ScoreRing score={ev.totalScore} size="sm" />
          {c?.finalResult === 'failed' && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 border-2 border-card">
              <X size={8} strokeWidth={4} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-sm font-bold text-foreground">{t('salesSimLabel')}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${c?.finalResult === 'failed' ? 'bg-red-500/15 text-red-500 border border-red-500/20' : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20'}`}>
              {c?.finalResult === 'failed' ? t('failedCaps') : t('passedCaps')}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{ev.evaluatorName}</span>
            {redFlagCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 flex items-center gap-1">
                <Flag size={8} /> {redFlagCount}
              </span>
            )}
          </div>
          {c?.generalRemark && <p className="text-xs text-muted-foreground truncate">{c.generalRemark}</p>}
          <div className="flex items-center gap-1 mt-1">
            <Clock size={9} className="text-muted-foreground/40" />
            <span className="text-[10px] text-muted-foreground/40">{timeAgo(ev.evaluatedAt, t)}</span>
          </div>
        </div>
        <ChevronDown size={13} className={`text-muted-foreground transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-3 border-t border-border bg-secondary/10">
              {c?.finalResult === 'failed' && c?.failReason && (
                <div className="pt-3">
                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3">
                    <div className="text-[10px] font-bold text-red-500 uppercase mb-1 flex items-center gap-1.5">
                      <AlertCircle size={10} /> {t('reasonForFailure')}
                    </div>
                    <p className="text-sm text-foreground">{c.failReason}</p>
                  </div>
                </div>
              )}
              
              {c?.performance && (
                <div className="pt-3 space-y-2">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">{t('agentPerfSection')}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PERFORMANCE_KEYS.map(key => {
                      const p = c.performance[key];
                      if (!p?.comment && !p?.agentInvolve) return null;
                      return (
                        <div key={key} className="flex items-start gap-2 bg-card p-2.5 rounded-xl border border-border">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${p.agentInvolve ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-secondary text-muted-foreground border border-border'}`}>
                            {p.agentInvolve ? t('yLabel') : t('nLabel')}
                          </span>
                          <div className="min-w-0">
                            <div className="text-[10px] font-bold text-muted-foreground truncate">{t(`performanceItems.${key}`)}</div>
                            {p.comment && <div className="text-xs text-foreground mt-0.5 leading-snug">{p.comment}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {c?.qaThoughts && (
                <div className="rounded-xl p-3 bg-card border border-border">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">{t('qaSection')}</div>
                    {c?.qaImpact && c.qaImpact !== 'none' && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${c.qaImpact === 'immediate_fail' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                        {c.qaImpact === 'immediate_fail' ? <AlertTriangle size={8} /> : <Zap size={8} />}
                        {t(c.qaImpact === 'notify_improve' ? 'qaImpactNotifyImprove' : 'qaImpactImmediateFail')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{c.qaThoughts}</p>
                </div>
              )}

              {c?.redFlags && Object.values(c.redFlags).some(Boolean) && (
                <div className="rounded-xl p-3 bg-red-500/5 border border-red-500/20">
                  <div className="text-[10px] font-bold text-red-400/70 uppercase mb-2 flex items-center gap-1.5">
                    <AlertTriangle size={10} /> {t('redFlagsTitle')}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {RED_FLAG_KEYS.filter(k => c.redFlags[k]).map(key => (
                      <div key={key} className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 border border-red-500/20">
                        <X size={8} className="text-red-400 shrink-0" />
                        <span className="text-[10px] font-bold text-red-400">{t(`redFlagItems.${key}.label`)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={() => onEdit(ev)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors pt-2">
                <Edit3 size={12} /> {t('editLabel')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- OverviewPanel ---

const OverviewPanel = ({
  myEvals, agents, allAgentStats, onEvaluate,
}: {
  myEvals: AgentEvaluation[];
  agents: Agent[];
  allAgentStats: AgentStats[];
  onEvaluate: (agent: Agent) => void;
}) => {
  const t      = useTranslations('evaluator');
  const adminT = useTranslations('admin');
  const evaluatedIds = new Set(myEvals.map(e => e.agentId));
  const recent       = myEvals.slice(0, 5);

  // Priority queue — agents who need evaluation
  const needsEvalStats = allAgentStats.filter(s => getCompletionStatus(s).status === 'needs-eval');

  const stats = [
    { label: t('totalEvals'),       value: myEvals.length,           icon: ClipboardCheck, color: '#A78BFA' },
    { label: t('todayEvals'),        value: myEvals.filter(e => new Date(e.evaluatedAt).toDateString() === new Date().toDateString()).length, icon: Activity, color: '#60A5FA' },
    { label: t('avgScore'),          value: myEvals.length > 0 ? `${Math.round(myEvals.reduce((s, e) => s + e.totalScore, 0) / myEvals.length)}/100` : '—', icon: Star, color: '#FBBF24' },
    { label: t('trainingTeamAvg'),   value: allAgentStats.length > 0 ? `${Math.round(allAgentStats.reduce((s, a) => s + a.overallScore, 0) / allAgentStats.length)}/100` : '—', icon: Users, color: '#10B981' },
  ];

  return (
    <motion.div variants={STAGGER_CONTAINER} initial="initial" animate="animate" className="space-y-8">

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((k, i) => (
          <motion.div key={i} variants={STAGGER_ITEM} className="bg-card/60 backdrop-blur-md border border-border rounded-2xl p-5 shadow-sm hover:border-primary/20 transition-colors">
            <div className="p-2 rounded-xl w-fit mb-3" style={{ background: `${k.color}15` }}>
              <k.icon size={16} style={{ color: k.color }} />
            </div>
            <div className="text-2xl font-black text-foreground">{k.value}</div>
            <div className="text-xs font-medium text-muted-foreground mt-0.5">{k.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Priority Queue: Needs Evaluation */}
      {needsEvalStats.length > 0 && (
        <motion.div variants={STAGGER_ITEM}>
          <div className="bg-amber-500/5 border border-amber-500/25 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-amber-500/15 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/15">
                  <AlertCircle size={15} className="text-amber-400" />
                </div>
                <div>
                  <div className="text-sm font-black text-foreground">{t('needsEvaluation')}</div>
                  <div className="text-xs text-muted-foreground">{t('needsEvalDesc', { count: needsEvalStats.length })}</div>
                </div>
              </div>
              <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                {t('pendingCaps')}
              </span>
            </div>
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
              {needsEvalStats.map(s => (
                <motion.div key={s.agent.id} variants={STAGGER_ITEM}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card/60 border border-amber-500/15 hover:border-amber-500/30 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm font-black text-amber-500 shrink-0">
                    {s.agent.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-foreground truncate">{s.agent.name}</div>
                    <div className="text-xs text-muted-foreground">{t('scoreLabel')} {s.overallScore}%</div>
                  </div>
                  <button
                    onClick={() => onEvaluate(s.agent)}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 border border-amber-500/30 transition-all"
                  >
                    {t('evaluate')}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Mini pipeline summary */}
      <motion.div variants={STAGGER_ITEM}>
        <StatusPipeline stats={allAgentStats} />
      </motion.div>

      {/* All Agents grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('agentsGrid')}</div>
          <span className="text-xs text-muted-foreground/60">{t('agentCount', { count: allAgentStats.length })}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {allAgentStats
            .map(s => ({ ...s, completion: getCompletionStatus(s) }))
            .sort((a, b) => STATUS_ORDER[a.completion.status] - STATUS_ORDER[b.completion.status])
            .map(s => {
              const cfg = STATUS_CFG[s.completion.status];
              return (
                <motion.div key={s.agent.id} variants={STAGGER_ITEM}
                  className="bg-card/60 backdrop-blur-md border border-border rounded-2xl overflow-hidden hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
                  <div className="p-4 flex items-start gap-3">
                    <ScoreRing score={s.overallScore} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-black text-foreground truncate">{s.agent.name}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${BADGE_CONFIG[s.badge].bg} ${BADGE_CONFIG[s.badge].text}`}>
                          {adminT(`badges.${s.badge}`)}
                        </span>
                      </div>
                      <div className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {t(s.completion.status === 'not-started' ? 'statusNotStarted' : s.completion.status === 'in-progress' ? 'statusInProgress' : s.completion.status === 'needs-eval' ? 'statusNeedsEval' : 'statusCleared')}
                        {evaluatedIds.has(s.agent.id) && <span className="ml-1 opacity-60">· {t('evaluatedLabel')}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => onEvaluate(s.agent)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <ClipboardCheck size={12} /> {t('evaluate')}
                    </button>
                  </div>
                </motion.div>
              );
            })
          }
        </div>
      </div>

      {/* Recent Evaluations */}
      {recent.length > 0 && (
        <div className="space-y-4">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('recentEvals')}</div>
          <div className="space-y-2">
            {recent.map(ev => (
              <motion.div key={ev.id} variants={STAGGER_ITEM}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/20 border border-border hover:bg-secondary/30 transition-colors">
                <ScoreRing score={ev.totalScore} size="sm" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-foreground truncate block">{agents.find(a => a.id === ev.agentId)?.name ?? ev.agentName}</span>
                  <div className="text-xs text-muted-foreground truncate">{ev.comments || '—'}</div>
                </div>
                <div className="text-xs text-muted-foreground/50 shrink-0">{timeAgo(ev.evaluatedAt, t)}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// --- Main Component ---

interface EvaluatorDashboardProps {
  evaluatorId: string;
  evaluatorName: string;
  passwordChanged: boolean;
}

export default function EvaluatorDashboard({ evaluatorId, evaluatorName, passwordChanged }: EvaluatorDashboardProps) {
  const t = useTranslations('evaluator');

  // Layout state
  const [sidebarCollapsed, setSidebarCollapsed]   = useState(false);
  const [profileOpen, setProfileOpen]             = useState(false);
  const [isPwModalOpen, setIsPwModalOpen]         = useState(false);

  // Data state
  const [agents, setAgents]                 = useState<Agent[]>([]);
  const [agentSearch, setAgentSearch]       = useState('');
  const [statusFilter, setStatusFilter]     = useState<CompletionStatus | ''>('');
  const [selectedAgent, setSelectedAgent]   = useState<Agent | null>(null);
  const [tab, setTab]                       = useState<'new' | 'history'>('new');
  const [agentStats, setAgentStats]         = useState<AgentStats | null>(null);
  const [loadingStats, setLoadingStats]     = useState(false);
  const [allAgentStats, setAllAgentStats]   = useState<AgentStats[]>([]);
  const [myEvals, setMyEvals]               = useState<AgentEvaluation[]>([]);
  const [agentEvals, setAgentEvals]         = useState<AgentEvaluation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [criteria, setCriteria]             = useState<SalesCallCriteria>(emptyCriteria());
  const [saving, setSaving]                 = useState(false);
  const [saveSuccess, setSaveSuccess]       = useState(false);
  const [saveError, setSaveError]           = useState(false);
  const [editingEval, setEditingEval]       = useState<AgentEvaluation | null>(null);

  const [isLive, setIsLive]     = useState(false);
  const pollTimer               = useRef<NodeJS.Timeout | null>(null);

  // Load overview data
  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLive(true);
    try {
      const [agentsRes, evalsRes, statsRes] = await Promise.all([
        fetch('/api/agents'),
        fetch(`/api/evaluator/evaluations?evaluatorId=${evaluatorId}`),
        fetch('/api/evaluator/all-agent-stats'),
      ]);
      if (agentsRes.ok)  { const d = await agentsRes.json();  setAgents(d.agents ?? []); }
      if (evalsRes.ok)   { const d = await evalsRes.json();   setMyEvals(d.evaluations ?? []); }
      if (statsRes.ok)   { const d = await statsRes.json();   setAllAgentStats(d.stats ?? []); }
    } catch { /* silent */ } finally {
      if (!isSilent) setTimeout(() => setIsLive(false), 2000);
    }
  }, [evaluatorId]);

  useEffect(() => {
    loadData();
    pollTimer.current = setInterval(() => loadData(true), 5000);
    return () => { if (pollTimer.current) clearInterval(pollTimer.current); };
  }, [loadData]);

  // Force password change on first login
  useEffect(() => {
    if (!passwordChanged) setIsPwModalOpen(true);
  }, [passwordChanged]);

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

  useEffect(() => {
    if (selectedAgent && tab === 'history') fetchAgentHistory(selectedAgent.id);
  }, [selectedAgent, tab, fetchAgentHistory]);

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setTab('new');
    setCriteria(emptyCriteria());
    setSaveSuccess(false);
    setEditingEval(null);
    fetchAgentStats(agent.id);
    fetchAgentHistory(agent.id);
  };

  const handleSave = async () => {
    if (!selectedAgent) return;
    setSaving(true);
    const totalScore = calcScore(criteria);
    try {
      // Create a summary comment for the list view
      let summary = criteria.generalRemark || criteria.qaThoughts;
      if (criteria.finalResult === 'failed') {
        summary = `[FAILED] ${criteria.failReason ? criteria.failReason + ' — ' : ''}${summary}`;
      } else {
        summary = `[PASSED] ${summary}`;
      }

      const body = { 
        agentId: selectedAgent.id, 
        agentName: selectedAgent.name, 
        evaluatorId, 
        evaluatorName, 
        criteria, 
        totalScore, 
        comments: summary, 
        sessionNotes: '', 
        sessionType: 'roleplay' 
      };

      if (editingEval) {
        const res = await fetch(`/api/evaluator/evaluations/${editingEval.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!res.ok) throw new Error('PATCH failed');
      } else {
        const res  = await fetch('/api/evaluator/evaluations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!res.ok) throw new Error('POST failed');
        const data = await res.json();
        if (data.evaluation) setMyEvals(prev => [data.evaluation, ...prev]);
      }
      setSaveSuccess(true);
      setTimeout(() => { setCriteria(emptyCriteria()); setSaveSuccess(false); setEditingEval(null); fetchAgentHistory(selectedAgent.id); }, 1400);
    } catch {
      setSaveError(true);
      setTimeout(() => setSaveError(false), 3000);
    } finally { setSaving(false); }
  };

  // Sidebar agent list — filtered + sorted by priority
  const filteredAgents = agents
    .map(a => {
      const stats = allAgentStats.find(s => s.agent.id === a.id);
      const status = stats ? getCompletionStatus(stats).status : 'not-started' as CompletionStatus;
      return { agent: a, status };
    })
    .filter(({ agent, status }) => {
      const nameMatch = agent.name.toLowerCase().includes(agentSearch.toLowerCase());
      if (!nameMatch) return false;
      if (statusFilter) return status === statusFilter;
      return true;
    })
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);

  const evaluatedIds = new Set(myEvals.map(e => e.agentId));

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <ChangePasswordModal isOpen={isPwModalOpen} onClose={() => setIsPwModalOpen(false)} />

      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] right-[-10%] w-[30%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-amber-500/10 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 flex min-h-screen">

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <aside className={`flex flex-col shrink-0 bg-background/70 backdrop-blur-2xl border-r border-border/40 sticky top-0 h-screen transition-all duration-300 ${sidebarCollapsed ? 'w-[60px]' : 'w-[220px]'}`}>

          {/* Logo */}
          <div className={`flex items-center h-16 border-b border-border/40 px-4 ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="relative w-8 h-8 rounded-xl overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-violet-500 to-orange-400" />
              <span className="relative z-10 flex items-center justify-center w-full h-full text-[10px] font-black text-white tracking-tight">BT</span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-foreground tracking-tight truncate">BrainTrade</p>
                <p className="text-[10px] text-muted-foreground truncate">{t('evaluatorPanel')}</p>
              </div>
            )}
          </div>

          {/* User badge — profile popover */}
          <div className="px-3 pt-4 pb-2 relative">
            <button
              onClick={() => setProfileOpen(v => !v)}
              title={sidebarCollapsed ? evaluatorName : undefined}
              className={`w-full flex items-center gap-2.5 rounded-xl border transition-all hover:opacity-80 active:scale-[0.98]
                bg-blue-500/15 text-blue-400 border-blue-500/20
                ${sidebarCollapsed ? 'justify-center p-2' : 'px-3 py-2.5'}
              `}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black uppercase shrink-0 bg-blue-500/15 text-blue-400 border border-blue-500/20">
                {evaluatorName.charAt(0)}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-bold text-foreground truncate">{evaluatorName}</p>
                  <p className="text-[10px] font-black uppercase tracking-wider text-blue-400">{t('evaluatorRole')}</p>
                </div>
              )}
            </button>

            {/* Profile popover */}
            <AnimatePresence>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className={`absolute z-50 top-full mt-2 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl shadow-black/20 overflow-hidden
                      ${sidebarCollapsed ? 'left-full ml-2 top-0 mt-0 w-[220px]' : 'left-3 right-3'}
                    `}
                  >
                    <div className="px-4 py-3 border-b border-border/50 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black uppercase border shrink-0 bg-blue-500/15 text-blue-400 border-blue-500/20">
                        {evaluatorName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{evaluatorName}</p>
                        <p className="text-[10px] font-black uppercase tracking-wider text-blue-400">{t('evaluatorRole')}</p>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => { setIsPwModalOpen(true); setProfileOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all"
                      >
                        <Zap size={14} className="shrink-0" /> {t('changePw')}
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Nav — Overview */}
          <nav className="flex flex-col gap-0.5 px-2 py-2">
            {!sidebarCollapsed && (
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 px-3 mb-1">{t('workspace')}</p>
            )}
            <button
              onClick={() => setSelectedAgent(null)}
              title={sidebarCollapsed ? t('overview') : undefined}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${!selectedAgent ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'}
                ${sidebarCollapsed ? 'justify-center px-2' : ''}
              `}
            >
              {!selectedAgent && (
                <motion.div layoutId="sidebar-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Activity size={16} className="shrink-0" />
              {!sidebarCollapsed && <span className="flex-1 text-left">{t('overview')}</span>}
              {!sidebarCollapsed && isLive && <Loader2 size={10} className="animate-spin text-blue-500/50" />}
            </button>
          </nav>

          {/* Agents section */}
          <div className="flex-1 flex flex-col min-h-0">
            {!sidebarCollapsed && (
              <div className="px-3 pb-2 space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 px-0 pt-2">{t('agents')}</p>
                {/* Search */}
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                  <input
                    type="text"
                    value={agentSearch}
                    onChange={e => setAgentSearch(e.target.value)}
                    placeholder={t('searchPlaceholder')}
                    className="w-full pl-7 pr-3 py-1.5 rounded-lg text-xs bg-secondary/40 border border-border focus:ring-1 focus:ring-primary/20 outline-none"
                  />
                </div>
                {/* Status filter */}
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as CompletionStatus | '')}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-secondary/40 border border-border outline-none appearance-none cursor-pointer text-foreground"
                >
                  <option value="">{t('allStatus')}</option>
                  <option value="needs-eval">{t('statusNeedsEval')}</option>
                  <option value="in-progress">{t('statusInProgress')}</option>
                  <option value="cleared">{t('statusCleared')}</option>
                  <option value="not-started">{t('statusNotStarted')}</option>
                </select>
                <p className="text-[10px] text-muted-foreground/50">{t('agentCount', { count: filteredAgents.length })}</p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
              {filteredAgents.map(({ agent, status }) => {
                const cfg    = STATUS_CFG[status];
                const active = selectedAgent?.id === agent.id;
                return (
                  <button
                    key={agent.id}
                    onClick={() => handleSelectAgent(agent)}
                    title={sidebarCollapsed ? agent.name : undefined}
                    className={`relative w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                      ${active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'}
                      ${sidebarCollapsed ? 'justify-center px-2' : ''}
                    `}
                  >
                    {active && (
                      <motion.div layoutId="sidebar-indicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    {/* Status dot */}
                    <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left truncate">{agent.name}</span>
                        {evaluatedIds.has(agent.id) && <CheckCircle2 size={11} className="text-primary/60 shrink-0" />}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom: logout + collapse */}
          <div className="border-t border-border/40 p-2 flex flex-col gap-1">
            <button
              onClick={() => { fetch('/api/auth/session', { method: 'DELETE' }); window.location.replace('/login'); }}
              title={t('signOut')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              <LogOut size={15} className="shrink-0" />
              {!sidebarCollapsed && <span>{t('signOut')}</span>}
            </button>
            <button
              onClick={() => setSidebarCollapsed(v => !v)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-muted-foreground/60 hover:text-muted-foreground hover:bg-secondary/40 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              <ChevronRight size={13} className={`shrink-0 transition-transform duration-300 ${sidebarCollapsed ? '' : 'rotate-180'}`} />
              {!sidebarCollapsed && <span>{t('collapse')}</span>}
            </button>
          </div>
        </aside>

        {/* ── Main area ──────────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 min-w-0">

          {/* Top bar */}
          <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-background/60 backdrop-blur-2xl border-b border-border/40">
            <div className="flex items-center gap-2 min-w-0">
              {selectedAgent ? (
                <>
                  <button onClick={() => setSelectedAgent(null)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground shrink-0">
                    <ArrowLeft size={16} />
                  </button>
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs shrink-0">
                    {selectedAgent.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-sm font-black text-foreground tracking-tight leading-tight truncate">{selectedAgent.name}</h1>
                    <p className="text-[10px] text-muted-foreground leading-tight">{t('salesEvalSubtitle')}</p>
                  </div>
                </>
              ) : (
                <>
                  <Activity size={18} className="text-primary shrink-0" />
                  <div>
                    <h1 className="text-sm font-black text-foreground tracking-tight leading-tight">{t('overview')}</h1>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {selectedAgent && (
                <div className="flex gap-1 p-1 bg-muted/30 border border-border/40 rounded-xl">
                  {(['new', 'history'] as const).map(tabId => (
                    <button
                      key={tabId}
                      onClick={() => setTab(tabId)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === tabId ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {tabId === 'new' ? t('tabNew') : (agentEvals.length > 0 ? t('tabHistory', { count: agentEvals.length }) : t('tabHistoryEmpty'))}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-0.5 p-1 bg-muted/50 border border-border/50 rounded-full">
                <LangToggle />
                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto bg-secondary/5">
            <AnimatePresence mode="wait">
              {!selectedAgent ? (
                <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="p-6">
                  <OverviewPanel myEvals={myEvals} agents={agents} allAgentStats={allAgentStats} onEvaluate={handleSelectAgent} />
                </motion.div>
              ) : tab === 'new' ? (
                <motion.div key="eval-new" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="p-6">
                  <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
                    {/* Left: full training progress panel */}
                    <div className="w-full lg:w-[400px] shrink-0">
                      <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-4 pr-1 space-y-0">
                        <AgentPerformancePanel
                          stats={agentStats}
                          loading={loadingStats}
                        />
                      </div>
                    </div>
                    {/* Right: eval form */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-primary/5 border border-primary/10">
                        <Activity size={18} className="text-primary" />
                        <span className="text-sm font-bold text-primary">{t('salesSimBadge')}</span>
                      </div>
                      {editingEval && (
                        <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-sm font-bold">
                          <span>{t('editBanner')}</span>
                          <button onClick={() => { setCriteria(emptyCriteria()); setEditingEval(null); }}>
                            <X size={16} />
                          </button>
                        </div>
                      )}
                      <EvalForm criteria={criteria} onChange={setCriteria} />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="eval-history" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="p-6">
                  <div className="max-w-2xl mx-auto space-y-4">
                    {loadingHistory ? (
                      <div className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-primary/40" size={32} /></div>
                    ) : agentEvals.length === 0 ? (
                      <div className="py-12 text-center opacity-40">
                        <ClipboardCheck className="mx-auto mb-4" size={48} />
                        <p className="text-sm">{t('noHistory')}</p>
                      </div>
                    ) : agentEvals.map(ev => (
                      <EvalHistoryCard
                        key={ev.id}
                        ev={ev}
                        onEdit={ev => { setEditingEval(ev); setCriteria({ ...emptyCriteria(), ...(ev.criteria as SalesCallCriteria) }); setTab('new'); }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Sticky Save Bar */}
          <AnimatePresence>
            {selectedAgent && tab === 'new' && (
              <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 60, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="border-t border-border/40 bg-background/80 backdrop-blur-xl px-6 py-3.5 flex items-center justify-center z-30"
              >
                <div className="w-full max-w-5xl flex items-center gap-4">
                  <ScoreRing score={calcScore(criteria)} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-foreground flex items-center gap-2">
                      {saveSuccess ? t('saved') : editingEval ? t('editingEvaluation') : t('salesSimStatus')}
                      {!saveSuccess && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-black ${criteria.finalResult === 'failed' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'}`}>
                          {criteria.finalResult === 'failed' ? t('failedCaps') : t('passedCaps')}
                        </span>
                      )}
                    </div>
                    {(() => {
                      if (criteria.finalResult === 'failed' && criteria.failReason) {
                        return <div className="text-xs text-red-500 font-bold truncate max-w-md">{criteria.failReason}</div>;
                      }
                      const fc = Object.values(criteria.redFlags).filter(Boolean).length;
                      if (fc === 4) return <div className="text-xs text-red-400 font-black">{t('failAllFlags')}</div>;
                      if (fc > 0)  return <div className="text-xs text-red-400 font-semibold">{t('redFlagDeduction', { points: fc * 25, count: fc })}</div>;
                      return <div className="text-xs text-muted-foreground/40">{t('noRedFlags')}</div>;
                    })()}
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={saving || saveSuccess}
                    className={`shrink-0 px-6 py-2.5 rounded-xl font-black text-sm transition-all shadow-lg ${
                      saveSuccess
                        ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                        : saveError
                          ? 'bg-red-500 text-white shadow-red-500/20'
                          : 'bg-primary text-white shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    {saving
                      ? <Loader2 className="animate-spin" size={16} />
                      : saveSuccess
                        ? <span className="flex items-center gap-1.5"><Check size={14} /> {t('saved')}</span>
                        : saveError
                          ? <span className="flex items-center gap-1.5"><AlertTriangle size={14} /> {t('saveFailed')}</span>
                          : (editingEval ? t('saveBtnEdit') : t('saveBtnNew', { score: calcScore(criteria) }))}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
