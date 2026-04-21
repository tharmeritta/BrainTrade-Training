import { NextResponse } from 'next/server';
import { fsQuery } from '@/lib/firestore-db';
import type { Agent } from '@/types';

/**
 * GET /api/agents
 * Optimized: Uses indexed query to fetch only active agents.
 * Limits fields to reduce bandwidth.
 */
export async function GET() {
  try {
    const agents = await fsQuery<Agent>('agents', {
      where: [{ field: 'active', op: '==', value: true }]
    });

    const active = agents
      .map(a => ({ 
        id: a.id, 
        name: a.name, 
        stageName: a.stageName ?? '' 
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ agents: active });
  } catch (err: any) {
    console.error('[API Agents] GET error:', err.message);
    return NextResponse.json({ agents: [], error: 'Failed to fetch agents' });
  }
}
