import { NextRequest, NextResponse } from 'next/server';
import { fsQuery } from '@/lib/server/db';
import { getCanonicalQuizKey } from '@/lib/registry';

interface QuizResult {
  agentId: string;
  moduleId: string;
  passed: boolean;
}

export async function GET(req: NextRequest) {
  const agentId = req.nextUrl.searchParams.get('agentId');
  if (!agentId) return NextResponse.json({ passed: [] });

  // Optimized: Query only results for this agent that are passed
  const results = await fsQuery<QuizResult>('quiz_results', {
    where: [
      { field: 'agentId', op: '==', value: agentId },
      { field: 'passed', op: '==', value: true }
    ]
  });

  const passed = results.map(r => getCanonicalQuizKey(r.moduleId));

  return NextResponse.json({ passed: [...new Set(passed)] });
}
