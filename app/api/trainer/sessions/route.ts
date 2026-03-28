import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/session';
import { fsAdd } from '@/lib/firestore-db';
import type { LiveSessionRecord } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user || !['admin', 'manager', 'it', 'trainer'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      trainingPeriodId, moduleId, moduleTitle, 
      trainerId, trainerName, startTime, endTime, 
      durationSecs, agentCount, notes, engagement 
    } = body;

    const sessionData: Omit<LiveSessionRecord, 'id'> = {
      trainingPeriodId: trainingPeriodId || '',
      moduleId: moduleId || '',
      moduleTitle: moduleTitle || '',
      trainerId: trainerId || user.uid,
      trainerName: trainerName || user.name,
      startTime: startTime || new Date().toISOString(),
      endTime: endTime || new Date().toISOString(),
      durationSecs: durationSecs || 0,
      agentCount: agentCount || 0,
      notes: notes || '',
      engagement: engagement || { heart: 0, hand: 0, smile: 0 },
      createdAt: new Date().toISOString(),
    };

    const session = await fsAdd<Omit<LiveSessionRecord, 'id'>>('live_sessions', sessionData);
    return NextResponse.json(session);
  } catch (err: any) {
    console.error('[API Session POST Error]:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
