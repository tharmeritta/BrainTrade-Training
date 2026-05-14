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
  /** true if all required AI scenarios passed */
  aiEvalDone: boolean;
  /** latest human eval score, or null */
  latestEvalScore: number | null;
}

export interface CompletionConfig {
  requiredQuizIds?: readonly string[];
  requiredScenarioIds?: readonly string[];
}

/**
 * Calculates the training completion status for an agent.
 * Now supports dynamic requirements for quizzes and AI scenarios.
 */
export function getCompletionStatus(
  stats: AgentStats, 
  config?: CompletionConfig
): CompletionInfo {
  const { learn, quiz, eval: evaluation } = TRAINING_REGISTRY;

  // 1. Quiz completion: Check if every required quiz is passed
  // Fallback to registry if no dynamic list provided
  const requiredQuizzes = config?.requiredQuizIds || quiz.required;
  const quizComplete = requiredQuizzes.every(id => !!stats.quiz[id]?.passed);

  // 2. Learn completion: Business rule says they need at least N modules (minToUnlockNext)
  const learnComplete = (stats.learnedModules?.length ?? 0) >= learn.minToUnlockNext;
  
  // 3. AI Eval completion: Check passed scenarios or fallback to legacy level check
  let aiEvalDone = false;
  if (config?.requiredScenarioIds && config.requiredScenarioIds.length > 0) {
    // Dynamic check: must pass all scenarios marked as required in the DB
    aiEvalDone = config.requiredScenarioIds.every(id => stats.evalPassedScenarios?.includes(id));
  } else {
    // Legacy/Fallback check: reached the required level
    const completedLevels = stats.evalCompletedLevels ?? [];
    const maxLevelReached = completedLevels.length > 0 ? Math.max(...completedLevels) : 0;
    aiEvalDone = maxLevelReached >= evaluation.requiredLevel;
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

  return { 
    trainingComplete, 
    evaluated, 
    status, 
    quizComplete, 
    learnComplete, 
    aiEvalDone, 
    latestEvalScore 
  };
}
