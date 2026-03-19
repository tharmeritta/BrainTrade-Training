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
      // Fallback or return empty
      return NextResponse.json({ config: null });
    }

    const allQuizzes = doc.data()?.definitions || {};
    
    if (moduleId) {
      return NextResponse.json({ config: allQuizzes[moduleId] || null });
    }

    return NextResponse.json({ configs: allQuizzes });
  } catch (err) {
    console.error('Fetch quiz config error:', err);
    return NextResponse.json({ error: 'Failed to fetch quiz config' }, { status: 500 });
  }
}
