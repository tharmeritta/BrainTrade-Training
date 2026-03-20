import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrManager, requireAdminManagerOrTrainer } from '@/lib/session';
import { fsAdd } from '@/lib/firestore-db';
import { getAllAgentStats } from '@/lib/agents';

export async function GET() {
  try { await requireAdminManagerOrTrainer(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  try {
    const agents = await getAllAgentStats();
    return NextResponse.json({ agents });
  } catch (err: any) {
    console.error('admin agents error:', err);
    return NextResponse.json({ error: 'Failed to fetch agents', details: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try { await requireAdminOrManager(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { name } = body;
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  try {
    const agent = await fsAdd('agents', { name: name.trim(), active: true });
    return NextResponse.json(agent);
  } catch (err: any) {
    console.error('Create agent error:', err);
    return NextResponse.json({ error: 'Failed to create agent', details: err.message }, { status: 500 });
  }
}
