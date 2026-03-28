import { fsGet as gcsGet, fsGetAll as gcsGetAll, fsGetWhere as gcsGetWhere } from './firestore-db';
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

export async function getAgentStats(agentId: string, agentName: string): Promise<AgentStats> {
  // Handle Mockup Agent
  if (agentId === MOCKUP_AGENT_ID) {
    const partialMock: any = {
      agent: { id: MOCKUP_AGENT_ID, name: agentName || 'Mockup Agent', active: true, createdAt: new Date() },
      quiz: {
        foundation: { bestScore: 90, passed: true, attempts: 1, history: [{ score: 9, total: 10, passed: true, timestamp: new Date().toISOString() }] }
      },
      aiEval: null,
      lastActive: new Date().toISOString(),
      evalCompletedLevels: [],
      evalPassedScenarios: [],
      learnedModules: ['product'],
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

  // Optimize: Only fetch records belonging to THIS agent.
  // This prevents loading thousands of records into RAM to find a few.
  const [quizDocs, evalDocs, progressDoc, humanEvals, scenariosSnap] = await Promise.all([
    gcsGetWhere<QuizRecord>('quiz_results', 'agentId', agentId),
    gcsGetWhere<EvalRecord>('ai_eval_logs', 'agentId', agentId),
    gcsGet<ProgressRecord>('agent_progress', agentId).catch(() => null),
    gcsGetWhere<AgentEvaluation>('agent_evaluations', 'agentId', agentId),
    gcsGetAll<{ isActive: boolean }>('aiev_scenarios'), // Small collection, okay to getAll
  ]);

  // Quiz per module
  const quiz: AgentStats['quiz'] = {};
  for (const mod of MODULES) {
    const results = quizDocs.filter(r => r.moduleId === mod);
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
  const aiEval = buildAiEval(evalDocs);

  const evalCompleted  = progressDoc?.evalCompletedLevels ?? [];
  const passedScenarios = progressDoc?.evalPassedScenarios ?? [];
  const activeScenariosCount = scenariosSnap.filter(s => s.isActive).length;
  const learnedModules = progressDoc?.learnedModules ?? [];
  const myHumanEvals   = [...humanEvals].sort((a, b) => b.evaluatedAt.localeCompare(a.evaluatedAt));

  const lastActive = [
    ...quizDocs,
    ...evalDocs,
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

  const levels: Record<number, LevelData> = {};
  let totalScore = 0;

  // Single pass to aggregate stats by level
  for (const e of evals) {
    totalScore += e.score;
    const lvl = e.level || 1;
    
    if (!levels[lvl]) {
      levels[lvl] = {
        attempts: 0,
        avgScore: 0,
        bestScore: 0,
        passed: false,
        lastTimestamp: e.timestamp
      };
    }

    const l = levels[lvl];
    l.attempts++;
    if (e.score > l.bestScore) l.bestScore = e.score;
    if (e.passed) l.passed = true;
    if (e.timestamp > l.lastTimestamp) l.lastTimestamp = e.timestamp;
    // We'll calculate avgScore in a second pass or at the end
  }

  // Calculate averages
  for (const lvl in levels) {
    const l = levels[lvl];
    const levelEvals = evals.filter(e => (e.level || 1) === Number(lvl));
    l.avgScore = Math.round(levelEvals.reduce((sum, e) => sum + e.score, 0) / l.attempts);
  }

  return {
    avgScore: Math.round(totalScore / evals.length),
    count:    evals.length,
    history:  evals.map(e => ({ 
      score: e.score, 
      level: e.level || 1, 
      passed: e.passed || false, 
      timestamp: e.timestamp 
    })).sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    levels,
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

  // Efficiency: Use Map for O(1) lookup
  const quizMap = new Map<string, QuizRecord[]>();
  for (const r of quizDocs) {
    if (!quizMap.has(r.agentId)) quizMap.set(r.agentId, []);
    quizMap.get(r.agentId)!.push(r);
  }

  const evalMap = new Map<string, EvalRecord[]>();
  for (const e of evalDocs) {
    if (!evalMap.has(e.agentId)) evalMap.set(e.agentId, []);
    evalMap.get(e.agentId)!.push(e);
  }

  const humanMap = new Map<string, AgentEvaluation[]>();
  for (const h of humanEvals) {
    if (!humanMap.has(h.agentId)) humanMap.set(h.agentId, []);
    humanMap.get(h.agentId)!.push(h);
  }

  const progressMap = new Map<string, ProgressRecord>();
  for (const p of progressDocs) {
    progressMap.set(p.agentId, p);
  }

  const results: AgentStats[] = [];
  
  for (const agent of activeAgents) {
    const myQuizzes = quizMap.get(agent.id) ?? [];
    const myEvals   = evalMap.get(agent.id) ?? [];
    const myHuman   = humanMap.get(agent.id) ?? [];
    const progress  = progressMap.get(agent.id);

    // Quiz per module
    const quiz: AgentStats['quiz'] = {};
    for (const mod of MODULES) {
      const modResults = myQuizzes.filter(r => r.moduleId === mod);
      if (modResults.length > 0) {
        quiz[mod] = {
          bestScore: Math.max(...modResults.map(r => Math.round((r.score / r.totalQuestions) * 100))),
          passed:    modResults.some(r => r.passed),
          attempts:  modResults.length,
          history:   modResults.map(r => ({ score: r.score, total: r.totalQuestions, passed: r.passed, timestamp: r.timestamp })),
        };
      }
    }

    const aiEval = buildAiEval(myEvals);
    const sortedHuman = myHuman.length > 0 
      ? [...myHuman].sort((a, b) => b.evaluatedAt.localeCompare(a.evaluatedAt))
      : [];

    // Optimize last active calculation
    let lastActive: string | null = null;
    for (const q of myQuizzes) if (!lastActive || q.timestamp > lastActive) lastActive = q.timestamp;
    for (const e of myEvals) if (!lastActive || e.timestamp > lastActive) lastActive = e.timestamp;

    const partial = { 
      agent, 
      quiz, 
      aiEval, 
      lastActive, 
      evalCompletedLevels: progress?.evalCompletedLevels ?? [], 
      evalPassedScenarios: progress?.evalPassedScenarios ?? [], 
      learnedModules: progress?.learnedModules ?? [], 
      humanEvaluations: sortedHuman 
    };
    
    const overallScore = computeOverallScore({ ...partial, activeScenariosCount });
    results.push({ ...partial, overallScore, badge: computeBadge(overallScore) });
  }

  return results;
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

  if (total === 0) {
    return [
      { moduleId: 'learn',   label: 'Learn',   avgScore: 0, passCount: 0, totalAttempts: 0 },
      { moduleId: 'quiz',    label: 'Quiz',    avgScore: 0, passCount: 0, totalAttempts: 0 },
      { moduleId: 'ai-eval', label: 'AI Eval', avgScore: 0, passCount: 0, totalAttempts: 0 },
    ];
  }

  // Pre-calculate sets and maps for O(1) lookups
  const quizPassedMap: Record<string, Set<string>> = {};
  quizDocs.filter(q => q.passed).forEach(q => {
    if (!quizPassedMap[q.agentId]) quizPassedMap[q.agentId] = new Set();
    quizPassedMap[q.agentId].add(q.moduleId);
  });

  const progressMap: Record<string, ProgressRecord> = {};
  progressDocs.forEach(p => {
    progressMap[p.agentId] = p;
  });

  const pct = (n: number) => Math.round((n / total) * 100);

  // Learn — all 3 required modules
  const learnCount = active.filter(a => (progressMap[a.id]?.learnedModules?.length ?? 0) >= 3).length;

  // Quiz — passed all 4 modules
  const quizCount = active.filter(a => {
    const passed = quizPassedMap[a.id];
    return passed && MODULES.every(m => passed.has(m));
  }).length;

  // AI Eval — completed Level 4
  const evalCount = active.filter(a => {
    const levels = progressMap[a.id]?.evalCompletedLevels ?? [];
    return levels.length > 0 && Math.max(...levels) >= 4;
  }).length;

  return [
    { moduleId: 'learn',   label: 'Learn',   avgScore: pct(learnCount), passCount: learnCount, totalAttempts: total },
    { moduleId: 'quiz',    label: 'Quiz',    avgScore: pct(quizCount),  passCount: quizCount,  totalAttempts: total },
    { moduleId: 'ai-eval', label: 'AI Eval', avgScore: pct(evalCount),  passCount: evalCount,  totalAttempts: total },
  ];
}
