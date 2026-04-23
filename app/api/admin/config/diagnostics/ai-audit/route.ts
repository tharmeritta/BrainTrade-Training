import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/session';
import { SemanticAuditService } from '@/lib/services/semantic-audit-service';

export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[AI Semantic Audit] Starting deep analysis with Gemini...');
    const result = await SemanticAuditService.runFullAudit();

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('AI Semantic Audit error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
