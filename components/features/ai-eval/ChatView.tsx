'use client';

import React, { memo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Bot, ChevronLeft, Trophy, RotateCcw, ArrowRight,
  Zap, XCircle, Frown, Smile,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TRANSITION } from '@/lib/animations';
import { CoachingCard, ScoreTrend } from './CoachingCard';
import { MessageBubble } from './MessageBubble';
import { StepProgress } from './StepProgress';
import type { ChatViewProps } from './types';

export const ChatView = memo(({
  messages, coaching, customerProfile, input, setInput, loading, passed, failed, error,
  onSend, onReset, onClearError, onUseScript, bottomRef, textareaRef, criteriaKeys,
}: ChatViewProps) => {
  const t = useTranslations('aiEval');

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input, textareaRef]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); }
  }, [onSend]);

  const isEnded = passed || failed;

  return (
    <div className="max-w-4xl mx-auto py-2 px-4">
      <div
        className="bg-card rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-black/5 dark:border-white/10 flex flex-col overflow-hidden"
        style={{
          height:    isEnded ? 'auto' : 'calc(100dvh - 96px)',
          maxHeight: isEnded ? 'none' : '920px',
          minHeight: '500px',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-black/5 dark:border-white/10 bg-white/90 dark:bg-card/90 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
              passed ? 'bg-emerald-500/10 text-emerald-600'
              : failed ? 'bg-rose-500/10 text-rose-600'
              : 'bg-primary/10 text-primary'
            }`}>
              {passed ? <Trophy size={18} /> : failed ? <XCircle size={18} /> : <Zap size={18} />}
            </div>
            <div>
              <span className="font-bold text-foreground text-sm">{t('systemTitle')}</span>
              <p className={`text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-widest ${
                passed ? 'text-emerald-500' : failed ? 'text-rose-500' : 'text-primary'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  passed ? 'bg-emerald-500' : failed ? 'bg-rose-500' : 'bg-primary animate-pulse'
                }`} />
                {passed ? t('congrats', { level: '' }) : failed ? 'Simulation Ended' : t('liveSim')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ScoreTrend coaching={coaching} />
            <StepProgress current={3} />
            <button
              onClick={() => onReset(isEnded)}
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-rose-50 transition-all py-2 px-3 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10"
            >
              <ChevronLeft size={14} />
              {isEnded ? t('backToSelection') : t('endTraining')}
            </button>
          </div>
        </div>

        {/* Customer profile bar */}
        {customerProfile && (
          <div className="px-5 py-3 bg-white dark:bg-card/50 border-b border-black/5 dark:border-white/5 flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center">
                {customerProfile.mood?.includes('หงุดหงิด') || failed
                  ? <Frown size={14} className="text-rose-500" />
                  : <Smile size={14} className="text-emerald-500" />}
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
                {customerProfile.occupation || t('general')}
                {customerProfile.age ? ` (${customerProfile.age} ${t('yearsOld')})` : ''}
              </p>
            </div>
            <div className="h-6 w-px bg-black/5 dark:bg-white/5 hidden sm:block" />
            <div className="flex-1 min-w-[200px]">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight leading-none mb-0.5">{t('objectiveLabel')}</p>
              <p className="text-xs font-bold text-primary italic truncate">&ldquo;{customerProfile.objective || t('general')}&rdquo;</p>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className={`overflow-y-auto px-5 py-5 bg-slate-50/50 dark:bg-black/10 selection:bg-primary/10 ${isEnded ? '' : 'flex-1'}`}>
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
                      criteriaKeys={criteriaKeys}
                    />
                  )}
                </React.Fragment>
              );
            })}

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
                    <p className="font-black text-xl tracking-tight leading-none mb-1">
                      {t('congrats', { level: '' }).replace(' Level ', '')}
                    </p>
                    <p className="text-sm font-bold opacity-90">{t('congratsSub')}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {failed && (
              <motion.div
                key="failed"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={TRANSITION.spring}
                className="flex flex-col items-center py-6 mt-4"
              >
                <div className="flex items-center gap-4 bg-gradient-to-br from-rose-500 to-rose-600 text-white px-8 py-5 rounded-2xl shadow-2xl shadow-rose-500/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
                  <XCircle size={36} className="drop-shadow-lg" />
                  <div className="relative z-10">
                    <p className="font-black text-xl tracking-tight leading-none mb-1">Session Ended</p>
                    <p className="text-sm font-bold opacity-90">Customer hung up. Try a different approach.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {isEnded && (
              <motion.div
                key="actions"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row gap-3 pb-4 pt-4"
              >
                <button
                  onClick={() => onReset(true)}
                  className="flex-1 flex items-center justify-center gap-2.5 bg-white dark:bg-white/5 text-foreground hover:bg-secondary transition-all duration-300 px-6 py-3.5 rounded-xl font-bold text-sm border border-black/5 shadow-md active:scale-95"
                >
                  <RotateCcw size={15} />
                  {t('retryBtn', { level: '' }).replace(' Level ', '')}
                </button>
                {passed ? (
                  <button
                    onClick={() => onReset(true)}
                    className="flex-1 flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-emerald-500/20"
                  >
                    <ArrowRight size={15} />Next Level Selection
                  </button>
                ) : (
                  <button
                    onClick={() => onReset(true)}
                    className="flex-1 flex items-center justify-center gap-2.5 bg-foreground text-background px-6 py-3.5 rounded-xl font-bold text-sm shadow-xl"
                  >
                    <ArrowRight size={15} />Start New Attempt
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div
                key="error-banner"
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

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-end gap-2 mt-1"
            >
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

        {/* Input */}
        {!isEnded && (
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
          </div>
        )}
      </div>
    </div>
  );
});

ChatView.displayName = 'ChatView';
