import { NextRequest, NextResponse } from 'next/server';
import { gcsGet, gcsSet } from '@/lib/gcs';

export interface ProgressRecord {
  agentId: string;
  agentName: string;
  pitchCompletedLevels: number[];
  evalCompletedLevels: number[];
  evalSavedLevel: number | null;
  updatedAt?: string;
}

function defaults(agentId: string, agentName = ''): ProgressRecord {
  return { agentId, agentName, pitchCompletedLevels: [], evalCompletedLevels: [], evalSavedLevel: null };
}

// GET /api/agent/progress?agentId=xxx
export async function GET(req: NextRequest) {
  const agentId = req.nextUrl.searchParams.get('agentId');
  if (!agentId) return NextResponse.json({ error: 'agentId required' }, { status: 400 });

  try {
    const record = await gcsGet<ProgressRecord>('agent_progress', agentId);
    return NextResponse.json(record ?? defaults(agentId));
  } catch {
    return NextResponse.json(defaults(agentId));
  }
}

// POST /api/agent/progress
// Body may include any subset of fields — completed levels are always unioned (never shrink).
export async function POST(req: NextRequest) {
  try {
    const body: Partial<ProgressRecord> & { agentId: string; agentName: string } = await req.json();
    const { agentId, agentName } = body;
    if (!agentId) return NextResponse.json({ error: 'agentId required' }, { status: 400 });

    const existing = await gcsGet<ProgressRecord>('agent_progress', agentId) ?? defaults(agentId, agentName);

    const merged: ProgressRecord = {
      agentId,
      agentName: agentName || existing.agentName,
      // Completed levels only ever grow — union of server + incoming
      pitchCompletedLevels: Array.from(
        new Set([...existing.pitchCompletedLevels, ...(body.pitchCompletedLevels ?? [])])
      ).sort((a, b) => a - b),
      evalCompletedLevels: Array.from(
        new Set([...existing.evalCompletedLevels, ...(body.evalCompletedLevels ?? [])])
      ).sort((a, b) => a - b),
      // evalSavedLevel: null means "clear it"; omitted means "keep existing"
      evalSavedLevel: 'evalSavedLevel' in body ? (body.evalSavedLevel ?? null) : existing.evalSavedLevel,
    };

    const saved = await gcsSet('agent_progress', agentId, merged);
    return NextResponse.json(saved);
  } catch (err) {
    console.error('Progress save error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
