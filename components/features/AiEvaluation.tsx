'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, User as UserIcon, Bot, ChevronLeft, Play,
  CheckCircle2, Trophy, RotateCcw, ArrowRight,
  Lock, BookOpen, AlertTriangle, ChevronRight, History,
  ChevronDown, Smile, Frown, Meh, Zap, Loader2
} from 'lucide-react';

import type { PitchMessage } from '@/types';
import { getAgentSession } from '@/lib/agent-session';
import { TRANSITION } from '@/lib/animations';

import { useTranslations } from 'next-intl';
import { ActiveAgentUI } from '@/components/ui/ActiveAgentUI';

/* ─── Constants & Types ────────────────────────────────────────────────────── */


const CRITERIA_KEYS = [
  'rapport',
  'objectionHandling',
  'credibility',
  'closing',
  'naturalness',
];

type Step = 'intro' | 'chat';

/* ─── Interfaces ───────────────────────────────────────────────────────────── */

interface CoachingData {
  score: number;
  criteria?: {
    rapport: number;
    objectionHandling: number;
    credibility: number;
    closing: number;
    naturalness: number;
  };
  strengths: string;
  improvements: string;
  coachingScript: string;
  coachingTip: string;
  metadata?: Record<string, any>;
}

interface IntroViewProps {
  onContinue: () => void;
  guideline: string | null;
  agentName: string | null;
  loading: boolean;
}

interface CustomerProfile {
  name: string;
  occupation: string;
  age: number;
  mood?: string;
  objective: string;
}

interface ChatViewProps {
  messages: PitchMessage[];
  coaching: Map<number, CoachingData>;
  customerProfile: CustomerProfile | null;
  input: string;
  setInput: (v: string) => void;
  loading: boolean;
  passed: boolean;
  error: string | null;
  onSend: () => void;
  onReset: (clearHistory: boolean) => void;
  onClearError: () => void;
  onUseScript: (text: string) => void;
  bottomRef: React.RefObject<HTMLDivElement>;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

/* ─── Step Progress Indicator ──────────────────────────────────────────────── */

const StepProgress = ({ current }: { current: 1 | 2 }) => (
  <div className="flex items-center gap-1.5">
    {([1, 2] as const).map(s => (
      <div
        key={s}
        className={`rounded-full transition-all duration-300 ${
          s === current
            ? 'w-5 h-1.5 bg-primary'
            : s < current
            ? 'w-1.5 h-1.5 bg-primary/40'
            : 'w-1.5 h-1.5 bg-muted-foreground/20'
        }`}
      />
    ))}
  </div>
);

/* ─── Coaching Card ─────────────────────────────────────────────────────────── */

const SCORE_STYLE = (score: number) =>
  score >= 7
    ? { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800', dot: 'bg-emerald-500' }
    : score >= 5
    ? { badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800', dot: 'bg-amber-400' }
    : { badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800', dot: 'bg-rose-500' };

const CoachingCard = memo(({ coaching, autoExpand, onUseScript }: { 
  coaching: CoachingData; 
  autoExpand: boolean;
  onUseScript?: (text: string) => void;
}) => {
  const [open, setOpen] = useState(autoExpand);
  const { score, criteria, strengths, improvements, coachingScript, coachingTip, metadata } = coaching;
  const style = SCORE_STYLE(score);
  const t = useTranslations('aiEval');

  return (
    <div className="ml-9 mt-1.5 mb-1">
      {/* Toggle badge */}
      <button
        onClick={() => setOpen(v => !v)}
        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all hover:opacity-80 ${style.badge}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
        <span className="font-black">{score}/10</span>
        <span className="opacity-50">·</span>
        <span>{open ? t('hideCoaching') : t('viewCoaching')}</span>
        <ChevronDown size={11} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Expandable coaching panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-2 bg-white dark:bg-card border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
              <div className="divide-y divide-black/5 dark:divide-white/5">

                {/* Criteria Score Breakdown (Bars) */}
                {criteria && (
                  <div className="px-4 py-3 bg-secondary/10">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2.5">{t('performanceBreakdown')}</p>
                    <div className="space-y-2">
                      {CRITERIA_KEYS.map((key) => {
                        const val = (criteria as any)[key] || 0;
                        return (
                          <div key={key}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold text-foreground/70">{t(`criteria.${key}`)}</span>
                              <span className="text-[10px] font-black text-primary">{val}/10</span>
                            </div>
                            <div className="h-1 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${val * 10}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full rounded-full ${val >= 7 ? 'bg-emerald-500' : val >= 5 ? 'bg-amber-400' : 'bg-rose-500'}`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Strengths */}
                {strengths && (
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                      ✓ {t('strengthsLabel')}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{strengths}</p>
                  </div>
                )}

                {/* Improvements */}
                {improvements && (
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-wider mb-1">
                      ↑ {t('improvementsLabel')}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{improvements}</p>
                  </div>
                )}

                {/* Coaching tip */}
                {coachingTip && (
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-black text-primary uppercase tracking-wider mb-1">
                      💡 {t('techniqueLabel')}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{coachingTip}</p>
                  </div>
                )}

                {/* Coaching script — the most actionable piece */}
                {coachingScript && (
                  <div className="px-4 py-3 bg-primary/5 dark:bg-primary/10">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[10px] font-black text-primary uppercase tracking-wider">
                        💬 {t('scriptLabel')}
                      </p>
                      {onUseScript && (
                        <button
                          onClick={() => onUseScript(coachingScript)}
                          className="text-[10px] font-black bg-primary text-white px-2 py-0.5 rounded-md hover:bg-primary/80 transition-all active:scale-95"
                        >
                          {t('useScriptBtn')}
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-primary/80 dark:text-primary/70 leading-relaxed font-medium">
                      &ldquo;{coachingScript}&rdquo;
                    </p>
                  </div>
                )}

                {/* Dynamic Metadata / Extra AI Insights */}
                {metadata && Object.keys(metadata).length > 0 && (
                  <div className="px-4 py-3 border-t border-black/5 dark:border-white/5 bg-secondary/5">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2">
                      ✨ {t('extraInsights')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(metadata).map(([key, val]) => (
                        <div key={key} className="bg-white dark:bg-black/20 px-2 py-1 rounded-lg border border-black/5 dark:border-white/5">
                          <span className="text-[9px] font-black text-muted-foreground uppercase mr-1">{key}:</span>
                          <span className="text-[10px] font-bold text-foreground">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

CoachingCard.displayName = 'CoachingCard';

/* ─── Score Trend Component ────────────────────────────────────────────────── */

const ScoreTrend = memo(({ coaching }: { coaching: Map<number, CoachingData> }) => {
  const scores = useMemo(() => {
    return Array.from(coaching.values()).map(c => c.score);
  }, [coaching]);

  if (scores.length < 2) return null;

  const max = 10;
  const min = 0;
  const height = 16;
  const width = 100;
  const points = scores.map((s, i) => {
    const x = (i / (scores.length - 1)) * width;
    const y = height - ((s - min) / (max - min)) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-secondary/20 rounded-lg border border-black/5 dark:border-white/5 animate-in fade-in zoom-in duration-500 shrink-0">
      <div className="flex flex-col">
        <span className="text-[8px] font-black text-muted-foreground uppercase leading-none mb-0.5">Progress</span>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-16 h-4 overflow-visible">
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            className="text-primary"
            points={points}
          />
          <circle 
            cx={width} 
            cy={height - ((scores[scores.length - 1] - min) / (max - min)) * height} 
            r="2" 
            className="fill-primary"
          />
        </svg>
      </div>
    </div>
  );
});

ScoreTrend.displayName = 'ScoreTrend';

/* ─── Sub-components ────────────────────────────────────────────────────────── */

/**
 * IntroView: Step 1 - Instructions and overview
 */
const IntroView = memo(({ onContinue, guideline, agentName, loading }: IntroViewProps) => {
  const t = useTranslations('aiEval');

  return (
    <div className="max-w-4xl mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={TRANSITION.base}
        className="bg-card rounded-3xl shadow-2xl border border-black/5 dark:border-white/5 overflow-hidden"
      >
        {/* Hero header — unified inside the card */}
        <div className="bg-gradient-to-br from-primary to-primary/80 px-8 py-8 text-primary-foreground relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 blur-3xl rounded-full" />
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                  <Zap size={20} className="text-white" />
                </div>
                <h1 className="text-2xl font-black tracking-tight">{t('title')}</h1>
              </div>
              <p
                className="opacity-90 text-sm leading-relaxed max-w-2xl font-medium"
                dangerouslySetInnerHTML={{ __html: t.raw('introDesc') }}
              />
            </div>
            <div className="shrink-0 pt-1 flex flex-col items-end gap-3">
              <StepProgress current={1} />
              <ActiveAgentUI agentName={agentName} />
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Section 1 — Guidelines (Loaded from Admin) */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-7 h-7 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-xs font-black">1</span>
              <h3 className="font-black text-foreground text-base tracking-tight">Guideline Instruction</h3>
            </div>
            <div className="bg-secondary/20 rounded-2xl p-6 border border-black/5 dark:border-white/5 whitespace-pre-wrap text-sm leading-relaxed text-foreground font-medium">
              {guideline || "Please wait for guidelines to load..."}
            </div>
          </div>

          {/* Section 2 — Criteria */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-7 h-7 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-xs font-black">2</span>
              <h3 className="font-black text-foreground text-base tracking-tight">{t('criteriaTitle')}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {CRITERIA_KEYS.map((key) => (
                <span key={key} className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-foreground text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                  {t(`criteria.${key}`)}
                </span>
              ))}
            </div>
          </div>

          {/* Pass / Fail grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 size={16} />
                <span className="font-black text-sm uppercase tracking-tight">{t('passCriteria')}</span>
              </div>
              <p className="text-xs text-emerald-800/70 dark:text-emerald-300/70 leading-relaxed font-medium">
                {t('passDesc')}
              </p>
            </div>
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2 text-rose-700 dark:text-rose-400">
                <AlertTriangle size={16} />
                <span className="font-black text-sm uppercase tracking-tight">{t('failCriteria')}</span>
              </div>
              <p className="text-xs text-rose-800/70 dark:text-rose-300/70 leading-relaxed font-medium">
                {t('failDesc')}
              </p>
            </div>
          </div>

          {/* Primary CTA */}
          <button
            onClick={onContinue}
            disabled={loading || !guideline}
            className="w-full flex items-center justify-center gap-2.5 bg-foreground text-background hover:bg-primary hover:text-white transition-all duration-500 py-4 rounded-2xl font-black text-base shadow-xl active:scale-[0.99] group disabled:opacity-50"
          >
            {loading ? t('connecting') : t('startSimBtn')}
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </div>
  );
});

IntroView.displayName = 'IntroView';

/**
 * MessageBubble sub-component
 */
const MessageBubble = memo(({ m, i }: { m: PitchMessage; i: number }) => {
  const isUser = m.role === 'user';
  const timeStr = m.timestamp
    ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...TRANSITION.base, delay: Math.min(i * 0.02, 0.15) }}
      className={`flex items-end gap-2.5 mt-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${
        isUser
          ? 'bg-primary text-primary-foreground border-primary/20'
          : 'bg-white dark:bg-card border-black/5 dark:border-white/10 text-foreground'
      }`}>
        {isUser ? <UserIcon size={13} /> : <Bot size={13} />}
      </div>

      <div className={`flex flex-col gap-1 max-w-[78%] sm:max-w-[68%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap font-medium rounded-2xl border ${
          isUser
            ? 'bg-primary text-primary-foreground border-primary/10'
            : 'bg-white dark:bg-card text-foreground border-black/5 dark:border-white/10'
        }`}>
          {m.content}
        </div>
        {timeStr && (
          <span className="text-[10px] text-muted-foreground/35 font-medium px-1">
            {timeStr}
          </span>
        )}
      </div>
    </motion.div>
  );
});

MessageBubble.displayName = 'MessageBubble';

/**
 * ChatView: Step 2 - AI Evaluation simulation
 */
const ChatView = memo(({
  messages, coaching, customerProfile, input, setInput, loading, passed, error,
  onSend, onReset, onClearError, onUseScript, bottomRef, textareaRef
}: ChatViewProps) => {
  const t = useTranslations('aiEval');

  // Auto-grow textarea up to ~5 lines
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input, textareaRef]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }, [onSend]);

  return (
    <div className="max-w-4xl mx-auto py-2">
      <div
        className="bg-card rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-black/5 dark:border-white/10 flex flex-col overflow-hidden"
        style={{ height: passed ? 'auto' : 'calc(100dvh - 96px)', maxHeight: passed ? 'none' : '920px', minHeight: '500px' }}
      >

        {/* Chat Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-black/5 dark:border-white/10 bg-white/90 dark:bg-card/90 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
              passed ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'
            }`}>
              {passed ? <Trophy size={18} /> : <Zap size={18} />}
            </div>
            <div>
              <span className="font-bold text-foreground text-sm">
                {t('systemTitle')}
              </span>
              <p className={`text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-widest ${
                passed ? 'text-emerald-500' : 'text-primary'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${passed ? 'bg-emerald-500' : 'bg-primary animate-pulse'}`} />
                {passed ? t('congrats', { level: '' }) : t('liveSim')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ScoreTrend coaching={coaching} />
            <StepProgress current={2} />
            <button
              onClick={() => onReset(passed)}
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-rose-50 transition-all py-2 px-3 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10"
            >
              <ChevronLeft size={14} />
              {passed ? t('backToSelection') : t('endTraining')}
            </button>
          </div>
        </div>

        {/* Customer Profile Card */}
        {customerProfile && (
          <div className="px-5 py-3 bg-white dark:bg-card/50 border-b border-black/5 dark:border-white/5 flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center">
                {customerProfile.mood?.includes('หงุดหงิด') ? (
                  <Frown size={14} className="text-rose-500" />
                ) : customerProfile.mood?.includes('พอใจ') || customerProfile.mood?.includes('สนใจ') ? (
                  <Smile size={14} className="text-emerald-500" />
                ) : (
                  <UserIcon size={14} className="text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight leading-none mb-0.5">{t('customerLabel')}</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-black text-foreground">{customerProfile.name || t('unknown')}</p>
                  {customerProfile.mood && (
                    <span className="text-[10px] bg-secondary/80 text-foreground px-1.5 py-0.5 rounded-md font-bold">
                      {customerProfile.mood}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="h-6 w-px bg-black/5 dark:bg-white/5 hidden sm:block" />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight leading-none mb-0.5">{t('occupationAgeLabel')}</p>
              <p className="text-xs font-bold text-foreground">
                {customerProfile.occupation || t('general')} {customerProfile.age ? `(${customerProfile.age} ${t('yearsOld')})` : ''}
              </p>
            </div>
            <div className="h-6 w-px bg-black/5 dark:bg-white/5 hidden sm:block" />
            <div className="flex-1 min-w-[200px]">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight leading-none mb-0.5">{t('objectiveLabel')}</p>
              <p className="text-xs font-bold text-primary italic truncate">&ldquo;{customerProfile.objective || t('general')}&rdquo;</p>
            </div>
          </div>
        )}

        {/* Message List */}
        <div className={`overflow-y-auto px-5 py-5 bg-slate-50/50 dark:bg-black/10 selection:bg-primary/10 ${passed ? '' : 'flex-1'}`}>

          {/* System ready message */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2.5 mb-5">
            <div className="w-7 h-7 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
              <CheckCircle2 size={13} />
            </div>
            <div className="max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-3 text-xs leading-relaxed bg-primary/5 border border-primary/20 text-primary">
              <p className="text-sm font-bold mb-0.5">{t('readyMsg', { level: '', label: '' }).replace(' —  ()', '')}</p>
              <p className="opacity-70 font-medium">{t('readySub')}</p>
            </div>
          </motion.div>

          {/* Conversation + coaching cards */}
          <AnimatePresence initial={false}>
            {messages.map((m, i) => {
              const card = m.role === 'assistant' ? coaching.get(i) : undefined;
              return (
                <React.Fragment key={i}>
                  <MessageBubble m={m} i={i} />
                  {card && (
                    <CoachingCard
                      coaching={card}
                      autoExpand={card.score < 6}
                      onUseScript={onUseScript}
                    />
                  )}
                </React.Fragment>
              );
            })}

            {/* Passed banner */}
            {passed && (
              <motion.div
                key="passed"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={TRANSITION.spring}
                className="flex flex-col items-center py-6 mt-4"
              >
                <div className="flex items-center gap-4 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white px-8 py-5 rounded-2xl shadow-2xl shadow-emerald-500/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
                  <Trophy size={36} className="drop-shadow-lg" />
                  <div className="relative z-10">
                    <p className="font-black text-xl tracking-tight leading-none mb-1">{t('congrats', { level: '' }).replace(' Level ', '')}</p>
                    <p className="text-sm font-bold opacity-90">{t('congratsSub')}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Post-pass action buttons */}
            {passed && (
              <motion.div
                key="actions"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row gap-3 pb-4"
              >
                <button
                  onClick={() => onReset(true)}
                  className="flex-1 flex items-center justify-center gap-2.5 bg-white dark:bg-white/5 text-foreground hover:bg-secondary transition-all duration-300 px-6 py-3.5 rounded-xl font-bold text-sm border border-black/5 shadow-md active:scale-95"
                >
                  <RotateCcw size={15} />
                  {t('retryBtn', { level: '' }).replace(' Level ', '')}
                </button>
                <div className="flex-1 flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-emerald-500/20">
                  <Trophy size={15} />
                  {t('allCompleted')}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Inline error banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center justify-between gap-3 mt-3 px-4 py-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs font-medium text-rose-700 dark:text-rose-400"
              >
                <span className="leading-relaxed">{error}</span>
                <button onClick={onClearError} className="shrink-0 text-rose-400 hover:text-rose-600 transition-colors font-black px-1">✕</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3-dot typing indicator */}
          {loading && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-2 mt-1">
              <div className="w-7 h-7 rounded-xl bg-white dark:bg-card border border-black/5 flex items-center justify-center shrink-0">
                <Bot size={13} />
              </div>
              <div className="bg-white dark:bg-card border border-black/5 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                {[0, 1, 2].map(dot => (
                  <span
                    key={dot}
                    className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce"
                    style={{ animationDelay: `${dot * 0.15}s`, animationDuration: '0.8s' }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} className="h-2" />
        </div>

        {/* Chat Input */}
        {!passed && (
          <div className="px-4 py-3 bg-white dark:bg-card border-t border-black/5 dark:border-white/10 z-10 shrink-0">
            <div className="flex items-end gap-2 bg-secondary/30 px-4 py-2 rounded-2xl border-2 border-transparent focus-within:border-primary/20 focus-within:bg-white dark:focus-within:bg-black/20 transition-all duration-300">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('placeholder')}
                rows={1}
                className="flex-1 bg-transparent border-none focus:ring-0 py-2 text-sm font-medium placeholder:text-muted-foreground/40 placeholder:italic resize-none overflow-hidden leading-relaxed"
              />
              <button
                onClick={onSend}
                disabled={loading || !input.trim()}
                className="bg-primary text-white p-2.5 rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-30 disabled:scale-100 shadow-lg shadow-primary/30 mb-0.5 shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-2 text-center opacity-25">
              BrainTrade Training Infrastructure
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

ChatView.displayName = 'ChatView';

/* ─── Main Component ────────────────────────────────────────────────────────── */

export default function AiEvaluation() {
  const [step,           setStep]           = useState<Step>('intro');
  const [sessionId,      setSessionId]      = useState<string | null>(null);
  const [messages,       setMessages]       = useState<PitchMessage[]>([]);
  const [coaching,       setCoaching]       = useState<Map<number, CoachingData>>(new Map());
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [input,          setInput]          = useState('');
  const [loading,        setLoading]        = useState(false);
  const [agentId,        setAgentId]        = useState<string | null>(null);
  const [agentName,      setAgentName]      = useState<string | null>(null);
  const [passed,          setPassed]          = useState(false);
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());
  const [guideline,       setGuideline]       = useState<string | null>(null);
  const [error,           setError]           = useState<string | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const showError = useCallback((msg: string) => {
    setError(msg);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setError(null), 7000);
  }, []);

  useEffect(() => {
    // Fetch Guidelines from Admin Config — always runs regardless of session
    fetch('/api/ai-eval/config', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.guideline) {
          setGuideline(data.guideline);
        } else {
          setGuideline('AI customer will act as a Thai client. Handle objections professionally and try to close the sale.');
        }
      })
      .catch(() => {
        setGuideline('AI customer will act as a Thai client. Handle objections professionally and try to close the sale.');
      });

    const session = getAgentSession();
    if (!session) return;

    const id   = session.id;
    const name = session.name;
    setAgentId(id);
    setAgentName(name);

    // UX initialization from localStorage (completed levels flag only)
    const localComp  = localStorage.getItem('brainstrade_eval_completed_levels');
    const localSet: Set<number> = localComp ? new Set(JSON.parse(localComp)) : new Set();
    if (localSet.size > 0) setCompletedLevels(localSet);

    if (id) {
      // Sync completed levels from server (source of truth)
      fetch(`/api/agent/progress?agentId=${id}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (!data) return;
          const serverComp: number[] = data.stats?.evalCompletedLevels ?? [];
          const merged = new Set([...localSet, ...serverComp]);
          setCompletedLevels(merged);
          localStorage.setItem('brainstrade_eval_completed_levels', JSON.stringify([...merged]));
        })
        .catch(() => {});

      // Restore active session from server only
      fetch(`/api/ai-eval/active?agentId=${id}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          const s = data?.session;
          if (s && s.messages?.length > 0) {
            const age = Date.now() - (s.savedAt ?? 0);
            if (age < 24 * 60 * 60 * 1000) {
              setSessionId(s.sessionId);
              setMessages(s.messages);
              if (s.customerProfile) setCustomerProfile(s.customerProfile);
              setStep('chat');
            }
          }
        })
        .catch(() => {});
    }
  }, []);

  const syncToServer = useCallback((patch: {
    evalCompletedLevels?: number[];
    evalSavedLevel?: number | null;
  }) => {
    if (!agentId) return;
    fetch('/api/agent/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId, agentName: agentName ?? '', ...patch }),
    }).catch(() => {});
  }, [agentId, agentName]);

  useEffect(() => {
    if (step === 'chat') {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, loading, step]);

  const markLevelCompleted = useCallback((l: number) => {
    setCompletedLevels(prev => {
      const next = new Set(prev);
      next.add(l);
      localStorage.setItem('brainstrade_eval_completed_levels', JSON.stringify([...next]));
      syncToServer({ evalCompletedLevels: [...next], evalSavedLevel: null });
      return next;
    });
  }, [syncToServer]);

  const startSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Create session record
      const res = await fetch('/api/ai-eval/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: 1, agentId, agentName }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Start failed (${res.status})`);
      }
      const data = await res.json();
      const sid = data.sessionId;
      setSessionId(sid);
      setMessages([]);
      setCoaching(new Map());
      setPassed(false);

      syncToServer({ evalSavedLevel: 1 });

      // 2. Fetch the customer's opening line
      try {
        const initRes = await fetch('/api/ai-eval', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sid, level: 1, messages: [], agentId, agentName, isStart: true }),
        });
        if (initRes.ok) {
          const initData = await initRes.json();
          if (initData.customerProfile) {
            setCustomerProfile(initData.customerProfile);
          }
          if (initData.reply) {
            const openingMsg: PitchMessage = { role: 'assistant', content: initData.reply, timestamp: new Date() };
            setMessages([openingMsg]);
            // Save to server
            if (agentId) {
              fetch('/api/ai-eval/active', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  agentId, 
                  sessionId: sid, 
                  level: 1, 
                  messages: [openingMsg],
                  customerProfile: initData.customerProfile
                }),
              }).catch(() => {});
            }
          }
        }
      } catch {
      }

      setStep('chat');
    } catch (err: any) {
      console.error('Failed to start AI session', err);
      showError(err.message || 'Could not connect to AI. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [agentId, agentName, syncToServer, showError]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !sessionId || loading || passed) return;
    const userMsg: PitchMessage = { role: 'user', content: input, timestamp: new Date() };
    
    // Sanitize existing messages
    const sanitizedHistory = messages.filter(m => m && typeof m.content === 'string' && m.content.length > 0);
    const newMessages = [...sanitizedHistory, userMsg];
    
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-eval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, level: 1, messages: newMessages, agentId, agentName }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const detailedMsg = errorData.details || errorData.error || 'Connection failure';
        throw new Error(detailedMsg);
      }
      
      const data = await res.json();
      const reply = (data.reply || '').trim();
      if (!reply) throw new Error('AI returned an empty response. Please try again.');

      const aiMsg: PitchMessage = { role: 'assistant', content: reply, timestamp: new Date() };
      const finalMessages = [...newMessages, aiMsg];
      setMessages(finalMessages);

      if (data.customerProfile) {
        setCustomerProfile(data.customerProfile);
      }

      // Store coaching
      if (data.coaching) {
        const assistantIndex = finalMessages.length - 1;
        setCoaching(prev => {
          const next = new Map(prev);
          next.set(assistantIndex, data.coaching);
          return next;
        });
      }

      if (data.passed) {
        setPassed(true);
        markLevelCompleted(1);
        if (agentId) fetch(`/api/ai-eval/active?agentId=${agentId}`, { method: 'DELETE' }).catch(() => {});
      } else if (sessionId && agentId) {
        fetch('/api/ai-eval/active', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId,
            sessionId,
            level: 1,
            messages: finalMessages,
            customerProfile: data.customerProfile || customerProfile
          }),
        }).catch(() => {});
      }
    } catch (err: any) {
      console.error('Failed to send message', err);
      setMessages(messages);
      showError(err.message || 'Failed to get AI response. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [input, sessionId, loading, passed, messages, agentId, agentName, markLevelCompleted, showError, customerProfile]);

  const resetToSelect = useCallback((clearHistory = false) => {
    if (clearHistory) {
      if (agentId) fetch(`/api/ai-eval/active?agentId=${agentId}`, { method: 'DELETE' }).catch(() => {});
    }
    setSessionId(null);
    setMessages([]);
    setCoaching(new Map());
    setCustomerProfile(null);
    setPassed(false);
    setStep('intro');
  }, [agentId]);

  const handleUseScript = useCallback((text: string) => {
    setInput(text);
    textareaRef.current?.focus();
  }, []);

  /* ─── Render Logic ─────────────────────────────────────────────────────────── */

  return (
    <AnimatePresence mode="wait">
      {step === 'intro' ? (
        <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={TRANSITION.base}>
          <IntroView 
            onContinue={startSession} 
            guideline={guideline}
            agentName={agentName}
            loading={loading}
          />
        </motion.div>
      ) : (
        <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={TRANSITION.base}>
          <ChatView
            messages={messages}
            coaching={coaching}
            customerProfile={customerProfile}
            input={input}
            setInput={setInput}
            loading={loading}
            passed={passed}
            error={error}
            onSend={sendMessage}
            onReset={resetToSelect}
            onClearError={() => setError(null)}
            onUseScript={handleUseScript}
            bottomRef={bottomRef}
            textareaRef={textareaRef}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
