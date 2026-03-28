import type { AgentStats } from '@/types';
import { StepId } from '@/constants/training';

export interface StepState { 
  locked: boolean; 
  passed: boolean; 
  score?: number; 
}

export function scoreColor(n: number) { 
  return n >= 70 ? '#60A5FA' : n >= 50 ? '#FBBF24' : '#F87171'; 
}

/**
 * deriveSteps: The central "Source of Truth" for agent progression.
 * Calculates pass/fail/lock status for each training phase.
 */
export function deriveSteps(stats: AgentStats | null): Record<StepId, StepState> {
  // 1. Learn Phase: Pass if 1 or more modules are learned
  const learnedCount = stats?.learnedModules?.length ?? 0;
  const isLearnPassed = learnedCount >= 1;
  
  // 2. Quiz Phase: Pass if all required quizzes are passed
  const REQUIRED = ['foundation', 'product', 'process', 'payment'];
  const allQ = REQUIRED.every(id => !!stats?.quiz?.[id]?.passed);
  
  const qs = REQUIRED
    .map(id => stats?.quiz?.[id]?.bestScore)
    .filter((s): s is number => s !== undefined);
  
  const avgQ = qs.length ? Math.round(qs.reduce((a, b) => a + b, 0) / qs.length) : undefined;

  // 3. AI Eval Phase: Pass if level 4 or higher is completed
  const completedLevels = stats?.evalCompletedLevels ?? [];
  const maxL = completedLevels.length > 0 ? Math.max(...completedLevels) : 0;
  const aiOk = maxL >= 4;
  
  let aiScore = stats?.aiEval ? Math.round(stats.aiEval.avgScore) : undefined;
  if (completedLevels.length > 0) {
     aiScore = Math.min(100, maxL * 25);
  }

  const results: Record<StepId, StepState> = {
    learn: { 
      locked: false, 
      passed: isLearnPassed, 
      score: stats?.learnedModules && stats.learnedModules.length > 0 
        ? Math.min(100, Math.round((stats.learnedModules.length / 1) * 100)) 
        : undefined 
    },
    quiz: { 
      locked: !isLearnPassed, 
      passed: allQ, 
      score: avgQ 
    },
    'ai-eval': { 
      locked: !allQ, 
      passed: aiOk, 
      score: aiScore 
    },
  };

  return results;
}
