import type { Language, QuizDefinition, QuestionData } from '@/lib/quiz-data';

export type Screen = 'briefing' | 'quiz' | 'result';

/**
 * Describes how the current quiz session was started.
 * - full:         all questions, score is submitted to backend
 * - phase:        filtered to one phase, practice only (not submitted)
 * - practice-all: all questions, practice only (not submitted)
 * - retry:        a pre-selected subset of wrong questions, practice only
 */
export type SessionMode =
  | { type: 'full' }
  | { type: 'phase'; phaseIdx: number }
  | { type: 'practice-all' }
  | { type: 'retry'; questions: QuestionData[] };

// ── Screen-level component props ──────────────────────────────────────────────

export interface QuizBriefingProps {
  quiz: QuizDefinition;
  lang: Language;
  agentName: string | null;
  onBack: () => void;
  onStart: (mode: SessionMode) => void;
}

export interface QuizSessionProps {
  quiz: QuizDefinition;
  lang: Language;
  filteredQuestions: QuestionData[];
  current: number;
  answered: Record<number, number>;
  fillAnswers: Record<number, string>;
  sessionMode: SessionMode;
  saving: boolean;
  agentName: string | null;
  onBack: () => void;
  onAnswer: (idx: number) => void;
  onFillText: (text: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onJump: (index: number) => void;
}

export interface QuizResultProps {
  quiz: QuizDefinition;
  lang: Language;
  filteredQuestions: QuestionData[];
  answered: Record<number, number>;
  fillAnswers: Record<number, string>;
  sessionMode: SessionMode;
  saving: boolean;
  onRestart: () => void;
  onRetryWrong: (wrongQuestions: QuestionData[]) => void;
  onDashboard: () => void;
}
