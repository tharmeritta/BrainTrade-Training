import { fsGet as gcsGet, fsGetAll as gcsGetAll, fsGetWhere as gcsGetWhere } from '@/lib/server/db';
import type { Agent, AgentStats, ModuleStat, AgentEvaluation, TrainingPeriod } from '@/types';
import type { AiEvalScenario } from '@/types/ai-eval';
import { MOCKUP_AGENT_ID } from '@/lib/session/agent';
import { TRAINING_REGISTRY, getCanonicalQuizKey } from './registry';

// -- Score helpers ---------------------------------------------------------

export function computeBadge(score: number): AgentStats['badge'] {
  if (score >= 85) return 'elite';
  if (score >= 70) return 'strong';
  if (score >= 50) return 'developing';
  return 'needs-work';
}

export function computeOverallScore(
  stats: Omit<AgentStats, 'overallScore' | 'badge'> & { 
    evalCompletedLevels?: number[]; 
    evalPassedScenarios?: string[]; 
    activeScenariosCount?: number 
  },
  weights?: { quiz: number; human: number; ai: number },
  config?: { requiredQuizIds?: readonly string[]; requiredScenarioIds?: readonly string[] }
): number {
  const w = weights ?? { quiz: 0.4, human: 0.3, ai: 0.3 };
  const modules = config?.requiredQuizIds || TRAINING_REGISTRY.quiz.required;
  
  const quizScores    = modules.map(m => stats.quiz[m]?.bestScore ?? 0);
  const avgQuiz       = modules.length > 0 ? quizScores.reduce((a, b) => a + b, 0) / modules.length : 0;
  const aiEval        = stats.aiEval?.avgScore ?? 0;
  
  // AI Eval progress
  const levels        = stats.evalCompletedLevels ?? [];
  const maxL          = levels.length > 0 ? Math.max(...levels) : 0;
  
  // If we have required scenarios, we can calculate AI progress based on those
  let aiProgress = maxL >= 4 ? 100 : Math.min(aiEval, maxL * 25);
  if (config?.requiredScenarioIds && config.requiredScenarioIds.length > 0) {
    const passedCount = config.requiredScenarioIds.filter(id => stats.evalPassedScenarios?.includes(id)).length;
    const passRate = (passedCount / config.requiredScenarioIds.length) * 100;
    aiProgress = passRate;
  }
  
  const hasHumanEvals = stats.humanEvaluations && stats.humanEvaluations.length > 0;
  const humanScore    = hasHumanEvals 
    ? stats.humanEvaluations[0].totalScore 
    : aiProgress;
  
  return Math.round(avgQuiz * w.quiz + humanScore * w.human + aiEval * w.ai);
}

// -- Single-agent stats (used by /api/agent/progress GET) ------------------

export async function getAgentStats(agentId: string, agentName: string, targetPeriodId?: string): Promise<AgentStats> {
  const modules = TRAINING_REGISTRY.quiz.required;
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
      badge: computeBadge(overallScore),
    };
    return mockStats;
  }

  // Optimize: Only fetch records belonging to THIS agent.
  const [quizDocs, evalDocsLegacy, evalDocsV2, progressDoc, humanEvals, scenariosSnap, periodsSnap, quizzesSnap] = await Promise.all([
    gcsGetWhere<QuizRecord>('quiz_results', 'agentId', agentId),
    gcsGetWhere<EvalRecord>('ai_eval_logs', 'agentId', agentId),
    gcsGetWhere<EvalRecord>('ai_eval_logs_v2', 'agentId', agentId),
    gcsGet<ProgressRecord>('agent_progress', agentId).catch(() => null),
    gcsGetWhere<AgentEvaluation>('agent_evaluations', 'agentId', agentId),
    gcsGetAll<AiEvalScenario & { id: string }>('aiev_scenarios'),
    gcsGetAll<TrainingPeriod>('training_periods'),
    gcsGet<{ required: string[] }>('module_config', 'quizzes').catch(() => null),
  ]);

  const requiredQuizIds = quizzesSnap?.required || TRAINING_REGISTRY.quiz.required;
  const requiredScenarioIds = scenariosSnap.filter(s => s.isActive && s.required).map(s => s.id);
  const config = { requiredQuizIds, requiredScenarioIds };

  // Combine and deduplicate if necessary, though buildAiEval handles multiple anyway
  let evalDocs = [...evalDocsLegacy, ...evalDocsV2];
  let filteredQuizDocs = quizDocs;
  let filteredHumanEvals = humanEvals;

  // Find the active period this agent belongs to or use the targeted one
  let myActivePeriod = periodsSnap.find(p => p.active && p.agentIds.includes(agentId));
  
  // If no active period found and this is a graduate, find their last period
  if (!myActivePeriod && !targetPeriodId) {
    const myPeriods = periodsSnap
      .filter(p => p.agentIds.includes(agentId))
      .sort((a, b) => (b.completedAt || b.updatedAt || '').localeCompare(a.completedAt || a.updatedAt || ''));
    if (myPeriods.length > 0) {
      myActivePeriod = myPeriods[0];
    }
  }

  const effectivePeriodId = targetPeriodId || myActivePeriod?.id;

  if (effectivePeriodId) {
    filteredQuizDocs = quizDocs.filter(q => q.trainingPeriodId === effectivePeriodId);
    evalDocs = evalDocs.filter(e => (e as any).trainingPeriodId === effectivePeriodId);
    filteredHumanEvals = humanEvals.filter(h => h.trainingPeriodId === effectivePeriodId);
  }

  const weights = effectivePeriodId ? periodsSnap.find(p => p.id === effectivePeriodId)?.scoringWeights : myActivePeriod?.scoringWeights;

  // Quiz per module
  const quiz: AgentStats['quiz'] = {};
  for (const mod of modules) {
    const results = filteredQuizDocs.filter(r => getCanonicalQuizKey(r.moduleId) === mod);
    if (results.length > 0) {
      quiz[mod] = {
        bestScore: Math.max(...results.map(r => Math.round((r.score / r.totalQuestions) * 100))),
        passed:    results.some(r => r.passed),
        attempts:  results.length,
        history:   results.map(r => ({ score: r.score, total: r.totalQuestions, passed: r.passed, timestamp: r.timestamp, trainingPeriodId: (r as any).trainingPeriodId })),
        trainingPeriodId: (results[0] as any).trainingPeriodId
      };
    }
  }

  // AI Eval
  const aiEval = buildAiEval(evalDocs);

  // Derive completed levels and passed scenarios from logs to ensure accuracy
  // even if agent_progress doc is out of sync or missing updates.
  const logPassedLevels = aiEval 
    ? Object.keys(aiEval.levels)
        .filter(lvl => aiEval.levels[Number(lvl)].passed)
        .map(Number)
    : [];
  
  const logPassedScenarios = evalDocs
    .filter(e => e.passed && e.scenarioId)
    .map(e => e.scenarioId!);

  // When calculating stats for a specific period, we only care about progress IN THAT period
  const evalCompleted = effectivePeriodId 
    ? logPassedLevels.sort((a, b) => a - b)
    : Array.from(new Set([
        ...logPassedLevels,
        ...(progressDoc?.evalCompletedLevels ?? [])
      ])).sort((a, b) => a - b);

  const passedScenarios = effectivePeriodId
    ? logPassedScenarios
    : Array.from(new Set([
        ...logPassedScenarios,
        ...(progressDoc?.evalPassedScenarios ?? [])
      ]));

  const activeScenariosCount = scenariosSnap.filter(s => s.isActive).length;
  const learnedModules = progressDoc?.learnedModules ?? [];
  const myHumanEvals   = [...filteredHumanEvals].sort((a, b) => b.evaluatedAt.localeCompare(a.evaluatedAt));

  const agent: Agent = { 
    id: agentId, 
    name: agentName, 
    active: true, 
    createdAt: new Date(),
    graduated: progressDoc?.graduated || false,
    graduatedAt: progressDoc?.graduatedAt,
    acknowledged: progressDoc?.acknowledged || false,
    acknowledgedAt: progressDoc?.acknowledgedAt
  };

  const lastActive = [
    ...filteredQuizDocs,
    ...evalDocs,
    { timestamp: progressDoc?.updatedAt },
    { timestamp: agent.createdAt?.toString() },
  ].map(r => (r as any).timestamp).filter(Boolean).sort().at(-1) ?? null;

  const partial      = { agent, quiz, aiEval, lastActive, evalCompletedLevels: evalCompleted, evalPassedScenarios: passedScenarios, learnedModules, humanEvaluations: myHumanEvals, activeScenariosCount, activePeriodId: effectivePeriodId };
  
  const overallScore = computeOverallScore(partial, weights);

  return { ...partial, overallScore, badge: computeBadge(overallScore) };
}

// -- Data types matching GCS records ---------------------------------------

interface QuizRecord     { id: string; agentId: string; moduleId: string; score: number; totalQuestions: number; passed: boolean; timestamp: string; trainingPeriodId?: string; }
interface EvalRecord     { id: string; agentId: string; score: number; level: number; passed: boolean; timestamp: string; scenarioId?: string; trainingPeriodId?: string; }
interface ProgressRecord { agentId: string; evalCompletedLevels: number[]; evalPassedScenarios?: string[]; learnedModules?: string[]; evalSavedLevel: number | null; updatedAt: string; graduated?: boolean; graduatedAt?: string; acknowledged?: boolean; acknowledgedAt?: string; }

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
      timestamp: e.timestamp,
      manualOverride: (e as any).manualOverride || false,
      overriddenBy: (e as any).overriddenBy || '',
      isBypassed: (e as any).isBypassed || false,
      bypassReason: (e as any).bypassReason || ''
    })).sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    levels,
    };
    }

    // -- Analytics -------------------------------------------------------------

    export async function getAllAgentStats(targetPeriodId?: string): Promise<AgentStats[]> {
    const [agents, quizDocs, evalDocsLegacy, evalDocsV2, progressDocs, humanEvals, scenariosSnap, periodsSnap, quizzesSnap] = await Promise.all([
    gcsGetAll<Agent & { id: string }>('agents'),
    gcsGetAll<QuizRecord>('quiz_results'),
    gcsGetAll<EvalRecord>('ai_eval_logs'),
    gcsGetAll<EvalRecord>('ai_eval_logs_v2'),
    gcsGetAll<ProgressRecord>('agent_progress'),
    gcsGetAll<AgentEvaluation>('agent_evaluations'),
    gcsGetAll<AiEvalScenario & { id: string }>('aiev_scenarios'),
    gcsGetAll<TrainingPeriod>('training_periods'),
    gcsGet<{ required: string[] }>('module_config', 'quizzes').catch(() => null),
    ]);

    const requiredQuizIds = quizzesSnap?.required || TRAINING_REGISTRY.quiz.required;
    const requiredScenarioIds = scenariosSnap.filter(s => s.isActive && s.required).map(s => s.id);
    const config = { requiredQuizIds, requiredScenarioIds };

    const evalDocsRaw = [...evalDocsLegacy, ...evalDocsV2];
    const activeScenariosCount = scenariosSnap.filter(s => s.isActive).length;

    // Mapping for weights
    const weightMap = new Map<string, { quiz: number; human: number; ai: number }>();
    const activePeriods = periodsSnap.filter(p => p.active);
    
    // If we target a specific period, only care about agents in that period
    let filteredAgents = agents.filter(a => a.active);
    let effectivePeriodId = targetPeriodId;

    if (effectivePeriodId) {
      const period = periodsSnap.find(p => p.id === effectivePeriodId);
      if (period) {
        filteredAgents = agents.filter(a => period.agentIds.includes(a.id));
        for (const aid of period.agentIds) {
          if (period.scoringWeights) weightMap.set(aid, period.scoringWeights);
        }
      }
    } else {
      for (const p of activePeriods) {
        if (p.scoringWeights) {
          for (const aid of p.agentIds) {
            weightMap.set(aid, p.scoringWeights);
          }
        }
      }
    }

  const quizMap = new Map<string, QuizRecord[]>();
  for (const r of quizDocs) {
    if (!quizMap.has(r.agentId)) quizMap.set(r.agentId, []);
    quizMap.get(r.agentId)!.push(r);
  }

  const evalMap = new Map<string, EvalRecord[]>();
  for (const e of evalDocsRaw) {
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
    const id = p.agentId || (p as any).id;
    if (id) progressMap.set(id, p);
  }

  const results: AgentStats[] = [];
  
  for (const agent of filteredAgents) {
    // Determine the period for this agent
    const agentPeriodId = effectivePeriodId || periodsSnap.find(p => p.active && p.agentIds.includes(agent.id))?.id;

    let myQuizzes = quizMap.get(agent.id) ?? [];
    let myEvals   = evalMap.get(agent.id) ?? [];
    let myHuman   = humanMap.get(agent.id) ?? [];
    
    if (agentPeriodId) {
      myQuizzes = myQuizzes.filter(q => q.trainingPeriodId === agentPeriodId);
      myEvals   = myEvals.filter(e => (e as any).trainingPeriodId === agentPeriodId);
      myHuman   = myHuman.filter(h => h.trainingPeriodId === agentPeriodId);
    }

    const progress  = progressMap.get(agent.id);
    const weights   = weightMap.get(agent.id);

    // Quiz per module
    const quiz: AgentStats['quiz'] = {};
    for (const mod of requiredQuizIds) {
      const modResults = myQuizzes.filter(r => getCanonicalQuizKey(r.moduleId) === mod);
      if (modResults.length > 0) {
        quiz[mod] = {
          bestScore: Math.max(...modResults.map(r => Math.round((r.score / r.totalQuestions) * 100))),
          passed:    modResults.some(r => r.passed),
          attempts:  modResults.length,
          history:   modResults.map(r => ({ score: r.score, total: r.totalQuestions, passed: r.passed, timestamp: r.timestamp, trainingPeriodId: r.trainingPeriodId })),
          trainingPeriodId: (modResults[0] as any).trainingPeriodId
        };
      }
    }

    const aiEval = buildAiEval(myEvals);

    // Derive completed levels and passed scenarios from logs to ensure accuracy
    const logPassedLevels = aiEval 
      ? Object.keys(aiEval.levels)
          .filter(lvl => aiEval.levels[Number(lvl)].passed)
          .map(Number)
      : [];
    
    const logPassedScenarios = myEvals
      .filter(e => e.passed && e.scenarioId)
      .map(e => e.scenarioId!);

    const evalCompleted = agentPeriodId 
      ? logPassedLevels.sort((a, b) => a - b)
      : Array.from(new Set([
          ...logPassedLevels,
          ...(progress?.evalCompletedLevels ?? [])
        ])).sort((a, b) => a - b);

    const passedScenarios = agentPeriodId
      ? logPassedScenarios
      : Array.from(new Set([
          ...logPassedScenarios,
          ...(progress?.evalPassedScenarios ?? [])
        ]));

    const sortedHuman = myHuman.length > 0 
      ? [...myHuman].sort((a, b) => b.evaluatedAt.localeCompare(a.evaluatedAt))
      : [];

    let lastActive: string | null = null;
    for (const q of myQuizzes) if (!lastActive || q.timestamp > lastActive) lastActive = q.timestamp;
    for (const e of myEvals) if (!lastActive || e.timestamp > lastActive) lastActive = e.timestamp;
    if (progress?.updatedAt && (!lastActive || progress.updatedAt > lastActive)) lastActive = progress.updatedAt;
    if (agent.createdAt && (!lastActive || agent.createdAt.toString() > lastActive)) lastActive = agent.createdAt.toString();

    const agentWithGraduation: Agent = {
      ...agent,
      graduated: progress?.graduated || false,
      graduatedAt: progress?.graduatedAt,
      acknowledged: progress?.acknowledged || false,
      acknowledgedAt: progress?.acknowledgedAt
    };

    const partial = { 
      agent: agentWithGraduation, 
      quiz, 
      aiEval, 
      lastActive, 
      evalCompletedLevels: evalCompleted, 
      evalPassedScenarios: passedScenarios, 
      learnedModules: progress?.learnedModules ?? [], 
      humanEvaluations: sortedHuman,
      activeScenariosCount,
      activePeriodId: agentPeriodId
    };
    
    const overallScore = computeOverallScore(partial, weights, config);

    results.push({ ...partial, overallScore, badge: computeBadge(overallScore) });
  }

  return results;
}

export async function getModuleStats(): Promise<ModuleStat[]> {
  const [agents, quizDocs, evalDocs, progressDocs, scenariosSnap, quizzesSnap] = await Promise.all([
    gcsGetAll<Agent & { id: string }>('agents'),
    gcsGetAll<QuizRecord>('quiz_results'),
    gcsGetAll<EvalRecord>('ai_eval_logs_v2'),
    gcsGetAll<ProgressRecord>('agent_progress'),
    gcsGetAll<AiEvalScenario & { id: string }>('aiev_scenarios'),
    gcsGet<{ required: string[] }>('module_config', 'quizzes').catch(() => null),
  ]);

  const requiredQuizIds = quizzesSnap?.required || TRAINING_REGISTRY.quiz.required;
  const requiredScenarioIds = scenariosSnap.filter(s => s.isActive && s.required).map(s => s.id);

  const active = agents.filter((a: Agent & { id: string }) => a.active);
  const total  = active.length;

  if (total === 0) {
    return [
      { moduleId: 'learn',   label: 'Learn',   avgScore: 0, passCount: 0, totalAttempts: 0 },
      { moduleId: 'quiz',    label: 'Quiz',    avgScore: 0, passCount: 0, totalAttempts: 0 },
      { moduleId: 'ai-eval', label: 'AI Eval', avgScore: 0, passCount: 0, totalAttempts: 0 },
    ];
  }

  const quizPassedMap: Record<string, Set<string>> = {};
  quizDocs.filter(q => q.passed).forEach(q => {
    if (!quizPassedMap[q.agentId]) quizPassedMap[q.agentId] = new Set();
    quizPassedMap[q.agentId].add(getCanonicalQuizKey(q.moduleId));
  });

  const progressMap: Record<string, ProgressRecord> = {};
  progressDocs.forEach(p => {
    const id = p.agentId || (p as any).id;
    if (id) progressMap[id] = p;
  });

  const pct = (n: number) => Math.round((n / total) * 100);

  // Learn — at least 1 module required to unlock quiz
  const learnCount = active.filter(a => (progressMap[a.id]?.learnedModules?.length ?? 0) >= TRAINING_REGISTRY.learn.minToUnlockNext).length;

  // Quiz — passed all required modules
  const quizCount = active.filter(a => {
    const passed = quizPassedMap[a.id];
    return passed && requiredQuizIds.every(m => passed.has(m));
  }).length;

  // AI Eval — passed all required scenarios
  const evalCount = active.filter(a => {
    if (requiredScenarioIds.length > 0) {
      const passed = progressMap[a.id]?.evalPassedScenarios ?? [];
      return requiredScenarioIds.every(id => passed.includes(id));
    }
    const levels = progressMap[a.id]?.evalCompletedLevels ?? [];
    return levels.length > 0 && Math.max(...levels) >= TRAINING_REGISTRY.eval.requiredLevel;
  }).length;

  return [
    { moduleId: 'learn',   label: 'Learn',   avgScore: pct(learnCount), passCount: learnCount, totalAttempts: total },
    { moduleId: 'quiz',    label: 'Quiz',    avgScore: pct(quizCount),  passCount: quizCount,  totalAttempts: total },
    { moduleId: 'ai-eval', label: 'AI Eval', avgScore: pct(evalCount),  passCount: evalCount,  totalAttempts: total },
  ];
}
