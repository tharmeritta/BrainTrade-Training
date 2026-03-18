import { NextRequest, NextResponse } from 'next/server';
import { requireAdminManagerOrTrainer } from '@/lib/session';
import { gcsGetAll, gcsAdd, gcsUpdate } from '@/lib/gcs';
import type { TrainingDayRecord } from '@/types';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdminManagerOrTrainer(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const { id } = await params;
  const all = await gcsGetAll<TrainingDayRecord>('training_day_records');
  const records = all.filter(r => r.trainingPeriodId === id);
  return NextResponse.json({ records });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdminManagerOrTrainer(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const { id: trainingPeriodId } = await params;
  const body = await req.json();
  const { agentId, dayNumber, date, attendance, topics, notes } = body;
  if (!agentId || !dayNumber) return NextResponse.json({ error: 'agentId and dayNumber required' }, { status: 400 });

  // Check if record already exists for this agent/day/period — update it
  const all = await gcsGetAll<TrainingDayRecord>('training_day_records');
  const existing = all.find(r => r.trainingPeriodId === trainingPeriodId && r.agentId === agentId && r.dayNumber === dayNumber);
  if (existing) {
    await gcsUpdate('training_day_records', existing.id, {
      date: date ?? existing.date,
      attendance: attendance ?? existing.attendance,
      topics: topics ?? existing.topics,
      notes: notes ?? existing.notes,
      updatedAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, id: existing.id });
  }
  const record = await gcsAdd('training_day_records', {
    trainingPeriodId,
    agentId,
    dayNumber,
    date: date ?? new Date().toISOString().slice(0, 10),
    attendance: attendance ?? 'present',
    topics: topics ?? '',
    notes: notes ?? '',
  });
  return NextResponse.json(record);
}
