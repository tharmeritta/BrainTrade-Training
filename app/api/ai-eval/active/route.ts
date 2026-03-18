import { NextRequest, NextResponse } from 'next/server';
import { fsGet, fsSet, fsDelete } from '@/lib/firestore-db';
import type { PitchMessage } from '@/types';

interface ActiveEvalSession {
  agentId: string;
  sessionId: string;
  level: 1 | 2 | 3 | 4;
  messages: PitchMessage[];
  savedAt: number;
}

// GET /api/ai-eval/active?agentId=xxx
export async function GET(req: NextRequest) {
  const agentId = req.nextUrl.searchParams.get('agentId');
  if (!agentId) return NextResponse.json({ session: null });
  try {
    const session = await fsGet<ActiveEvalSession>('aiev_active', agentId);
    return NextResponse.json({ session: session ?? null });
  } catch {
    return NextResponse.json({ session: null });
  }
}

// POST /api/ai-eval/active — upsert active session with latest messages
export async function POST(req: NextRequest) {
  try {
    const { agentId, sessionId, level, messages } = await req.json();
    if (!agentId || !sessionId) {
      return NextResponse.json({ error: 'agentId and sessionId required' }, { status: 400 });
    }
    await fsSet<ActiveEvalSession>('aiev_active', agentId, {
      agentId,
      sessionId,
      level,
      messages,
      savedAt: Date.now(),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('AI eval active save error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/ai-eval/active?agentId=xxx — clear active session on quit or completion
export async function DELETE(req: NextRequest) {
  const agentId = req.nextUrl.searchParams.get('agentId');
  if (!agentId) return NextResponse.json({ error: 'agentId required' }, { status: 400 });
  try {
    await fsDelete('aiev_active', agentId);
  } catch {
    // File may not exist — ignore
  }
  return NextResponse.json({ ok: true });
}
