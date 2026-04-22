import { NextRequest, NextResponse } from 'next/server';
import { requireAdminManagerOrTrainer } from '@/lib/session';
import { getAllAgentStats } from '@/lib/agents';

/**
 * GET: Retrieve historical stats for a specific training period
 * Query: ?periodId=xxx
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminManagerOrTrainer();
    if (auth instanceof NextResponse) return auth;

    const periodId = req.nextUrl.searchParams.get('periodId');
    if (!periodId) return NextResponse.json({ error: 'periodId required' }, { status: 400 });

    // getAllAgentStats has been updated to filter by targetPeriodId
    const stats = await getAllAgentStats(periodId);

    return NextResponse.json({ stats });
  } catch (err: any) {
    console.error('History API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
