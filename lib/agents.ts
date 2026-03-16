import { gcsGetAll } from './gcs';
import type { Agent, AgentStats, ModuleStat } from '@/types';

const MODULES = ['product', 'process', 'payment'] as const;

// ── Score helpers ─────────────────────────────────────────────────────────

export function computeBadge(score: number): AgentStats['badge'] {
  if (score >= 85) return 'elite';
  if (score >= 70) return 'strong';
  if (score >= 50) return 'developing';
  return 'needs-work';
}

export function computeOverallScore(stats: Omit<AgentStats, 'overallScore' | 'badge'> & { evalCompletedLevels?: number[] }): number {
  const quizScores    = MODULES.map(m => stats.quiz[m]?.bestScore ?? 0);
  const avgQuiz       = quizScores.reduce((a, b) => a + b, 0) / 3;
  const aiEval        = stats.aiEval?.avgScore ?? 0;
  // Pitch: use completed level count (out of 3) if available, else highest started level
  const pitchLevels   = (stats.pitch as (typeof stats.pitch & { completedLevels?: number[] }) | null)?.completedLevels;
  const pitchScore    = pitchLevels && pitchLevels.length > 0
    ? (pitchLevels.length / 3) * 100
    : stats.pitch ? (stats.pitch.highestLevel / 3) * 100 : 0;
  // Eval: completed levels out of 4
  const evalLevels    = stats.evalCompletedLevels ?? [];
  const evalScore     = evalLevels.length > 0 ? (evalLevels.length / 4) * 100 : aiEval;
  return Math.round(avgQuiz * 0.4 + evalScore * 0.3 + pitchScore * 0.2 + aiEval * 0.1);
}

// ── Data types matching GCS records ───────────────────────────────────────

interface QuizRecord     { id: string; agentId: string; moduleId: string; score: number; totalQuestions: number; passed: boolean; timestamp: string; }
interface EvalRecord     { id: string; agentId: string; score: number; timestamp: string; }
interface PitchRecord    { id: string; agentId: string; level: number; timestamp: string; }
interface ProgressRecord { agentId: string; pitchCompletedLevels: number[]; evalCompletedLevels: number[]; evalSavedLevel: number | null; updatedAt: string; }

// ── Analytics ─────────────────────────────────────────────────────────────

export async function getAllAgentStats(): Promise<AgentStats[]> {
  const [agents, quizDocs, evalDocs, pitchDocs, progressDocs] = await Promise.all([
    gcsGetAll<Agent & { id: string }>('agents'),
    gcsGetAll<QuizRecord>('quiz_results'),
    gcsGetAll<EvalRecord>('ai_eval_logs'),
    gcsGetAll<PitchRecord>('pitch_sessions'),
    gcsGetAll<ProgressRecord>('agent_progress'),
  ]);

  const activeAgents = agents.filter(a => a.active);

  return activeAgents.map(agent => {
    // Quiz per module
    const quiz: AgentStats['quiz'] = {};
    for (const mod of MODULES) {
      const results = quizDocs.filter(r => r.agentId === agent.id && r.moduleId === mod);
      if (results.length > 0) {
        quiz[mod] = {
          bestScore: Math.max(...results.map(r => Math.round((r.score / r.totalQuestions) * 100))),
          passed:    results.some(r => r.passed),
          attempts:  results.length,
        };
      }
    }

    // AI Eval
    const evals  = evalDocs.filter(e => e.agentId === agent.id);
    const aiEval = evals.length > 0
      ? { avgScore: Math.round(evals.reduce((s, e) => s + e.score, 0) / evals.length), count: evals.length }
      : null;

    // Pitch — prefer completed levels from agent_progress (more accurate than session starts)
    const progress       = progressDocs.find(p => p.agentId === agent.id);
    const pitches        = pitchDocs.filter(p => p.agentId === agent.id);
    const pitchCompleted = progress?.pitchCompletedLevels ?? [];
    const highestPitch   = pitchCompleted.length > 0
      ? Math.max(...pitchCompleted)
      : pitches.length > 0 ? Math.max(...pitches.map(p => p.level)) : 0;
    const pitch = (pitches.length > 0 || pitchCompleted.length > 0)
      ? { highestLevel: highestPitch, sessionCount: pitches.length, completedLevels: pitchCompleted }
      : null;

    // AI Eval completed levels (from agent_progress)
    const evalCompleted = progress?.evalCompletedLevels ?? [];

    // Last active (ISO strings — direct comparison works)
    const allTimes = [
      ...quizDocs.filter(r => r.agentId === agent.id),
      ...evalDocs.filter(e => e.agentId === agent.id),
      ...pitchDocs.filter(p => p.agentId === agent.id),
    ].map(r => r.timestamp).filter(Boolean).sort();
    const lastActive = allTimes.length > 0 ? allTimes[allTimes.length - 1] : null;

    const partial      = { agent, quiz, aiEval, pitch, lastActive, evalCompletedLevels: evalCompleted };
    const overallScore = computeOverallScore(partial);
    return { ...partial, overallScore, badge: computeBadge(overallScore) };
  });
}

export async function getModuleStats(): Promise<ModuleStat[]> {
  const [agents, quizDocs, evalDocs, progressDocs] = await Promise.all([
    gcsGetAll<Agent & { id: string }>('agents'),
    gcsGetAll<QuizRecord>('quiz_results'),
    gcsGetAll<EvalRecord>('ai_eval_logs'),
    gcsGetAll<ProgressRecord>('agent_progress'),
  ]);

  const active = agents.filter((a: Agent & { id: string }) => a.active);
  const total  = active.length;

  if (total === 0) {
    return [
      { moduleId: 'learn',   label: 'Learn',   avgScore: 0, passCount: 0, totalAttempts: 0 },
      { moduleId: 'quiz',    label: 'Quiz',    avgScore: 0, passCount: 0, totalAttempts: 0 },
      { moduleId: 'ai-eval', label: 'AI Eval', avgScore: 0, passCount: 0, totalAttempts: 0 },
      { moduleId: 'pitch',   label: 'Pitch',   avgScore: 0, passCount: 0, totalAttempts: 0 },
    ];
  }

  const pct = (n: number) => Math.round((n / total) * 100);

  // Learn — at least one quiz attempt (signals the agent engaged with study material)
  const learnCount = active.filter(a =>
    quizDocs.some(q => q.agentId === a.id)
  ).length;

  // Quiz — passed all 3 modules (Product, Process, Payment)
  const quizCount = active.filter(a =>
    MODULES.every(m =>
      quizDocs.filter(q => q.agentId === a.id && q.moduleId === m).some(q => q.passed)
    )
  ).length;

  // AI Eval — completed at least one session
  const evalCount = active.filter(a =>
    evalDocs.some(e => e.agentId === a.id)
  ).length;

  // Pitch — completed all 3 levels
  const pitchCount = active.filter(a => {
    const prog = progressDocs.find(p => p.agentId === a.id);
    return prog ? prog.pitchCompletedLevels.length >= 3 : false;
  }).length;

  return [
    { moduleId: 'learn',   label: 'Learn',   avgScore: pct(learnCount), passCount: learnCount, totalAttempts: total },
    { moduleId: 'quiz',    label: 'Quiz',    avgScore: pct(quizCount),  passCount: quizCount,  totalAttempts: total },
    { moduleId: 'ai-eval', label: 'AI Eval', avgScore: pct(evalCount),  passCount: evalCount,  totalAttempts: total },
    { moduleId: 'pitch',   label: 'Pitch',   avgScore: pct(pitchCount), passCount: pitchCount, totalAttempts: total },
  ];
}
