import { NextRequest, NextResponse } from 'next/server';
import { fsAdd as gcsAdd } from '@/lib/firestore-db';

export async function POST(req: NextRequest) {
  try {
    const { moduleId, score, totalQuestions, passed, agentId, agentName } = await req.json();
    const percentage = Math.round((score / totalQuestions) * 100);

    if (agentId && agentName) {
      await gcsAdd('quiz_results', { agentId, agentName, moduleId, score, totalQuestions, passed, percentage });
    }

    return NextResponse.json({ passed, score, totalQuestions });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
