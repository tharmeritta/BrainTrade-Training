import { NextResponse } from 'next/server';
import { requireAdminManagerOrTrainer } from '@/lib/session';
import { fsCount, fsQuery } from '@/lib/firestore-db';
import { getGlobalStats } from '@/lib/services/stats-service';
import { getAllAgentStats } from '@/lib/agents';
import type { AdminOverviewData, AgentStats } from '@/types';

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

    const [globalStats, totalAgents, activeAgents, weekQuizzes, weekEvals, weekLearns] = await Promise.all([
      getGlobalStats(),
      fsCount('agents'),
      fsCount('agents', 'active', true),
      fsCount('quiz_results', 'timestamp', weekAgo, '>='), 
      fsCount('ai_eval_logs_v2', 'timestamp', weekAgo, '>='),
      fsCount('learning_logs', 'timestamp', weekAgo, '>='),
    ]);

    // If global stats don't exist, we fall back to the heavy calculation ONCE
    if (!globalStats) {
      console.warn('[Admin Overview] Global stats missing, falling back to heavy calculation');
      const allStats = await getAllAgentStats();
      const agents = allStats.filter(s => s.agent.active);
      const totalAgentsCount = agents.length;
      if (totalAgentsCount === 0) return NextResponse.json(EMPTY);

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
        }
      };
      return NextResponse.json(data);
    }

    const weekSessionsTotal = (weekQuizzes || 0) + (weekEvals || 0) + (weekLearns || 0);

    // Leaderboard: Query agents sorted by overallScore (which we now persist)
    const leaderboard = await fsQuery<any>('agents', {
      where: [{ field: 'active', op: '==', value: true }],
      orderBy: { field: 'overallScore', direction: 'desc' },
      limit: 10
    });

    const data: AdminOverviewData = {
      totalAgents: globalStats.totalAgents || totalAgents,
      activeAgents: globalStats.activeAgents || activeAgents,
      overallPassRate: Math.round((globalStats.totalQuizScore + globalStats.totalAiEvalScore) / ((globalStats.totalQuizAttempts + globalStats.totalAiEvalAttempts) || 1)),
      avgAiEvalScore: Math.round(globalStats.totalAiEvalScore / (globalStats.totalAiEvalAttempts || 1)),
      weekSessions: weekSessionsTotal,
      moduleStats: [
        { 
          moduleId: 'learn', 
          label: 'Learn', 
          avgScore: Math.round(((globalStats.moduleStats?.learn?.passCount || 0) / (activeAgents || 1)) * 100),
          passCount: globalStats.moduleStats?.learn?.passCount || 0,
          totalAttempts: globalStats.moduleStats?.learn?.count || 0
        },
        { 
          moduleId: 'quiz', 
          label: 'Quiz', 
          avgScore: Math.round((globalStats.moduleStats?.foundation?.sum || 0) / (globalStats.moduleStats?.foundation?.count || 1)),
          passCount: globalStats.moduleStats?.foundation?.passCount || 0,
          totalAttempts: globalStats.moduleStats?.foundation?.count || 0
        },
        { 
          moduleId: 'ai-eval', 
          label: 'AI Eval', 
          avgScore: Math.round((globalStats.moduleStats?.['ai-eval']?.sum || 0) / (globalStats.moduleStats?.['ai-eval']?.count || 1)),
          passCount: globalStats.moduleStats?.['ai-eval']?.passCount || 0,
          totalAttempts: globalStats.moduleStats?.['ai-eval']?.count || 0
        },
      ],
      leaderboard: leaderboard as AgentStats[],
      passFail: {
        passed: globalStats.activeAgents ? Math.round(globalStats.activeAgents * 0.7) : 0,
        failed: globalStats.activeAgents ? Math.round(globalStats.activeAgents * 0.3) : 0
      }
    };

    return NextResponse.json(data);
  } catch (err) {
    console.error('Admin overview error:', err);
    return NextResponse.json(EMPTY);
  }
}
