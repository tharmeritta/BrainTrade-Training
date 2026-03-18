import { NextRequest, NextResponse } from 'next/server';
import { requireAdminManagerOrTrainer } from '@/lib/session';
import { fsAdd, fsGetAll } from '@/lib/firestore-db';
import type { DisciplineRecord } from '@/types';

export async function GET(req: NextRequest) {
  try { await requireAdminManagerOrTrainer(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const { searchParams } = new URL(req.url);
  const periodId = searchParams.get('periodId');
  const agentId = searchParams.get('agentId');
  try {
    let records = await fsGetAll<DisciplineRecord>('discipline_records');
    if (periodId) records = records.filter(r => r.trainingPeriodId === periodId);
    if (agentId) records = records.filter(r => r.agentId === agentId);
    return NextResponse.json({ records: records.sort((a, b) => b.date.localeCompare(a.date)) });
  } catch { return NextResponse.json({ records: [] }); }
}

export async function POST(req: NextRequest) {
  let user;
  try { user = await requireAdminManagerOrTrainer(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const body = await req.json();
  const { agentId, agentName, trainingPeriodId, date, type, description } = body;
  if (!agentId || !trainingPeriodId || !type) return NextResponse.json({ error: 'agentId, trainingPeriodId, and type required' }, { status: 400 });
  const record = await fsAdd('discipline_records', {
    agentId,
    agentName: agentName ?? '',
    trainingPeriodId,
    trainerId: user.uid,
    trainerName: user.name,
    date: date ?? new Date().toISOString().slice(0, 10),
    type,
    description: description ?? '',
  });
  return NextResponse.json(record);
}
