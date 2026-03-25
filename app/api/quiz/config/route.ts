import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

// Agents need to fetch quiz definitions without admin privileges.
// But we might want some basic auth check if needed.

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
      // 1. Try exact match
      let config = allQuizzes[moduleId];

      // 2. Try case-insensitive partial match (e.g., "Foundation" vs "foundation")
      if (!config) {
        const key = Object.keys(allQuizzes).find(k => k.toLowerCase() === moduleId.toLowerCase());
        if (key) config = allQuizzes[key];
      }

      console.log(`[API Quiz] Fetching moduleId: ${moduleId}. Found in DB: ${!!config}`);
      return NextResponse.json({ config: config || null });
    }

    return NextResponse.json({ configs: allQuizzes });
  } catch (err: any) {
    console.error('Fetch quiz config error:', err.message);
    return NextResponse.json({ error: 'Failed to fetch quiz config' }, { status: 500 });
  }
}
