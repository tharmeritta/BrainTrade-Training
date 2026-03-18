import { NextRequest, NextResponse } from 'next/server';
import { requireAdminManagerOrTrainer } from '@/lib/session';
import { gcsUpdate, gcsDelete } from '@/lib/gcs';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdminManagerOrTrainer(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const { id } = await params;
  const body = await req.json();
  const update: Record<string, unknown> = {};
  if (typeof body.type === 'string') update.type = body.type;
  if (typeof body.description === 'string') update.description = body.description;
  if (typeof body.date === 'string') update.date = body.date;
  await gcsUpdate('discipline_records', id, update);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdminManagerOrTrainer(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const { id } = await params;
  await gcsDelete('discipline_records', id);
  return NextResponse.json({ ok: true });
}
