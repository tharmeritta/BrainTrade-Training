import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, requireAdminManagerOrTrainer } from '@/lib/session';
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
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Handle bulk import
  if (Array.isArray(body)) {
    const agentsToCreate = body.filter(a => a.name?.trim());
    if (agentsToCreate.length === 0) return NextResponse.json({ error: 'No valid agents provided' }, { status: 400 });

    try {
      const results = [];
      for (const a of agentsToCreate) {
        const agent = await fsAdd('agents', { 
          name: a.name.trim(), 
          stageName: a.stageName?.trim() || '',
          active: true 
        });
        results.push(agent);
      }
      return NextResponse.json({ success: true, count: results.length, agents: results });
    } catch (err: any) {
      console.error('Bulk create agents error:', err);
      return NextResponse.json({ error: 'Failed to create agents', details: err.message }, { status: 500 });
    }
  }

  // Handle single creation
  const { name, stageName } = body;
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  try {
    const agent = await fsAdd('agents', { 
      name: name.trim(), 
      stageName: stageName?.trim() || '',
      active: true 
    });
    return NextResponse.json(agent);
  } catch (err: any) {
    console.error('Create agent error:', err);
    return NextResponse.json({ error: 'Failed to create agent', details: err.message }, { status: 500 });
  }
}
