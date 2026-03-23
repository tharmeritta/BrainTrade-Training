import { NextRequest, NextResponse } from 'next/server';
import { fsAdd } from '@/lib/firestore-db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { level, agentId, agentName } = await req.json();

    if (agentId && agentName) {
      const record = await fsAdd('ai_eval_sessions', { agentId, agentName, level });
      return NextResponse.json({ sessionId: record.id, level });
    }

    return NextResponse.json({ sessionId: crypto.randomUUID(), level });
  } catch (err: any) {
    console.error('AI session start error:', err);
    return NextResponse.json({ error: 'Server error', details: err.message }, { status: 500 });
  }
}
