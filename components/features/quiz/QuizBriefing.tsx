'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Hash, Target, Layers, Sparkles, Trophy, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TRANSITION } from '@/lib/animations';
import { PASS_THRESHOLD } from '@/lib/quiz-data';
import { ActiveAgentUI } from '@/components/ui/ActiveAgentUI';
import { C } from './shared';
import type { QuizBriefingProps } from './types';
import { playGamifiedSound } from './gamification';

// Staggered reveal
const reveal = {
  initial: { opacity: 0, y: 16 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, ...TRANSITION.base },
  }),
  exit: { opacity: 0, y: -10, transition: TRANSITION.fast },
};

export const QuizBriefing = memo(({
  quiz, lang, agentName, onBack, onStart,
}: QuizBriefingProps) => {
  const t = useTranslations('quiz');
  const tSelection = useTranslations('quizSelection');
  const phases        = quiz.phases ?? [];
  const total         = quiz.questions.length;
  const thresholdPct  = Math.round((quiz.passThreshold ?? PASS_THRESHOLD) * 100);
  const hasMultiPhase = phases.length > 1;
  const maxPotentialXp = total * 150;

  const statItems = [
    { icon: <Hash size={13} />, label: t('questionsLabel'),    value: String(total) },
    { icon: <Target size={13} />, label: t('passScoreLabel'), value: `${thresholdPct}%` },
    { icon: <Sparkles size={13} className="text-amber-500" />, label: 'Max XP', value: `+${maxPotentialXp.toLocaleString()}` },
    ...(hasMultiPhase
      ? [{ icon: <Layers size={13} />, label: t('phasesLabel'), value: String(phases.length) }]
      : []
    ),
  ];

  const handleStartFull = () => {
    playGamifiedSound('correct');
    onStart({ type: 'full' });
  };

  const handleStartPhase = (phaseIdx: number) => {
    playGamifiedSound('combo');
    onStart({ type: 'phase', phaseIdx });
  };

  const handleStartPracticeAll = () => {
    playGamifiedSound('combo');
    onStart({ type: 'practice-all' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={TRANSITION.base}
      className="min-h-[calc(100dvh-56px)] py-10 px-4 select-none"
      style={{ background: C.bg, fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="max-w-[620px] mx-auto">

        {/* Top nav */}
        <motion.div
          custom={0} variants={reveal}
          className="flex items-center justify-between gap-4 mb-8 flex-wrap"
        >
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm font-bold transition-opacity hover:opacity-70"
            style={{ color: C.muted }}
          >
            <ChevronLeft size={18} />
            {t('chooseAssessment')}
          </button>
          <ActiveAgentUI agentName={agentName} />
        </motion.div>

        {/* Quiz identity & gamification banner */}
        <motion.div custom={1} variants={reveal} className="mb-8 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 font-mono text-[11px] font-black uppercase tracking-wider mb-3">
            <Trophy size={13} className="text-amber-500" />
            <span>BrainTrade Gamified Arena</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight mb-3">
            {quiz.title[lang]}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg">
            {quiz.description[lang]}
          </p>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          custom={2} variants={reveal}
          className="flex items-stretch mb-8 rounded-3xl overflow-hidden shadow-md border"
          style={{ borderColor: C.border, background: C.surface }}
        >
          {statItems.map(({ icon, label, value }, i) => (
            <div
              key={label}
              className="flex-1 flex flex-col items-center justify-center py-5 gap-1.5"
              style={{ borderRight: i < statItems.length - 1 ? `1px solid ${C.border}` : 'none' }}
            >
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 800, color: C.text, lineHeight: 1 }}>
                {value}
              </p>
              <div className="flex items-center gap-1" style={{ color: C.hint }}>
                {icon}
                <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  {label}
                </span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Section label */}
        <motion.div custom={3} variants={reveal} className="flex items-center justify-between gap-2 mb-3">
          <p style={{
            fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 800,
            color: C.hint, textTransform: 'uppercase', letterSpacing: '0.14em',
          }}>
            {t('selectMode')}
          </p>
          <span className="text-[10px] font-extrabold font-mono text-emerald-600 flex items-center gap-1">
            <Zap size={11} /> Multiplier active
          </span>
        </motion.div>

        {/* -- Full Assessment card -- */}
        <motion.button
          custom={4} variants={reveal}
          onClick={handleStartFull}
          whileHover={{ scale: 1.015, y: -2 }}
          whileTap={{ scale: 0.985 }}
          className="w-full rounded-3xl p-7 text-left shadow-2xl mb-4 relative overflow-hidden group border border-slate-800"
          style={{ background: '#1A1917', color: '#fff' }}
        >
          {/* Animated glow gradient background */}
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-blue-500/20 opacity-40 blur-xl group-hover:opacity-80 transition-opacity" />

          {/* Dot texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-3 mb-4">
              <p style={{
                fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 800,
                color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.14em',
              }}>
                ⚡ Scored Session
              </p>
              <span
                className="shrink-0 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
              >
                {t('fullModeTag')}
              </span>
            </div>

            <h2 className="text-2xl font-black tracking-tight mb-2 text-white">
              {t('startFull')}
            </h2>

            <p className="text-xs text-slate-300 mb-6 leading-relaxed opacity-85">
              {tSelection('questions', { count: total })}
              {' · '}
              {t('passThreshold', { threshold: thresholdPct })}
              {' · '}
              {t('officialNote')}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono text-slate-400 font-bold">
                  {t('officialNote')}
                </span>
              </div>

              <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black text-sm shadow-lg group-hover:bg-amber-400 transition-colors">
                <span>{t('begin')}</span>
                <ChevronRight size={16} strokeWidth={3} />
              </div>
            </div>
          </div>
        </motion.button>

        {/* Practice Mode Divider */}
        <motion.div
          custom={5} variants={reveal}
          className="flex items-center gap-3 my-6"
        >
          <div className="flex-1 h-px" style={{ background: C.border }} />
          <p style={{
            fontFamily: "'DM Mono', monospace", fontSize: 9, fontWeight: 800,
            color: C.hint, textTransform: 'uppercase', letterSpacing: '0.22em',
          }}>
            {t('orPractice')}
          </p>
          <div className="flex-1 h-px" style={{ background: C.border }} />
        </motion.div>

        {/* Practice Sections */}
        {hasMultiPhase ? (
          <div className="space-y-3">
            {phases.map((ph, idx) => {
              const count = quiz.questions.filter(q => (q.phase ?? 0) === idx).length;
              return (
                <motion.button
                  key={idx}
                  custom={6 + idx}
                  variants={reveal}
                  onClick={() => handleStartPhase(idx)}
                  whileHover={{ scale: 1.01, x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left shadow-sm transition-all"
                  style={{ background: C.surface, border: `1.5px solid ${C.border}` }}
                >
                  <div
                    className="w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center shadow-sm"
                    style={{ background: `${ph.color}15`, border: `1.5px solid ${ph.color}30` }}
                  >
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: ph.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 2 }}>
                      {ph.name[lang]}
                    </p>
                    <p style={{ fontSize: 12, color: C.hint }}>
                      {tSelection('questions', { count })}
                      {' · '}
                      {t('practiceModeTag')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="px-2.5 py-1 rounded-xl text-xs font-black font-mono"
                      style={{ background: `${ph.color}15`, color: ph.color }}
                    >
                      {count} Q
                    </span>
                    <ChevronRight size={16} style={{ color: C.hint }} />
                  </div>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <motion.button
            custom={6} variants={reveal}
            onClick={handleStartPracticeAll}
            whileHover={{ scale: 1.01, x: 3 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-between gap-4 px-6 py-5 rounded-2xl text-left shadow-sm"
            style={{ background: C.surface, border: `1.5px solid ${C.border}` }}
          >
            <div>
              <p style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 2 }}>
                {t('practiceRun')}
              </p>
              <p style={{ fontSize: 12, color: C.hint }}>{t('practiceModeTag')}</p>
            </div>
            <ChevronRight size={16} style={{ color: C.hint, flexShrink: 0 }} />
          </motion.button>
        )}

      </div>
    </motion.div>
  );
});
QuizBriefing.displayName = 'QuizBriefing';
