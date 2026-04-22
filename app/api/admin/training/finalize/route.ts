import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { getServerUser } from '@/lib/session';
import { AuditService } from '@/lib/services/audit-service';
import { recalculateGlobalStats } from '@/lib/services/stats-service';

/**
 * POST: Finalize and archive a training batch
 * Body: { periodId: string }
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user || !['admin', 'it', 'manager'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { periodId } = await req.json();
    if (!periodId) return NextResponse.json({ error: 'periodId required' }, { status: 400 });

    const db = getAdminDb();
    const periodRef = db.collection('training_periods').doc(periodId);
    const periodSnap = await periodRef.get();

    if (!periodSnap.exists) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const periodData = periodSnap.data();
    if (!periodData?.active) {
      return NextResponse.json({ error: 'Batch already finalized' }, { status: 400 });
    }

    const agentIds = periodData.agentIds || [];
    const timestamp = new Date().toISOString();

    const batch = db.batch();

    // 1. Mark the training period as completed/inactive
    batch.update(periodRef, {
      active: false,
      completedAt: timestamp,
      updatedAt: timestamp
    });

    // 2. Mark all agents in this batch as graduated and inactive for live tracking
    for (const agentId of agentIds) {
      const agentRef = db.collection('agents').doc(agentId);
      batch.update(agentRef, {
        active: false, // This removes them from the "Live" dashboard
        graduated: true,
        graduatedAt: timestamp,
        updatedAt: timestamp
      });

      // Update their progress record too
      const progressRef = db.collection('agent_progress').doc(agentId);
      batch.set(progressRef, {
        graduated: true,
        graduatedAt: timestamp,
        updatedAt: timestamp
      }, { merge: true });
    }

    await batch.commit();

    // 3. Trigger global stats recalculation to reflect the "fresh start"
    await recalculateGlobalStats();

    // 4. Log the audit event
    await AuditService.log({
      userId: user.uid,
      userName: user.name,
      userRole: user.role,
      action: 'batch_archive',
      targetId: periodId,
      targetName: periodData.name,
      details: { agentCount: agentIds.length }
    });

    return NextResponse.json({ success: true, message: `Batch ${periodData.name} archived successfully.` });
  } catch (error: any) {
    console.error('[Batch Finalize] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
