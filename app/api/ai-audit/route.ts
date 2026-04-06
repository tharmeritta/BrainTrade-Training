import { NextRequest, NextResponse } from 'next/server';
import { AiAuditService } from '@/lib/services/ai-audit-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, agentName, scenarioId, link } = body;

    if (!agentId || !scenarioId || !link) {
      return NextResponse.json({ error: 'agentId, scenarioId, and link are required' }, { status: 400 });
    }

    // 1. Fetch transcript
    let transcript: string;
    try {
      transcript = await AiAuditService.fetchChatTranscript(link);
    } catch (fetchErr: any) {
      return NextResponse.json({ 
        error: fetchErr.message || 'Could not fetch transcript from the provided link.' 
      }, { status: 400 });
    }

    if (!transcript) {
        return NextResponse.json({ error: 'Could not fetch transcript. The link might be private or invalid.' }, { status: 400 });
    }
    
    if (transcript.startsWith('Transcript could not be extracted')) {
        return NextResponse.json({ error: transcript }, { status: 400 });
    }

    // 2. Perform Audit
    const auditResult = await AiAuditService.auditTranscript(
      agentId,
      agentName,
      scenarioId,
      transcript
    );

    return NextResponse.json({
      auditResult,
      transcript,
      passed: auditResult.verdict === 'passed',
      failed: auditResult.verdict === 'failed'
    });

  } catch (err: any) {
    console.error('[AI Audit API Error]:', err);
    return NextResponse.json({ 
      error: 'Audit failed', 
      details: err.message 
    }, { status: 500 });
  }
}
