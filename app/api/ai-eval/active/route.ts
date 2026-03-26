import { NextRequest, NextResponse } from 'next/server';
import { fsGet, fsDelete } from '@/lib/firestore-db';
import { AiEvalSession } from '@/types/ai-eval';

// GET /api/ai-eval/active?agentId=xxx
export async function GET(req: NextRequest) {
  const agentId = req.nextUrl.searchParams.get('agentId');
  if (!agentId) return NextResponse.json({ session: null });
  try {
    const session = await fsGet<AiEvalSession>('aiev_sessions_v2', agentId);
    return NextResponse.json({ session: session ?? null });
  } catch {
    return NextResponse.json({ session: null });
  }
}

// DELETE /api/ai-eval/active?agentId=xxx — clear active session on quit or completion
export async function DELETE(req: NextRequest) {
  const agentId = req.nextUrl.searchParams.get('agentId');
  if (!agentId) return NextResponse.json({ error: 'agentId required' }, { status: 400 });
  try {
    await fsDelete('aiev_sessions_v2', agentId);
  } catch {
    // ignore
  }
  return NextResponse.json({ ok: true });
}
