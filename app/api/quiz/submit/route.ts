import { NextRequest, NextResponse } from 'next/server';
import { fsAdd } from '@/lib/server/db';
import { MOCKUP_AGENT_ID } from '@/lib/session/agent';
import { getCanonicalQuizKey } from '@/lib/registry';
import { updateGlobalQuizStats, updateAgentOverallScore } from '@/lib/services/stats-service';
import { getActiveTrainingPeriod } from '@/lib/server/training';

export async function POST(req: NextRequest) {
  try {
    const { moduleId: rawModuleId, score, totalQuestions, passed, agentId, agentName } = await req.json();
    const percentage = Math.round((score / totalQuestions) * 100);
    const moduleId = getCanonicalQuizKey(rawModuleId);

    if (agentId && agentName && agentId !== MOCKUP_AGENT_ID) {
      // Get active training period
      const activePeriod = await getActiveTrainingPeriod(agentId);
      const trainingPeriodId = activePeriod?.id;

      await Promise.all([
        fsAdd('quiz_results', { 
          agentId, 
          agentName, 
          moduleId, 
          score, 
          totalQuestions, 
          passed, 
          percentage,
          trainingPeriodId 
        }),
        updateGlobalQuizStats(moduleId, percentage, passed),
        updateAgentOverallScore(agentId, agentName)
      ]);
    }

    return NextResponse.json({ passed, score, totalQuestions });
  } catch (error) {
    console.error('[Quiz Submit] Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
