import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrManager } from '@/lib/session';
import { gcsAdd } from '@/lib/gcs';
import { getAllAgentStats } from '@/lib/agents';

export async function GET() {
  try { await requireAdminOrManager(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  try {
    const agents = await getAllAgentStats();
    return NextResponse.json({ agents });
  } catch (err) {
    console.error('admin agents error:', err);
    return NextResponse.json({ agents: [] });
  }
}

export async function POST(req: NextRequest) {
  try { await requireAdminOrManager(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });
  const agent = await gcsAdd('agents', { name: name.trim(), active: true });
  return NextResponse.json(agent);
}
