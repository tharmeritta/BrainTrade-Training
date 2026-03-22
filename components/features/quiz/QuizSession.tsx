'use client';

import React, {
  useState, useEffect, useMemo, useCallback, memo, type CSSProperties,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TRANSITION } from '@/lib/animations';
import { ActiveAgentUI } from '@/components/ui/ActiveAgentUI';
import type { Language, QuestionData } from '@/lib/quiz-data';
import { C, LABELS, isAnswerCorrect } from './shared';
import type { QuizSessionProps } from './types';

// ─── QuestionMap ──────────────────────────────────────────────────────────────
//
// Dot grid showing every question's status:
//   • Hollow ring  = current question
//   • Filled blue  = answered correctly
//   • Filled red   = answered wrongly
//   • Grey         = not yet answered
//   • Clicking a dot jumps back to that (already-answered) question

interface QuestionMapProps {
  questions: QuestionData[];
  answered: Record<number, number>;
  current: number;
  onJump: (index: number) => void;
}

const QuestionMap = memo(({
  questions, answered, current, onJump,
}: QuestionMapProps) => {
  const total = questions.length;

  const { correctCount, answeredCount } = useMemo(() => ({
    correctCount:  questions.filter((q, i) => answered[i] !== undefined && isAnswerCorrect(q, answered[i])).length,
    answeredCount: Object.keys(answered).length,
  }), [questions, answered]);

  return (
    <div className="mb-5">

      {/* Running score bar */}
      <div className="flex items-center gap-2.5 mb-3">
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 700, color: C.muted, minWidth: 48 }}>
          {answeredCount > 0 ? `${correctCount}/${total}` : `0/${total}`}
        </span>
        <div className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ background: '#E2E0DA' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: C.successText }}
            animate={{ width: total > 0 ? `${(correctCount / total) * 100}%` : '0%' }}
            transition={TRANSITION.slow}
          />
        </div>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: C.hint, minWidth: 32, textAlign: 'right' }}>
          {answeredCount > 0 ? `${Math.round((correctCount / total) * 100)}%` : '—'}
        </span>
      </div>

      {/* Dot grid */}
      <div className="flex flex-wrap gap-1.5">
        {questions.map((q, i) => {
          const isAnswered = answered[i] !== undefined;
          const isCorrect  = isAnswered && isAnswerCorrect(q, answered[i]);
          const isCurrent  = i === current;

          return (
            <motion.button
              key={i}
              onClick={() => { if (isAnswered) onJump(i); }}
              title={`Q${i + 1}`}
              style={{
                width:        18,
                height:       18,
                borderRadius: '50%',
                flexShrink:   0,
                cursor:       isAnswered ? 'pointer' : 'default',
                background:   isCurrent  ? 'transparent'
                            : isAnswered ? (isCorrect ? C.successBorder : C.dangerBorder)
                            : '#E2E0DA',
                border:       isCurrent  ? `2.5px solid ${C.text}` : 'none',
                outline:      'none',
              }}
              whileHover={isAnswered && !isCurrent ? { scale: 1.35 } : {}}
              transition={{ duration: 0.12 }}
            />
          );
        })}
      </div>

    </div>
  );
});
QuestionMap.displayName = 'QuestionMap';

// ─── QuestionCard ─────────────────────────────────────────────────────────────

interface QuestionCardProps {
  question: QuestionData;
  index: number;
  total: number;
  lang: Language;
  phaseColor: string;
  phaseLight: string;
  phaseName: string;
  answeredIdx: number | undefined;
  fillText: string | undefined;
  onAnswer: (choiceIdx: number) => void;
  onFillText: (text: string) => void;
}

const QuestionCard = memo(({
  question, index, total, lang, phaseColor, phaseLight, phaseName,
  answeredIdx, fillText, onAnswer, onFillText,
}: QuestionCardProps) => {
  const t = useTranslations('quiz');
  const [inputValue, setInputValue] = useState('');

  useEffect(() => { setInputValue(''); }, [index]);

  const qType   = question.type ?? 'mcq';
  const opts    = useMemo(() => question.options?.[lang] ?? [], [question.options, lang]);
  const correct = question.correctIdx ?? 0;
  const locked  = answeredIdx !== undefined;

  const choiceStyle = useCallback((i: number): CSSProperties => {
    if (!locked) return { background: C.surface, borderColor: C.border, color: C.text };
    if (i === correct)     return { background: C.successBg, borderColor: C.successBorder, color: C.successText };
    if (i === answeredIdx) return { background: C.dangerBg,  borderColor: C.dangerBorder,  color: C.dangerText  };
    return { background: C.surface, borderColor: C.border, color: C.muted };
  }, [locked, correct, answeredIdx]);

  const labelStyle = useCallback((i: number): CSSProperties => {
    if (!locked)           return { color: C.hint };
    if (i === correct)     return { color: C.successText };
    if (i === answeredIdx) return { color: C.dangerText };
    return { color: C.hint };
  }, [locked, correct, answeredIdx]);

  const handleFillSubmit = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    onFillText(trimmed);
    onAnswer(trimmed.toLowerCase() === (question.a ?? '').toLowerCase() ? 0 : 1);
  };

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={TRANSITION.base}
    >
      {/* Question text */}
      <div
        className="rounded-2xl mb-4 overflow-hidden shadow-sm"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center gap-2 px-6 pt-5 pb-4 flex-wrap">
          {/* Phase badge */}
          {phaseName && (
            <span
              className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg"
              style={{ background: phaseLight, color: phaseColor }}
            >
              {phaseName}
            </span>
          )}

          {question.isNew && (
            <span
              className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg"
              style={{ background: C.warnBg, color: C.warnText, border: `1px solid ${C.warnBorder}` }}
            >
              New
            </span>
          )}

          {qType === 'tf' && (
            <span
              className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg"
              style={{ background: '#F0F9FF', color: '#0284C7', border: '1px solid #BAE6FD' }}
            >
              T / F
            </span>
          )}

          {qType === 'fill' && (
            <span
              className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg"
              style={{ background: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE' }}
            >
              Fill In
            </span>
          )}

          <span
            className="ml-auto"
            style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 600, color: C.hint }}
          >
            {index + 1}<span style={{ opacity: 0.4 }}>/</span>{total}
          </span>
        </div>

        <p className="px-6 pb-6" style={{ fontSize: 17, fontWeight: 600, color: C.text, lineHeight: 1.55 }}>
          {question[lang]}
        </p>
      </div>

      {/* ── True / False ── */}
      {qType === 'tf' && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[t('trueTxt'), t('falseTxt')].map((label, i) => (
            <motion.button
              key={i}
              disabled={locked}
              onClick={() => onAnswer(i)}
              className="flex items-center justify-center py-5 rounded-xl border transition-all shadow-sm"
              style={choiceStyle(i)}
              whileHover={!locked ? { scale: 1.02, borderColor: C.borderHover } : {}}
              whileTap={!locked ? { scale: 0.98 } : {}}
            >
              <span style={{ fontSize: 16, fontWeight: 700 }}>{label}</span>
            </motion.button>
          ))}
        </div>
      )}

      {/* ── Multiple Choice ── */}
      {qType === 'mcq' && (
        <div className="space-y-2 mb-4">
          {opts.map((opt, i) => (
            <motion.button
              key={i}
              disabled={locked}
              onClick={() => onAnswer(i)}
              className="w-full flex items-start gap-4 px-5 py-4 rounded-xl border text-left transition-all shadow-sm"
              style={choiceStyle(i)}
              whileHover={!locked ? { scale: 1.01, borderColor: C.borderHover } : {}}
              whileTap={!locked ? { scale: 0.99 } : {}}
            >
              <span
                className="shrink-0 text-[13px] font-black min-w-[20px] pt-[2px]"
                style={{ fontFamily: "'DM Mono', monospace", ...labelStyle(i) }}
              >
                {LABELS[i]}
              </span>
              <span style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.4 }}>{opt}</span>
            </motion.button>
          ))}
        </div>
      )}

      {/* ── Fill in the Blank ── */}
      {qType === 'fill' && (
        <div className="mb-4">
          {!locked ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleFillSubmit(); }}
                placeholder={t('placeholder')}
                className="flex-1 px-5 py-4 rounded-xl border text-[15px] font-medium outline-none transition-all"
                style={{
                  background: C.surface, borderColor: C.border, color: C.text,
                  fontFamily: "'DM Sans', sans-serif",
                }}
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
              />
              <motion.button
                onClick={handleFillSubmit}
                disabled={!inputValue.trim()}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-4 rounded-xl font-bold text-sm transition-all disabled:opacity-30"
                style={{ background: C.text, color: '#fff' }}
              >
                {t('submit')}
              </motion.button>
            </div>
          ) : (
            <div
              className="px-5 py-4 rounded-xl border"
              style={{
                background:  answeredIdx === 0 ? C.successBg    : C.dangerBg,
                borderColor: answeredIdx === 0 ? C.successBorder : C.dangerBorder,
              }}
            >
              <p style={{ fontSize: 12, fontWeight: 700, color: C.hint, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {t('yourAnswer')}
              </p>
              <p style={{ fontSize: 15, fontWeight: 600, color: answeredIdx === 0 ? C.successText : C.dangerText }}>
                {fillText || '—'}
              </p>
              {answeredIdx !== 0 && (
                <p style={{ fontSize: 13, color: C.muted, marginTop: 8 }}>
                  <span style={{ fontWeight: 700 }}>{t('correctAnswer')}</span> {question.a}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Explanation (shown after answering) */}
      <AnimatePresence>
        {locked && question.explain && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={TRANSITION.base}
            className="overflow-hidden"
          >
            <div
              className="rounded-xl px-5 py-4 mb-4"
              style={{
                background: '#EAE9E4',
                borderLeft: `4px solid ${C.borderHover}`,
                fontSize: 14, color: C.muted, lineHeight: 1.6,
              }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.15em] mb-1.5 opacity-60">
                {t('explanation')}
              </p>
              {question.explain[lang]}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
QuestionCard.displayName = 'QuestionCard';

// ─── StickyNav ────────────────────────────────────────────────────────────────
//
// Fixed to bottom of viewport so Prev/Next are always reachable, even after
// scrolling through a long question or explanation.

interface StickyNavProps {
  current: number;
  total: number;
  isAnswered: boolean;
  isLastQ: boolean;
  onPrev: () => void;
  onNext: () => void;
}

const StickyNav = memo(({
  current, total, isAnswered, isLastQ, onPrev, onNext,
}: StickyNavProps) => {
  const t = useTranslations('quiz');

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-20 px-4 py-3"
      style={{
        background:           `${C.bg}F2`,
        backdropFilter:       'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop:            `1px solid ${C.border}`,
      }}
    >
      <div className="max-w-[680px] mx-auto flex items-center justify-between gap-3">
        <motion.button
          disabled={current === 0}
          onClick={onPrev}
          whileHover={current > 0 ? { x: -2 } : {}}
          className="px-6 py-2.5 rounded-xl text-sm font-bold border transition-all disabled:opacity-20 bg-white shadow-sm"
          style={{ color: C.text, borderColor: C.border, minWidth: 96 }}
        >
          {t('prev')}
        </motion.button>

        <div
          className="px-4 py-1.5 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.6)', border: `1px solid ${C.border}` }}
        >
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 700, color: C.muted }}>
            {current + 1}<span style={{ opacity: 0.35 }}> / </span>{total}
          </span>
        </div>

        <motion.button
          disabled={!isAnswered}
          onClick={onNext}
          whileHover={isAnswered ? { x: 2 } : {}}
          // Subtle pulse when the answer is locked in, drawing attention to Next
          animate={isAnswered ? { scale: [1, 1.04, 1] } : { scale: 1 }}
          transition={isAnswered ? { duration: 0.35, delay: 0.15, ease: 'easeOut' } : {}}
          className="px-6 py-2.5 rounded-xl text-sm font-black border transition-all disabled:opacity-20 shadow-md"
          style={{
            background:  isAnswered ? C.text    : C.surface,
            color:       isAnswered ? '#fff'    : C.text,
            borderColor: isAnswered ? C.text    : C.border,
            minWidth:    120,
          }}
        >
          {isLastQ ? t('seeResults') : t('next')}
        </motion.button>
      </div>
    </div>
  );
});
StickyNav.displayName = 'StickyNav';

// ─── QuizSession ──────────────────────────────────────────────────────────────
//
// Active quiz screen: question map, question card, sticky nav, saving indicator.
// Edit this file to add features like a timer, keyboard navigation, or a
// progress ring without touching the briefing or results logic.

export function QuizSession({
  quiz, lang, filteredQuestions, current, answered, fillAnswers,
  sessionMode, saving, agentName,
  onBack, onAnswer, onFillText, onNext, onPrev, onJump,
}: QuizSessionProps) {
  const t = useTranslations('quiz');

  const phases     = quiz.phases ?? [];
  const total      = filteredQuestions.length;
  const isPractice = sessionMode.type !== 'full';
  const isAnswered = answered[current] !== undefined;
  const isLastQ    = current === total - 1;
  const currentQ   = filteredQuestions[current];
  const qPhaseIdx  = currentQ?.phase ?? 0;
  const qPhase     = phases[qPhaseIdx];
  const phaseColor = qPhase?.color        ?? C.hint;
  const phaseLight = qPhase?.light        ?? '#E2E0DA33';
  const phaseName  = qPhase?.name?.[lang] ?? '';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={TRANSITION.base}
      // pb-24 keeps the last card/explanation above the fixed sticky nav
      className="pb-24"
      style={{ background: C.bg, minHeight: 'calc(100dvh - 56px)', fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="py-8 px-4">
        <div className="max-w-[680px] mx-auto">

          {/* Top bar: back to briefing + session mode badge + agent */}
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: C.muted }}
            >
              <ChevronLeft size={16} />
              {quiz.title[lang]}
            </button>

            <div className="flex items-center gap-2 flex-wrap justify-end">
              {isPractice && (
                <span
                  className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                  style={{ background: C.warnBg, color: C.warnText, border: `1px solid ${C.warnBorder}` }}
                >
                  {sessionMode.type === 'retry'
                    ? `${lang === 'en' ? 'Retry' : 'ทำซ้ำ'} · ${total} ${lang === 'en' ? 'Q' : 'ข้อ'}`
                    : (sessionMode.type === 'phase'
                        ? (phases[sessionMode.phaseIdx]?.name[lang] ?? t('practiceMode').split('—')[0].trim())
                        : t('practiceMode').split('—')[0].trim()
                      )
                  }
                </span>
              )}
              <ActiveAgentUI agentName={agentName} />
            </div>
          </div>

          {/* Question map */}
          <QuestionMap
            questions={filteredQuestions}
            answered={answered}
            current={current}
            onJump={onJump}
          />

          {/* Question card */}
          <AnimatePresence mode="wait">
            {currentQ && (
              <QuestionCard
                key={`${sessionMode.type}-${current}`}
                question={currentQ}
                index={current}
                total={total}
                lang={lang}
                phaseColor={phaseColor}
                phaseLight={phaseLight}
                phaseName={phaseName}
                answeredIdx={answered[current]}
                fillText={fillAnswers[current]}
                onAnswer={onAnswer}
                onFillText={onFillText}
              />
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* Sticky navigation bar */}
      <StickyNav
        current={current}
        total={total}
        isAnswered={isAnswered}
        isLastQ={isLastQ}
        onPrev={onPrev}
        onNext={onNext}
      />

      {/* Score sync indicator */}
      {saving && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-16 left-0 right-0 flex items-center justify-center gap-2 pointer-events-none"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 shadow-md border border-[#E2E0DA]">
            <Loader2 size={12} className="animate-spin text-muted-foreground" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {t('syncing')}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
