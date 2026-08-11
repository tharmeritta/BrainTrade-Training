'use client';

import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronUp, LayoutDashboard, RotateCcw,
  CheckCircle2, AlertCircle, Loader2, Sparkles, Award, Trophy, Zap,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TRANSITION, FADE_IN } from '@/lib/animations';
import { PASS_THRESHOLD } from '@/lib/quiz-data';
import type { Language, QuizDefinition, QuestionData, QuizPhase } from '@/lib/quiz-data';
import { C, isAnswerCorrect } from './shared';
import type { QuizResultProps, SessionMode } from './types';
import {
  getRankForXp, getNextRankProgress, playGamifiedSound,
  ConfettiBurst, SoundWaveIndicator,
} from './gamification';

// --- PhaseBreakdown -----------------------------------------------------------

interface PhaseBreakdownProps {
  questions: QuestionData[];
  answered: Record<number, number>;
  phases: QuizPhase[];
  lang: Language;
}

const PhaseBreakdown = memo(({ questions, answered, phases, lang }: PhaseBreakdownProps) => {
  const breakdown = useMemo(() =>
    phases.map((ph, phIdx) => {
      const phaseQs = questions
        .map((q, i) => ({ q, i }))
        .filter(({ q }) => (q.phase ?? 0) === phIdx);
      const total   = phaseQs.length;
      const correct = phaseQs.filter(({ q, i }) => answered[i] !== undefined && isAnswerCorrect(q, answered[i])).length;
      const pct     = total > 0 ? Math.round((correct / total) * 100) : 0;
      return { ph, total, correct, pct };
    }),
  [questions, answered, phases]);

  return (
    <div className="rounded-3xl overflow-hidden shadow-lg mb-6 border" style={{ background: C.surface, borderColor: C.border }}>
      <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
        <span style={{ fontSize: 12, fontWeight: 800, fontFamily: "'DM Mono', monospace", color: C.hint, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Phase Breakdown
        </span>
        <SoundWaveIndicator isPlaying={true} />
      </div>
      <div className="divide-y" style={{ borderColor: C.border }}>
        {breakdown.map(({ ph, total, correct, pct }, idx) => (
          <div key={idx} className="px-6 py-4 flex items-center gap-4">
            <div className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ background: ph.color }} />
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 5 }}>
                {ph.name[lang]}
              </p>
              <div className="rounded-full overflow-hidden" style={{ height: 6, background: '#E2E0DA' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: ph.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={TRANSITION.slow}
                />
              </div>
            </div>
            <div className="text-right shrink-0">
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 800, color: C.text }}>
                {correct}/{total}
              </p>
              <p style={{ fontSize: 11, color: C.hint, fontWeight: 700 }}>{pct}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
PhaseBreakdown.displayName = 'PhaseBreakdown';

// --- ResultView ---------------------------------------------------------------

interface ResultViewProps {
  questions: QuestionData[];
  answered: Record<number, number>;
  fillAnswers: Record<number, string>;
  lang: Language;
  quiz: QuizDefinition;
  sessionMode: SessionMode;
  onRestart: () => void;
  onRetryWrong: (wrongQuestions: QuestionData[]) => void;
  onDashboard: () => void;
}

const ResultView = memo(({
  questions, answered, fillAnswers, lang, quiz, sessionMode,
  onRestart, onRetryWrong, onDashboard,
}: ResultViewProps) => {
  const t = useTranslations('quiz');

  // Answer key accordion state
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  const phases     = useMemo(() => quiz.phases ?? [], [quiz.phases]);
  const total      = questions.length;
  const isPractice = sessionMode.type !== 'full';

  const score = useMemo(() =>
    questions.filter((q, i) => answered[i] !== undefined && isAnswerCorrect(q, answered[i])).length,
  [questions, answered]);

  // Calculate total XP and streak stats
  const { totalXp, maxStreak } = useMemo(() => {
    let xp = 0;
    let currentStreak = 0;
    let highestStreak = 0;
    questions.forEach((q, i) => {
      if (answered[i] !== undefined && isAnswerCorrect(q, answered[i])) {
        currentStreak += 1;
        highestStreak = Math.max(highestStreak, currentStreak);
        const comboBonus = (currentStreak - 1) * 50;
        xp += 100 + comboBonus;
      } else {
        currentStreak = 0;
      }
    });
    return { totalXp: xp, maxStreak: highestStreak };
  }, [questions, answered]);

  const currentRank = useMemo(() => getRankForXp(totalXp), [totalXp]);
  const rankProgress = useMemo(() => getNextRankProgress(totalXp), [totalXp]);

  const pct       = Math.round((score / total) * 100);
  const threshold = quiz.passThreshold ?? PASS_THRESHOLD;
  const passed    = score / total >= threshold;

  // Sound effect on result load
  useEffect(() => {
    if (passed) playGamifiedSound('finish');
    else playGamifiedSound('wrong');
  }, [passed]);

  const message = useMemo(() => {
    if (pct >= 90) return quiz.uiOverrides?.feedbackHigh?.[lang] ?? t('msgHigh');
    if (pct >= 70) return quiz.uiOverrides?.feedbackMid?.[lang]  ?? t('msgMed');
    return quiz.uiOverrides?.feedbackLow?.[lang] ?? t('msgLow');
  }, [pct, quiz.uiOverrides, lang, t]);

  const finishTitle = quiz.uiOverrides?.finishTitle?.[lang] ?? t('finishTitle');
  const finishSub   = quiz.uiOverrides?.finishSub?.[lang]   ?? t('finishSub');
  const scoreLabel  = quiz.uiOverrides?.scoreLabel?.[lang]  ?? t('scoreLabel');

  const feedbackColor = pct >= 90 ? C.successText : pct >= 70 ? '#185FA5' : C.dangerText;

  // Wrong questions
  const wrongQuestions = useMemo(() =>
    questions.filter((q, i) => answered[i] !== undefined && !isAnswerCorrect(q, answered[i])),
  [questions, answered]);

  // Answer groups by phase
  const answerGroups = useMemo(() => {
    if (phases.length <= 1) {
      return [{ ph: phases[0] ?? null, phIdx: 0, qs: questions.map((q, i) => ({ q, i })) }];
    }
    return phases.map((ph, phIdx) => ({
      ph,
      phIdx,
      qs: questions.map((q, i) => ({ q, i })).filter(({ q }) => (q.phase ?? 0) === phIdx),
    }));
  }, [questions, phases]);

  const toggleSection = useCallback((phIdx: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(phIdx)) next.delete(phIdx); else next.add(phIdx);
      return next;
    });
  }, []);

  return (
    <motion.div className="w-full relative" variants={FADE_IN} initial="initial" animate="animate">

      {/* Confetti celebration burst if passed */}
      <ConfettiBurst active={passed} />

      {/* -- Score Card -- */}
      <div
        className="rounded-3xl text-center mb-6 shadow-2xl overflow-hidden border relative"
        style={{ background: C.surface, borderColor: C.border }}
      >
        <div className="px-8 py-10">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 font-mono text-[11px] font-black uppercase tracking-wider mb-4">
            <Trophy size={13} className="text-amber-500" />
            <span>{finishTitle}</span>
          </div>

          <p style={{
            fontSize: 12, color: C.hint, fontWeight: 800, fontFamily: "'DM Mono', monospace",
            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8,
          }}>
            {scoreLabel}
          </p>

          <motion.div
            style={{ fontSize: 80, fontWeight: 800, color: C.text, lineHeight: 1, marginBottom: 6, letterSpacing: '-0.03em' }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={TRANSITION.spring}
          >
            {score}
            <span style={{ fontSize: 32, color: C.hint, fontWeight: 400, marginLeft: 4 }}>/{total}</span>
          </motion.div>

          <p style={{ fontSize: 13, color: C.hint, marginBottom: 20 }}>{finishSub}</p>

          {/* Gamified Rewards Strip (XP & Rank Unlock) */}
          <div className="max-w-md mx-auto mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 border border-amber-500/20 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              {/* Rank Badge */}
              <div className="flex items-center gap-2.5">
                <span
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-md"
                  style={{ background: currentRank.badgeBg, border: `1.5px solid ${currentRank.badgeBorder}` }}
                >
                  {currentRank.icon}
                </span>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    {lang === 'en' ? 'Rank Unlocked' : 'ยศที่ได้'}
                  </p>
                  <p className="text-sm font-extrabold text-foreground font-mono">
                    {currentRank.title[lang]}
                  </p>
                </div>
              </div>

              {/* XP Earned */}
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 text-slate-950 font-mono text-sm font-black shadow-md">
                  <Sparkles size={14} />
                  <span>+{totalXp} XP</span>
                </div>
                {maxStreak > 1 && (
                  <span className="text-[10px] font-black text-rose-600 font-mono mt-1 flex items-center gap-0.5">
                    <Zap size={11} /> {maxStreak}x Max Combo
                  </span>
                )}
              </div>
            </div>

            {/* Rank Progress bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-extrabold font-mono text-muted-foreground">
                <span>{lang === 'en' ? 'Next Rank Progress' : 'ความคืบหน้ายศถัดไป'}</span>
                <span>{rankProgress.pct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-500"
                  animate={{ width: `${rankProgress.pct}%` }}
                  transition={TRANSITION.slow}
                />
              </div>
            </div>
          </div>

          {/* Pass / Fail badge */}
          <div className="flex flex-col items-center gap-3 mb-6">
            <span
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-black uppercase tracking-widest shadow-md"
              style={{
                background:  passed ? C.successBg  : C.dangerBg,
                border:      `1.5px solid ${passed ? C.successBorder : C.dangerBorder}`,
                color:       passed ? C.successText : C.dangerText,
                boxShadow:   passed ? `0 6px 20px ${C.successBorder}44` : 'none',
              }}
            >
              {passed
                ? <><CheckCircle2 size={18} /> Mission Passed</>
                : <><AlertCircle  size={18} /> Mission Failed</>}
            </span>

            {isPractice && (
              <span className="px-4 py-1.5 rounded-xl text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                {sessionMode.type === 'retry'
                  ? `${t('retryWrong')} · ${total} ${lang === 'en' ? 'questions' : 'ข้อ'}`
                  : t('practiceMode')
                }
              </span>
            )}
          </div>

          <p style={{ fontSize: 17, fontWeight: 700, color: feedbackColor, maxWidth: '420px', margin: '0 auto 32px' }}>
            {message}
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
            <motion.button
              onClick={onDashboard}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm shadow-xl bg-foreground text-background"
            >
              <LayoutDashboard size={17} />
              {t('backToHome')}
            </motion.button>
            <motion.button
              onClick={onRestart}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm border shadow-sm"
              style={{ background: C.surface, color: C.muted, borderColor: C.border }}
            >
              <RotateCcw size={16} />
              {t('tryAgain')}
            </motion.button>
          </div>

          {/* Retry Wrong button */}
          {wrongQuestions.length > 0 && (
            <motion.button
              onClick={() => onRetryWrong(wrongQuestions)}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm shadow-md"
              style={{ background: C.warnBg, color: C.warnText, border: `1.5px solid ${C.warnBorder}` }}
            >
              <RotateCcw size={15} />
              {t('retryWrong')}
              <span style={{ opacity: 0.8 }}>
                · {wrongQuestions.length} {lang === 'en' ? 'wrong' : 'ข้อที่ผิด'}
              </span>
            </motion.button>
          )}
        </div>
      </div>

      {/* -- Phase Breakdown -- */}
      {phases.length > 1 && !isPractice && (
        <PhaseBreakdown
          questions={questions}
          answered={answered}
          phases={phases}
          lang={lang}
        />
      )}

      {/* -- Answer Key accordion -- */}
      <div
        className="rounded-3xl overflow-hidden shadow-lg border"
        style={{ background: C.surface, borderColor: C.border }}
      >
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
          <span style={{ fontSize: 12, fontWeight: 800, fontFamily: "'DM Mono', monospace", color: C.hint, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {t('answerKey')}
          </span>
          <Award size={16} className="text-muted-foreground opacity-40" />
        </div>

        {answerGroups.map(({ ph, phIdx, qs }) => {
          const isExpanded   = expandedSections.has(phIdx);
          const groupCorrect = qs.filter(({ q, i }) => answered[i] !== undefined && isAnswerCorrect(q, answered[i])).length;
          const groupPct     = qs.length > 0 ? Math.round((groupCorrect / qs.length) * 100) : 0;

          return (
            <div key={phIdx} className="border-b last:border-b-0" style={{ borderColor: C.border }}>
              <button
                onClick={() => toggleSection(phIdx)}
                className="w-full px-6 py-4 flex items-center gap-3 text-left transition-colors hover:bg-slate-50/60"
              >
                {ph && (
                  <div className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ background: ph.color }} />
                )}
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 14, fontWeight: 800, color: C.text }}>
                    {ph ? ph.name[lang] : (lang === 'en' ? 'All Questions' : 'ทุกคำถาม')}
                  </p>
                </div>

                <span
                  className="shrink-0 text-xs font-black px-3 py-1 rounded-full font-mono shadow-sm"
                  style={{
                    background: groupPct >= 70 ? C.successBg  : C.dangerBg,
                    color:      groupPct >= 70 ? C.successText : C.dangerText,
                  }}
                >
                  {groupCorrect}/{qs.length}
                </span>

                {isExpanded
                  ? <ChevronUp   size={18} style={{ color: C.hint, flexShrink: 0 }} />
                  : <ChevronDown size={18} style={{ color: C.hint, flexShrink: 0 }} />
                }
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={TRANSITION.base}
                    className="overflow-hidden"
                  >
                    <div className="divide-y" style={{ borderColor: C.border }}>
                      {qs.map(({ q, i }) => {
                        const userIdx    = answered[i];
                        const isFill     = (q.type ?? 'mcq') === 'fill';
                        const correct    = q.correctIdx ?? 0;
                        const isCorrect  = userIdx !== undefined && isAnswerCorrect(q, userIdx);
                        const opts       = q.options?.[lang] ?? [];
                        const correctTxt = isFill ? (q.a ?? '') : (opts[correct] ?? '');
                        const userTxt    = isFill
                          ? (fillAnswers[i] ?? '—')
                          : (userIdx !== undefined ? (opts[userIdx] ?? '—') : '—');

                        return (
                          <div key={i} className="px-6 py-4 transition-colors hover:bg-slate-50/50">
                            <p className="text-sm font-bold leading-relaxed mb-2" style={{ color: C.text }}>
                              Q{i + 1}: {q[lang]}
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold">
                              <span style={{ color: C.successText, fontWeight: 800 }}>✓ {correctTxt}</span>
                              {!isCorrect && (
                                <span style={{ color: C.dangerText, fontWeight: 800 }}>✕ {userTxt}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        <div className="px-6 py-4 text-center" style={{ background: '#F9F8F5' }}>
          <p style={{ fontSize: 11, color: C.hint, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('passingReq')}: {Math.round(threshold * 100)}%
          </p>
        </div>
      </div>

    </motion.div>
  );
});
ResultView.displayName = 'ResultView';

// --- QuizResult ---------------------------------------------------------------

export function QuizResult({
  quiz, lang, filteredQuestions, answered, fillAnswers,
  sessionMode, saving,
  onRestart, onRetryWrong, onDashboard,
}: QuizResultProps) {
  const t = useTranslations('quiz');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={TRANSITION.base}
      className="min-h-[calc(100dvh-56px)] py-10 px-4 select-none"
      style={{ background: C.bg, fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="max-w-[680px] mx-auto">
        <ResultView
          questions={filteredQuestions}
          answered={answered}
          fillAnswers={fillAnswers}
          lang={lang}
          quiz={quiz}
          sessionMode={sessionMode}
          onRestart={onRestart}
          onRetryWrong={onRetryWrong}
          onDashboard={onDashboard}
        />

        {saving && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mt-8"
          >
            <Loader2 size={14} className="animate-spin text-muted-foreground" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {t('syncing')}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
