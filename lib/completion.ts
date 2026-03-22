import type { AgentStats } from '@/types';

export type CompletionStatus = 'cleared' | 'needs-eval' | 'in-progress' | 'not-started';

export interface CompletionInfo {
  trainingComplete: boolean;
  evaluated: boolean;
  status: CompletionStatus;
  /** true if all 3 quizzes passed */
  quizComplete: boolean;
  /** true if at least one AI eval session done */
  aiEvalDone: boolean;
  /** latest human eval score, or null */
  latestEvalScore: number | null;
}

export function getCompletionStatus(stats: AgentStats): CompletionInfo {
  const quizComplete =
    !!stats.quiz.foundation?.passed &&
    !!stats.quiz.product?.passed &&
    !!stats.quiz.process?.passed;

  const aiEvalDone = (stats.aiEval?.count ?? 0) > 0;

  const trainingComplete = quizComplete && aiEvalDone;
  const humanEvals = stats.humanEvaluations ?? [];
  const evaluated = humanEvals.length > 0;
  const latestEvalScore = evaluated ? humanEvals[0].totalScore : null;

  const status: CompletionStatus =
    trainingComplete && evaluated ? 'cleared' :
    trainingComplete              ? 'needs-eval' :
    !!stats.lastActive            ? 'in-progress' :
                                    'not-started';

  return { trainingComplete, evaluated, status, quizComplete, aiEvalDone, latestEvalScore };
}
