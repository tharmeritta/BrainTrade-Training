import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, requireAdminManagerOrTrainer } from '@/lib/session';
import { fsUpdate, fsDelete } from '@/lib/firestore-db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdminManagerOrTrainer(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const { id } = await params;
  const body = await req.json();
  const update: Record<string, unknown> = {};
  if (typeof body.active === 'boolean') update.active = body.active;
  if (typeof body.name === 'string') {
    if (!body.name.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });
    update.name = body.name.trim();
  }
  if (typeof body.stageName === 'string') update.stageName = body.stageName.trim();
  await fsUpdate('agents', id, update);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Delete is admin-only — managers cannot delete agents
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const { id } = await params;
  await fsDelete('agents', id);
  return NextResponse.json({ ok: true });
}
