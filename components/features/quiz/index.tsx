'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, BookOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FADE_IN } from '@/lib/animations';
import {
  MODULE_QUIZ_MAP, PASS_THRESHOLD,
  type Language, type QuizDefinition, type QuestionData,
} from '@/lib/quiz-data';
import { getAgentSession, type AgentSession } from '@/lib/agent-session';
import { C, isAnswerCorrect } from './shared';
import type { Screen, SessionMode } from './types';
import { QuizBriefing } from './QuizBriefing';
import { QuizSession } from './QuizSession';
import { QuizResult } from './QuizResult';

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function QuizSkeleton() {
  return (
    <div className="min-h-[calc(100dvh-56px)] py-10 px-4" style={{ background: C.bg }}>
      <div className="max-w-[680px] mx-auto animate-pulse">
        <div className="h-5 w-40 rounded-full bg-[#E2E0DA] mb-8" />
        <div className="h-7 w-2/3 rounded-lg bg-[#E2E0DA] mb-3" />
        <div className="h-4 w-1/2 rounded-lg bg-[#E2E0DA] mb-8" />
        <div className="h-32 rounded-3xl bg-white border border-[#E2E0DA] mb-3" />
        <div className="h-16 rounded-2xl bg-white border border-[#E2E0DA] mb-2" />
        <div className="h-16 rounded-2xl bg-white border border-[#E2E0DA] mb-2" />
        <div className="h-16 rounded-2xl bg-white border border-[#E2E0DA]" />
      </div>
    </div>
  );
}

// ─── QuizSystem ───────────────────────────────────────────────────────────────
//
// State machine and screen router. Owns all session state and handlers.
// Does not contain any UI — edit the three screen files instead:
//   QuizBriefing.tsx  — mode selection
//   QuizSession.tsx   — active quiz
//   QuizResult.tsx    — score & answer key

export default function QuizSystem({ moduleId }: { moduleId: string }) {
  const pathname = usePathname();
  const router   = useRouter();
  const locale   = pathname.split('/')[1] ?? 'th';
  const lang     = (locale === 'en' ? 'en' : 'th') as Language;
  const t        = useTranslations('quiz');

  // ── Config & agent ──
  const [quiz,             setQuiz]            = useState<QuizDefinition | null>(null);
  const [loadingConfig,    setLoadingConfig]    = useState(true);
  const [agent,            setAgent]           = useState<AgentSession | null>(null);
  const [showLockedModal,  setShowLockedModal]  = useState(false);

  // ── Session state ──
  const [screen,      setScreen]      = useState<Screen>('briefing');
  const [sessionMode, setSessionMode] = useState<SessionMode>({ type: 'full' });
  const [current,     setCurrent]     = useState(0);
  const [answered,    setAnswered]    = useState<Record<number, number>>({});
  const [fillAnswers, setFillAnswers] = useState<Record<number, string>>({});
  const [saving,      setSaving]      = useState(false);

  useEffect(() => {
    const session = getAgentSession();
    setAgent(session);
    setLoadingConfig(true);

    if (session) {
      // Check learned modules — show prompt if none completed yet
      fetch(`/api/agent/progress?agentId=${encodeURIComponent(session.id)}`)
        .then(r => r.json())
        .then(d => {
          const learned = d.stats?.learnedModules ?? [];
          if (learned.length === 0) setShowLockedModal(true);
        })
        .catch(() => {});
    }

    fetch(`/api/quiz/config?moduleId=${moduleId}`)
      .then(r => r.json())
      .then(d => {
        if (d.config) setQuiz(d.config);
        else          setQuiz(MODULE_QUIZ_MAP[moduleId] || null);
      })
      .catch(() => setQuiz(MODULE_QUIZ_MAP[moduleId] || null))
      .finally(() => setLoadingConfig(false));
  }, [moduleId, locale, router]);

  // The questions shown in the current session, derived from sessionMode
  const filteredQuestions = useMemo(() => {
    if (!quiz) return [];
    switch (sessionMode.type) {
      case 'full':
      case 'practice-all': return quiz.questions;
      case 'phase':        return quiz.questions.filter(q => (q.phase ?? 0) === sessionMode.phaseIdx);
      case 'retry':        return sessionMode.questions;
    }
  }, [quiz, sessionMode]);

  const isPractice = sessionMode.type !== 'full';

  // Submit to backend only when a scored full assessment finishes
  useEffect(() => {
    if (screen !== 'result' || isPractice || !agent || !quiz) return;

    setSaving(true);
    const allTotal = quiz.questions.length;
    const score    = quiz.questions.filter((q, i) =>
      answered[i] !== undefined && isAnswerCorrect(q, answered[i]),
    ).length;

    fetch('/api/quiz/submit', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        moduleId,
        agentId:        agent.id,
        agentName:      agent.name,
        score,
        totalQuestions: allTotal,
        passed:         score / allTotal >= (quiz.passThreshold ?? PASS_THRESHOLD),
      }),
    }).finally(() => {
      setTimeout(() => setSaving(false), 800);
    });
  }, [screen, isPractice, agent, quiz, answered, moduleId]);

  // ── Handlers ──

  const handleStart = useCallback((mode: SessionMode) => {
    setSessionMode(mode);
    setCurrent(0);
    setAnswered({});
    setFillAnswers({});
    setScreen('quiz');
  }, []);

  const handleAnswer = useCallback((idx: number) => {
    setAnswered(prev => ({ ...prev, [current]: idx }));
  }, [current]);

  const handleFillText = useCallback((text: string) => {
    setFillAnswers(prev => ({ ...prev, [current]: text }));
  }, [current]);

  const handleNext = useCallback(() => {
    if (current === filteredQuestions.length - 1) setScreen('result');
    else setCurrent(c => c + 1);
  }, [current, filteredQuestions.length]);

  const handlePrev = useCallback(() => {
    if (current > 0) setCurrent(c => c - 1);
  }, [current]);

  const handleRestart = useCallback(() => {
    setScreen('briefing');
    setCurrent(0);
    setAnswered({});
    setFillAnswers({});
    setSessionMode({ type: 'full' });
  }, []);

  const handleRetryWrong = useCallback((wrongQuestions: QuestionData[]) => {
    setSessionMode({ type: 'retry', questions: wrongQuestions });
    setCurrent(0);
    setAnswered({});
    setFillAnswers({});
    setScreen('quiz');
  }, []);

  const handleJump = useCallback((index: number) => setCurrent(index), []);

  // ── Render ──

  if (loadingConfig) return <QuizSkeleton />;

  if (!quiz) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-72px)] bg-[#F5F4F0]">
        <motion.div variants={FADE_IN} initial="initial" animate="animate" className="text-center">
          <AlertCircle className="mx-auto mb-4 text-muted-foreground opacity-20" size={48} />
          <p style={{ color: C.muted, fontWeight: 600 }}>{t('notFound')}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
    <AnimatePresence mode="wait">

      {screen === 'briefing' && (
        <QuizBriefing
          key="briefing"
          quiz={quiz}
          lang={lang}
          agentName={agent?.name || null}
          onBack={() => router.push(`/${locale}/quiz`)}
          onStart={handleStart}
        />
      )}

      {screen === 'quiz' && (
        <QuizSession
          key="quiz"
          quiz={quiz}
          lang={lang}
          filteredQuestions={filteredQuestions}
          current={current}
          answered={answered}
          fillAnswers={fillAnswers}
          sessionMode={sessionMode}
          saving={saving}
          agentName={agent?.name || null}
          onBack={() => setScreen('briefing')}
          onAnswer={handleAnswer}
          onFillText={handleFillText}
          onNext={handleNext}
          onPrev={handlePrev}
          onJump={handleJump}
        />
      )}

      {screen === 'result' && (
        <QuizResult
          key="result"
          quiz={quiz}
          lang={lang}
          filteredQuestions={filteredQuestions}
          answered={answered}
          fillAnswers={fillAnswers}
          sessionMode={sessionMode}
          saving={saving}
          onRestart={handleRestart}
          onRetryWrong={handleRetryWrong}
          onDashboard={() => router.push(`/${locale}/dashboard`)}
        />
      )}

    </AnimatePresence>

    {/* ── Learn-first prompt modal ─────────────────────────────────────────── */}
    <AnimatePresence>
      {showLockedModal && (
        <motion.div
          key="quiz-locked-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setShowLockedModal(false)}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="bg-card border border-border rounded-3xl p-7 w-full max-w-sm shadow-2xl shadow-black/20 text-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center mx-auto mb-4">
              <BookOpen size={26} className="text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-lg font-black text-foreground mb-2 tracking-tight">
              Complete a lesson first
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              You need to finish at least one learning module before taking a quiz. Head to the <strong className="text-foreground">Learn</strong> section to get started.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.push(`/${locale}/learn`)}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl text-sm font-black hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
              >
                Go to Learn
              </button>
              <button
                onClick={() => setShowLockedModal(false)}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
