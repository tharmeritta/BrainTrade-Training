import { NextResponse } from 'next/server';
import { gcsGetAll } from '@/lib/gcs';
import type { Agent } from '@/types';

export async function GET() {
  try {
    const agents = await gcsGetAll<Agent>('agents');
    const active = agents
      .filter(a => a.active)
      .map(a => ({ id: a.id, name: a.name, stageName: a.stageName ?? '' }))
      .sort((a, b) => a.name.localeCompare(b.name));
    return NextResponse.json({ agents: active });
  } catch {
    return NextResponse.json({ agents: [] });
  }
}
