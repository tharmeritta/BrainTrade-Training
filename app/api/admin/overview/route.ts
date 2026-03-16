import { NextResponse } from 'next/server';
import { requireAdminOrManager } from '@/lib/session';
import { gcsGetAll } from '@/lib/gcs';
import { getAllAgentStats, getModuleStats } from '@/lib/agents';
import type { AdminOverviewData } from '@/types';

const EMPTY: AdminOverviewData = {
  totalAgents: 0, activeAgents: 0, overallPassRate: 0,
  avgAiEvalScore: 0, weekSessions: 0,
  moduleStats: [
    { moduleId: 'learn',   label: 'Learn',   avgScore: 0, passCount: 0, totalAttempts: 0 },
    { moduleId: 'quiz',    label: 'Quiz',    avgScore: 0, passCount: 0, totalAttempts: 0 },
    { moduleId: 'ai-eval', label: 'AI Eval', avgScore: 0, passCount: 0, totalAttempts: 0 },
    { moduleId: 'pitch',   label: 'Pitch',   avgScore: 0, passCount: 0, totalAttempts: 0 },
  ],
  leaderboard: [], passFail: { passed: 0, failed: 0 },
};

export async function GET() {
  try { await requireAdminOrManager(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  try {
    const [allStats, moduleStats, quizDocs, evalDocs, pitchDocs] = await Promise.all([
      getAllAgentStats(),
      getModuleStats(),
      gcsGetAll<{ agentId: string; passed: boolean; score: number; timestamp: string }>('quiz_results'),
      gcsGetAll<{ agentId: string; score: number; timestamp: string }>('ai_eval_logs'),
      gcsGetAll<{ agentId: string; timestamp: string }>('pitch_sessions'),
    ]);

    const passed         = quizDocs.filter(d => d.passed).length;
    const overallPassRate = quizDocs.length > 0 ? Math.round((passed / quizDocs.length) * 100) : 0;
    const avgAiEvalScore  = evalDocs.length > 0
      ? Math.round(evalDocs.reduce((s, e) => s + e.score, 0) / evalDocs.length) : 0;

    const weekAgo    = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const isThisWeek = (d: { timestamp: string }) => d.timestamp > weekAgo;
    const weekSessions = [...quizDocs, ...evalDocs, ...pitchDocs].filter(isThisWeek).length;
    const activeIds    = new Set(
      [...quizDocs, ...evalDocs, ...pitchDocs].filter(isThisWeek).map(d => d.agentId)
    );

    const data: AdminOverviewData = {
      totalAgents: allStats.length,
      activeAgents: activeIds.size,
      overallPassRate,
      avgAiEvalScore,
      weekSessions,
      moduleStats,
      leaderboard: allStats.sort((a, b) => b.overallScore - a.overallScore),
      passFail: { passed, failed: quizDocs.length - passed },
    };

    return NextResponse.json(data);
  } catch (err) {
    console.error('Overview error:', err);
    return NextResponse.json(EMPTY);
  }
}
