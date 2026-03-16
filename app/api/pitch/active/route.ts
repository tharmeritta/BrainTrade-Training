import { NextRequest, NextResponse } from 'next/server';
import { gcsGet, gcsSet, gcsDelete } from '@/lib/gcs';
import type { PitchMessage } from '@/types';

interface ActivePitchSession {
  agentId: string;
  sessionId: string;
  level: 1 | 2 | 3;
  messages: PitchMessage[];
  savedAt: number;
}

// GET /api/pitch/active?agentId=xxx
export async function GET(req: NextRequest) {
  const agentId = req.nextUrl.searchParams.get('agentId');
  if (!agentId) return NextResponse.json({ session: null });
  try {
    const session = await gcsGet<ActivePitchSession>('pitch_active', agentId);
    return NextResponse.json({ session: session ?? null });
  } catch {
    return NextResponse.json({ session: null });
  }
}

// POST /api/pitch/active — upsert active session with latest messages
export async function POST(req: NextRequest) {
  try {
    const { agentId, sessionId, level, messages } = await req.json();
    if (!agentId || !sessionId) {
      return NextResponse.json({ error: 'agentId and sessionId required' }, { status: 400 });
    }
    await gcsSet<ActivePitchSession>('pitch_active', agentId, {
      agentId,
      sessionId,
      level,
      messages,
      savedAt: Date.now(),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Pitch active save error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/pitch/active?agentId=xxx — clear active session on quit or completion
export async function DELETE(req: NextRequest) {
  const agentId = req.nextUrl.searchParams.get('agentId');
  if (!agentId) return NextResponse.json({ error: 'agentId required' }, { status: 400 });
  try {
    await gcsDelete('pitch_active', agentId);
  } catch {
    // File may not exist — ignore
  }
  return NextResponse.json({ ok: true });
}
