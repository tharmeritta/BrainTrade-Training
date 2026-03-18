import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/session';
import { fsUpdate as gcsUpdate } from '@/lib/firestore-db';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getServerUser();
  if (!user || !['evaluator', 'admin', 'manager'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  await gcsUpdate('agent_evaluations', id, { ...body, updatedAt: new Date().toISOString() });
  return NextResponse.json({ ok: true });
}
