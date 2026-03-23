'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Hash, Target, Layers } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FADE_IN, TRANSITION } from '@/lib/animations';
import { PASS_THRESHOLD } from '@/lib/quiz-data';
import { ActiveAgentUI } from '@/components/ui/ActiveAgentUI';
import { C } from './shared';
import type { QuizBriefingProps } from './types';

// ─── QuizBriefing ─────────────────────────────────────────────────────────────
//
// Pre-quiz screen: shows quiz metadata and lets the user choose a session mode
// (full assessment, practice by phase, or practice-all).
// Edit this file to change the layout, add new mode cards, or adjust the
// stats strip without touching the quiz or results logic.

// Staggered reveal — each section gets a custom delay index
const reveal = {
  initial: { opacity: 0, y: 14 },
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

  const statItems = [
    { icon: <Hash size={12} />, label: t('questionsLabel'),    value: String(total) },
    { icon: <Target size={12} />, label: t('passScoreLabel'), value: `${thresholdPct}%` },
    ...(hasMultiPhase
      ? [{ icon: <Layers size={12} />, label: t('phasesLabel'), value: String(phases.length) }]
      : []
    ),
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={TRANSITION.base}
      className="min-h-[calc(100dvh-56px)] py-10 px-4"
      style={{ background: C.bg, fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="max-w-[620px] mx-auto">

        {/* Top nav — simplified to move with content if desired, or stay static */}
        <motion.div
          custom={0} variants={reveal}
          className="flex items-center justify-between gap-4 mb-10 flex-wrap"
        >
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: C.muted }}
          >
            <ChevronLeft size={16} />
            {t('chooseAssessment')}
          </button>
          <ActiveAgentUI agentName={agentName} />
        </motion.div>

        {/* Quiz identity */}
        <motion.div custom={1} variants={reveal} className="mb-8">
          <p style={{
            fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 700,
            color: C.hint, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10,
          }}>
            BrainTrade · Internal Training
          </p>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: C.text, letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: 10 }}>
            {quiz.title[lang]}
          </h1>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.65, maxWidth: 480 }}>
            {quiz.description[lang]}
          </p>
        </motion.div>

        {/* Stats strip — unified card with vertical dividers */}
        <motion.div
          custom={2} variants={reveal}
          className="flex items-stretch mb-8 rounded-2xl overflow-hidden"
          style={{ border: `1px solid ${C.border}`, background: C.surface }}
        >
          {statItems.map(({ icon, label, value }, i) => (
            <div
              key={label}
              className="flex-1 flex flex-col items-center justify-center py-4 gap-1.5"
              style={{ borderRight: i < statItems.length - 1 ? `1px solid ${C.border}` : 'none' }}
            >
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 24, fontWeight: 700, color: C.text, lineHeight: 1 }}>
                {value}
              </p>
              <div className="flex items-center gap-1" style={{ color: C.hint }}>
                {icon}
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  {label}
                </span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Section label */}
        <motion.p
          custom={3} variants={reveal}
          style={{
            fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 700,
            color: C.hint, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 10,
          }}
        >
          {t('selectMode')}
        </motion.p>

        {/* ── Full Assessment card ── */}
        <motion.button
          custom={4} variants={reveal}
          onClick={() => onStart({ type: 'full' })}
          whileHover={{ scale: 1.01, y: -2 }}
          whileTap={{ scale: 0.99 }}
          className="w-full rounded-3xl p-7 text-left shadow-xl mb-3 relative overflow-hidden"
          style={{ background: C.text, color: '#fff' }}
        >
          {/* Dot-grid texture */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
          {/* Top shimmer line */}
          <div className="absolute top-0 left-7 right-7 h-px" style={{ background: 'rgba(255,255,255,0.12)' }} />

          <div className="relative">
            {/* Header row: eyebrow + badge */}
            <div className="flex items-start justify-between gap-3 mb-5">
              <p style={{
                fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 700,
                opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.14em',
              }}>
                {t('startFull')}
              </p>
              <span
                className="shrink-0 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.85)',
                  border: '1px solid rgba(255,255,255,0.18)',
                }}
              >
                {t('fullModeTag')}
              </span>
            </div>

            {/* Title */}
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 6 }}>
              {t('startFull')}
            </h2>

            {/* Meta */}
            <p style={{ fontSize: 12, opacity: 0.45, lineHeight: 1.5, marginBottom: 24 }}>
              {useTranslations('quizSelection')('questions', { count: total })}
              {' · '}
              {t('passThreshold', { threshold: thresholdPct })}
              {' · '}
              {t('officialNote')}
            </p>

            {/* CTA row */}
            <div className="flex items-center justify-between">
              {/* Status indicator */}
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#4ADE80' }} />
                <span style={{ fontSize: 11, opacity: 0.55 }}>
                  {t('officialNote')}
                </span>
              </div>
              {/* Begin button */}
              <div className="flex items-center gap-1.5">
                <span style={{ fontSize: 14, fontWeight: 800 }}>
                  {t('begin')}
                </span>
                <ChevronRight size={16} style={{ opacity: 0.65 }} />
              </div>
            </div>
          </div>
        </motion.button>

        {/* ── "or practice" divider ── */}
        <motion.div
          custom={5} variants={reveal}
          className="flex items-center gap-3 my-5"
        >
          <div className="flex-1 h-px" style={{ background: C.border }} />
          <p style={{
            fontFamily: "'DM Mono', monospace", fontSize: 9, fontWeight: 700,
            color: C.hint, textTransform: 'uppercase', letterSpacing: '0.22em',
          }}>
            {t('orPractice')}
          </p>
          <div className="flex-1 h-px" style={{ background: C.border }} />
        </motion.div>

        {/* ── Practice section ── */}
        {hasMultiPhase ? (
          <div className="space-y-2">
            {phases.map((ph, idx) => {
              const count = quiz.questions.filter(q => (q.phase ?? 0) === idx).length;
              return (
                <motion.button
                  key={idx}
                  custom={6 + idx}
                  variants={reveal}
                  onClick={() => onStart({ type: 'phase', phaseIdx: idx })}
                  whileHover={{ scale: 1.005, x: 2 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left"
                  style={{ background: C.surface, border: `1.5px solid ${C.border}` }}
                >
                  {/* Phase color swatch */}
                  <div
                    className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center"
                    style={{ background: `${ph.color}12`, border: `1.5px solid ${ph.color}28` }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: ph.color }} />
                  </div>

                  {/* Labels */}
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>
                      {ph.name[lang]}
                    </p>
                    <p style={{ fontSize: 11, color: C.hint }}>
                      {tSelection('questions', { count })}
                      {' · '}
                      {t('practiceModeTag')}
                    </p>
                  </div>

                  {/* Count badge + arrow */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="px-2 py-0.5 rounded-lg text-[11px] font-bold"
                      style={{ background: `${ph.color}14`, color: ph.color }}
                    >
                      {count}
                    </span>
                    <ChevronRight size={14} style={{ color: C.hint }} />
                  </div>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <motion.button
            custom={6} variants={reveal}
            onClick={() => onStart({ type: 'practice-all' })}
            whileHover={{ scale: 1.005, x: 2 }}
            whileTap={{ scale: 0.99 }}
            className="w-full flex items-center justify-between gap-4 px-5 py-4 rounded-2xl text-left"
            style={{ background: C.surface, border: `1.5px solid ${C.border}` }}
          >
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>
                {t('practiceRun')}
              </p>
              <p style={{ fontSize: 11, color: C.hint }}>{t('practiceModeTag')}</p>
            </div>
            <ChevronRight size={14} style={{ color: C.hint, flexShrink: 0 }} />
          </motion.button>
        )}

      </div>
    </motion.div>
  );
});
QuizBriefing.displayName = 'QuizBriefing';
