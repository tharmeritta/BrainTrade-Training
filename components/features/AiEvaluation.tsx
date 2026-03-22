'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, User as UserIcon, Bot, ChevronLeft, Play,
  CheckCircle2, Trophy, RotateCcw, ArrowRight,
  Lock, BookOpen, AlertTriangle, ChevronRight, History,
  ChevronDown,
} from 'lucide-react';

import type { PitchMessage } from '@/types';
import { getAgentSession } from '@/lib/agent-session';
import { TRANSITION } from '@/lib/animations';

import { useTranslations } from 'next-intl';
import { ActiveAgentUI } from '@/components/ui/ActiveAgentUI';

/* ─── Constants & Types ────────────────────────────────────────────────────── */

const AIEV_SESSION_KEY = 'brainstrade_aiev_active';

const CRITERIA_KEYS = [
  'rapport',
  'objectionHandling',
  'credibility',
  'closing',
  'naturalness',
];

type EvalLevel = 1 | 2 | 3 | 4;
type Step = 'intro' | 'select' | 'chat';

/* ─── Interfaces ───────────────────────────────────────────────────────────── */

interface CoachingData {
  score: number;
  strengths: string;
  improvements: string;
  coachingScript: string;
  coachingTip: string;
}

interface IntroViewProps {
  onContinue: (level?: EvalLevel) => void;
  inProgressLevel: EvalLevel | null;
}

interface SelectionViewProps {
  level: EvalLevel;
  setLevel: (l: EvalLevel) => void;
  onStart: (overrideLevel?: EvalLevel) => void;
  onShowIntro: () => void;
  isLocked: (l: EvalLevel) => boolean;
  completedLevels: Set<number>;
  inProgressLevel: EvalLevel | null;
  agentName: string | null;
  loading: boolean;
}

interface ChatViewProps {
  level: EvalLevel;
  messages: PitchMessage[];
  coaching: Map<number, CoachingData>;
  input: string;
  setInput: (v: string) => void;
  loading: boolean;
  passed: boolean;
  onSend: () => void;
  onReset: (clearHistory: boolean) => void;
  onNextLevel: (next: EvalLevel) => void;
  bottomRef: React.RefObject<HTMLDivElement>;
}

/* ─── Step Progress Indicator ──────────────────────────────────────────────── */

const StepProgress = ({ current }: { current: 1 | 2 | 3 }) => (
  <div className="flex items-center gap-1.5">
    {([1, 2, 3] as const).map(s => (
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

const CoachingCard = memo(({ coaching, autoExpand }: { coaching: CoachingData; autoExpand: boolean }) => {
  const [open, setOpen] = useState(autoExpand);
  const { score, strengths, improvements, coachingScript, coachingTip } = coaching;
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
            <div className="mt-2 bg-white dark:bg-card border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden">
              <div className="divide-y divide-black/5 dark:divide-white/5">

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
                    <p className="text-[10px] font-black text-primary uppercase tracking-wider mb-1.5">
                      💬 {t('scriptLabel')}
                    </p>
                    <p className="text-xs text-primary/80 dark:text-primary/70 leading-relaxed font-medium">
                      &ldquo;{coachingScript}&rdquo;
                    </p>
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

/* ─── Sub-components ────────────────────────────────────────────────────────── */

/**
 * IntroView: Step 1 - Instructions and overview
 */
const IntroView = memo(({ onContinue, inProgressLevel }: IntroViewProps) => {
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
                  <BookOpen size={20} className="text-white" />
                </div>
                <h1 className="text-2xl font-black tracking-tight">{t('title')}</h1>
              </div>
              <p
                className="opacity-90 text-sm leading-relaxed max-w-2xl font-medium"
                dangerouslySetInnerHTML={{ __html: t.raw('introDesc') }}
              />
            </div>
            <div className="shrink-0 pt-1">
              <StepProgress current={1} />
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Section 1 — Levels */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-7 h-7 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-xs font-black">1</span>
              <h3 className="font-black text-foreground text-base tracking-tight">{t('levelsTitle')}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {([1, 2, 3, 4] as const).map(l => (
                <div key={l} className="bg-secondary/20 rounded-2xl p-4 border border-black/5 dark:border-white/5 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black bg-primary text-white px-2 py-0.5 rounded-md uppercase tracking-wider">{t('levelLabel')} {l}</span>
                    <span className="font-bold text-sm text-foreground">{t(`levels.${l}.th`)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 font-medium leading-relaxed">{t(`levels.${l}.desc`)}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[0, 1].map((i) => (
                      <span key={i} className="text-[11px] bg-white dark:bg-black/20 border border-black/5 dark:border-white/10 text-muted-foreground px-2.5 py-0.5 rounded-md font-medium italic">
                        &quot;{t(`levels.${l}.examples.${i}`)}&quot;
                      </span>
                    ))}
                  </div>
                </div>
              ))}
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

          {/* In-progress resume banner */}
          {inProgressLevel && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-amber-50 dark:bg-amber-950/20 border border-amber-300/50 dark:border-amber-700/50 rounded-2xl p-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                  <History size={20} />
                </div>
                <div>
                  <p className="font-black text-amber-800 dark:text-amber-300 text-sm leading-tight">
                    {t('continueAt', { level: inProgressLevel })}
                  </p>
                  <p className="text-xs text-amber-700/70 dark:text-amber-400/70 mt-0.5 font-medium">
                    {t(`levels.${inProgressLevel}.th`)} — {t('continueSaved')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onContinue(inProgressLevel)}
                className="shrink-0 flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl font-black text-sm transition-all shadow-md active:scale-95"
              >
                {t('continueBtn')}
                <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {/* Primary CTA */}
          <button
            onClick={() => onContinue()}
            className="w-full flex items-center justify-center gap-2.5 bg-foreground text-background hover:bg-primary hover:text-white transition-all duration-500 py-4 rounded-2xl font-black text-base shadow-xl active:scale-[0.99] group"
          >
            {inProgressLevel ? t('overviewBtn') : t('startBtn')}
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </div>
  );
});

IntroView.displayName = 'IntroView';

/**
 * SelectionView: Step 2 - Level selection
 */
const SelectionView = memo(({
  level, setLevel, onStart, onShowIntro, isLocked,
  completedLevels, inProgressLevel, agentName, loading
}: SelectionViewProps) => {
  const t = useTranslations('aiEval');

  return (
    <div className="max-w-4xl mx-auto py-8">

      {/* Page header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">{t('title')}</h1>
          <p className="text-muted-foreground text-sm font-medium mt-0.5 opacity-70">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <StepProgress current={2} />
          <ActiveAgentUI agentName={agentName} />
          <button
            onClick={onShowIntro}
            className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-secondary/50 transition-all"
          >
            <BookOpen size={14} />
            {t('instructionsBtn')}
          </button>
        </div>
      </div>

      {/* Resume in-progress banner */}
      {inProgressLevel && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700/50 rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 rounded-xl">
              <History size={18} className="text-amber-600" />
            </div>
            <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
              {t('resumeDesc', { level: inProgressLevel, label: t(`levels.${inProgressLevel}.th`) })}
            </p>
          </div>
          <button
            onClick={() => onStart(inProgressLevel)}
            disabled={loading}
            className="shrink-0 flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
          >
            <Play size={14} className="fill-current" />
            {t('continueBtn')}
          </button>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={TRANSITION.base}
        className="bg-card rounded-3xl shadow-2xl border border-black/5 dark:border-white/5 p-8 relative overflow-hidden"
      >
        <div className="relative z-10">
          <h2 className="text-xl font-black mb-1 tracking-tight">{t('selectTitle')}</h2>
          <p className="text-sm text-muted-foreground font-medium mb-8 opacity-80">{t('selectDesc')}</p>

          {/* Level selector grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {([1, 2, 3, 4] as const).map(l => {
              const locked    = isLocked(l);
              const completed = completedLevels.has(l);
              const selected  = level === l;
              return (
                <button
                  key={l}
                  onClick={() => !locked && setLevel(l)}
                  disabled={locked}
                  className={`group relative px-4 py-4 rounded-2xl font-black transition-all duration-300 border-2 text-left ${
                    locked
                      ? 'bg-secondary/20 text-muted-foreground/30 border-transparent cursor-not-allowed opacity-60'
                      : selected
                      ? 'bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20'
                      : 'bg-white dark:bg-white/5 text-muted-foreground border-black/5 dark:border-white/10 hover:border-primary/30 hover:shadow-md'
                  }`}
                >
                  {/* Status badge */}
                  {locked ? (
                    <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-muted-foreground/20 rounded-full flex items-center justify-center">
                      <Lock size={10} className="text-muted-foreground/60" />
                    </div>
                  ) : completed ? (
                    <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border border-white">
                      <CheckCircle2 size={11} className="text-white" />
                    </div>
                  ) : null}

                  <span className="block text-xs font-black uppercase tracking-wider opacity-60 mb-1">{t('levelLabel')} {l}</span>
                  <span className="block text-sm font-extrabold leading-tight">{t(`levels.${l}.th`)}</span>
                </button>
              );
            })}
          </div>

          {/* Static description area — replaces the fragile floating tooltip */}
          <div className="min-h-[48px] mb-8 px-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={level}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
              >
                {isLocked(level) ? (
                  <p className="text-xs text-muted-foreground/50 italic font-medium">
                    {t('lockedDesc', { level: level - 1 })}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    {t(`levels.${level}.desc`)}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Start button */}
          <button
            onClick={() => onStart()}
            disabled={loading || isLocked(level)}
            className="group w-full flex items-center justify-center gap-2.5 bg-foreground text-background px-8 py-4 rounded-2xl font-black text-base hover:bg-primary hover:text-white transition-all duration-300 shadow-xl disabled:opacity-50 active:scale-[0.99]"
          >
            <Play size={18} className="fill-current group-hover:scale-110 transition-transform" />
            {loading ? t('connecting') : t('startSimBtn')}
          </button>
        </div>

        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full translate-x-1/2 translate-y-1/2" />
      </motion.div>
    </div>
  );
});

SelectionView.displayName = 'SelectionView';

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
 * ChatView: Step 3 - AI Evaluation simulation
 */
const ChatView = memo(({
  level, messages, coaching, input, setInput, loading, passed,
  onSend, onReset, onNextLevel, bottomRef
}: ChatViewProps) => {
  const t = useTranslations('aiEval');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea up to ~5 lines
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

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
              {passed ? <Trophy size={18} /> : `L${level}`}
            </div>
            <div>
              <span className="font-bold text-foreground text-sm">
                {t('systemTitle')}
                <span className="text-muted-foreground font-normal opacity-40 mx-1">/</span>
                {t(`levels.${level}.th`)}
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
            <StepProgress current={3} />
            <button
              onClick={() => onReset(passed)}
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-rose-500 transition-all py-2 px-3 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10"
            >
              <ChevronLeft size={14} />
              {passed ? t('backToSelection') : t('endTraining')}
            </button>
          </div>
        </div>

        {/* Message List */}
        <div className={`overflow-y-auto px-5 py-5 bg-slate-50/50 dark:bg-black/10 selection:bg-primary/10 ${passed ? '' : 'flex-1'}`}>

          {/* System ready message */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2.5 mb-5">
            <div className="w-7 h-7 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
              <CheckCircle2 size={13} />
            </div>
            <div className="max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-3 text-xs leading-relaxed bg-primary/5 border border-primary/20 text-primary">
              <p className="text-sm font-bold mb-0.5">{t('readyMsg', { level: level, label: t(`levels.${level}.th`) })}</p>
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
                    <p className="font-black text-xl tracking-tight leading-none mb-1">{t('congrats', { level: level })}</p>
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
                  {t('retryBtn', { level: level })}
                </button>
                {level < 4 ? (
                  <button
                    onClick={() => onNextLevel((level + 1) as EvalLevel)}
                    className="flex-1 flex items-center justify-center gap-2.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 px-6 py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-primary/30 active:scale-95"
                  >
                    {t('nextLevelBtn', { level: level + 1 })}
                    <ArrowRight size={15} />
                  </button>
                ) : (
                  <div className="flex-1 flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-emerald-500/20">
                    <Trophy size={15} />
                    {t('allCompleted')}
                  </div>
                )}
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
  const [level,          setLevel]          = useState<EvalLevel>(1);
  const [sessionId,      setSessionId]      = useState<string | null>(null);
  const [messages,       setMessages]       = useState<PitchMessage[]>([]);
  const [coaching,       setCoaching]       = useState<Map<number, CoachingData>>(new Map());
  const [input,          setInput]          = useState('');
  const [loading,        setLoading]        = useState(false);
  const [agentId,        setAgentId]        = useState<string | null>(null);
  const [agentName,      setAgentName]      = useState<string | null>(null);
  const [passed,          setPassed]          = useState(false);
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());
  const [savedLevel,      setSavedLevel]      = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Derived state
  const inProgressLevel = useMemo(() => 
    savedLevel && !completedLevels.has(savedLevel) ? savedLevel as EvalLevel : null, 
  [savedLevel, completedLevels]);

  useEffect(() => {
    const session = getAgentSession();
    if (!session) return;
    
    const id   = session.id;
    const name = session.name;
    setAgentId(id);
    setAgentName(name);

    // UX initialization from localStorage
    const localComp  = localStorage.getItem('brainstrade_eval_completed_levels');
    const localSaved = localStorage.getItem('brainstrade_eval_saved_level');
    const localSet: Set<number> = localComp ? new Set(JSON.parse(localComp)) : new Set();
    if (localSet.size > 0) setCompletedLevels(localSet);
    if (localSaved) {
      const n = parseInt(localSaved, 10);
      if (!localSet.has(n)) setSavedLevel(n);
    }

    let hasLocalSession = false;
    try {
      const raw = localStorage.getItem(AIEV_SESSION_KEY);
      if (raw && id) {
        const saved = JSON.parse(raw);
        const age = Date.now() - (saved.savedAt ?? 0);
        // Session valid for 24h
        if (saved.agentId === id && saved.messages?.length > 0 && age < 24 * 60 * 60 * 1000) {
          setSessionId(saved.sessionId);
          setLevel(saved.level);
          setMessages(saved.messages);
          setStep('chat');
          hasLocalSession = true;
        } else {
          localStorage.removeItem(AIEV_SESSION_KEY);
        }
      }
    } catch {
      localStorage.removeItem(AIEV_SESSION_KEY);
    }

    if (id) {
      // Sync from server (source of truth)
      fetch(`/api/agent/progress?agentId=${id}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (!data) return;
          const serverComp: number[] = data.evalCompletedLevels ?? [];
          const merged = new Set([...localSet, ...serverComp]);
          setCompletedLevels(merged);
          localStorage.setItem('brainstrade_eval_completed_levels', JSON.stringify([...merged]));

          const serverSaved: number | null = data.evalSavedLevel ?? null;
          if (serverSaved && !merged.has(serverSaved)) {
            setSavedLevel(serverSaved);
            localStorage.setItem('brainstrade_eval_saved_level', String(serverSaved));
          }
        })
        .catch(() => {});

      if (!hasLocalSession) {
        fetch(`/api/ai-eval/active?agentId=${id}`)
          .then(r => r.ok ? r.json() : null)
          .then(data => {
            const s = data?.session;
            if (s && s.messages?.length > 0) {
              const age = Date.now() - (s.savedAt ?? 0);
              if (age < 24 * 60 * 60 * 1000) {
                setSessionId(s.sessionId);
                setLevel(s.level);
                setMessages(s.messages);
                setStep('chat');
                localStorage.setItem(AIEV_SESSION_KEY, JSON.stringify({
                  agentId: id, sessionId: s.sessionId, level: s.level,
                  messages: s.messages, savedAt: s.savedAt ?? Date.now(),
                }));
              }
            }
          })
          .catch(() => {});
      }
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
    localStorage.removeItem('brainstrade_eval_saved_level');
    setSavedLevel(null);
  }, [syncToServer]);

  const isLocked = useCallback((l: number) => {
    if (l === 1) return false;
    return !completedLevels.has(l - 1);
  }, [completedLevels]);

  const startSession = useCallback(async (overrideLevel?: EvalLevel) => {
    const activeLevel = overrideLevel ?? level;
    if (overrideLevel) setLevel(overrideLevel);
    setLoading(true);
    try {
      const res = await fetch('/api/ai-eval/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: activeLevel, agentId, agentName }),
      });
      const data = await res.json();
      setSessionId(data.sessionId);
      setMessages([]);
      setCoaching(new Map());
      setPassed(false);
      
      localStorage.setItem('brainstrade_eval_saved_level', String(activeLevel));
      setSavedLevel(activeLevel);
      syncToServer({ evalSavedLevel: activeLevel });
      setStep('chat');
    } catch (err) {
      console.error('Failed to start AI session', err);
    } finally {
      setLoading(false);
    }
  }, [level, agentId, agentName, syncToServer]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !sessionId || loading || passed) return;
    const userMsg: PitchMessage = { role: 'user', content: input, timestamp: new Date() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-eval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, level, messages: newMessages, agentId, agentName }),
      });
      const data = await res.json();
      const aiMsg: PitchMessage = { role: 'assistant', content: data.reply, timestamp: new Date() };
      const finalMessages = [...newMessages, aiMsg];
      setMessages(finalMessages);

      // Store coaching keyed by the assistant message index
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
        markLevelCompleted(level);
        localStorage.removeItem(AIEV_SESSION_KEY);
        if (agentId) fetch(`/api/ai-eval/active?agentId=${agentId}`, { method: 'DELETE' }).catch(() => {});
      } else if (sessionId && agentId) {
        const snap = { agentId, sessionId, level, messages: finalMessages, savedAt: Date.now() };
        localStorage.setItem(AIEV_SESSION_KEY, JSON.stringify(snap));
        fetch('/api/ai-eval/active', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId, sessionId, level, messages: finalMessages }),
        }).catch(() => {});
      }
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setLoading(false);
    }
  }, [input, sessionId, loading, passed, messages, level, agentId, agentName, markLevelCompleted]);

  const resetToSelect = useCallback((clearHistory = false) => {
    if (clearHistory) {
      localStorage.removeItem(AIEV_SESSION_KEY);
      if (agentId) fetch(`/api/ai-eval/active?agentId=${agentId}`, { method: 'DELETE' }).catch(() => {});
    }
    setSessionId(null);
    setMessages([]);
    setCoaching(new Map());
    setPassed(false);
    setStep('select');
  }, [agentId]);

  const handleContinueIntro = useCallback((l?: EvalLevel) => { 
    if (l) setLevel(l); 
    setStep('select'); 
  }, []);

  /* ─── Render Logic ─────────────────────────────────────────────────────────── */

  return (
    <AnimatePresence mode="wait">
      {step === 'intro' ? (
        <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={TRANSITION.base}>
          <IntroView 
            onContinue={handleContinueIntro} 
            inProgressLevel={inProgressLevel} 
          />
        </motion.div>
      ) : step === 'select' ? (
        <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={TRANSITION.base}>
          <SelectionView
            level={level}
            setLevel={setLevel}
            onStart={startSession}
            onShowIntro={() => setStep('intro')}
            isLocked={isLocked}
            completedLevels={completedLevels}
            inProgressLevel={inProgressLevel}
            agentName={agentName}
            loading={loading}
          />
        </motion.div>
      ) : (
        <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={TRANSITION.base}>
          <ChatView
            level={level}
            messages={messages}
            coaching={coaching}
            input={input}
            setInput={setInput}
            loading={loading}
            passed={passed}
            onSend={sendMessage}
            onReset={resetToSelect}
            onNextLevel={(next) => {
              setLevel(next);
              resetToSelect(true);
            }}
            bottomRef={bottomRef}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
