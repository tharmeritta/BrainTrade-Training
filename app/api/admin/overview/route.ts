import { NextResponse } from 'next/server';
import { requireAdminManagerOrTrainer } from '@/lib/session';
import { fsGetAll } from '@/lib/firestore-db';
import { computeOverallScore, computeBadge } from '@/lib/agents';
import { getCanonicalQuizKey } from '@/lib/registry';
import type { AdminOverviewData, Agent, AgentStats, ModuleStat, AgentEvaluation } from '@/types';

const EMPTY: AdminOverviewData = {
  totalAgents: 0, activeAgents: 0, overallPassRate: 0,
  avgAiEvalScore: 0, weekSessions: 0,
  moduleStats: [
    { moduleId: 'learn',   label: 'Learn',   avgScore: 0, passCount: 0, totalAttempts: 0 },
    { moduleId: 'quiz',    label: 'Quiz',    avgScore: 0, passCount: 0, totalAttempts: 0 },
    { moduleId: 'ai-eval', label: 'AI Eval', avgScore: 0, passCount: 0, totalAttempts: 0 },
  ],
  leaderboard: [], passFail: { passed: 0, failed: 0 },
};

const MODULES = ['foundation', 'product', 'process', 'payment'] as const;

export async function GET() {
  try { 
    await requireAdminManagerOrTrainer(); 
  } catch { 
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); 
  }

  try {
    // Single fetch for all data to avoid redundant Firestore calls
    const [agents, quizDocs, evalDocs, progressDocs, humanEvals, scenariosDocs] = await Promise.all([
      fsGetAll<Agent & { id: string }>('agents'),
      fsGetAll<{ id: string; agentId: string; moduleId: string; score: number; totalQuestions: number; passed: boolean; timestamp: string }>('quiz_results'),
      fsGetAll<{ id: string; agentId: string; score: number; level?: number; passed?: boolean; timestamp: string }>('ai_eval_logs'),
      fsGetAll<{ agentId: string; evalCompletedLevels: number[]; evalPassedScenarios?: string[]; learnedModules?: string[]; updatedAt: string }>('agent_progress'),
      fsGetAll<AgentEvaluation>('agent_evaluations'),
      fsGetAll<{ isActive: boolean }>('aiev_scenarios'),
    ]);

    const activeAgents = agents.filter(a => a.active);
    const totalAgents  = activeAgents.length;
    const activeScenariosCount = scenariosDocs.filter(s => s.isActive).length;

    if (totalAgents === 0) return NextResponse.json(EMPTY);

    // Compute AgentStats for leaderboard
    const allStats: AgentStats[] = activeAgents.map(agent => {
      // Quiz per module
      const quiz: AgentStats['quiz'] = {};
      for (const mod of MODULES) {
        const results = quizDocs.filter(r => r.agentId === agent.id && getCanonicalQuizKey(r.moduleId) === mod);
        if (results.length > 0) {
          quiz[mod] = {
            bestScore: Math.max(...results.map(r => Math.round((r.score / r.totalQuestions) * 100))),
            passed:    results.some(r => r.passed),
            attempts:  results.length,
            history:   results.map(r => ({ score: r.score, total: r.totalQuestions, passed: r.passed, timestamp: r.timestamp })),
          };
        }
      }

      // AI Eval — per-level breakdown computed inline for leaderboard entry
      const evals  = evalDocs.filter(e => e.agentId === agent.id);
      const levels: Record<number, { attempts: number; avgScore: number; bestScore: number; passed: boolean; lastTimestamp: string }> = {};
      for (const lv of [1, 2, 3, 4]) {
        const lvEvals = evals.filter(e => (e.level || 1) === lv);
        if (lvEvals.length === 0) continue;
        const sorted = [...lvEvals].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
        levels[lv] = {
          attempts:      lvEvals.length,
          avgScore:      Math.round(lvEvals.reduce((s, e) => s + e.score, 0) / lvEvals.length),
          bestScore:     Math.max(...lvEvals.map(e => e.score)),
          passed:        lvEvals.some((e: any) => e.passed),
          lastTimestamp: sorted[sorted.length - 1].timestamp,
        };
      }
      const aiEval = evals.length > 0
        ? {
            avgScore: Math.round(evals.reduce((s, e) => s + e.score, 0) / evals.length),
            count:    evals.length,
            history:  evals.map(e => ({ score: e.score, level: e.level || 1, passed: e.passed || false, timestamp: e.timestamp })),
            levels,
          }
        : null;

      const progress       = progressDocs.find(p => p.agentId === agent.id);
      const evalCompleted  = progress?.evalCompletedLevels ?? [];
      const evalPassedScenarios = progress?.evalPassedScenarios ?? [];
      const learnedModules = progress?.learnedModules ?? [];
      const myHumanEvals   = humanEvals.filter(h => h.agentId === agent.id).sort((a, b) => b.evaluatedAt.localeCompare(a.evaluatedAt));

      const allTimes = [
        ...quizDocs.filter(r => r.agentId === agent.id),
        ...evalDocs.filter(e => e.agentId === agent.id),
      ].map(r => r.timestamp).filter(Boolean).sort();
      const lastActive = allTimes.length > 0 ? allTimes[allTimes.length - 1] : null;

      const partial      = { 
        agent, quiz, aiEval, lastActive, 
        evalCompletedLevels: evalCompleted, 
        evalPassedScenarios,
        learnedModules, 
        humanEvaluations: myHumanEvals,
        activeScenariosCount
      };
      
      const overallScore = computeOverallScore(partial);

      return { ...partial, overallScore, badge: computeBadge(overallScore) };
    });

    // Module stats
    const pct = (n: number) => Math.round((n / totalAgents) * 100);
    const moduleStats: ModuleStat[] = [
      { 
        moduleId: 'learn', label: 'Learn', 
        passCount: activeAgents.filter(a => {
          const p = progressDocs.find(pd => pd.agentId === a.id);
          return (p?.learnedModules?.length ?? 0) > 0;
        }).length,
        avgScore: 0, totalAttempts: totalAgents 
      },
      { 
        moduleId: 'quiz', label: 'Quiz', 
        passCount: activeAgents.filter(a => MODULES.every(m => quizDocs.filter(q => q.agentId === a.id && getCanonicalQuizKey(q.moduleId) === m).some(q => q.passed))).length,
        avgScore: 0, totalAttempts: totalAgents 
      },
      { 
        moduleId: 'ai-eval', label: 'AI Eval', 
        passCount: activeAgents.filter(a => evalDocs.some(e => e.agentId === a.id)).length,
        avgScore: 0, totalAttempts: totalAgents 
      },
    ];
    moduleStats.forEach(m => m.avgScore = pct(m.passCount));

    const avgAiEvalScore = evalDocs.length > 0
      ? Math.round(evalDocs.reduce((s, e) => s + e.score, 0) / evalDocs.length) : 0;

    const weekAgo    = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const isThisWeek = (d: { timestamp: string }) => d.timestamp > weekAgo;
    const weekSessions = [...quizDocs, ...evalDocs].filter(isThisWeek).length;
    const activeIds    = new Set(
      [...quizDocs, ...evalDocs].filter(isThisWeek).map(d => d.agentId)
    );

    const data: AdminOverviewData = {
      totalAgents,
      activeAgents: activeIds.size,
      overallPassRate: pct(moduleStats.find(m => m.moduleId === 'quiz')?.passCount ?? 0),
      avgAiEvalScore,
      weekSessions,
      moduleStats,
      leaderboard: allStats.sort((a, b) => b.overallScore - a.overallScore),
      passFail: { passed: moduleStats.find(m => m.moduleId === 'quiz')?.passCount ?? 0, failed: totalAgents - (moduleStats.find(m => m.moduleId === 'quiz')?.passCount ?? 0) },
    };

    return NextResponse.json(data);
  } catch (err) {
    console.error('Overview error:', err);
    return NextResponse.json(EMPTY);
  }
}
