import { NextRequest, NextResponse } from 'next/server';
import { requireAdminManagerOrTrainer } from '@/lib/session';
import { fsAdd, fsGetAll } from '@/lib/firestore-db';
import type { TrainingPeriod } from '@/types';

export async function GET() {
  try { await requireAdminManagerOrTrainer(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  try {
    const periods = await fsGetAll<TrainingPeriod>('training_periods');
    return NextResponse.json({ periods: periods.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
  } catch { return NextResponse.json({ periods: [] }); }
}

export async function POST(req: NextRequest) {
  let user;
  try { user = await requireAdminManagerOrTrainer(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const body = await req.json();
  const { name, agentIds, agentNames, totalDays, startDate, trainerId, trainerName, dayTopics } = body;
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  // If user is admin/manager and provided trainer info, use it. Otherwise use current user.
  const finalTrainerId = (['admin', 'manager'].includes(user.role) && trainerId) ? trainerId : user.uid;
  const finalTrainerName = (['admin', 'manager'].includes(user.role) && trainerName) ? trainerName : user.name;

  const period = await fsAdd<Omit<TrainingPeriod, 'id'>>('training_periods', {
    name: name.trim(),
    agentIds: agentIds ?? [],
    agentNames: agentNames ?? {},
    totalDays: totalDays ?? 5,
    startDate: startDate ?? new Date().toISOString().slice(0, 10),
    trainerId: finalTrainerId,
    trainerName: finalTrainerName,
    dayTopics: dayTopics ?? {},
    active: true,
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json(period);
}
