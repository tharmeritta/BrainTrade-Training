'use client';

import React, { memo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Bot, ChevronLeft, Trophy, RotateCcw, ArrowRight,
  Zap, XCircle, Frown, Smile, BookOpen, X,
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { TRANSITION } from '@/lib/animations';
import { CoachingCard, ScoreTrend } from './CoachingCard';
import { MessageBubble } from './MessageBubble';
import { StepProgress } from './StepProgress';
import CallSimulatorHud from './CallSimulatorHud';
import type { ChatViewProps } from './types';

export const ChatView = memo(({
  messages, coaching, customerProfile, input, setInput, loading, passed, failed, error,
  onSend, onReset, onClearError, onUseScript, bottomRef, textareaRef, criteriaKeys,
}: ChatViewProps) => {
  const t = useTranslations('aiEval');
  const router = useRouter();
  const pathname = usePathname();
  const [showMobileTips, setShowMobileTips] = React.useState(false);

  const locale = pathname.split('/')[1] || 'th';
  const currentLevel = messages.length > 0 ? (messages[0] as any).level || 1 : 1;
  const isLevel4 = currentLevel >= 4;

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
    <div className="max-w-[1400px] mx-auto py-2 px-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Left Column: Real-Time 12-Turn Call Roadmap */}
      <div className="lg:col-span-3 order-2 lg:order-1 space-y-4">
        <div className="bg-card border border-black/5 dark:border-white/10 rounded-3xl p-4 shadow-lg space-y-4 sticky top-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                {t('turnTracker.title')}
              </h3>
              <p className="text-[10px] text-muted-foreground">{t('turnTracker.subtitle')}</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
              Turn {messages.filter(m => m.role === 'user').length} / 12
            </span>
          </div>

          {(() => {
            const uTurns = messages.filter(m => m.role === 'user').length;
            const phases = [
              { id: 1, range: [1, 3], title: t('turnTracker.p1_title'), desc: t('turnTracker.p1_desc') },
              { id: 2, range: [4, 6], title: t('turnTracker.p2_title'), desc: t('turnTracker.p2_desc') },
              { id: 3, range: [7, 9], title: t('turnTracker.p3_title'), desc: t('turnTracker.p3_desc') },
              { id: 4, range: [10, 12], title: t('turnTracker.p4_title'), desc: t('turnTracker.p4_desc') },
            ];

            return (
              <div className="space-y-2.5">
                {phases.map(p => {
                  const isActive = uTurns >= p.range[0] && uTurns <= p.range[1];
                  const isDone = uTurns > p.range[1];
                  return (
                    <div
                      key={p.id}
                      className={`p-3 rounded-2xl border transition-all duration-300 ${
                        isActive
                          ? 'bg-primary/10 border-primary shadow-sm scale-[1.01]'
                          : isDone
                          ? 'bg-muted/30 border-black/5 dark:border-white/5 opacity-60'
                          : 'bg-card border-black/5 dark:border-white/5 opacity-40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold text-[11px] ${isActive ? 'text-primary' : 'text-foreground'}`}>
                          {p.title}
                        </span>
                        {isActive && (
                          <span className="text-[9px] font-black uppercase tracking-wider bg-primary text-white px-1.5 py-0.2 rounded">
                            CURRENT
                          </span>
                        )}
                        {isDone && (
                          <span className="text-[9px] font-bold text-emerald-500">✓ Done</span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-snug">{p.desc}</p>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Quick Trainer Tip */}
          <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 text-[11px] text-slate-300 space-y-1">
            <span className="font-bold text-amber-400 block">{t('guidelines.proTipTitle')}</span>
            <p className="italic leading-relaxed text-[10px]">
              {t('guidelines.proTipDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Center Column: Main Interactive Chat Box */}
      <div
        className="lg:col-span-6 order-1 lg:order-2 bg-card rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-black/5 dark:border-white/10 flex flex-col overflow-hidden"
        style={{
          height:    isEnded ? 'auto' : 'calc(100dvh - 96px)',
          maxHeight: isEnded ? 'none' : '920px',
          minHeight: '500px',
        }}
      >
        {/* Header with integrated customer profile & turn counter */}
        <div className="flex items-center justify-between px-4 py-2.5 sm:px-5 sm:py-3 border-b border-black/5 dark:border-white/10 bg-white/90 dark:bg-card/90 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
              passed ? 'bg-emerald-500/10 text-emerald-600'
              : failed ? 'bg-rose-500/10 text-rose-600'
              : 'bg-primary/10 text-primary'
            }`}>
              {passed ? <Trophy size={16} /> : failed ? <XCircle size={16} /> : <Zap size={16} />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-xs sm:text-sm truncate">
                  {customerProfile?.name ? `${customerProfile.name}` : t('systemTitle')}
                </span>
                {customerProfile?.mood && (
                  <span className="hidden xs:inline px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-primary/10 text-primary border border-primary/20 shrink-0">
                    {customerProfile.mood}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                <span className="truncate max-w-[140px] sm:max-w-[220px]">
                  {customerProfile?.occupation || 'Call Simulation'}
                </span>
                <span className="text-primary font-mono font-bold shrink-0">
                  Turn {messages.filter(m => m.role === 'user').length}/12
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <ScoreTrend coaching={coaching} />
            <button
              onClick={() => setShowMobileTips(true)}
              className="lg:hidden flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-1 rounded-lg active:scale-95"
            >
              <Zap size={12} />
              <span>Tips</span>
            </button>
            <button
              onClick={() => onReset(isEnded)}
              className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-rose-50 transition-all py-1.5 px-2 sm:py-2 sm:px-3 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10"
            >
              <ChevronLeft size={14} />
              <span className="hidden sm:inline">{isEnded ? t('backToSelection') : t('endTraining')}</span>
              <span className="sm:hidden">Exit</span>
            </button>
          </div>
        </div>

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
                      autoExpand={(() => {
                        const score = card.score ?? 0;
                        const criteria = card.criteria || {};
                        const hasLowScore = Object.values(criteria).some(val => val < 5);
                        return score < 35 || hasLowScore;
                      })()}
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
                    onClick={() => {
                      if (isLevel4) {
                        router.push(`/${locale}/dashboard?graduated=1`);
                      } else {
                        onReset(true);
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-emerald-500/20 active:scale-95 transition-all duration-300"
                  >
                    <ArrowRight size={15} />
                    {isLevel4 ? t('claimGraduationBtn') : t('nextLevelBtn')}
                  </button>
                ) : (
                  <button
                    onClick={() => onReset(true)}
                    className="flex-1 flex items-center justify-center gap-2.5 bg-foreground text-background px-6 py-3.5 rounded-xl font-bold text-sm shadow-xl active:scale-95"
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

      {/* Right Column: Scenario Passing Guidelines Panel */}
      <div className="lg:col-span-3 order-3 lg:order-3 space-y-4">
        <div className="bg-card border border-black/5 dark:border-white/10 rounded-3xl p-4 shadow-lg space-y-4 sticky top-6">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Zap size={18} />
            </div>
            <div>
              <h3 className="font-bold text-xs text-foreground">{t('guidelines.title')}</h3>
              <p className="text-[10px] text-muted-foreground">{t('guidelines.subtitle')}</p>
            </div>
          </div>

          {/* Checklist Guidelines */}
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block text-[11px]">
                {t('guidelines.g1_title')}
              </span>
              <p className="text-muted-foreground leading-relaxed text-[10px]">
                {t('guidelines.g1_desc')}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-1">
              <span className="font-bold text-indigo-600 dark:text-indigo-400 block text-[11px]">
                {t('guidelines.g2_title')}
              </span>
              <p className="text-muted-foreground leading-relaxed text-[10px]">
                {t('guidelines.g2_desc')}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1">
              <span className="font-bold text-amber-500 dark:text-amber-400 block text-[11px]">
                {t('guidelines.g3_title')}
              </span>
              <p className="text-muted-foreground leading-relaxed text-[10px]">
                {t('guidelines.g3_desc')}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-primary/5 border border-primary/20 space-y-1">
              <span className="font-bold text-primary block text-[11px]">
                {t('guidelines.g4_title')}
              </span>
              <p className="text-muted-foreground leading-relaxed text-[10px]">
                {t('guidelines.g4_desc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Modal for Tips & Roadmap */}
      <AnimatePresence>
        {showMobileTips && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end flex-col lg:hidden"
            onClick={() => setShowMobileTips(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="bg-card border-t border-black/10 dark:border-white/10 rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                    <Zap size={16} />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">{t('guidelines.title')}</h3>
                </div>
                <button
                  onClick={() => setShowMobileTips(false)}
                  className="p-1 text-muted-foreground hover:text-foreground rounded-lg bg-muted/50"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Guidelines List */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 block text-[11px]">
                    {t('guidelines.g1_title')}
                  </span>
                  <p className="text-muted-foreground text-[10px]">{t('guidelines.g1_desc')}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 block text-[11px]">
                    {t('guidelines.g2_title')}
                  </span>
                  <p className="text-muted-foreground text-[10px]">{t('guidelines.g2_desc')}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <span className="font-bold text-amber-500 dark:text-amber-400 block text-[11px]">
                    {t('guidelines.g3_title')}
                  </span>
                  <p className="text-muted-foreground text-[10px]">{t('guidelines.g3_desc')}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/20">
                  <span className="font-bold text-primary block text-[11px]">
                    {t('guidelines.g4_title')}
                  </span>
                  <p className="text-muted-foreground text-[10px]">{t('guidelines.g4_desc')}</p>
                </div>
              </div>

              {/* Turn Roadmap */}
              <div className="pt-2 border-t border-border space-y-2">
                <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  {t('turnTracker.title')}
                </h4>
                {(() => {
                  const uTurns = messages.filter(m => m.role === 'user').length;
                  const phases = [
                    { id: 1, range: [1, 3], title: t('turnTracker.p1_title'), desc: t('turnTracker.p1_desc') },
                    { id: 2, range: [4, 6], title: t('turnTracker.p2_title'), desc: t('turnTracker.p2_desc') },
                    { id: 3, range: [7, 9], title: t('turnTracker.p3_title'), desc: t('turnTracker.p3_desc') },
                    { id: 4, range: [10, 12], title: t('turnTracker.p4_title'), desc: t('turnTracker.p4_desc') },
                  ];
                  return (
                    <div className="space-y-1.5">
                      {phases.map(p => {
                        const isActive = uTurns >= p.range[0] && uTurns <= p.range[1];
                        const isDone = uTurns > p.range[1];
                        return (
                          <div
                            key={p.id}
                            className={`p-2 rounded-lg border text-xs ${
                              isActive ? 'bg-primary/10 border-primary font-bold' : isDone ? 'opacity-50' : 'opacity-40'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[11px]">{p.title}</span>
                              {isActive && <span className="text-[8px] bg-primary text-white px-1 rounded">ACTIVE</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

ChatView.displayName = 'ChatView';
