import { NextRequest, NextResponse } from 'next/server';
import { requireAdminManagerOrTrainer } from '@/lib/session/server';
import { getAllAgentStats } from '@/lib/agents';
import { HistoryService } from '@/lib/services/history-service';

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

    // 1. Try to get a frozen snapshot first (fast and permanent)
    const snapshot = await HistoryService.getBatchSnapshot(periodId);
    if (snapshot) {
      return NextResponse.json({ 
        stats: snapshot.agentStats, 
        summary: snapshot.summary,
        archived: true,
        completedAt: snapshot.completedAt
      });
    }

    // 2. Fallback to dynamic calculation (if not archived yet)
    const stats = await getAllAgentStats(periodId);

    return NextResponse.json({ stats, archived: false });
  } catch (err: any) {
    console.error('History API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
