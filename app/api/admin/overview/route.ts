import { NextResponse } from 'next/server';
import { requireAdminManagerOrTrainer } from '@/lib/session/server';
import { fsCount, fsQuery, fsGetAll } from '@/lib/server/db';
import { getGlobalStats } from '@/lib/services/stats-service';
import { getAllAgentStats } from '@/lib/agents';
import type { AdminOverviewData, AgentStats, TrainingPeriod } from '@/types';

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

export async function GET() {
  try { 
    await requireAdminManagerOrTrainer(); 
  } catch { 
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); 
  }

  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [globalStats, totalAgents, activeAgents, weekQuizzes, weekEvals, weekLearns, periods] = await Promise.all([
      getGlobalStats(),
      fsCount('agents'),
      fsCount('agents', 'active', true),
      fsCount('quiz_results', 'timestamp', weekAgo, '>='), 
      fsCount('ai_eval_logs_v2', 'timestamp', weekAgo, '>='),
      fsCount('learning_logs', 'timestamp', weekAgo, '>='),
      fsGetAll<TrainingPeriod>('training_periods'),
    ]);

    const activeWaves = periods.filter(p => p.active);
    const activePeriodIds = activeWaves.map(p => p.id);

    // If global stats don't exist, we fall back to the heavy calculation ONCE
    if (!globalStats) {
      console.warn('[Admin Overview] Global stats missing, falling back to heavy calculation');
      // heavy calculation scoped to active periods
      const allStats = await getAllAgentStats();
      const agents = allStats.filter(s => s.agent.active && s.activePeriodId && activePeriodIds.includes(s.activePeriodId));
      const totalAgentsCount = agents.length;
      if (totalAgentsCount === 0) return NextResponse.json({ ...EMPTY, trainingWaves: activeWaves });

      const avgAiEval = Math.round(agents.reduce((a, b) => a + (b.aiEval?.avgScore || 0), 0) / (agents.filter(a => a.aiEval).length || 1));
      const overallPass = Math.round(agents.reduce((a, b) => a + b.overallScore, 0) / totalAgentsCount);

      const data: AdminOverviewData = {
        totalAgents: totalAgentsCount,
        activeAgents: totalAgentsCount,
        overallPassRate: overallPass,
        avgAiEvalScore: avgAiEval,
        weekSessions: (weekQuizzes || 0) + (weekEvals || 0) + (weekLearns || 0),
        moduleStats: EMPTY.moduleStats,
        leaderboard: agents.sort((a, b) => b.overallScore - a.overallScore).slice(0, 10),
        passFail: { 
          passed: agents.filter(a => a.overallScore >= 70).length, 
          failed: agents.filter(a => a.overallScore < 70).length 
        },
        trainingWaves: activeWaves
      };
      return NextResponse.json(data);
    }

    const weekSessionsTotal = (weekQuizzes || 0) + (weekEvals || 0) + (weekLearns || 0);

    // Leaderboard: Query agents who are active AND in an active training period
    // Since we don't have activePeriodId in the main 'agents' doc easily for querying,
    // we use getAllAgentStats and filter, then slice.
    const agentsWithStats = await getAllAgentStats();
    const liveAgents = agentsWithStats.filter(s => s.agent.active && s.activePeriodId && activePeriodIds.includes(s.activePeriodId));
    const leaderboard = liveAgents.sort((a, b) => b.overallScore - a.overallScore).slice(0, 10);

    // Recalculate summary stats for "Live" dashboard based ONLY on active batches
    const activeAgentCount = liveAgents.length;
    const avgAiEval = liveAgents.length > 0 
      ? Math.round(liveAgents.reduce((sum, a) => sum + (a.aiEval?.avgScore || 0), 0) / (liveAgents.filter(a => a.aiEval).length || 1))
      : 0;
    const avgQuiz = liveAgents.length > 0
      ? Math.round(liveAgents.reduce((sum, a) => {
          const quizScores = Object.values(a.quiz).map(q => q.bestScore);
          return sum + (quizScores.length > 0 ? quizScores.reduce((p, c) => p + c, 0) / quizScores.length : 0);
        }, 0) / activeAgentCount)
      : 0;

    const data: AdminOverviewData = {
      totalAgents: activeAgentCount,
      activeAgents: activeAgentCount,
      overallPassRate: Math.round((avgQuiz + avgAiEval) / 2),
      avgAiEvalScore: avgAiEval,
      weekSessions: weekSessionsTotal,
      moduleStats: [
        { 
          moduleId: 'learn', 
          label: 'Learn', 
          avgScore: liveAgents.length > 0 ? Math.round((liveAgents.filter(a => a.learnedModules.length >= 1).length / activeAgentCount) * 100) : 0,
          passCount: liveAgents.filter(a => a.learnedModules.length >= 1).length,
          totalAttempts: activeAgentCount
        },
        { 
          moduleId: 'quiz', 
          label: 'Quiz', 
          avgScore: avgQuiz,
          passCount: liveAgents.filter(a => Object.values(a.quiz).every(q => q.passed)).length,
          totalAttempts: activeAgentCount
        },
        { 
          moduleId: 'ai-eval', 
          label: 'AI Eval', 
          avgScore: avgAiEval,
          passCount: liveAgents.filter(a => a.evalCompletedLevels.includes(4)).length,
          totalAttempts: activeAgentCount
        },
      ],
      leaderboard: leaderboard,
      passFail: {
        passed: liveAgents.filter(a => a.overallScore >= 70).length,
        failed: liveAgents.filter(a => a.overallScore < 70).length
      },
      trainingWaves: activeWaves
    };

    return NextResponse.json(data);
  } catch (err) {
    console.error('Admin overview error:', err);
    return NextResponse.json(EMPTY);
  }
}
