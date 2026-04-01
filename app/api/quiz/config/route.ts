import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { TRAINING_REGISTRY, getCanonicalQuizKey } from '@/lib/registry';

// Agents need to fetch quiz definitions without admin privileges.
export async function GET(req: NextRequest) {
  const moduleId = req.nextUrl.searchParams.get('moduleId');
  
  try {
    const db = getAdminDb();
    const doc = await db.collection('module_config').doc('quizzes').get();
    
    if (!doc.exists) {
      console.log('[API Quiz] No Firestore document found for "module_config/quizzes", using hardcoded fallbacks.');
      return NextResponse.json({ config: null });
    }

    const data = doc.data();
    const allQuizzes = data?.definitions || {};
    
    if (moduleId) {
      const canonicalKey = getCanonicalQuizKey(moduleId);
      const def = (TRAINING_REGISTRY.quiz.definitions as any)[canonicalKey];
      const expectedId = def?.id || moduleId;

      // 1. Try expected ID from registry
      let config = allQuizzes[expectedId];

      // 2. Try exact moduleId passed in
      if (!config && moduleId !== expectedId) {
        config = allQuizzes[moduleId];
      }

      // 3. Try case-insensitive lookup
      if (!config) {
        const key = Object.keys(allQuizzes).find(k => 
          k.toLowerCase() === expectedId.toLowerCase() || 
          k.toLowerCase() === moduleId.toLowerCase() ||
          k.toLowerCase() === canonicalKey.toLowerCase()
        );
        if (key) config = allQuizzes[key];
      }

      console.log(`[API Quiz] Fetching moduleId: ${moduleId} (canonical: ${canonicalKey}). Found in DB: ${!!config}`);
      return NextResponse.json({ config: config || null });
    }

    return NextResponse.json({ configs: allQuizzes });
  } catch (err: any) {
    console.error('Fetch quiz config error:', err.message);
    return NextResponse.json({ error: 'Failed to fetch quiz config' }, { status: 500 });
  }
}
