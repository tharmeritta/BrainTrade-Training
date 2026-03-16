import { NextRequest, NextResponse } from 'next/server';
import { gcsAdd } from '@/lib/gcs';

export async function POST(req: NextRequest) {
  try {
    const { level, agentId, agentName } = await req.json();

    if (agentId && agentName) {
      const record = await gcsAdd('ai_eval_sessions', { agentId, agentName, level });
      return NextResponse.json({ sessionId: record.id, level });
    }

    return NextResponse.json({ sessionId: crypto.randomUUID(), level });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
