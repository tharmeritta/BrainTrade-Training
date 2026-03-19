'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, User as UserIcon, Bot, ChevronLeft, Play, Sparkles,
  CheckCircle2, Trophy, RotateCcw, Loader2, ArrowRight,
  Lock, BookOpen, AlertTriangle, ChevronRight, History,
} from 'lucide-react';

import type { PitchMessage } from '@/types';
import { getAgentSession } from '@/lib/agent-session';
import { FADE_IN, TRANSITION, EASE } from '@/lib/animations';

import { useTranslations } from 'next-intl';

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
  input: string;
  setInput: (v: string) => void;
  loading: boolean;
  passed: boolean;
  onSend: () => void;
  onReset: (clearHistory: boolean) => void;
  onNextLevel: (next: EvalLevel) => void;
  bottomRef: React.RefObject<HTMLDivElement>;
}

/* ─── Sub-components ────────────────────────────────────────────────────────── */

/**
 * IntroView: Step 1 - Instructions and overview
 */
const IntroView = memo(({ onContinue, inProgressLevel }: IntroViewProps) => {
  const t = useTranslations('aiEval');
  
  return (
    <div className="max-w-4xl mx-auto py-8">
      <motion.div variants={FADE_IN} initial="initial" animate="animate" className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-primary/10 text-primary rounded-2xl shadow-sm">
          <BookOpen size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">{t('title')}</h1>
          <p className="text-muted-foreground text-sm font-medium mt-0.5 opacity-80">{t('subtitle')}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={TRANSITION.base}
        className="bg-card rounded-[2.5rem] shadow-2xl border border-black/5 dark:border-white/5 overflow-hidden"
      >
        <div className="bg-gradient-to-br from-primary to-primary/80 px-10 py-10 text-primary-foreground relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 blur-3xl rounded-full" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                <Sparkles size={24} className="text-white" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">{t('introTitle')}</h2>
            </div>
            <p 
              className="opacity-90 text-base leading-relaxed max-w-2xl font-medium"
              dangerouslySetInnerHTML={{ __html: t.raw('introDesc') }}
            />
          </div>
        </div>

        <div className="p-10 space-y-10">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-sm font-black shadow-sm">1</span>
              <h3 className="font-black text-foreground text-xl tracking-tight">{t('levelsTitle')}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([1, 2, 3, 4] as const).map(l => (
                <div key={l} className="bg-secondary/20 rounded-[24px] p-5 border border-black/5 dark:border-white/5 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-black bg-primary text-white px-2.5 py-1 rounded-lg uppercase tracking-wider">Level {l}</span>
                    <span className="font-extrabold text-base text-foreground">{t(`levels.${l}.th`)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 font-medium leading-relaxed">{t(`levels.${l}.desc`)}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[0, 1].map((i) => (
                      <span key={i} className="text-[11px] bg-white dark:bg-black/20 border border-black/5 dark:border-white/10 text-muted-foreground px-3 py-1 rounded-lg font-bold italic">
                        &quot;{t(`levels.${l}.examples.${i}`)}&quot;
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-sm font-black shadow-sm">2</span>
              <h3 className="font-black text-foreground text-xl tracking-tight">{t('criteriaTitle')}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {CRITERIA_KEYS.map((key) => (
                <span key={key} className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-foreground text-xs font-black px-4 py-2.5 rounded-xl shadow-sm uppercase tracking-wide">
                  {t(`criteria.${key}`)}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-2.5 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 size={20} />
                <span className="font-black text-base uppercase tracking-tight">{t('passCriteria')}</span>
              </div>
              <p className="text-sm text-emerald-800/70 dark:text-emerald-300/70 leading-relaxed font-medium">
                {t('passDesc')}
              </p>
            </div>
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-2.5 text-rose-700 dark:text-rose-400">
                <AlertTriangle size={20} />
                <span className="font-black text-base uppercase tracking-tight">{t('failCriteria')}</span>
              </div>
              <p className="text-sm text-rose-800/70 dark:text-rose-300/70 leading-relaxed font-medium">
                {t('failDesc')}
              </p>
            </div>
          </div>

          {inProgressLevel && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-amber-50 dark:bg-amber-950/20 border border-amber-300/50 dark:border-amber-700/50 rounded-[28px] p-6 flex items-center justify-between gap-6 shadow-lg shadow-amber-500/5"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                  <History size={28} />
                </div>
                <div>
                  <p className="font-black text-amber-800 dark:text-amber-300 text-lg leading-tight">
                    {t('continueAt', { level: inProgressLevel })}
                  </p>
                  <p className="text-sm text-amber-700/70 dark:text-amber-400/70 mt-1 font-bold">
                    {t(`levels.${inProgressLevel}.th`)} — {t('continueSaved')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onContinue(inProgressLevel)}
                className="shrink-0 flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3.5 rounded-2xl font-black text-sm transition-all shadow-md active:scale-95 hover:shadow-lg hover:shadow-amber-500/20"
              >
                {t('continueBtn')}
                <ArrowRight size={18} />
              </button>
            </motion.div>
          )}

          <button
            onClick={() => onContinue()}
            className="w-full flex items-center justify-center gap-3 bg-foreground text-background hover:bg-primary hover:text-white transition-all duration-500 py-6 rounded-[24px] font-black text-xl shadow-xl active:scale-[0.99] group"
          >
            {inProgressLevel ? t('overviewBtn') : t('startBtn')}
            <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
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
      <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground uppercase">{t('title')}</h1>
          <p className="text-muted-foreground text-sm font-bold mt-1 opacity-70">{t('selectDesc')}</p>
        </div>
        <div className="flex items-center gap-3">
          {agentName && (
            <div className="text-[10px] font-black text-muted-foreground bg-secondary/50 px-4 py-2 rounded-xl border border-black/5 uppercase tracking-widest shadow-sm">
              {t('activeAgent')}: <span className="text-primary">{agentName}</span>
            </div>
          )}
          <button
            onClick={onShowIntro}
            className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-secondary/50 transition-all"
          >
            <BookOpen size={16} />
            {t('instructionsBtn')}
          </button>
        </div>
      </div>

      {inProgressLevel && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700/50 rounded-3xl px-8 py-5 flex items-center justify-between gap-6 shadow-lg shadow-amber-500/5"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-2xl">
              <History size={24} className="text-amber-600" />
            </div>
            <p className="text-sm font-black text-amber-800 dark:text-amber-300">
              {t('resumeDesc', { level: inProgressLevel, label: t(`levels.${inProgressLevel}.th`) })}
            </p>
          </div>
          <button
            onClick={() => onStart(inProgressLevel)}
            disabled={loading}
            className="shrink-0 flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-md active:scale-95"
          >
            <Play size={16} className="fill-current" />
            {t('continueBtn')}
          </button>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={TRANSITION.base}
        className="bg-card rounded-[3rem] shadow-2xl border border-black/5 dark:border-white/5 p-12 text-center relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="w-24 h-24 bg-primary/10 text-primary rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Sparkles size={48} />
          </div>
          <h2 className="text-3xl font-black mb-3 tracking-tight">{t('selectTitle')}</h2>
          <p className="mb-12 text-muted-foreground max-w-sm mx-auto font-medium opacity-80">
            {t('selectDesc')}
          </p>

          <div className="flex flex-wrap justify-center gap-5 mb-12">
            {([1, 2, 3, 4] as const).map(l => {
              const locked    = isLocked(l);
              const completed = completedLevels.has(l);
              const selected  = level === l;
              return (
                <button
                  key={l}
                  onClick={() => !locked && setLevel(l)}
                  disabled={locked}
                  className={`group relative px-8 py-5 rounded-[24px] font-black transition-all duration-500 border-2 ${
                    locked
                      ? 'bg-secondary/20 text-muted-foreground/30 border-transparent cursor-not-allowed opacity-60'
                      : selected
                      ? 'bg-primary text-primary-foreground border-primary shadow-2xl shadow-primary/30 scale-110'
                      : 'bg-white dark:bg-white/5 text-muted-foreground border-black/5 dark:border-white/10 hover:border-primary/40 hover:bg-white hover:shadow-xl'
                  }`}
                >
                  {locked ? (
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-muted-foreground/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-lg">
                      <Lock size={14} className="text-muted-foreground/60" />
                    </div>
                  ) : completed ? (
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                      <CheckCircle2 size={16} className="text-white" />
                    </div>
                  ) : null}

                  <span className="relative z-10 text-lg block uppercase tracking-wide">Level {l}</span>
                  <span className="block text-[11px] opacity-70 font-extrabold mt-0.5">{t(`levels.${l}.th`)}</span>

                  {selected && !locked && (
                    <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-primary uppercase tracking-widest whitespace-nowrap bg-primary/10 px-3 py-1 rounded-full">
                      {t(`levels.${l}.desc`)}
                    </p>
                  )}
                  {locked && (
                    <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-muted-foreground/50 whitespace-nowrap italic">
                      {t('lockedDesc', { level: l - 1 })}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onStart()}
            disabled={loading || isLocked(level)}
            className="group mt-6 flex items-center justify-center gap-3 bg-foreground text-background px-12 py-5 rounded-[24px] font-black text-xl hover:bg-primary hover:text-white transition-all duration-500 shadow-2xl disabled:opacity-50 mx-auto active:scale-95"
          >
            <Play size={24} className="fill-current group-hover:scale-110 transition-transform" />
            {loading ? t('connecting') : t('startSimBtn')}
          </button>
        </div>

        <div className="absolute top-0 left-0 w-80 h-84 bg-primary/5 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-84 bg-primary/5 blur-3xl rounded-full translate-x-1/2 translate-y-1/2" />
      </motion.div>
    </div>
  );
});

SelectionView.displayName = 'SelectionView';

/**
 * MessageBubble sub-component
 */
const MessageBubble = memo(({ m, i }: { m: PitchMessage; i: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 12, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ ...TRANSITION.base, delay: i * 0.05 }}
    className={`flex items-start gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
  >
    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-md border ${
      m.role === 'user'
        ? 'bg-primary text-primary-foreground border-primary/20'
        : 'bg-white dark:bg-card border-black/5 dark:border-white/10 text-foreground'
    }`}>
      {m.role === 'user' ? <UserIcon size={22} /> : <Bot size={22} />}
    </div>
    <div className={`max-w-[85%] sm:max-w-[75%] rounded-[24px] px-6 py-4 text-sm leading-relaxed shadow-sm whitespace-pre-wrap font-medium border ${
      m.role === 'user'
        ? 'bg-primary text-primary-foreground rounded-tr-none border-primary/10'
        : 'bg-white dark:bg-card text-foreground rounded-tl-none border-black/5 dark:border-white/10'
    }`}>
      {m.content}
    </div>
  </motion.div>
));

MessageBubble.displayName = 'MessageBubble';

/**
 * ChatView: Step 3 - AI Evaluation simulation
 */
const ChatView = memo(({ 
  level, messages, input, setInput, loading, passed, 
  onSend, onReset, onNextLevel, bottomRef 
}: ChatViewProps) => {
  const t = useTranslations('aiEval');
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }, [onSend]);

  return (
    <div className="max-w-4xl mx-auto py-4">
      <div className="bg-card rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-black/5 dark:border-white/10 flex flex-col overflow-hidden relative"
        style={{ height: passed ? 'auto' : 'calc(100dvh - 120px)', maxHeight: passed ? 'none' : '850px', minHeight: '600px' }}>

        {/* Chat Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-black/5 dark:border-white/10 bg-white/90 dark:bg-card/90 backdrop-blur-md z-10 shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-inner ${
              passed ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'
            }`}>
              {passed ? <Trophy size={24} /> : `L${level}`}
            </div>
            <div>
              <span className="font-black text-foreground text-lg tracking-tight">AI Evaluation <span className="text-muted-foreground font-medium opacity-40 mx-1">/</span> {t(`levels.${level}.th`)}</span>
              <p className={`text-[10px] font-black flex items-center gap-1.5 uppercase tracking-[0.2em] mt-0.5 ${
                passed ? 'text-emerald-500' : 'text-primary'
              }`}>
                <span className={`w-2 h-2 rounded-full ${passed ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-primary animate-pulse'}`} />
                {passed ? t('congrats', { level: '' }) : t('liveSim')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onReset(passed)}
            className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-rose-500 transition-all py-2.5 px-5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-200/50"
          >
            <ChevronLeft size={16} />
            {passed ? t('backToSelection') : t('endTraining')}
          </button>
        </div>

        {/* Message List */}
        <div className={`overflow-y-auto px-8 py-10 space-y-8 bg-slate-50/30 dark:bg-black/10 selection:bg-primary/10 ${passed ? '' : 'flex-1'}`}>
          <AnimatePresence initial={false}>
            {/* System ready message */}
            <motion.div key="ready" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 shadow-sm">
                <CheckCircle2 size={22} />
              </div>
              <div className="max-w-[85%] rounded-[24px] rounded-tl-none px-6 py-5 text-sm leading-relaxed shadow-sm bg-primary/5 border border-primary/20 text-primary font-bold">
                <p className="mb-1 text-base">{t('readyMsg', { level: level, label: t(`levels.${level}.th`) })}</p>
                <p className="text-xs opacity-70 font-medium">{t('readySub')}</p>
              </div>
            </motion.div>

            {/* Conversation */}
            {messages.map((m, i) => (
              <MessageBubble key={i} m={m} i={i} />
            ))}

            {/* Passed banner */}
            {passed && (
              <motion.div
                key="passed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={TRANSITION.spring}
                className="flex flex-col items-center py-10"
              >
                <div className="flex items-center gap-5 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white px-10 py-6 rounded-[32px] shadow-2xl shadow-emerald-500/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
                  <Trophy size={48} className="drop-shadow-lg" />
                  <div className="relative z-10">
                    <p className="font-black text-2xl tracking-tight leading-none mb-1">{t('congrats', { level: level })}</p>
                    <p className="text-sm font-bold opacity-90">{t('congratsSub')}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action buttons after passing */}
            {passed && (
              <motion.div
                key="actions"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <button
                  onClick={() => onReset(true)}
                  className="flex-1 flex items-center justify-center gap-3 bg-white dark:bg-white/5 text-foreground hover:bg-secondary transition-all duration-300 px-8 py-5 rounded-[24px] font-black border border-black/5 shadow-lg active:scale-95"
                >
                  <RotateCcw size={20} />
                  {t('retryBtn', { level: level })}
                </button>

                {level < 4 ? (
                  <button
                    onClick={() => onNextLevel((level + 1) as EvalLevel)}
                    className="flex-1 flex items-center justify-center gap-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 px-8 py-5 rounded-[24px] font-black shadow-xl shadow-primary/30 active:scale-95"
                  >
                    {t('nextLevelBtn', { level: level + 1 })}
                    <ArrowRight size={22} />
                  </button>
                ) : (
                  <div className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-5 rounded-[24px] font-black shadow-xl shadow-emerald-500/20">
                    <Trophy size={22} />
                    {t('allCompleted')}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI typing indicator */}
          {loading && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-white dark:bg-card border border-black/5 flex items-center justify-center shrink-0 shadow-sm">
                <Bot size={22} />
              </div>
              <div className="bg-white dark:bg-card border border-black/5 rounded-[24px] rounded-tl-none px-6 py-4 flex gap-3 items-center shadow-md">
                <Loader2 size={18} className="animate-spin text-primary" />
                <span className="text-xs font-black uppercase tracking-[0.1em] text-muted-foreground opacity-60">AI is thinking...</span>
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} className="h-4" />
        </div>

        {/* Chat Input */}
        {!passed && (
          <div className="p-8 bg-white dark:bg-card border-t border-black/5 dark:border-white/10 z-10 shrink-0 shadow-[0_-8px_32px_rgba(0,0,0,0.02)]">
            <div className="relative flex items-center gap-4 bg-secondary/30 p-2.5 rounded-[28px] border-2 border-transparent focus-within:border-primary/20 focus-within:bg-white dark:focus-within:bg-black/20 transition-all duration-300 group">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('placeholder')}
                className="flex-1 bg-transparent border-none focus:ring-0 px-5 py-4 text-sm font-bold placeholder:text-muted-foreground/40 placeholder:italic"
              />
              <button
                onClick={onSend}
                disabled={loading || !input.trim()}
                className="bg-primary text-white p-4 rounded-[20px] hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-30 disabled:scale-100 shadow-xl shadow-primary/30 group-focus-within:shadow-primary/40"
              >
                <Send size={24} />
              </button>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-4 text-center px-4 opacity-40">
              Thai Tele-Sales Simulation System v3.0
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
