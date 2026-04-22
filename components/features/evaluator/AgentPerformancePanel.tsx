'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  BarChart3, ClipboardCheck, Clock, Loader2, Star, Target, Zap,
  Check, CheckCircle2, Circle, AlertTriangle, Flag
} from 'lucide-react';

import { ScoreRing, scoreHex } from '@/components/ui/ScoreRing';
import { FADE_IN } from '@/lib/animations';
import { BADGE_CONFIG } from '@/components/features/admin/AdminHelpers';
import { timeAgo } from '@/lib/evaluator-helpers';
import type { AgentStats, SalesCallCriteria } from '@/types';

interface AgentPerformancePanelProps {
  stats: AgentStats | null;
  loading: boolean;
}

export const AgentPerformancePanel = ({
  stats, loading,
}: AgentPerformancePanelProps) => {
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
                          <span className="text-[10px] text-muted-foreground/50">{qs.attempts} att.</span>
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
