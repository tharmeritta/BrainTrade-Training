import { NextRequest, NextResponse } from 'next/server';
import { requireAdminManagerOrTrainer } from '@/lib/session';
import { gcsAdd, gcsGetAll } from '@/lib/gcs';
import type { TrainingPeriod } from '@/types';

export async function GET() {
  try { await requireAdminManagerOrTrainer(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  try {
    const periods = await gcsGetAll<TrainingPeriod>('training_periods');
    return NextResponse.json({ periods: periods.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
  } catch { return NextResponse.json({ periods: [] }); }
}

export async function POST(req: NextRequest) {
  let user;
  try { user = await requireAdminManagerOrTrainer(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const body = await req.json();
  const { name, agentIds, agentNames, totalDays, startDate } = body;
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });
  const period = await gcsAdd<Omit<TrainingPeriod, 'id'>>('training_periods', {
    name: name.trim(),
    agentIds: agentIds ?? [],
    agentNames: agentNames ?? {},
    totalDays: totalDays ?? 5,
    startDate: startDate ?? new Date().toISOString().slice(0, 10),
    trainerId: user.uid,
    trainerName: user.name,
    active: true,
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json(period);
}
