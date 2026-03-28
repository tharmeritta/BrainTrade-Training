import { fsGet as gcsGet, fsGetAll as gcsGetAll } from './firestore-db';
import type { Agent, AgentStats, ModuleStat, AgentEvaluation } from '@/types';
import { MOCKUP_AGENT_ID } from './agent-session';

const MODULES = ['foundation', 'product', 'process', 'payment'] as const;

// ── Score helpers ─────────────────────────────────────────────────────────

export function computeBadge(score: number): AgentStats['badge'] {
  if (score >= 85) return 'elite';
  if (score >= 70) return 'strong';
  if (score >= 50) return 'developing';
  return 'needs-work';
}

export function computeOverallScore(stats: Omit<AgentStats, 'overallScore' | 'badge'> & { evalCompletedLevels?: number[]; evalPassedScenarios?: string[]; activeScenariosCount?: number }): number {
  const quizScores    = MODULES.map(m => stats.quiz[m]?.bestScore ?? 0);
  const avgQuiz       = quizScores.reduce((a, b) => a + b, 0) / MODULES.length;
  const aiEval        = stats.aiEval?.avgScore ?? 0;
  
  // Eval progress: 25% per level reached (up to Level 4)
  const levels        = stats.evalCompletedLevels ?? [];
  const maxL          = levels.length > 0 ? Math.max(...levels) : 0;
  const evalScore     = maxL >= 4 ? 100 : Math.min(aiEval, maxL * 25);
  
  // New Weighting: Quiz 40%, Human Eval 30%, AI Eval 30%
  // Note: For training progress before human evaluation, we use evalScore (the simulated simulation progress)
  return Math.round(avgQuiz * 0.4 + evalScore * 0.3 + aiEval * 0.3);
}

// ── Single-agent stats (used by /api/agent/progress GET) ──────────────────

export async function getAgentStats(agentId: string, agentName: string, simulateCompletion: boolean = false): Promise<AgentStats> {
  // Handle Mockup Agent
  if (agentId === MOCKUP_AGENT_ID) {
    const isFull = simulateCompletion;
    
    const partialMock: any = {
      agent: { id: MOCKUP_AGENT_ID, name: agentName || 'Mockup Agent', active: true, createdAt: new Date() },
      quiz: isFull ? {
        foundation: { bestScore: 95, passed: true, attempts: 1, history: [] },
        product:    { bestScore: 90, passed: true, attempts: 1, history: [] },
        process:    { bestScore: 85, passed: true, attempts: 1, history: [] },
        payment:    { bestScore: 100, passed: true, attempts: 1, history: [] },
      } : {
        foundation: { bestScore: 90, passed: true, attempts: 1, history: [{ score: 9, total: 10, passed: true, timestamp: new Date().toISOString() }] }
      },
      aiEval: isFull ? {
        avgScore: 88,
        count: 4,
        history: [],
        levels: { 1: { passed: true }, 2: { passed: true }, 3: { passed: true }, 4: { passed: true } }
      } : null,
      lastActive: new Date().toISOString(),
      evalCompletedLevels: isFull ? [1, 2, 3, 4] : [],
      evalPassedScenarios: isFull ? ['scen-1', 'scen-2', 'scen-3'] : [],
      learnedModules: isFull ? ['product', 'kyc', 'website'] : ['product'],
      humanEvaluations: [],
      activeScenariosCount: 3,
    };
    
    const overallScore = computeOverallScore(partialMock);
    const mockStats: AgentStats = {
      ...partialMock,
      overallScore,
      badge: computeBadge(overallScore)
    };
    return mockStats;
  }

  const [quizDocs, evalDocs, progressDoc, humanEvals, scenariosSnap] = await Promise.all([
    gcsGetAll<QuizRecord>('quiz_results'),
    gcsGetAll<EvalRecord>('ai_eval_logs'),
    gcsGet<ProgressRecord>('agent_progress', agentId).catch(() => null),
    gcsGetAll<AgentEvaluation>('agent_evaluations'),
    gcsGetAll<{ isActive: boolean }>('aiev_scenarios'),
  ]);

  // Quiz per module
  const quiz: AgentStats['quiz'] = {};
  for (const mod of MODULES) {
    const results = quizDocs.filter(r => r.agentId === agentId && r.moduleId === mod);
    if (results.length > 0) {
      quiz[mod] = {
        bestScore: Math.max(...results.map(r => Math.round((r.score / r.totalQuestions) * 100))),
        passed:    results.some(r => r.passed),
        attempts:  results.length,
        history:   results.map(r => ({ score: r.score, total: r.totalQuestions, passed: r.passed, timestamp: r.timestamp })),
      };
    }
  }

  // AI Eval
  const evals  = evalDocs.filter(e => e.agentId === agentId);
  const aiEval = buildAiEval(evals);

  const evalCompleted  = progressDoc?.evalCompletedLevels ?? [];
  const passedScenarios = progressDoc?.evalPassedScenarios ?? [];
  const activeScenariosCount = scenariosSnap.filter(s => s.isActive).length;
  const learnedModules = progressDoc?.learnedModules ?? [];
  const myHumanEvals   = humanEvals.filter(h => h.agentId === agentId).sort((a, b) => b.evaluatedAt.localeCompare(a.evaluatedAt));

  const lastActive = [
    ...quizDocs.filter(r => r.agentId === agentId),
    ...evalDocs.filter(e => e.agentId === agentId),
  ].map(r => r.timestamp).filter(Boolean).sort().at(-1) ?? null;

  const agent: Agent = { id: agentId, name: agentName, active: true, createdAt: new Date() };
  const partial      = { agent, quiz, aiEval, lastActive, evalCompletedLevels: evalCompleted, evalPassedScenarios: passedScenarios, learnedModules, humanEvaluations: myHumanEvals };
  const overallScore = computeOverallScore({ ...partial, activeScenariosCount });
  return { ...partial, overallScore, badge: computeBadge(overallScore) };
}

// ── Data types matching GCS records ───────────────────────────────────────

interface QuizRecord     { id: string; agentId: string; moduleId: string; score: number; totalQuestions: number; passed: boolean; timestamp: string; }
interface EvalRecord     { id: string; agentId: string; score: number; level: number; passed: boolean; timestamp: string; }
interface ProgressRecord { agentId: string; evalCompletedLevels: number[]; evalPassedScenarios?: string[]; learnedModules?: string[]; evalSavedLevel: number | null; updatedAt: string; }

type LevelData = { attempts: number; avgScore: number; bestScore: number; passed: boolean; lastTimestamp: string };

function buildAiEval(evals: EvalRecord[]): AgentStats['aiEval'] {
  if (evals.length === 0) return null;

  const sorted = [...evals].sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  return {
    avgScore: Math.round(evals.reduce((s, e) => s + e.score, 0) / evals.length),
    count:    evals.length,
    history:  evals.map(e => ({ score: e.score, level: e.level || 1, passed: e.passed || false, timestamp: e.timestamp })),
    levels: {
      1: {
        attempts:      evals.length,
        avgScore:      Math.round(evals.reduce((s, e) => s + e.score, 0) / evals.length),
        bestScore:     Math.max(...evals.map(e => e.score)),
        passed:        evals.some(e => e.passed),
        lastTimestamp: sorted[sorted.length - 1].timestamp,
      }
    },
  };
}

// ── Analytics ─────────────────────────────────────────────────────────────

export async function getAllAgentStats(): Promise<AgentStats[]> {
  const [agents, quizDocs, evalDocs, progressDocs, humanEvals, scenariosSnap] = await Promise.all([
    gcsGetAll<Agent & { id: string }>('agents'),
    gcsGetAll<QuizRecord>('quiz_results'),
    gcsGetAll<EvalRecord>('ai_eval_logs'),
    gcsGetAll<ProgressRecord>('agent_progress'),
    gcsGetAll<AgentEvaluation>('agent_evaluations'),
    gcsGetAll<{ isActive: boolean }>('aiev_scenarios'),
  ]);

  const activeAgents = agents.filter(a => a.active);
  const activeScenariosCount = scenariosSnap.filter(s => s.isActive).length;

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
          history:   results.map(r => ({ score: r.score, total: r.totalQuestions, passed: r.passed, timestamp: r.timestamp })),
        };
      }
    }

    // AI Eval
    const evals  = evalDocs.filter(e => e.agentId === agent.id);
    const aiEval = buildAiEval(evals);

    // AI Eval completed levels (from agent_progress)
    const progress       = progressDocs.find(p => p.agentId === agent.id);
    const evalCompleted  = progress?.evalCompletedLevels ?? [];
    const passedScenarios = progress?.evalPassedScenarios ?? [];
    const learnedModules = progress?.learnedModules ?? [];
    
    // Human Evaluations
    const myHumanEvals = humanEvals.filter(h => h.agentId === agent.id).sort((a, b) => b.evaluatedAt.localeCompare(a.evaluatedAt));

    // Last active
    const allTimes = [
      ...quizDocs.filter(r => r.agentId === agent.id),
      ...evalDocs.filter(e => e.agentId === agent.id),
    ].map(r => r.timestamp).filter(Boolean).sort();
    const lastActive = allTimes.length > 0 ? allTimes[allTimes.length - 1] : null;

    const partial      = { agent, quiz, aiEval, lastActive, evalCompletedLevels: evalCompleted, evalPassedScenarios: passedScenarios, learnedModules, humanEvaluations: myHumanEvals };
    const overallScore = computeOverallScore({ ...partial, activeScenariosCount });
    return { ...partial, overallScore, badge: computeBadge(overallScore) };
  });
}

export async function getModuleStats(): Promise<ModuleStat[]> {
  const [agents, quizDocs, evalDocs, progressDocs, scenariosSnap] = await Promise.all([
    gcsGetAll<Agent & { id: string }>('agents'),
    gcsGetAll<QuizRecord>('quiz_results'),
    gcsGetAll<EvalRecord>('ai_eval_logs'),
    gcsGetAll<ProgressRecord>('agent_progress'),
    gcsGetAll<{ isActive: boolean }>('aiev_scenarios'),
  ]);

  const active = agents.filter((a: Agent & { id: string }) => a.active);
  const total  = active.length;
  const activeScenariosCount = scenariosSnap.filter(s => s.isActive).length;

  if (total === 0) {
    return [
      { moduleId: 'learn',   label: 'Learn',   avgScore: 0, passCount: 0, totalAttempts: 0 },
      { moduleId: 'quiz',    label: 'Quiz',    avgScore: 0, passCount: 0, totalAttempts: 0 },
      { moduleId: 'ai-eval', label: 'AI Eval', avgScore: 0, passCount: 0, totalAttempts: 0 },
    ];
  }

  const pct = (n: number) => Math.round((n / total) * 100);

  // Learn — all 3 required modules (Product, KYC, Website)
  const learnCount = active.filter(a => {
    const p = progressDocs.find(pd => pd.agentId === a.id);
    return (p?.learnedModules?.length ?? 0) >= 3;
  }).length;

  // Quiz — passed all 4 modules (Foundation, Product, Process, Payment)
  const quizCount = active.filter(a =>
    MODULES.every(m =>
      quizDocs.filter(q => q.agentId === a.id && q.moduleId === m).some(q => q.passed)
    )
  ).length;

  // AI Eval — completed Level 4 (highest level)
  const evalCount = active.filter(a => {
    const p = progressDocs.find(pd => pd.agentId === a.id);
    const levels = p?.evalCompletedLevels ?? [];
    const maxL = levels.length > 0 ? Math.max(...levels) : 0;
    return maxL >= 4;
  }).length;

  return [
    { moduleId: 'learn',   label: 'Learn',   avgScore: pct(learnCount), passCount: learnCount, totalAttempts: total },
    { moduleId: 'quiz',    label: 'Quiz',    avgScore: pct(quizCount),  passCount: quizCount,  totalAttempts: total },
    { moduleId: 'ai-eval', label: 'AI Eval', avgScore: pct(evalCount),  passCount: evalCount,  totalAttempts: total },
  ];
}
