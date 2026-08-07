import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/session/server';
import { generateCoachingBrief } from '@/lib/services/telesales-coaching';

export async function POST(req: NextRequest) {
  const user = await getServerUser();
  if (!user || !['evaluator', 'admin', 'manager', 'trainer'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { scenarioName, messages, score } = await req.json();
    const brief = await generateCoachingBrief(scenarioName || 'Telesales Practice', messages || [], score);
    return NextResponse.json({ brief });
  } catch (err: any) {
    console.error('[API Coaching Brief] Error:', err.message);
    return NextResponse.json({ error: 'Failed to generate coaching brief' }, { status: 500 });
  }
}
