import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { getServerUser } from '@/lib/session';
import { getCanonicalQuizKey } from '@/lib/registry';

export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user || (user.role !== 'admin' && user.role !== 'it')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agentId, moduleId, type } = await req.json();

    if (!agentId || !moduleId || !type) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const db = getAdminDb();
    const canonicalId = getCanonicalQuizKey(moduleId);

    if (type === 'quiz') {
      // Create a synthetic passing quiz result
      const quizRef = db.collection('quiz_results').doc(`${agentId}_${canonicalId}_override`);
      await quizRef.set({
        agentId,
        moduleId: canonicalId,
        score: 100,
        totalQuestions: 100, // Matching the field name in lib/agents.ts
        passed: true,
        timestamp: new Date().toISOString(),
        manualOverride: true,
        overriddenBy: user.name
      });
    } else if (type === 'ai-eval') {
      // Create a synthetic passing AI eval result
      const evalRef = db.collection('ai_eval_logs').doc(`${agentId}_lv${moduleId}_override`);
      await evalRef.set({
        agentId,
        level: parseInt(moduleId),
        score: 100,
        passed: true,
        timestamp: new Date().toISOString(),
        manualOverride: true,
        overriddenBy: user.name,
        feedback: "Manual override by administrator"
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Override error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
