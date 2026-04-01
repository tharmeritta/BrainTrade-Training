import type { AgentStats } from '@/types';
import { TRAINING_REGISTRY } from '@/lib/registry';

export type CompletionStatus = 'cleared' | 'needs-eval' | 'in-progress' | 'not-started';

export interface CompletionInfo {
  trainingComplete: boolean;
  evaluated: boolean;
  status: CompletionStatus;
  /** true if all required quizzes passed */
  quizComplete: boolean;
  /** true if all required learning modules viewed */
  learnComplete: boolean;
  /** true if at least one AI eval session done */
  aiEvalDone: boolean;
  /** latest human eval score, or null */
  latestEvalScore: number | null;
}

export function getCompletionStatus(stats: AgentStats, activeScenariosCount?: number): CompletionInfo {
  const { learn, quiz, eval: evaluation } = TRAINING_REGISTRY;

  // Quiz completion: Check if every required quiz is passed
  const quizComplete = quiz.required.every(id => !!stats.quiz[id]?.passed);

  // Learn completion: Business rule says they need at least N modules (minToUnlockNext)
  const learnComplete = (stats.learnedModules?.length ?? 0) >= learn.minToUnlockNext;
  
  // AI Eval completion: Check if they reached the required level
  const completedLevels = stats.evalCompletedLevels ?? [];
  const hasHistory = (stats.aiEval?.count ?? 0) > 0;
  
  let aiEvalDone = false;
  if (completedLevels.length > 0) {
    const maxLevelReached = Math.max(...completedLevels);
    aiEvalDone = maxLevelReached >= evaluation.requiredLevel; 
  } else {
    aiEvalDone = hasHistory;
  }

  const trainingComplete = quizComplete && learnComplete && aiEvalDone;
  const humanEvals = stats.humanEvaluations ?? [];
  const evaluated = humanEvals.length > 0;
  const latestEvalScore = evaluated ? humanEvals[0].totalScore : null;

  const status: CompletionStatus =
    trainingComplete && evaluated ? 'cleared' :
    trainingComplete              ? 'needs-eval' :
    !!stats.lastActive            ? 'in-progress' :
                                    'not-started';

  return { trainingComplete, evaluated, status, quizComplete, learnComplete, aiEvalDone, latestEvalScore };
}
