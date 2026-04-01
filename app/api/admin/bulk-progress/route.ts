import { NextRequest, NextResponse } from 'next/server';
import { fsGet, fsSet } from '@/lib/firestore-db';

interface ProgressRecord {
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

/**
 * POST /api/admin/bulk-progress
 * Body: { agentIds: string[], moduleId: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { agentIds, moduleId } = await req.json();

    if (!Array.isArray(agentIds) || !moduleId) {
      return NextResponse.json({ error: 'agentIds (array) and moduleId required' }, { status: 400 });
    }

    const timestamp = new Date().toISOString();

    const results = await Promise.all(agentIds.map(async (agentId) => {
      // 1. Update/Create Progress Record
      const existing = await fsGet<ProgressRecord>('agent_progress', agentId) ?? defaults(agentId);
      
      const alreadyLearned = existing.learnedModules.includes(moduleId);
      if (alreadyLearned) return { agentId, status: 'already-learned' };

      const merged: ProgressRecord = {
        ...existing,
        learnedModules: Array.from(new Set([...existing.learnedModules, moduleId])).sort(),
        updatedAt: timestamp
      };

      await fsSet('agent_progress', agentId, merged);

      // 2. Log to Learning Logs (for Live Feed)
      await fsSet('learning_logs', `${agentId}_${moduleId}`, {
        agentId,
        agentName: merged.agentName,
        moduleId: moduleId,
        timestamp: timestamp,
        bulk: true // Mark as bulk processed by admin/trainer
      });

      return { agentId, status: 'updated' };
    }));

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error('Bulk progress error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
