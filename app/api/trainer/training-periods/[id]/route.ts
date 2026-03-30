import { NextRequest, NextResponse } from 'next/server';
import { requireTrainer } from '@/lib/session';
import { fsUpdate, fsDelete } from '@/lib/firestore-db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireTrainer(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const { id } = await params;
  const body = await req.json();
  const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (typeof body.name === 'string') update.name = body.name.trim();
  if (typeof body.totalDays === 'number') update.totalDays = Math.max(1, body.totalDays);
  if (typeof body.active === 'boolean') update.active = body.active;
  if (body.agentIds) update.agentIds = body.agentIds;
  if (body.agentNames) update.agentNames = body.agentNames;
  if (typeof body.startDate === 'string') update.startDate = body.startDate;
  if (body.dayTopics) update.dayTopics = body.dayTopics;
  await fsUpdate('training_periods', id, update);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireTrainer(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const { id } = await params;
  await fsDelete('training_periods', id);
  return NextResponse.json({ ok: true });
}
