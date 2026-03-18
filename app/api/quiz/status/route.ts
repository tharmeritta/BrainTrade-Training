import { NextRequest, NextResponse } from 'next/server';
import { fsGetAll } from '@/lib/firestore-db';

interface QuizResult {
  agentId: string;
  moduleId: string;
  passed: boolean;
}

export async function GET(req: NextRequest) {
  const agentId = req.nextUrl.searchParams.get('agentId');
  if (!agentId) return NextResponse.json({ passed: [] });

  const all = await fsGetAll<QuizResult>('quiz_results');
  const passed = all
    .filter(r => r.agentId === agentId && r.passed)
    .map(r => r.moduleId);

  return NextResponse.json({ passed: [...new Set(passed)] });
}
