import { NextRequest, NextResponse } from 'next/server';
import { getServerUser, requireAdminManagerOrTrainer } from '@/lib/session';
import { fsAdd, fsGetAll } from '@/lib/firestore-db';
import { createApprovalRequest } from '@/lib/services/approval-service';
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
  try { user = await getServerUser(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  if (!user || !['admin', 'manager', 'it', 'trainer'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { name, agentIds, agentNames, totalDays, startDate, trainerId, trainerName, dayTopics } = body;
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  // If user is admin/manager and provided trainer info, use it. Otherwise use current user.
  const finalTrainerId = (['admin', 'manager'].includes(user.role) && trainerId) ? trainerId : user.uid;
  const finalTrainerName = (['admin', 'manager'].includes(user.role) && trainerName) ? trainerName : user.name;

  const periodData = {
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
  };

  // IT and Manager roles require approval
  if (user.role === 'it' || user.role === 'manager') {
    await createApprovalRequest(
      { uid: user.uid, name: user.name },
      'create_training_period',
      periodData,
      { name: periodData.name }
    );
    return NextResponse.json({ message: 'Request submitted for approval' }, { status: 202 });
  }

  const period = await fsAdd<Omit<TrainingPeriod, 'id'>>('training_periods', periodData);
  return NextResponse.json(period);
}
