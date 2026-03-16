import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/session';
import { getAllAgentStats } from '@/lib/agents';

export async function GET() {
  const user = await getServerUser();
  if (!user || !['evaluator', 'admin', 'manager'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stats = await getAllAgentStats();
  return NextResponse.json({ stats });
}
