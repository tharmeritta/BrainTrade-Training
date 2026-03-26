import { NextResponse } from 'next/server';
import { requireAdminManagerOrTrainer } from '@/lib/session';
import { fsGetAll } from '@/lib/firestore-db';

interface FeedItem {
  id: string;
  type: 'quiz' | 'ai-eval' | 'learning';
  agentId: string;
  agentName: string;
  timestamp: string;
  details: string;
  score?: number;
  level?: number;
  passed?: boolean;
}

export async function GET() {
  try { 
    await requireAdminManagerOrTrainer(); 
  } catch { 
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); 
  }

  try {
    const [quizDocs, evalDocs, learnDocs] = await Promise.all([
      fsGetAll<{ id: string; agentId: string; agentName: string; moduleId: string; score: number; totalQuestions: number; passed: boolean; timestamp: string }>('quiz_results'),
      fsGetAll<{ id: string; agentId: string; agentName: string; level: number; score: number; timestamp: string; passed: boolean }>('ai_eval_logs'),
      fsGetAll<{ id: string; agentId: string; agentName: string; moduleId: string; timestamp: string }>('learning_logs'),
    ]);

    const feed: FeedItem[] = [
      ...quizDocs.map(d => ({
        id: d.id,
        type: 'quiz' as const,
        agentId: d.agentId,
        agentName: d.agentName || 'Unknown Agent',
        timestamp: d.timestamp,
        details: `Completed Quiz: ${d.moduleId}`,
        score: Math.round((d.score / d.totalQuestions) * 100),
        passed: d.passed
      })),
      ...evalDocs.map(d => ({
        id: d.id,
        type: 'ai-eval' as const,
        agentId: d.agentId,
        agentName: d.agentName || 'Unknown Agent',
        timestamp: d.timestamp,
        details: `AI Evaluation Level ${d.level}`,
        score: d.score,
        level: d.level,
        passed: d.passed
      })),
      ...learnDocs.map(d => ({
        id: d.id,
        type: 'learning' as const,
        agentId: d.agentId,
        agentName: d.agentName || 'Unknown Agent',
        timestamp: d.timestamp,
        details: `Finished Learning: ${d.moduleId}`,
      })),
    ];

    // Sort by timestamp descending and take the last 20
    const sortedFeed = feed.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 20);

    return NextResponse.json({ feed: sortedFeed });
  } catch (err) {
    console.error('Live feed error:', err);
    return NextResponse.json({ feed: [] });
  }
}
