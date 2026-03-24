import { NextResponse } from 'next/server';
import { fsGetAll } from '@/lib/firestore-db';
import type { Agent } from '@/types';

export async function GET() {
  try {
    const agents = await fsGetAll<Agent>('agents');
    const active = agents
      .filter(a => a.active)
      .map(a => ({ id: a.id, name: a.name, stageName: a.stageName ?? '' }))
      .sort((a, b) => a.name.localeCompare(b.name));
    return NextResponse.json({ agents: active });
  } catch (err: any) {
    console.error('[API Agents] GET error:', err.message);
    return NextResponse.json({ agents: [], error: err.message });
  }
}
