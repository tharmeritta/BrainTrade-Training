'use client';

import React, { useState, useEffect, useMemo, useCallback, memo, type CSSProperties } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, LayoutDashboard, RotateCcw, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

import {
  MODULE_QUIZ_MAP, UI_STRINGS, PASS_THRESHOLD,
  type Language, type QuizDefinition, type QuestionData, type QuizPhase,
} from '@/lib/quiz-data';

import { getAgentSession, type AgentSession } from '@/lib/agent-session';
import { FADE_IN, TRANSITION, EASE } from '@/lib/animations';

import { useTranslations } from 'next-intl';

// ─── Theme Configuration ─────────────────────────────────────────────────────
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

// ─── Interfaces ─────────────────────────────────────────────────────────────

interface QuizHeaderProps {
  quiz: QuizDefinition;
  lang: Language;
  progressPct: number;
  phases: QuizPhase[];
  activePhase: number | null;
  onPhaseFilter: (p: number | null) => void;
  onBack: () => void;
  finished: boolean;
}

interface QuestionCardProps {
  question: QuestionData;
  index: number;
  total: number;
  lang: Language;
  phaseColor: string;
  phaseLight: string;
  phaseName: string;
  answeredIdx: number | undefined;
  onAnswer: (choiceIdx: number) => void;
}

interface ResultViewProps {
  questions: QuestionData[];
  answered: Record<number, number>;
  lang: Language;
  quiz: QuizDefinition;
  onRestart: () => void;
  onDashboard: () => void;
  isPractice: boolean;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * QuizHeader: Logo, title, progress bar and phase filters
 */
const QuizHeader = memo(({
  quiz, lang, progressPct, phases, activePhase, onPhaseFilter, onBack, finished
}: QuizHeaderProps) => {
  const t = useTranslations('quiz');
  
  return (
    <div className="mb-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 mb-5 text-sm transition-opacity hover:opacity-70 font-medium"
        style={{ color: C.muted }}
      >
        <ChevronLeft size={16} />
        {t('chooseAssessment')}
      </button>

      <div className="mb-6">
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 600, color: C.hint, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
          BrainTrade · Internal Training
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, marginBottom: 4, letterSpacing: '-0.01em' }}>
          {quiz?.title?.[lang] || 'Untitled Quiz'}
        </h1>
        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.5 }}>
          {quiz?.description?.[lang] || ''}
        </p>
      </div>

      <div
        className="rounded-full overflow-hidden mb-5 bg-[#E2E0DA]/50"
        style={{ height: 4 }}
      >
        <motion.div
          className="h-full rounded-full shadow-sm"
          style={{ background: C.text }}
          animate={{ width: `${finished ? 100 : progressPct}%` }}
          transition={TRANSITION.slow}
        />
      </div>

      {phases.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onPhaseFilter(null)}
            className="px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all"
            style={{
              border: `1px solid ${activePhase === null ? C.text : C.border}`,
              background: activePhase === null ? C.text : C.surface,
              color: activePhase === null ? '#fff' : C.muted,
              boxShadow: activePhase === null ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            {t('allPhases')}
          </button>
          {phases.map((ph, idx) => (
            <button
              key={idx}
              onClick={() => onPhaseFilter(idx)}
              className="px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all"
              style={{
                border: `1px solid ${activePhase === idx ? ph.color : C.border}`,
                background: activePhase === idx ? ph.color : C.surface,
                color: activePhase === idx ? '#fff' : C.muted,
                boxShadow: activePhase === idx ? `0 4px 12px ${ph.color}33` : 'none'
              }}
            >
              {ph.name[lang]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

QuizHeader.displayName = 'QuizHeader';

/**
 * QuestionCard: Individual quiz question
 */
const QuestionCard = memo(({
  question, index, total, lang, phaseColor, phaseLight, phaseName,
  answeredIdx, onAnswer,
}: QuestionCardProps) => {
  const t = useTranslations('quiz');
  const opts    = useMemo(() => question.options?.[lang] ?? [], [question.options, lang]);
  const correct = question.correctIdx ?? 0;
  const locked  = answeredIdx !== undefined;

  const choiceStyle = useCallback((i: number): CSSProperties => {
    if (!locked) return { background: C.surface, borderColor: C.border, color: C.text };
    if (i === correct) return { background: C.successBg, borderColor: C.successBorder, color: C.successText };
    if (i === answeredIdx) return { background: C.dangerBg, borderColor: C.dangerBorder, color: C.dangerText };
    return { background: C.surface, borderColor: C.border, color: C.muted };
  }, [locked, correct, answeredIdx]);

  const labelStyle = useCallback((i: number): CSSProperties => {
    if (!locked) return { color: C.hint };
    if (i === correct) return { color: C.successText };
    if (i === answeredIdx) return { color: C.dangerText };
    return { color: C.hint };
  }, [locked, correct, answeredIdx]);

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={TRANSITION.base}
    >
      <div
        className="rounded-2xl mb-4 overflow-hidden shadow-sm"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center gap-2 px-6 pt-5 pb-4">
          <span
            className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg"
            style={{ background: phaseLight, color: phaseColor }}
          >
            {phaseName}
          </span>
          {question.isNew && (
            <span
              className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg"
              style={{ background: C.warnBg, color: C.warnText, border: `1px solid ${C.warnBorder}` }}
            >
              New
            </span>
          )}
          <span
            className="ml-auto"
            style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 600, color: C.hint }}
          >
            {index + 1}<span style={{ opacity: 0.4 }}>/</span>{total}
          </span>
        </div>

        <p
          className="px-6 pb-6"
          style={{ fontSize: 17, fontWeight: 600, color: C.text, lineHeight: 1.5 }}
        >
          {question[lang]}
        </p>
      </div>

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
              className="rounded-xl px-5 py-4 mb-4 shadow-inner"
              style={{
                background: '#EAE9E4',
                borderLeft: `4px solid ${C.borderHover}`,
                fontSize: 14,
                color: C.muted,
                lineHeight: 1.6,
              }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.15em] mb-1.5 opacity-60">{t('explanation')}</p>
              {question.explain[lang]}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

QuestionCard.displayName = 'QuestionCard';

/**
 * ResultView: Final summary and feedback
 */
const ResultView = memo(({
  questions, answered, lang, quiz, onRestart, onDashboard, isPractice,
}: ResultViewProps) => {
  const t       = useTranslations('quiz');
  const total = questions.length;
  const score = useMemo(() => questions.filter((q, i) => answered[i] === q.correctIdx).length, [questions, answered]);
  const pct   = Math.round((score / total) * 100);
  const threshold = quiz.passThreshold ?? PASS_THRESHOLD;
  const passed = score / total >= threshold;

  const message = useMemo(() => {
    if (pct >= 90) return quiz.uiOverrides?.feedbackHigh?.[lang] ?? t('msgHigh');
    if (pct >= 70) return quiz.uiOverrides?.feedbackMid?.[lang]  ?? t('msgMed');
    return quiz.uiOverrides?.feedbackLow?.[lang] ?? t('msgLow');
  }, [pct, quiz.uiOverrides, lang, t]);

  const feedbackColor = pct >= 90 ? C.successText : pct >= 70 ? '#185FA5' : C.dangerText;

  return (
    <motion.div
      className="w-full"
      variants={FADE_IN}
      initial="initial"
      animate="animate"
    >
      <div
        className="rounded-3xl text-center mb-6 shadow-xl"
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          overflow: 'hidden',
        }}
      >
        <div className="px-8 py-12">
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 700, color: C.hint, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
            BrainTrade Training Assessment
          </p>

          <p style={{ fontSize: 13, color: C.hint, fontWeight: 700, fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>
            {t('yourScore')}
          </p>
          
          <motion.div
            style={{ fontSize: 84, fontWeight: 700, color: C.text, lineHeight: 1, marginBottom: 10, letterSpacing: '-0.02em' }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={TRANSITION.spring}
          >
            {score}
            <span style={{ fontSize: 32, color: C.hint, fontWeight: 400, marginLeft: 2 }}>/{total}</span>
          </motion.div>

          <div className="flex flex-col items-center gap-3 mb-8">
            <span
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-black uppercase tracking-widest"
              style={{
                background: passed ? C.successBg : C.dangerBg,
                border: `1px solid ${passed ? C.successBorder : C.dangerBorder}`,
                color: passed ? C.successText : C.dangerText,
                boxShadow: passed ? `0 4px 15px ${C.successBorder}44` : 'none'
              }}
            >
              {passed ? (
                <><CheckCircle2 size={16} /> Mission Passed</>
              ) : (
                <><AlertCircle size={16} /> Mission Failed</>
              )}
            </span>
            {isPractice && (
              <span
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200"
              >
                {t('practiceMode')}
              </span>
            )}
          </div>

          <p style={{ fontSize: 18, fontWeight: 600, color: feedbackColor, maxWidth: '400px', margin: '0 auto 40px' }}>
            {message}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-sm mx-auto">
            <motion.button
              onClick={onDashboard}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg"
              style={{ background: C.text, color: '#fff' }}
            >
              <LayoutDashboard size={16} />
              {t('backToHome')}
            </motion.button>
            <motion.button
              onClick={onRestart}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all border shadow-sm"
              style={{ background: C.surface, color: C.muted, borderColor: C.border }}
            >
              <RotateCcw size={15} />
              {t('tryAgain')}
            </motion.button>
          </div>
        </div>
      </div>

      <div
        className="rounded-3xl overflow-hidden shadow-lg"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
      >
        <div
          className="px-6 py-4 border-b bg-secondary/10"
          style={{ borderColor: C.border }}
        >
          <span style={{ fontSize: 12, fontWeight: 800, fontFamily: "'DM Mono', monospace", color: C.hint, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {t('answerKey')}
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
              <div key={i} className="px-6 py-5 transition-colors hover:bg-slate-50/50">
                <p className="text-sm leading-relaxed mb-2" style={{ color: C.text, fontWeight: 600 }}>
                   Q{i + 1}: {q[lang]}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  <span style={{ color: C.successText, fontWeight: 700 }}>
                    ✓ {correctTxt}
                  </span>
                  {!isCorrect && (
                    <span style={{ color: C.dangerText, fontWeight: 700 }}>
                      ✕ {userTxt}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="px-6 py-4 bg-secondary/5 text-center">
          <p style={{ fontSize: 11, color: C.hint, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('passingReq')}: {Math.round(threshold * 100)}%
          </p>
        </div>
      </div>
    </motion.div>
  );
});

ResultView.displayName = 'ResultView';

// ─── Main Component ───────────────────────────────────────────────────────────

export default function QuizSystem({ moduleId }: { moduleId: string }) {
  const pathname = usePathname();
  const router   = useRouter();
  const locale   = pathname.split('/')[1] ?? 'th';
  const lang     = (locale === 'en' ? 'en' : 'th') as Language;
  const t        = useTranslations('quiz');
  const ui       = UI_STRINGS[lang];

  const [quiz, setQuiz] = useState<QuizDefinition | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [agent, setAgent] = useState<AgentSession | null>(null);
  const [activePhase, setActivePhase] = useState<number | null>(null);
  const [current,   setCurrent]   = useState(0);
  const [answered,  setAnswered]  = useState<Record<number, number>>({});
  const [finished,  setFinished]  = useState(false);
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    setAgent(getAgentSession());
    
    // Fetch latest quiz definition
    setLoadingConfig(true);
    fetch(`/api/quiz/config?moduleId=${moduleId}`)
      .then(r => r.json())
      .then(d => {
        if (d.config) setQuiz(d.config);
        else setQuiz(MODULE_QUIZ_MAP[moduleId] || null); // Fallback to hardcoded if not in DB
      })
      .catch(() => setQuiz(MODULE_QUIZ_MAP[moduleId] || null))
      .finally(() => setLoadingConfig(false));
  }, [moduleId]);

  const filteredQuestions = useMemo(() => {
    if (!quiz) return [];
    return activePhase === null
      ? quiz.questions
      : quiz.questions.filter(q => q.phase === activePhase);
  }, [quiz, activePhase]);

  const total = filteredQuestions.length;

  useEffect(() => {
    if (!finished || !agent || !quiz || activePhase !== null) return;
    
    setSaving(true);
    const allQuestions = quiz.questions ?? [];
    const allTotal = allQuestions.length;
    const score = allQuestions.filter((q, i) => answered[i] === q.correctIdx).length;
    
    fetch('/api/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        moduleId, 
        agentId: agent.id, 
        agentName: agent.name,
        score,
        totalQuestions: allTotal,
        passed: score / allTotal >= (quiz.passThreshold ?? PASS_THRESHOLD),
      }),
    }).finally(() => {
      // Small artificial delay for UX feel
      setTimeout(() => setSaving(false), 800);
    });
  }, [finished, agent, quiz, activePhase, answered, moduleId]);

  const handlePhaseFilter = useCallback((phase: number | null) => {
    setActivePhase(phase);
    setCurrent(0);
    setAnswered({});
    setFinished(false);
  }, []);

  const handleAnswer = useCallback((choiceIdx: number) => {
    setAnswered(prev => ({ ...prev, [current]: choiceIdx }));
  }, [current]);

  const handleNext = useCallback(() => {
    if (current === total - 1) {
      setFinished(true);
    } else {
      setCurrent(c => c + 1);
    }
  }, [current, total]);

  const handlePrev = useCallback(() => {
    if (current > 0) setCurrent(c => c - 1);
  }, [current]);

  const handleRestart = useCallback(() => {
    setCurrent(0);
    setAnswered({});
    setFinished(false);
  }, []);

  if (!quiz) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-72px)] bg-[#F5F4F0]">
        <motion.div variants={FADE_IN} initial="initial" animate="animate" className="text-center">
          <AlertCircle className="mx-auto mb-4 text-muted-foreground opacity-20" size={48} />
          <p style={{ color: C.muted, fontWeight: 600 }}>
            {t('notFound')}
          </p>
        </motion.div>
      </div>
    );
  }

  const phases      = quiz.phases ?? [];
  const currentQ    = filteredQuestions[current];
  const isAnswered  = answered[current] !== undefined;
  const isLastQ     = current === total - 1;
  const progressPct = total > 0 ? Math.round(((current + 1) / total) * 100) : 0;

  const qPhaseIdx   = currentQ?.phase ?? 0;
  const qPhase      = phases[qPhaseIdx];
  const phaseColor  = qPhase?.color  ?? C.hint;
  const phaseLight  = qPhase?.light  ?? '#E2E0DA33';
  const phaseName   = qPhase?.name?.[lang] ?? '';

  return (
    <div
      className="min-h-[calc(100dvh-56px)] py-10 px-4 selection:bg-slate-200"
      style={{ background: C.bg, fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="max-w-[680px] mx-auto">
        <AnimatePresence mode="wait">
          {finished ? (
            <ResultView
              key="results"
              questions={filteredQuestions}
              answered={answered}
              lang={lang}
              quiz={quiz}
              onRestart={handleRestart}
              onDashboard={() => router.push(`/${locale}/dashboard`)}
              isPractice={activePhase !== null}
            />
          ) : (
            <motion.div 
              key="quiz-body"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={TRANSITION.base}
            >
              <QuizHeader
                quiz={quiz}
                lang={lang}
                progressPct={progressPct}
                phases={phases}
                activePhase={activePhase}
                onPhaseFilter={handlePhaseFilter}
                onBack={() => router.push(`/${locale}/quiz`)}
                finished={finished}
              />

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

              <div className="flex items-center justify-between mt-6">
                <motion.button
                  disabled={current === 0}
                  onClick={handlePrev}
                  whileHover={current > 0 ? { x: -2 } : {}}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold border transition-all disabled:opacity-20 bg-white shadow-sm flex items-center gap-2"
                  style={{ color: C.text, borderColor: C.border }}
                >
                  {ui.prev}
                </motion.button>

                <div className="px-4 py-1.5 rounded-lg bg-white/40 border border-white/60">
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 700, color: C.muted }}>
                    {current + 1} <span style={{ opacity: 0.3 }}>/</span> {total}
                  </span>
                </div>

                <motion.button
                  disabled={!isAnswered}
                  onClick={handleNext}
                  whileHover={isAnswered ? { x: 2 } : {}}
                  className="px-6 py-2.5 rounded-xl text-sm font-black border transition-all disabled:opacity-20 shadow-md min-w-[120px]"
                  style={{
                    background: isAnswered ? C.text : C.surface,
                    color:      isAnswered ? '#fff' : C.text,
                    borderColor: isAnswered ? C.text : C.border,
                  }}
                >
                  {isLastQ ? ui.seeResults : ui.next}
                </motion.button>
              </div>

              {saving && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-2 mt-8"
                >
                  <Loader2 size={12} className="animate-spin text-muted-foreground" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {t('syncing')}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
