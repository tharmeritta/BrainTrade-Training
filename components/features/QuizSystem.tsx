'use client';

import { useState, useEffect, type CSSProperties } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, LayoutDashboard, RotateCcw } from 'lucide-react';
import {
  MODULE_QUIZ_MAP, UI_STRINGS, PASS_THRESHOLD,
  type Language, type QuizDefinition, type QuestionData,
} from '@/lib/quiz-data';

// ─── Light warm theme tokens (matches HTML prototype) ─────────────────────────
const C = {
  bg:            '#F5F4F0',
  surface:       '#FFFFFF',
  border:        '#E2E0DA',
  borderHover:   '#C8C5BC',
  text:          '#1A1917',
  muted:         '#6B6860',
  hint:          '#9E9B94',
  successBg:     '#DBEAFE',
  successBorder: '#93C5FD',
  successText:   '#1D4ED8',
  dangerBg:      '#FEE2E2',
  dangerBorder:  '#FCA5A5',
  dangerText:    '#991B1B',
  warnBg:        '#FEF9C3',
  warnBorder:    '#FDE047',
  warnText:      '#854D0E',
};

const LABELS = ['A', 'B', 'C', 'D'];

// ─── Result Screen ────────────────────────────────────────────────────────────
function ResultScreen({
  questions, answered, lang, quiz, onRestart, onDashboard, isPractice,
}: {
  questions: QuestionData[];
  answered: Record<number, number>;
  lang: Language;
  quiz: QuizDefinition;
  onRestart: () => void;
  onDashboard: () => void;
  isPractice?: boolean;
}) {
  const ui    = UI_STRINGS[lang];
  const total = questions.length;
  const score = questions.filter((q, i) => answered[i] === q.correctIdx).length;
  const pct   = Math.round((score / total) * 100);
  const threshold = quiz.passThreshold ?? PASS_THRESHOLD;
  const passed = score / total >= threshold;

  const message = pct >= 90
    ? (quiz.uiOverrides?.feedbackHigh?.[lang] ?? ui.msgHigh)
    : pct >= 70
    ? (quiz.uiOverrides?.feedbackMid?.[lang]  ?? ui.msgMed)
    : (quiz.uiOverrides?.feedbackLow?.[lang]  ?? ui.msgLow);

  const feedbackColor = pct >= 90 ? C.successText : pct >= 70 ? '#185FA5' : C.dangerText;

  return (
    <motion.div
      className="w-full max-w-[660px] mx-auto"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Score card */}
      <div
        className="rounded-[10px] text-center mb-4"
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          overflow: 'hidden',
        }}
      >
        <div className="px-8 py-10">
          {/* Logo */}
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 500, color: C.hint, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
            BrainTrade · Internal Training
          </p>

          {/* Score number */}
          <p style={{ fontSize: 12, color: C.hint, fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>
            {ui.yourScore}
          </p>
          <motion.div
            style={{ fontSize: 64, fontWeight: 600, color: C.text, lineHeight: 1, marginBottom: 6 }}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 220, damping: 18 }}
          >
            {score}
            <span style={{ fontSize: 28, color: C.hint, fontWeight: 400 }}>/{total}</span>
          </motion.div>
          <p style={{ fontSize: 15, color: C.muted, marginBottom: 10 }}>
            {pct}{ui.pctCorrect}
          </p>

          {/* Pass/Fail badge */}
          <div className="inline-flex flex-col items-center gap-2 mb-5">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
              style={{
                background: passed ? C.successBg : C.dangerBg,
                border: `1px solid ${passed ? C.successBorder : C.dangerBorder}`,
                color: passed ? C.successText : C.dangerText,
              }}
            >
              {passed ? '✓' : '✕'} {passed ? ui.passed : ui.failed}
            </span>
            {isPractice && (
              <span
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: C.warnBg, border: `1px solid ${C.warnBorder}`, color: C.warnText }}
              >
                {lang === 'th' ? '⚠ โหมดฝึกซ้อม — ไม่บันทึกผล' : '⚠ Practice mode — progress not saved'}
              </span>
            )}
          </div>

          {/* Feedback */}
          <p style={{ fontSize: 16, fontWeight: 500, color: feedbackColor, marginBottom: 28 }}>
            {message}
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-2 max-w-xs mx-auto">
            <button
              onClick={onDashboard}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[7px] font-medium text-sm transition-all hover:opacity-85 active:scale-[0.98]"
              style={{ background: C.text, color: '#fff', border: `1px solid ${C.text}` }}
            >
              <LayoutDashboard size={14} />
              {ui.backToHome}
            </button>
            <button
              onClick={onRestart}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[7px] font-medium text-sm transition-all hover:opacity-85 active:scale-[0.98]"
              style={{ background: C.surface, color: C.muted, border: `1px solid ${C.border}` }}
            >
              <RotateCcw size={13} />
              {ui.tryAgain}
            </button>
          </div>
        </div>
      </div>

      {/* Answer Key */}
      <div
        className="rounded-[10px] overflow-hidden"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
      >
        <div
          className="px-5 py-3 border-b"
          style={{ borderColor: C.border }}
        >
          <span style={{ fontSize: 11, fontWeight: 600, fontFamily: "'DM Mono', monospace", color: C.hint, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {ui.answerKey}
          </span>
        </div>
        <div className="divide-y" style={{ borderColor: C.border }}>
          {questions.map((q, i) => {
            const userIdx   = answered[i];
            const correct   = q.correctIdx ?? 0;
            const isCorrect = userIdx === correct;
            const opts      = q.options?.[lang] ?? [];
            const correctTxt = opts[correct] ?? '';
            const userTxt    = userIdx !== undefined ? (opts[userIdx] ?? '—') : '—';

            return (
              <div key={i} className="px-5 py-3" style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
                <strong style={{ color: C.text }}>Q{i + 1}:</strong> {q[lang]}
                <br />
                <span style={{ color: C.successText, fontWeight: 500 }}>
                  {isCorrect ? '✓' : `${ui.correctAnswer}`} {correctTxt}
                </span>
                {!isCorrect && (
                  <span style={{ color: C.dangerText }}>
                    {' · '}{ui.yourAnswer} {userTxt}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-center py-3" style={{ fontSize: 11, color: C.hint }}>
          {lang === 'th'
            ? `เกณฑ์ผ่าน: ${Math.round(threshold * 100)}%`
            : `Passing score: ${Math.round(threshold * 100)}%`}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Question Card ────────────────────────────────────────────────────────────
function QuestionCard({
  question, index, total, lang, phaseColor, phaseLight, phaseName,
  answeredIdx, onAnswer,
}: {
  question: QuestionData;
  index: number;
  total: number;
  lang: Language;
  phaseColor: string;
  phaseLight: string;
  phaseName: string;
  answeredIdx: number | undefined;
  onAnswer: (choiceIdx: number) => void;
}) {
  const opts    = question.options?.[lang] ?? [];
  const correct = question.correctIdx ?? 0;
  const locked  = answeredIdx !== undefined;

  function choiceStyle(i: number): CSSProperties {
    if (!locked) return { background: C.surface, borderColor: C.border, color: C.text };
    if (i === correct) return { background: C.successBg, borderColor: C.successBorder, color: C.successText };
    if (i === answeredIdx) return { background: C.dangerBg, borderColor: C.dangerBorder, color: C.dangerText };
    return { background: C.surface, borderColor: C.border, color: C.muted };
  }

  function labelStyle(i: number): CSSProperties {
    if (!locked) return { color: C.hint };
    if (i === correct) return { color: C.successText };
    if (i === answeredIdx) return { color: C.dangerText };
    return { color: C.hint };
  }

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Question card */}
      <div
        className="rounded-[10px] mb-3"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
      >
        {/* Meta row */}
        <div className="flex items-center gap-2 px-5 pt-4 pb-3">
          <span
            className="text-[11px] font-medium px-2.5 py-1 rounded-full"
            style={{ background: phaseLight, color: phaseColor }}
          >
            {phaseName}
          </span>
          {question.isNew && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: C.warnBg, color: C.warnText, border: `1px solid ${C.warnBorder}` }}
            >
              New
            </span>
          )}
          <span
            className="ml-auto"
            style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.hint }}
          >
            Q{index + 1} / {total}
          </span>
        </div>

        {/* Question text */}
        <p
          className="px-5 pb-5"
          style={{ fontSize: 15, fontWeight: 500, color: C.text, lineHeight: 1.55 }}
        >
          {question[lang]}
        </p>
      </div>

      {/* Choices */}
      <div className="space-y-1.5 mb-3">
        {opts.map((opt, i) => (
          <button
            key={i}
            disabled={locked}
            onClick={() => onAnswer(i)}
            className="w-full flex items-start gap-2.5 px-4 py-3 rounded-[7px] border text-left transition-colors"
            style={choiceStyle(i)}
          >
            <span
              className="shrink-0 text-[12px] font-semibold min-w-[16px] pt-[1px]"
              style={{ fontFamily: "'DM Mono', monospace", ...labelStyle(i) }}
            >
              {LABELS[i]}
            </span>
            <span style={{ fontSize: 14, lineHeight: 1.45 }}>{opt}</span>
          </button>
        ))}
      </div>

      {/* Explanation */}
      <AnimatePresence>
        {locked && question.explain && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div
              className="rounded-[7px] px-4 py-3"
              style={{
                background: C.bg,
                borderLeft: `3px solid ${C.borderHover}`,
                fontSize: 13,
                color: C.muted,
                lineHeight: 1.6,
              }}
            >
              {question.explain[lang]}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main QuizSystem ──────────────────────────────────────────────────────────
export default function QuizSystem({ moduleId }: { moduleId: string }) {
  const pathname = usePathname();
  const router   = useRouter();
  const locale   = pathname.split('/')[1] ?? 'th';
  const lang     = (locale === 'en' ? 'en' : 'th') as Language;
  const ui       = UI_STRINGS[lang];

  const quiz = MODULE_QUIZ_MAP[moduleId];

  const [agentId,   setAgentId]   = useState<string | null>(null);
  const [agentName, setAgentName] = useState<string | null>(null);
  const [activePhase, setActivePhase] = useState<number | null>(null);
  const [current,   setCurrent]   = useState(0);
  const [answered,  setAnswered]  = useState<Record<number, number>>({});
  const [finished,  setFinished]  = useState(false);
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    setAgentId(localStorage.getItem('brainstrade_agent_id'));
    setAgentName(localStorage.getItem('brainstrade_agent_name'));
  }, []);

  // Filtered questions based on active phase
  const filteredQuestions = activePhase === null
    ? quiz?.questions ?? []
    : (quiz?.questions ?? []).filter(q => q.phase === activePhase);

  const total = filteredQuestions.length;

  // Save result when quiz finishes — only when viewing all questions (not a phase filter)
  useEffect(() => {
    if (!finished || !agentId || !quiz) return;
    if (activePhase !== null) return; // phase filter = practice mode, don't record progress
    setSaving(true);
    const allQuestions = quiz.questions ?? [];
    const allTotal = allQuestions.length;
    const score = allQuestions.filter((q, i) => answered[i] === q.correctIdx).length;
    fetch('/api/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        moduleId, agentId, agentName,
        score,
        totalQuestions: allTotal,
        passed: score / allTotal >= (quiz.passThreshold ?? PASS_THRESHOLD),
      }),
    }).finally(() => setSaving(false));
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  function handlePhaseFilter(phase: number | null) {
    setActivePhase(phase);
    setCurrent(0);
    setAnswered({});
    setFinished(false);
  }

  function handleAnswer(choiceIdx: number) {
    setAnswered(prev => ({ ...prev, [current]: choiceIdx }));
  }

  function handleNext() {
    if (current === total - 1) {
      setFinished(true);
    } else {
      setCurrent(c => c + 1);
    }
  }

  function handlePrev() {
    if (current > 0) setCurrent(c => c - 1);
  }

  function handleRestart() {
    setCurrent(0);
    setAnswered({});
    setFinished(false);
  }

  // Unknown module guard
  if (!quiz) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: C.bg, fontFamily: "'DM Sans', sans-serif" }}
      >
        <p style={{ color: C.muted }}>ไม่พบข้อมูลแบบทดสอบสำหรับโมดูลนี้</p>
      </div>
    );
  }

  const phases      = quiz.phases ?? [];
  const currentQ    = filteredQuestions[current];
  const isAnswered  = answered[current] !== undefined;
  const isLastQ     = current === total - 1;
  const progressPct = total > 0 ? Math.round(((current + 1) / total) * 100) : 0;

  // Determine phase color for current question
  const qPhaseIdx   = currentQ?.phase ?? 0;
  const qPhase      = phases[qPhaseIdx];
  const phaseColor  = qPhase?.color  ?? C.hint;
  const phaseLight  = qPhase?.light  ?? C.bg;
  const phaseName   = qPhase?.name?.[lang] ?? '';

  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{ background: C.bg, fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="max-w-[660px] mx-auto">

        {finished ? (
          <ResultScreen
            questions={filteredQuestions}
            answered={answered}
            lang={lang}
            quiz={quiz}
            onRestart={handleRestart}
            onDashboard={() => router.push(`/${locale}/dashboard`)}
            isPractice={activePhase !== null}
          />
        ) : (
          <>
            {/* ── Header ──────────────────────────────────────────────── */}
            <div className="mb-5">
              {/* Back button */}
              <button
                onClick={() => router.push(`/${locale}/quiz`)}
                className="inline-flex items-center gap-1 mb-4 text-sm transition-opacity hover:opacity-70"
                style={{ color: C.muted }}
              >
                <ChevronLeft size={14} />
                {lang === 'th' ? 'เลือกแบบทดสอบ' : 'All Assessments'}
              </button>

              {/* Logo + title */}
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 500, color: C.hint, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                BrainTrade · Internal Training
              </p>
              <h1 style={{ fontSize: 22, fontWeight: 600, color: C.text, marginBottom: 2 }}>
                {quiz.title[lang]}
              </h1>
              <p style={{ fontSize: 14, color: C.muted, marginBottom: 16 }}>
                {quiz.description[lang]}
              </p>

              {/* Progress bar */}
              <div
                className="rounded-full overflow-hidden mb-4"
                style={{ height: 3, background: C.border }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: C.text }}
                  animate={{ width: `${finished ? 100 : progressPct}%` }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>

              {/* Phase filter buttons — only shown when quiz has multiple phases */}
              {phases.length > 1 && (
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    onClick={() => handlePhaseFilter(null)}
                    className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                    style={{
                      border: `1px solid ${activePhase === null ? C.text : C.border}`,
                      background: activePhase === null ? C.text : C.surface,
                      color: activePhase === null ? '#fff' : C.muted,
                    }}
                  >
                    {ui.allPhases}
                  </button>
                  {phases.map((ph, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePhaseFilter(idx)}
                      className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                      style={{
                        border: `1px solid ${activePhase === idx ? ph.color : C.border}`,
                        background: activePhase === idx ? ph.color : C.surface,
                        color: activePhase === idx ? '#fff' : C.muted,
                      }}
                    >
                      {ph.name[lang]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Question ────────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
              {currentQ && (
                <QuestionCard
                  key={`${activePhase}-${current}`}
                  question={currentQ}
                  index={current}
                  total={total}
                  lang={lang}
                  phaseColor={phaseColor}
                  phaseLight={phaseLight}
                  phaseName={phaseName}
                  answeredIdx={answered[current]}
                  onAnswer={handleAnswer}
                />
              )}
            </AnimatePresence>

            {/* ── Nav row ─────────────────────────────────────────────── */}
            <div className="flex items-center justify-between mt-2">
              <button
                disabled={current === 0}
                onClick={handlePrev}
                className="px-5 py-2 rounded-[7px] text-sm font-medium border transition-all disabled:opacity-30"
                style={{ background: C.surface, color: C.text, borderColor: C.border }}
              >
                {ui.prev}
              </button>

              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: C.hint }}>
                {current + 1} / {total}
              </span>

              <button
                disabled={!isAnswered}
                onClick={handleNext}
                className="px-5 py-2 rounded-[7px] text-sm font-medium border transition-all disabled:opacity-30"
                style={{
                  background: isAnswered ? C.text : C.surface,
                  color:      isAnswered ? '#fff' : C.text,
                  borderColor: isAnswered ? C.text : C.border,
                }}
              >
                {isLastQ ? ui.seeResults : ui.next}
              </button>
            </div>

            {saving && (
              <p className="text-center mt-3 text-xs" style={{ color: C.hint }}>
                {lang === 'th' ? 'กำลังบันทึก...' : 'Saving...'}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
