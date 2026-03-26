import { NextRequest, NextResponse } from 'next/server';
import { fsGet, fsSet, fsDelete } from '@/lib/firestore-db';
import { getAgentStats } from '@/lib/agents';

export interface ProgressRecord {
  agentId: string;
  agentName: string;
  evalCompletedLevels: number[];
  learnedModules: string[];
  evalSavedLevel: number | null;
  updatedAt?: string;
}

function defaults(agentId: string, agentName = ''): ProgressRecord {
  return { agentId, agentName, evalCompletedLevels: [], learnedModules: [], evalSavedLevel: null };
}

// GET /api/agent/progress?agentId=xxx&agentName=xxx
export async function GET(req: NextRequest) {
  const agentId   = req.nextUrl.searchParams.get('agentId');
  const agentName = req.nextUrl.searchParams.get('agentName') ?? '';
  if (!agentId) return NextResponse.json({ error: 'agentId required' }, { status: 400 });

  try {
    const stats = await getAgentStats(agentId, agentName);
    return NextResponse.json({ stats });
  } catch {
    return NextResponse.json({ stats: null });
  }
}

// POST /api/agent/progress
// Body may include any subset of fields — completed levels are always unioned (never shrink).
export async function POST(req: NextRequest) {
  try {
    const body: Partial<ProgressRecord> & { agentId: string; agentName: string } = await req.json();
    const { agentId, agentName } = body;
    if (!agentId) return NextResponse.json({ error: 'agentId required' }, { status: 400 });

    const existing = await fsGet<ProgressRecord>('agent_progress', agentId) ?? defaults(agentId, agentName);

    const newlyLearned = (body.learnedModules ?? []).filter(m => !existing.learnedModules.includes(m));

    const merged: ProgressRecord = {
      agentId,
      agentName: agentName || existing.agentName,
      evalCompletedLevels: Array.from(
        new Set([...existing.evalCompletedLevels, ...(body.evalCompletedLevels ?? [])])
      ).sort((a, b) => a - b),
      learnedModules: Array.from(
        new Set([...(existing.learnedModules ?? []), ...(body.learnedModules ?? [])])
      ).sort(),
      // evalSavedLevel: null means "clear it"; omitted means "keep existing"
      evalSavedLevel: 'evalSavedLevel' in body ? (body.evalSavedLevel ?? null) : existing.evalSavedLevel,
    };

    const saved = await fsSet('agent_progress', agentId, merged);

    // Log newly learned modules for the live feed
    if (newlyLearned.length > 0) {
      await Promise.all(newlyLearned.map(modId => 
        fsSet('learning_logs', `${agentId}_${modId}`, {
          agentId,
          agentName: merged.agentName,
          moduleId: modId,
          timestamp: new Date().toISOString()
        })
      ));
    }

    const evalDone = merged.evalCompletedLevels.length > 0;

    if (evalDone) {
      await Promise.allSettled([
        fsDelete('aiev_active', agentId),
      ]);
    }

    return NextResponse.json(saved);
  } catch (err) {
    console.error('Progress save error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
