import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebase-admin';
import { getServerUser } from '@/lib/session/server';
import { getCanonicalQuizKey, TRAINING_REGISTRY } from '@/lib/registry';
import { updateAgentOverallScore, updateGlobalAiEvalStats, updateGlobalQuizStats } from '@/lib/services/stats-service';
import { AuditService } from '@/lib/services/audit-service';
import { BatchService } from '@/lib/services/batch-service';

/**
 * GET: List all manual overrides for auditing/management
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user || !['admin', 'it', 'manager'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getAdminDb();
    const snap = await db.collection('admin_overrides').orderBy('timestamp', 'desc').limit(100).get();
    const overrides = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    return NextResponse.json({ overrides });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST: Create a manual override
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user || (user.role !== 'admin' && user.role !== 'it')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agentId, agentName, moduleId, type, score, isBypassed, bypassReason } = await req.json();

    if (!agentId || !type || (type !== 'bulk-pass' && !moduleId)) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const db = getAdminDb();
    const timestamp = new Date().toISOString();
    const finalScore = (typeof score === 'number' && !isNaN(score)) ? score : 100;

    // Find the active training period for this agent to ensure stats reflect in reports
    const periodsSnap = await db.collection('training_periods').where('active', '==', true).get();
    const activePeriod = periodsSnap.docs.find(d => (d.data().agentIds || []).includes(agentId));
    const trainingPeriodId = activePeriod?.id || null;

    if (type === 'bulk-pass') {
      console.log(`[Override API] Starting bulk-pass for agent: ${agentId} (${agentName})`);
      
      try {
        await db.runTransaction(async (transaction) => {
          const progressRef = db.collection('agent_progress').doc(agentId);
          const progressDoc = await transaction.get(progressRef);
          
          let evalCompletedLevels = progressDoc.exists ? (progressDoc.data()?.evalCompletedLevels || []) : [];
          let learnedModules = progressDoc.exists ? (progressDoc.data()?.learnedModules || []) : [];

          // 0. Log to central overrides collection for audit trail
          const overrideId = `${agentId}_bulk-pass_${Date.now()}`;
          const overrideRef = db.collection('admin_overrides').doc(overrideId);
          transaction.set(overrideRef, {
            agentId,
            agentName: agentName || 'Unknown Agent',
            moduleId: 'all-required',
            type: 'bulk-pass',
            score: finalScore,
            isBypassed: true,
            bypassReason: bypassReason || 'Bulk training pass',
            adminName: user.name,
            adminId: user.uid,
            timestamp
          });

          // 1. Mark all required quizzes as passed
          for (const quizId of TRAINING_REGISTRY.quiz.required) {
            const canonicalId = getCanonicalQuizKey(quizId);
            const quizRef = db.collection('quiz_results').doc(`${agentId}_${canonicalId}_override`);
            transaction.set(quizRef, {
              agentId,
              moduleId: canonicalId,
              score: finalScore,
              totalQuestions: 100,
              passed: true,
              timestamp,
              manualOverride: true,
              overriddenBy: user.name,
              trainingPeriodId
            });
          }

          // 2. Mark all AI Eval levels up to requiredLevel as passed
          const requiredLevel = TRAINING_REGISTRY.eval.requiredLevel;
          for (let level = 1; level <= requiredLevel; level++) {
            // v1 and v2 logs
            const evalRef = db.collection('ai_eval_logs').doc(`${agentId}_lv${level}_override`);
            transaction.set(evalRef, {
              agentId,
              level,
              score: finalScore,
              passed: true,
              timestamp,
              manualOverride: true,
              overriddenBy: user.name,
              trainingPeriodId
            });

            const difficultyMap: Record<number, string> = { 1: 'beginner', 2: 'intermediate', 3: 'advanced', 4: 'expert' };
            const v2Ref = db.collection('ai_eval_logs_v2').doc(`${agentId}_lv${level}_v2_override`);
            transaction.set(v2Ref, {
              agentId,
              agentName: agentName || 'Agent',
              level,
              difficulty: difficultyMap[level] || 'beginner',
              passed: true,
              score: finalScore,
              timestamp,
              manualOverride: true,
              overriddenBy: user.name,
              trainingPeriodId
            });

            if (!evalCompletedLevels.includes(level)) {
              evalCompletedLevels.push(level);
            }
          }

          // 3. Ensure Learn phase is also passed (add required modules if needed)
          if (learnedModules.length < TRAINING_REGISTRY.learn.minToUnlockNext) {
            learnedModules = Array.from(new Set([...learnedModules, ...TRAINING_REGISTRY.learn.required]));
          }

          transaction.set(progressRef, {
            evalCompletedLevels,
            learnedModules,
            updatedAt: timestamp,
            graduated: true,
            graduatedAt: timestamp
          }, { merge: true });

          // 4. Mark agent as graduated in main doc
          const agentRef = db.collection('agents').doc(agentId);
          transaction.update(agentRef, {
            graduated: true,
            graduatedAt: timestamp,
            updatedAt: timestamp
          });
        });

        console.log(`[Override API] Transaction committed for agent: ${agentId}`);

        // Update global stats and agent score (outside transaction as they are secondary)
        for (const quizId of TRAINING_REGISTRY.quiz.required) {
          await updateGlobalQuizStats(getCanonicalQuizKey(quizId), finalScore, true).catch(e => console.error('Stat update error (quiz):', e));
        }
        for (let level = 1; level <= TRAINING_REGISTRY.eval.requiredLevel; level++) {
          await updateGlobalAiEvalStats(finalScore, true).catch(e => console.error('Stat update error (eval):', e));
        }

        // Trigger agent overall score update
        await updateAgentOverallScore(agentId, agentName || 'Agent', {
          id: user.uid,
          name: user.name,
          role: user.role
        });

        // If part of a period, check if it's now complete
        if (trainingPeriodId) {
          await BatchService.checkBatchCompletion(trainingPeriodId);
        }

        // Log the audit event
        await AuditService.log({
          userId: user.uid,
          userName: user.name,
          userRole: user.role,
          action: 'override_create',
          targetId: agentId,
          targetName: agentName,
          details: { type: 'bulk-pass', score: finalScore }
        });

        return NextResponse.json({ success: true });
      } catch (transactionError: any) {
        console.error('[Override API] Transaction failed:', transactionError);
        throw transactionError;
      }
    }

    const canonicalId = getCanonicalQuizKey(moduleId);

    // Log to central overrides collection
    const overrideId = `${agentId}_${type}_${moduleId}_${Date.now()}`;
    await db.collection('admin_overrides').doc(overrideId).set({
      agentId,
      agentName: agentName || 'Unknown Agent',
      moduleId: canonicalId,
      type,
      score: finalScore,
      isBypassed: !!isBypassed,
      bypassReason: bypassReason || '',
      adminName: user.name,
      adminId: user.uid,
      timestamp
    });

    if (type === 'quiz') {
      // Create a synthetic passing quiz result
      const quizRef = db.collection('quiz_results').doc(`${agentId}_${canonicalId}_override`);
      await quizRef.set({
        agentId,
        moduleId: canonicalId,
        score: finalScore,
        totalQuestions: 100,
        passed: true,
        timestamp,
        manualOverride: true,
        overriddenBy: user.name,
        trainingPeriodId
      });
      
      // Update stats
      await updateGlobalQuizStats(canonicalId, finalScore, true);
    } else if (type === 'ai-eval') {
      const level = parseInt(moduleId);
      
      // 1. Create legacy log
      const evalRef = db.collection('ai_eval_logs').doc(`${agentId}_lv${moduleId}_override`);
      await evalRef.set({
        agentId,
        level,
        score: finalScore,
        passed: true,
        timestamp,
        manualOverride: true,
        isBypassed: isBypassed || false,
        bypassReason: bypassReason || '',
        overriddenBy: user.name,
        trainingPeriodId
      });

      // 2. Create v2 log
      const difficultyMap: Record<number, string> = { 1: 'beginner', 2: 'intermediate', 3: 'advanced', 4: 'expert' };
      const v2Ref = db.collection('ai_eval_logs_v2').doc(`${agentId}_lv${moduleId}_v2_override`);
      await v2Ref.set({
        agentId,
        agentName: agentName || 'Agent',
        level,
        difficulty: difficultyMap[level] || 'beginner',
        passed: true,
        score: finalScore,
        timestamp,
        manualOverride: true,
        isBypassed: isBypassed || false,
        bypassReason: bypassReason || '',
        overriddenBy: user.name,
        trainingPeriodId
      });

      // 3. Update agent progress
      const progressRef = db.collection('agent_progress').doc(agentId);
      const progressDoc = await progressRef.get();
      let evalCompletedLevels = [];
      if (progressDoc.exists) {
        evalCompletedLevels = progressDoc.data()?.evalCompletedLevels || [];
      }
      if (!evalCompletedLevels.includes(level)) {
        evalCompletedLevels.push(level);
        await progressRef.set({
          evalCompletedLevels,
          updatedAt: timestamp
        }, { merge: true });
      }

      // Update stats
      await updateGlobalAiEvalStats(finalScore, true);
    }

    // Always trigger agent overall score update after any override
    await updateAgentOverallScore(agentId, agentName || 'Agent', {
      id: user.uid,
      name: user.name,
      role: user.role
    });

    // If part of a period, check if it's now complete
    if (trainingPeriodId) {
      await BatchService.checkBatchCompletion(trainingPeriodId);
    }

    // Log the audit event
    await AuditService.log({
      userId: user.uid,
      userName: user.name,
      userRole: user.role,
      action: 'override_create',
      targetId: agentId,
      targetName: agentName,
      details: { moduleId, type, score: finalScore, isBypassed }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Override error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


/**
 * DELETE: Revert a manual override
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const agentId = searchParams.get('agentId');
    const type = searchParams.get('type');
    const moduleId = searchParams.get('moduleId');

    if (!id || !agentId || !type || !moduleId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const db = getAdminDb();
    const batch = db.batch();

    // 1. Remove from activity log
    batch.delete(db.collection('admin_overrides').doc(id));

    // 2. Remove the specific log
    if (type === 'quiz') {
      batch.delete(db.collection('quiz_results').doc(`${agentId}_${moduleId}_override`));
    } else if (type === 'ai-eval') {
      batch.delete(db.collection('ai_eval_logs').doc(`${agentId}_lv${moduleId}_override`));
      batch.delete(db.collection('ai_eval_logs_v2').doc(`${agentId}_lv${moduleId}_v2_override`));
      
      // Note: We don't automatically remove from evalCompletedLevels because they might 
      // have a legitimate pass. The sync service or recalculation will handle it.
    }

    await batch.commit();

    // Trigger agent overall score update after deletion
    await updateAgentOverallScore(agentId, 'Agent', {
      id: user.uid,
      name: user.name,
      role: user.role
    });

    // Log the audit event
    await AuditService.log({
      userId: user.uid,
      userName: user.name,
      userRole: user.role,
      action: 'override_delete',
      targetId: agentId,
      details: { id, type, moduleId }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
