'use client';

import React, {
  useState, useEffect, useMemo, useCallback, memo, type CSSProperties,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Loader2, Check, X, Flame, Zap, Award, Sparkles, Timer,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TRANSITION } from '@/lib/animations';
import { ActiveAgentUI } from '@/components/ui/ActiveAgentUI';
import type { Language, QuestionData } from '@/lib/quiz-data';
import { C, LABELS, isAnswerCorrect } from './shared';
import type { QuizSessionProps } from './types';
import {
  getRankForXp, getNextRankProgress, playGamifiedSound, triggerHaptic,
  ConfettiBurst, SoundWaveIndicator,
} from './gamification';

// --- Interactive Quest Map ---------------------------------------------------
//
// Gamified quest map track showing every question node on a connected path:
//   • Animated connecting track fill
//   • Stage milestone indicators
//   • Glowing pulse on active node
//   • Interactive hover & click jump for answered nodes

interface QuestionMapProps {
  questions: QuestionData[];
  answered: Record<number, number>;
  current: number;
  onJump: (index: number) => void;
  lang: Language;
}

const QuestionMap = memo(({
  questions, answered, current, onJump, lang,
}: QuestionMapProps) => {
  const total = questions.length;

  const { correctCount, answeredCount } = useMemo(() => ({
    correctCount:  questions.filter((q, i) => answered[i] !== undefined && isAnswerCorrect(q, answered[i])).length,
    answeredCount: Object.keys(answered).length,
  }), [questions, answered]);

  const progressPct = total > 0 ? (answeredCount / total) * 100 : 0;
  const correctPct  = total > 0 ? (correctCount / total) * 100 : 0;

  return (
    <div className="mb-6 rounded-2xl p-4 sm:p-5 shadow-sm border border-[#E2E0DA]" style={{ background: C.surface }}>

      {/* Quest track header stats */}
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 font-bold text-xs">
            🧭
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
              {lang === 'en' ? 'Quest Progress' : 'ความคืบหน้าเควส'}
            </p>
            <p className="text-xs font-extrabold text-foreground font-mono">
              {answeredCount}/{total} {lang === 'en' ? 'Completed' : 'ข้อที่ทำแล้ว'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-extrabold font-mono">
            <Check size={12} strokeWidth={3} />
            <span>{correctCount} {lang === 'en' ? 'Correct' : 'ถูก'}</span>
          </div>
          <span className="font-mono text-xs font-black text-muted-foreground">
            {answeredCount > 0 ? `${Math.round(correctPct)}%` : '0%'}
          </span>
        </div>
      </div>

      {/* Animated progress bar line */}
      <div className="relative h-2 w-full rounded-full overflow-hidden mb-4" style={{ background: '#E2E0DA' }}>
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500"
          animate={{ width: `${progressPct}%` }}
          transition={TRANSITION.slow}
        />
      </div>

      {/* Connected Quest Nodes */}
      <div className="relative flex items-center justify-between pt-1 pb-1 overflow-x-auto no-scrollbar gap-2">
        {/* Background connector path */}
        <div className="absolute top-1/2 left-3 right-3 -translate-y-1/2 h-0.5 bg-[#E2E0DA] -z-0" />

        {questions.map((q, i) => {
          const isAnswered = answered[i] !== undefined;
          const isCorrect  = isAnswered && isAnswerCorrect(q, answered[i]);
          const isCurrent  = i === current;

          return (
            <div key={i} className="relative z-10 flex flex-col items-center shrink-0">
              <motion.button
                onClick={() => { if (isAnswered) onJump(i); }}
                title={`Q${i + 1}: ${isAnswered ? (isCorrect ? 'Correct' : 'Wrong') : 'Pending'}`}
                className="relative flex items-center justify-center rounded-full text-[10px] font-extrabold font-mono transition-all outline-none"
                style={{
                  width:        isCurrent ? 28 : 22,
                  height:       isCurrent ? 28 : 22,
                  background:   isCurrent
                                ? '#1A1917'
                                : isAnswered
                                  ? (isCorrect ? '#22C55E' : '#EF4444')
                                  : '#FFFFFF',
                  color:        isCurrent || isAnswered ? '#FFFFFF' : '#6B6860',
                  border:       isCurrent
                                ? '3px solid #1A1917'
                                : isAnswered
                                  ? (isCorrect ? '2px solid #16A34A' : '2px solid #DC2626')
                                  : '2px solid #C8C5BC',
                  boxShadow:    isCurrent ? '0 0 12px rgba(26, 25, 23, 0.35)' : 'none',
                  cursor:       isAnswered ? 'pointer' : 'default',
                }}
                whileHover={isAnswered && !isCurrent ? { scale: 1.25 } : {}}
                whileTap={isAnswered ? { scale: 0.9 } : {}}
              >
                {isCurrent ? (
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-2 h-2 rounded-full bg-emerald-400"
                  />
                ) : isAnswered ? (
                  isCorrect ? <Check size={11} strokeWidth={3} /> : <X size={11} strokeWidth={3} />
                ) : (
                  <span>{i + 1}</span>
                )}
              </motion.button>

              {/* Node label indicator */}
              <span
                className="mt-1 text-[9px] font-bold font-mono"
                style={{ color: isCurrent ? C.text : C.hint }}
              >
                Q{i + 1}
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
});
QuestionMap.displayName = 'QuestionMap';

// --- QuestionCard -------------------------------------------------------------

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
  streak: number;
  xpEarned: number;
}

const QuestionCard = memo(({
  question, index, total, lang, phaseColor, phaseLight, phaseName,
  answeredIdx, fillText, onAnswer, onFillText, streak, xpEarned,
}: QuestionCardProps) => {
  const t = useTranslations('quiz');
  const [inputValue, setInputValue] = useState('');
  const [wrongShakeIdx, setWrongShakeIdx] = useState<number | null>(null);

  // Speed timer state (20 seconds countdown for speed bonus)
  const [timeLeft, setTimeLeft] = useState(20);

  useEffect(() => {
    setInputValue('');
    setTimeLeft(20);
  }, [index]);

  const qType   = question.type ?? 'mcq';
  const opts    = useMemo(() => question.options?.[lang] ?? [], [question.options, lang]);
  const correct = question.correctIdx ?? 0;
  const locked  = answeredIdx !== undefined;
  const isCorrectAnswer = locked && (qType === 'fill' ? answeredIdx === 0 : answeredIdx === correct);

  // Speed timer tick down until answered
  useEffect(() => {
    if (locked) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [locked, index]);

  const choiceStyle = useCallback((i: number): CSSProperties => {
    if (!locked) return { background: C.surface, borderColor: C.border, color: C.text };
    if (i === correct) return {
      background: 'rgba(220, 252, 231, 0.95)',
      borderColor: '#16A34A',
      color: '#15803D',
      boxShadow: '0 0 20px rgba(22, 163, 74, 0.3)',
    };
    if (i === answeredIdx) return {
      background: C.dangerBg,
      borderColor: C.dangerBorder,
      color: C.dangerText,
    };
    return { background: C.surface, borderColor: C.border, color: C.muted, opacity: 0.6 };
  }, [locked, correct, answeredIdx]);

  const labelStyle = useCallback((i: number): CSSProperties => {
    if (!locked)           return { color: C.hint };
    if (i === correct)     return { color: '#15803D' };
    if (i === answeredIdx) return { color: C.dangerText };
    return { color: C.hint };
  }, [locked, correct, answeredIdx]);

  const handleChoiceClick = (i: number) => {
    if (locked) return;
    const isRight = (qType === 'mcq' || qType === 'tf') && i === correct;
    if (!isRight) {
      setWrongShakeIdx(i);
      setTimeout(() => setWrongShakeIdx(null), 600);
    }
    onAnswer(i);
  };

  const handleFillSubmit = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || locked) return;
    const isRight = trimmed.toLowerCase() === (question.a ?? '').toLowerCase();
    const ansIdx = isRight ? 0 : 1;
    if (!isRight) {
      setWrongShakeIdx(999);
      setTimeout(() => setWrongShakeIdx(null), 600);
    }
    onFillText(trimmed);
    onAnswer(ansIdx);
  };

  // Timer color calculation
  const timerColor = timeLeft > 10 ? '#22C55E' : timeLeft > 5 ? '#F59E0B' : '#EF4444';

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, x: 25, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -25, scale: 0.98 }}
      transition={TRANSITION.base}
      className="relative"
    >
      {/* Visual Confetti burst on correct answer */}
      <ConfettiBurst active={locked && isCorrectAnswer} />

      {/* Main Question Card */}
      <div
        className="rounded-3xl mb-4 overflow-hidden shadow-lg transition-all"
        style={{
          background: C.surface,
          border: `1.5px solid ${locked ? (isCorrectAnswer ? '#86EFAC' : '#FCA5A5') : C.border}`,
          boxShadow: locked ? (isCorrectAnswer ? '0 8px 30px rgba(34, 197, 94, 0.15)' : '0 8px 30px rgba(239, 68, 68, 0.12)') : '0 4px 20px rgba(0,0,0,0.04)',
        }}
      >
        {/* Speed Bonus Timer indicator bar (top of card) */}
        {!locked && (
          <div className="h-1.5 w-full bg-slate-100 relative overflow-hidden">
            <motion.div
              className="h-full rounded-r-full"
              style={{ background: timerColor }}
              animate={{ width: `${(timeLeft / 20) * 100}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>
        )}

        <div className="flex items-center gap-2 px-6 pt-5 pb-3 flex-wrap">
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

          {/* Speed bonus timer pill */}
          {!locked && (
            <div className="flex items-center gap-1 text-[11px] font-black font-mono px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              <Timer size={12} className={timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-emerald-600'} />
              <span>{timeLeft}s</span>
            </div>
          )}

          <span
            className="ml-auto font-mono text-xs font-bold"
            style={{ color: C.hint }}
          >
            {index + 1}<span style={{ opacity: 0.4 }}>/</span>{total}
          </span>
        </div>

        <p className="px-6 pb-6 text-lg sm:text-xl font-bold tracking-tight text-foreground leading-relaxed">
          {question[lang]}
        </p>
      </div>

      {/* -- True / False options -- */}
      {qType === 'tf' && (
        <div className="grid grid-cols-2 gap-3.5 mb-4">
          {[t('trueTxt'), t('falseTxt')].map((label, i) => {
            const isShaking = wrongShakeIdx === i;
            return (
              <motion.button
                key={i}
                disabled={locked}
                onClick={() => handleChoiceClick(i)}
                className="relative flex items-center justify-center py-5 rounded-2xl border transition-all shadow-md font-extrabold text-base overflow-hidden"
                style={choiceStyle(i)}
                animate={isShaking ? { x: [0, -12, 12, -8, 8, -4, 4, 0] } : {}}
                whileHover={!locked ? { scale: 1.02, borderColor: C.borderHover } : {}}
                whileTap={!locked ? { scale: 0.98 } : {}}
              >
                <span>{label}</span>
                {locked && i === correct && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-4 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md"
                  >
                    <Check size={14} strokeWidth={3} />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* -- Multiple Choice options -- */}
      {qType === 'mcq' && (
        <div className="space-y-3 mb-4">
          {opts.map((opt, i) => {
            const isShaking = wrongShakeIdx === i;
            const isSelected = answeredIdx === i;
            const isTargetCorrect = i === correct;

            return (
              <motion.button
                key={i}
                disabled={locked}
                onClick={() => handleChoiceClick(i)}
                className="w-full relative flex items-start gap-4 px-5 py-4 rounded-2xl border text-left transition-all shadow-sm overflow-hidden"
                style={choiceStyle(i)}
                animate={isShaking ? { x: [0, -12, 12, -8, 8, -4, 4, 0] } : {}}
                whileHover={!locked ? { scale: 1.015, y: -1, borderColor: '#94A3B8' } : {}}
                whileTap={!locked ? { scale: 0.985 } : {}}
              >
                <span
                  className="shrink-0 text-[13px] font-black w-6 h-6 rounded-lg flex items-center justify-center font-mono mt-0.5 border"
                  style={{
                    ...labelStyle(i),
                    borderColor: locked ? (isTargetCorrect ? '#93C5FD' : '#E2E0DA') : '#E2E0DA',
                    background: locked && isTargetCorrect ? '#DBEAFE' : 'rgba(0,0,0,0.02)',
                  }}
                >
                  {LABELS[i]}
                </span>
                <span className="text-sm sm:text-base font-semibold leading-relaxed flex-1 pt-0.5">{opt}</span>

                {locked && isTargetCorrect && (
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="shrink-0 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg"
                  >
                    <Check size={16} strokeWidth={3} />
                  </motion.div>
                )}

                {locked && isSelected && !isTargetCorrect && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="shrink-0 w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md"
                  >
                    <X size={16} strokeWidth={3} />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* -- Fill in the Blank option -- */}
      {qType === 'fill' && (
        <div className="mb-4">
          {!locked ? (
            <motion.div
              className="flex gap-2"
              animate={wrongShakeIdx === 999 ? { x: [0, -12, 12, -8, 8, -4, 4, 0] } : {}}
            >
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleFillSubmit(); }}
                placeholder={t('placeholder')}
                className="flex-1 px-5 py-4 rounded-2xl border text-base font-medium outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-sm"
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="px-7 py-4 rounded-2xl font-bold text-sm transition-all disabled:opacity-30 shadow-md bg-foreground text-background flex items-center gap-2"
              >
                <span>{t('submit')}</span>
                <Sparkles size={16} />
              </motion.button>
            </motion.div>
          ) : (
            <div
              className="px-5 py-4 rounded-2xl border shadow-md"
              style={{
                background:  answeredIdx === 0 ? C.successBg    : C.dangerBg,
                borderColor: answeredIdx === 0 ? C.successBorder : C.dangerBorder,
              }}
            >
              <p style={{ fontSize: 11, fontWeight: 800, color: C.hint, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {t('yourAnswer')}
              </p>
              <p style={{ fontSize: 16, fontWeight: 700, color: answeredIdx === 0 ? C.successText : C.dangerText }}>
                {fillText || '—'}
              </p>
              {answeredIdx !== 0 && (
                <p style={{ fontSize: 13, color: C.muted, marginTop: 8 }}>
                  <span style={{ fontWeight: 800 }}>{t('correctAnswer')}:</span> {question.a}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Glassmorphic Feedback Banner + Sound Wave Indicator */}
      <AnimatePresence>
        {locked && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={TRANSITION.spring}
            className="mb-4 rounded-3xl p-5 border backdrop-blur-xl shadow-xl relative overflow-hidden"
            style={{
              background: isCorrectAnswer
                ? 'rgba(240, 253, 244, 0.92)'
                : 'rgba(254, 242, 242, 0.92)',
              borderColor: isCorrectAnswer ? '#86EFAC' : '#FCA5A5',
            }}
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-bold shadow-md"
                  style={{ background: isCorrectAnswer ? '#22C55E' : '#EF4444' }}
                >
                  {isCorrectAnswer ? <Check size={20} strokeWidth={3} /> : <X size={20} strokeWidth={3} />}
                </div>
                <div>
                  <h4
                    className="text-base font-black tracking-tight"
                    style={{ color: isCorrectAnswer ? '#15803D' : '#991B1B' }}
                  >
                    {isCorrectAnswer
                      ? (lang === 'en' ? 'Awesome! Correct Answer' : 'ยอดเยี่ยม! คำตอบถูกต้อง')
                      : (lang === 'en' ? 'Not quite... Keep going!' : 'ยังไม่ถูก... พยายามต่อไป!')
                    }
                  </h4>
                  {isCorrectAnswer && (
                    <p className="text-xs font-bold text-emerald-600 font-mono">
                      +{xpEarned} XP {streak > 1 ? `(🔥 ${streak}x Combo Bonus!)` : ''}
                    </p>
                  )}
                </div>
              </div>

              {/* Celebratory Sound Wave Indicator */}
              <div className="flex items-center gap-2">
                <SoundWaveIndicator isPlaying={isCorrectAnswer} />
              </div>
            </div>

            {/* Explanation box */}
            {question.explain && (
              <div
                className="mt-3 pt-3 border-t text-xs sm:text-sm leading-relaxed"
                style={{
                  borderColor: isCorrectAnswer ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: isCorrectAnswer ? '#166534' : '#991B1B',
                }}
              >
                <span className="font-extrabold text-[10px] uppercase tracking-wider block mb-1 opacity-75">
                  {t('explanation')}
                </span>
                {question.explain[lang]}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
QuestionCard.displayName = 'QuestionCard';

// --- StickyNav ----------------------------------------------------------------

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
      className="fixed bottom-0 left-0 right-0 z-20 px-4 py-3 shadow-2xl"
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
          className="px-6 py-3 rounded-2xl text-sm font-bold border transition-all disabled:opacity-20 bg-white shadow-sm flex items-center gap-1"
          style={{ color: C.text, borderColor: C.border, minWidth: 100 }}
        >
          <ChevronLeft size={16} />
          <span>{t('prev')}</span>
        </motion.button>

        <div
          className="px-4 py-2 rounded-xl border bg-white/70 shadow-sm"
          style={{ borderColor: C.border }}
        >
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 800, color: C.text }}>
            {current + 1}<span style={{ opacity: 0.35 }}> / </span>{total}
          </span>
        </div>

        <motion.button
          disabled={!isAnswered}
          onClick={onNext}
          whileHover={isAnswered ? { scale: 1.03 } : {}}
          whileTap={isAnswered ? { scale: 0.97 } : {}}
          animate={isAnswered ? { scale: [1, 1.05, 1] } : { scale: 1 }}
          transition={isAnswered ? { duration: 0.35, ease: 'easeOut' } : {}}
          className="px-7 py-3 rounded-2xl text-sm font-black border transition-all disabled:opacity-25 shadow-lg flex items-center gap-1.5"
          style={{
            background:  isAnswered ? C.text    : C.surface,
            color:       isAnswered ? '#fff'    : C.text,
            borderColor: isAnswered ? C.text    : C.border,
            minWidth:    130,
          }}
        >
          <span>{isLastQ ? t('seeResults') : t('next')}</span>
          <ChevronRight size={16} />
        </motion.button>
      </div>
    </div>
  );
});
StickyNav.displayName = 'StickyNav';

// --- QuizSession --------------------------------------------------------------

export function QuizSession({
  quiz, lang, filteredQuestions, current, answered, fillAnswers,
  sessionMode, saving, agentName,
  onBack, onAnswer, onFillText, onNext, onPrev, onJump,
}: QuizSessionProps) {
  const t = useTranslations('quiz');

  // Gamification session states
  const [streak, setStreak] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [lastXpGain, setLastXpGain] = useState(0);
  const [showComboBanner, setShowComboBanner] = useState(false);
  const [comboMessage, setComboMessage] = useState('');

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

  const currentRank = useMemo(() => getRankForXp(sessionXp), [sessionXp]);
  const rankProgress = useMemo(() => getNextRankProgress(sessionXp), [sessionXp]);

  // Handle choice submission & calculate gamified scores & sounds
  const handleGamifiedAnswer = useCallback((choiceIdx: number) => {
    onAnswer(choiceIdx);

    const isRight = isAnswerCorrect(currentQ, choiceIdx);
    if (isRight) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      const baseGain = 100;
      const comboBonus = (newStreak - 1) * 50;
      const totalGain = baseGain + comboBonus;

      setLastXpGain(totalGain);
      setSessionXp(prev => prev + totalGain);

      if (newStreak >= 2) {
        let msg = `🔥 ${newStreak}x Combo!`;
        if (newStreak === 3) msg = `⚡ ${newStreak}x Streak!`;
        if (newStreak === 4) msg = `🚀 ${newStreak}x Unstoppable!`;
        if (newStreak >= 5) msg = `👑 ${newStreak}x Godlike!`;
        setComboMessage(msg);
        setShowComboBanner(true);
        playGamifiedSound('combo');
        triggerHaptic('combo');
        setTimeout(() => setShowComboBanner(false), 2200);
      } else {
        playGamifiedSound('correct');
        triggerHaptic('correct');
      }
    } else {
      setStreak(0);
      setLastXpGain(0);
      playGamifiedSound('wrong');
      triggerHaptic('wrong');
    }
  }, [currentQ, onAnswer, streak]);

  const handleGamifiedFillText = useCallback((text: string) => {
    onFillText(text);
  }, [onFillText]);

  const handleNextWithSound = useCallback(() => {
    if (isLastQ) {
      playGamifiedSound('finish');
    }
    onNext();
  }, [isLastQ, onNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={TRANSITION.base}
      className="pb-28 min-h-[calc(100dvh-56px)] select-none"
      style={{ background: C.bg, fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="py-6 px-4">
        <div className="max-w-[680px] mx-auto">

          {/* Top navigation header + session mode badge */}
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-sm font-bold transition-opacity hover:opacity-70"
              style={{ color: C.muted }}
            >
              <ChevronLeft size={18} />
              {quiz.title[lang]}
            </button>

            <div className="flex items-center gap-2 flex-wrap justify-end">
              {isPractice && (
                <span
                  className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm"
                  style={{ background: C.warnBg, color: C.warnText, border: `1px solid ${C.warnBorder}` }}
                >
                  {sessionMode.type === 'retry'
                    ? `${lang === 'en' ? 'Retry Mode' : 'โหมดทำซ้ำ'} · ${total} Q`
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

          {/* Dynamic XP & Rank Progress Bar Header */}
          <div className="mb-5 rounded-2xl p-4 border shadow-sm bg-white border-[#E2E0DA] flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              {/* Rank Badge */}
              <div className="flex items-center gap-2">
                <span
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-sm"
                  style={{ background: currentRank.badgeBg, border: `1px solid ${currentRank.badgeBorder}` }}
                >
                  {currentRank.icon}
                </span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    {lang === 'en' ? 'Current Rank' : 'ยศปัจจุบัน'}
                  </p>
                  <p className="text-xs font-black text-foreground font-mono">
                    {currentRank.title[lang]}
                  </p>
                </div>
              </div>

              {/* Live XP Counter */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 font-mono text-xs font-extrabold shadow-sm">
                  <Sparkles size={13} className="text-amber-500 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>{sessionXp} XP</span>
                </div>

                {streak > 1 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500 text-white font-mono text-[11px] font-black shadow-md"
                  >
                    <Flame size={12} strokeWidth={3} />
                    <span>{streak}x</span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Rank XP Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-extrabold font-mono text-muted-foreground">
                <span>{currentRank.title[lang]}</span>
                <span>{rankProgress.nextRank ? `${rankProgress.nextRank.title[lang]} (${rankProgress.pct}%)` : 'MAX RANK'}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden relative">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500"
                  animate={{ width: `${rankProgress.pct}%` }}
                  transition={TRANSITION.slow}
                />
              </div>
            </div>
          </div>

          {/* Interactive Combo Popup Notification */}
          <AnimatePresence>
            {showComboBanner && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.8 }}
                transition={TRANSITION.spring}
                className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white text-center shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center justify-center gap-2 font-black text-lg sm:text-xl tracking-tight">
                  <Zap size={22} className="animate-bounce" />
                  <span>{comboMessage}</span>
                  <Award size={22} className="animate-bounce" />
                </div>
                <p className="text-xs font-bold text-amber-100 font-mono mt-0.5">
                  +{lastXpGain} XP Gained!
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Quest Map */}
          <QuestionMap
            questions={filteredQuestions}
            answered={answered}
            current={current}
            onJump={onJump}
            lang={lang}
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
                onAnswer={handleGamifiedAnswer}
                onFillText={handleGamifiedFillText}
                streak={streak}
                xpEarned={lastXpGain}
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
        onNext={handleNextWithSound}
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
