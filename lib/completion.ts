import type { AgentStats } from '@/types';

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

export const REQUIRED_QUIZZES = ['foundation', 'product', 'process', 'payment'];
export const REQUIRED_LEARN   = ['product', 'kyc', 'website'];

export function getCompletionStatus(stats: AgentStats, activeScenariosCount?: number): CompletionInfo {
  const quizComplete = REQUIRED_QUIZZES.every(id => !!stats.quiz[id]?.passed);
  const learnComplete = (stats.learnedModules?.length ?? 0) >= 1;
  
  // AI Eval is done if they have completed all available levels
  // We determine 'all levels' by looking at the highest level number among active scenarios
  const completedLevels = stats.evalCompletedLevels ?? [];
  const hasHistory = (stats.aiEval?.count ?? 0) > 0;
  
  // Fallback: If no levels are tracked, one session is enough.
  // If levels are tracked, they need to have reached the 'max' level (usually 4).
  // We'll consider it done if they have at least level 4 (or the highest level) completed.
  let aiEvalDone = false;
  if (completedLevels.length > 0) {
    const maxLevelReached = Math.max(...completedLevels);
    // Standard training has 4 levels. 
    aiEvalDone = maxLevelReached >= 4; 
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
