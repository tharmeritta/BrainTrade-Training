'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Trophy, BookOpen, RotateCcw, ArrowRight, LayoutDashboard, ChevronLeft } from 'lucide-react';
import {
  MODULE_QUIZ_MAP, UI_STRINGS, PASS_THRESHOLD,
  type Language, type QuizDefinition, type QuestionData,
} from '@/lib/quiz-data';

// ─── Option label helper (A B C D) ───────────────────────────────────────────
const LABELS = ['A', 'B', 'C', 'D'];

// ─── Result Screen ────────────────────────────────────────────────────────────
function ResultScreen({
  score, total, lang, agentName, quiz, onRestart, onDashboard,
}: {
  score: number; total: number; lang: Language;
  agentName: string; quiz: QuizDefinition;
  onRestart: () => void; onDashboard: () => void;
}) {
  const ui = UI_STRINGS[lang];
  const ov = quiz.uiOverrides;
  const ratio = score / total;
  const passed = ratio >= PASS_THRESHOLD;
  const pct = Math.round(ratio * 100);

  const title   = ov?.finishTitle?.[lang]   ?? ui.finishTitle;
  const sub     = ov?.finishSub?.[lang]     ?? ui.finishSub;
  const message = ratio >= 0.8
    ? (ov?.feedbackHigh?.[lang] ?? ui.msgHigh)
    : ratio >= PASS_THRESHOLD
    ? (ov?.feedbackMid?.[lang]  ?? ui.msgMed)
    : (ov?.feedbackLow?.[lang]  ?? ui.msgLow);

  const scoreLabel = ov?.scoreLabel?.[lang] ?? ui.scoreLabel;

  return (
    <motion.div
      className="w-full max-w-lg mx-auto"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Score card */}
      <div className="relative rounded-3xl overflow-hidden border p-8 text-center mb-4"
        style={{
          background: passed ? 'rgba(52,211,153,0.05)' : 'rgba(248,113,113,0.05)',
          borderColor: passed ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)',
        }}>
        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: passed
              ? 'radial-gradient(circle at 50% 0%, rgba(52,211,153,0.08) 0%, transparent 65%)'
              : 'radial-gradient(circle at 50% 0%, rgba(248,113,113,0.08) 0%, transparent 65%)',
          }} />

        {/* Icon */}
        <motion.div
          className="relative w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center"
          style={{ background: passed ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.12)' }}
          initial={{ scale: 0.5 }} animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 18 }}
        >
          {passed
            ? <Trophy size={38} style={{ color: '#34D399' }} />
            : <XCircle size={38} style={{ color: '#F87171' }} />}
        </motion.div>

        {/* Pass/Fail badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3"
          style={{
            background: passed ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.1)',
            border: passed ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(248,113,113,0.25)',
            color: passed ? '#34D399' : '#F87171',
          }}>
          {passed ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
          {passed ? ui.passed : ui.failed}
        </div>

        <h2 className="text-2xl font-black mb-1 text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mb-5">{ui.hello}, {agentName}! — {sub}</p>

        {/* Score ring */}
        <div className="relative w-32 h-32 mx-auto mb-5">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8"
              className="text-border opacity-40" />
            <motion.circle
              cx="50" cy="50" r="42" fill="none"
              stroke={passed ? '#34D399' : '#F87171'}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - ratio) }}
              transition={{ delay: 0.3, duration: 1.1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-foreground">{pct}%</span>
            <span className="text-xs text-muted-foreground mt-0.5">{score}/{total}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{scoreLabel}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">{message}</p>
        <p className="text-xs text-muted-foreground mt-2 opacity-60">{ui.passThreshold}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onRestart}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm border transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
        >
          <RotateCcw size={15} /> {ui.tryAgain}
        </button>
        <button
          onClick={onDashboard}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #00B4D8, #0055F0)',
            color: '#fff',
            boxShadow: '0 6px 20px rgba(0,180,216,0.22)',
          }}
        >
          <LayoutDashboard size={15} /> {ui.backToHome}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Question Card ────────────────────────────────────────────────────────────
function QuestionCard({
  question, index, total, lang, score,
  scoreLabel, onAnswer,
}: {
  question: QuestionData; index: number; total: number;
  lang: Language; score: number; scoreLabel: string;
  onAnswer: (val: string, idx: number) => void;
}) {
  const ui = UI_STRINGS[lang];
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; msg: string } | null>(null);
  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const pct = (index / total) * 100;

  // reset when question changes
  useEffect(() => {
    setSelected(null);
    setLocked(false);
    setFeedback(null);
    setInputVal('');
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [index]);

  function submit(val: string, btnIdx: number) {
    if (locked) return;
    setLocked(true);
    setSelected(btnIdx);

    let correct = false;
    let correctDisplay = '';

    if (question.type === 'tf') {
      correct = val === question.a;
      correctDisplay = question.a === 'true' ? ui.trueTxt : ui.falseTxt;
    } else if (question.type === 'mcq') {
      const opts = question.options?.[lang] ?? [];
      correctDisplay = opts[question.correctIdx ?? 0];
      correct = val === correctDisplay;
    } else if (question.type === 'fill') {
      correct = val.trim().toLowerCase() === (question.a ?? '').toLowerCase();
      correctDisplay = question.a ?? '';
    }

    setFeedback({
      correct,
      msg: correct ? ui.correct : `${ui.incorrect} ${correctDisplay}`,
    });

    setTimeout(() => onAnswer(val, btnIdx), 1600);
  }

  const opts = question.type === 'mcq'
    ? (question.options?.[lang] ?? [])
    : question.type === 'tf'
    ? [ui.trueTxt, ui.falseTxt]
    : [];

  const tfValues = [ui.trueTxt, ui.falseTxt].map((_, i) => i === 0 ? 'true' : 'false');

  return (
    <motion.div
      key={index}
      className="w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -32 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">
          {ui.qLabel} {index + 1}/{total}
        </span>
        <span className="text-xs font-semibold text-muted-foreground">
          {scoreLabel}: <span className="text-foreground font-black">{score}</span>
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full mb-6 overflow-hidden bg-border">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #00B4D8, #7C3AED)' }}
          initial={{ width: `${(index / total) * 100}%` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Question */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-4 shadow-sm">
        <p className="text-base font-semibold text-foreground leading-relaxed">{question[lang]}</p>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {question.type !== 'fill' && opts.map((label, i) => {
          const val = question.type === 'tf' ? tfValues[i] : label;
          const isSel = selected === i;
          const isCorrectOpt = question.type === 'tf'
            ? val === question.a
            : i === question.correctIdx;

          let borderColor = 'var(--border)';
          let bg = 'var(--card)';
          let textColor = 'var(--foreground)';

          if (locked && isSel && feedback?.correct)   { borderColor = '#34D399'; bg = 'rgba(52,211,153,0.08)'; textColor = '#34D399'; }
          if (locked && isSel && !feedback?.correct)  { borderColor = '#F87171'; bg = 'rgba(248,113,113,0.08)'; textColor = '#F87171'; }
          if (locked && !isSel && isCorrectOpt)        { borderColor = '#34D39980'; bg = 'rgba(52,211,153,0.04)'; }

          return (
            <motion.button
              key={i}
              onClick={() => submit(val, i)}
              disabled={locked}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all text-sm font-medium"
              style={{ borderColor, background: bg, color: textColor }}
              whileHover={!locked ? { scale: 1.01 } : {}}
              whileTap={!locked ? { scale: 0.98 } : {}}
            >
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                style={{ background: isSel ? borderColor : 'var(--secondary)', color: isSel ? '#fff' : 'var(--muted-foreground)' }}>
                {LABELS[i]}
              </span>
              <span className="flex-1">{label}</span>
              {locked && isSel && feedback?.correct && <CheckCircle2 size={16} style={{ color: '#34D399' }} />}
              {locked && isSel && !feedback?.correct  && <XCircle size={16} style={{ color: '#F87171' }} />}
              {locked && !isSel && isCorrectOpt        && <CheckCircle2 size={16} style={{ color: '#34D399', opacity: 0.7 }} />}
            </motion.button>
          );
        })}

        {question.type === 'fill' && (
          <div className="space-y-3">
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              disabled={locked}
              placeholder={ui.placeholder}
              onKeyDown={e => { if (e.key === 'Enter' && inputVal.trim()) submit(inputVal, 0); }}
              className="w-full px-4 py-3 rounded-xl border-2 text-sm font-medium outline-none transition-all bg-card text-foreground"
              style={{ borderColor: locked ? (feedback?.correct ? '#34D399' : '#F87171') : 'var(--border)' }}
            />
            <button
              onClick={() => submit(inputVal, 0)}
              disabled={locked || !inputVal.trim()}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #00B4D8, #0055F0)', color: '#fff' }}
            >
              {ui.submit} <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold"
            style={{
              background: feedback.correct ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.08)',
              border: feedback.correct ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(248,113,113,0.25)',
              color: feedback.correct ? '#34D399' : '#F87171',
            }}
          >
            {feedback.correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {feedback.msg}
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

  const quiz = MODULE_QUIZ_MAP[moduleId];

  const [agentId,   setAgentId]   = useState<string | null>(null);
  const [agentName, setAgentName] = useState<string | null>(null);
  const [idx,       setIdx]       = useState(0);
  const [score,     setScore]     = useState(0);
  const [finished,  setFinished]  = useState(false);
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    setAgentId(localStorage.getItem('brainstrade_agent_id'));
    setAgentName(localStorage.getItem('brainstrade_agent_name'));
  }, []);

  const ui = UI_STRINGS[lang];

  // Save result when quiz finishes
  useEffect(() => {
    if (!finished || !agentId) return;
    setSaving(true);
    const total = quiz.questions.length;
    fetch('/api/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        moduleId, agentId, agentName,
        score, totalQuestions: total,
        passed: score / total >= PASS_THRESHOLD,
      }),
    }).finally(() => setSaving(false));
  }, [finished]);

  function handleAnswer(_val: string, _btnIdx: number) {
    // Determine correct answer for scoring
    const q = quiz.questions[idx];
    let correct = false;
    if (q.type === 'tf') correct = _val === q.a;
    else if (q.type === 'mcq') {
      const opts = q.options?.[lang] ?? [];
      correct = _val === opts[q.correctIdx ?? 0];
    } else if (q.type === 'fill') correct = _val.trim().toLowerCase() === (q.a ?? '').toLowerCase();

    if (correct) setScore(s => s + 1);

    if (idx < quiz.questions.length - 1) {
      setIdx(i => i + 1);
    } else {
      setFinished(true);
    }
  }

  function handleRestart() {
    setIdx(0);
    setScore(0);
    setFinished(false);
  }

  // Unknown module
  if (!quiz) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <BookOpen size={48} className="mx-auto mb-4 text-muted-foreground opacity-40" />
        <p className="text-muted-foreground">ไม่พบข้อมูลแบบทดสอบสำหรับโมดูลนี้</p>
      </div>
    );
  }

  const scoreLabel = quiz.uiOverrides?.scoreLabel?.[lang] ?? ui.scoreLabel;
  const total = quiz.questions.length;

  if (finished) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <ResultScreen
          score={score} total={total} lang={lang}
          agentName={agentName ?? ''}
          quiz={quiz}
          onRestart={handleRestart}
          onDashboard={() => router.push(`/${locale}/dashboard`)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Quiz title header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <button
          onClick={() => router.push(`/${locale}/quiz`)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ChevronLeft size={14} />
          {lang === 'th' ? 'เลือกแบบทดสอบ' : 'All Assessments'}
        </button>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={16} className="text-primary" />
          <span className="text-xs font-bold text-primary uppercase tracking-widest">
            {quiz.title[lang]}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{quiz.description[lang]}</p>
      </motion.div>

      <AnimatePresence mode="wait">
        <QuestionCard
          key={idx}
          question={quiz.questions[idx]}
          index={idx}
          total={total}
          lang={lang}
          score={score}
          scoreLabel={scoreLabel}
          onAnswer={handleAnswer}
        />
      </AnimatePresence>
    </div>
  );
}
