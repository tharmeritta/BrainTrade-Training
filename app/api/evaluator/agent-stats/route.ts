import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/session';
import { getAllAgentStats } from '@/lib/agents';

export async function GET(req: Request) {
  const user = await getServerUser();
  if (!user || !['evaluator', 'admin', 'manager'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get('agentId');
  if (!agentId) return NextResponse.json({ stats: null });

  const allStats = await getAllAgentStats();
  const stats = allStats.find(s => s.agent.id === agentId) ?? null;
  return NextResponse.json({ stats });
}
