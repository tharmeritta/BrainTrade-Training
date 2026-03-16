import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, requireAdminOrManager } from '@/lib/session';
import { gcsUpdate, gcsDelete } from '@/lib/gcs';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdminOrManager(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const { id } = await params;
  const { active } = await req.json();
  await gcsUpdate('agents', id, { active });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Delete is admin-only — managers cannot delete agents
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const { id } = await params;
  await gcsDelete('agents', id);
  return NextResponse.json({ ok: true });
}
