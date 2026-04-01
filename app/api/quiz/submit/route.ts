import { NextRequest, NextResponse } from 'next/server';
import { fsAdd } from '@/lib/firestore-db';
import { MOCKUP_AGENT_ID } from '@/lib/agent-session';
import { getCanonicalQuizKey } from '@/lib/registry';

export async function POST(req: NextRequest) {
  try {
    const { moduleId: rawModuleId, score, totalQuestions, passed, agentId, agentName } = await req.json();
    const percentage = Math.round((score / totalQuestions) * 100);
    const moduleId = getCanonicalQuizKey(rawModuleId);

    if (agentId && agentName && agentId !== MOCKUP_AGENT_ID) {
      await fsAdd('quiz_results', { agentId, agentName, moduleId, score, totalQuestions, passed, percentage });
    }

    return NextResponse.json({ passed, score, totalQuestions });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
