import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { getCanonicalQuizKey, TRAINING_REGISTRY } from '@/lib/registry';

export async function POST(req: NextRequest) {
  try {
    const { agentId } = await req.json();
    if (!agentId) return NextResponse.json({ error: 'agentId required' }, { status: 400 });

    const db = getAdminDb();

    // 1. Fetch all raw data for this agent
    const [quizSnap, evalSnap, progressSnap] = await Promise.all([
      db.collection('quiz_results').where('agentId', '==', agentId).get(),
      db.collection('ai_eval_logs').where('agentId', '==', agentId).get(),
      db.collection('agent_progress').doc(agentId).get()
    ]);

    const quizDocs = quizSnap.docs.map(d => d.data());
    const evalDocs = evalSnap.docs.map(d => d.data());
    const existingProgress = progressSnap.exists ? progressSnap.data() : { learnedModules: [], evalCompletedLevels: [] };

    // 2. Determine passed quizzes (normalized)
    const passedQuizzes = new Set<string>();
    quizDocs.forEach(q => {
      if (q.passed) {
        passedQuizzes.add(getCanonicalQuizKey(q.moduleId));
      }
    });

    // 3. Determine AI eval levels completed
    const passedEvalLevels = new Set<number>(existingProgress?.evalCompletedLevels || []);
    evalDocs.forEach(e => {
      if (e.passed && e.level) {
        passedEvalLevels.add(Number(e.level));
      }
    });

    // 4. Update the aggregate progress document
    const updatedProgress = {
      ...existingProgress,
      agentId,
      evalCompletedLevels: Array.from(passedEvalLevels).sort((a, b) => a - b),
      updatedAt: new Date().toISOString(),
      syncSource: 'manual_button'
    };

    await db.collection('agent_progress').doc(agentId).set(updatedProgress, { merge: true });

    return NextResponse.json({ 
      success: true, 
      synced: {
        quizzes: Array.from(passedQuizzes),
        levels: updatedProgress.evalCompletedLevels
      }
    });
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
