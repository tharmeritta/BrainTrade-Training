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

    const { agentId, agentName, moduleId, type, score, isBypassed, bypassReason } = await req.json();

    if (!agentId || !moduleId || !type) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const db = getAdminDb();
    const canonicalId = getCanonicalQuizKey(moduleId);
    const finalScore = typeof score === 'number' ? score : 100;

    if (type === 'quiz') {
      // Create a synthetic passing quiz result
      const quizRef = db.collection('quiz_results').doc(`${agentId}_${canonicalId}_override`);
      await quizRef.set({
        agentId,
        moduleId: canonicalId,
        score: finalScore,
        totalQuestions: 100, // Using 100 as base for percentage-based override
        passed: true,
        timestamp: new Date().toISOString(),
        manualOverride: true,
        overriddenBy: user.name
      });
    } else if (type === 'ai-eval') {
      const timestamp = new Date().toISOString();
      const level = parseInt(moduleId);
      
      // 1. Create a synthetic passing AI eval result in legacy logs
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
        feedback: isBypassed 
          ? `Bypassed by ${user.name}. Reason: ${bypassReason}`
          : `Manual override by ${user.name} with score ${finalScore}%`
      });

      // 2. Also write to the new v2 logs
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
      });

      // 3. Update agent progress so it reflects in the UI
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
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Override error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
