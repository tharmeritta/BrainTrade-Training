import { NextRequest, NextResponse } from 'next/server';
import { AiEvalService } from '@/lib/services/ai-eval-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, agentName, isStart, message: userMessageContent, scenarioId } = body;

    if (!agentId) {
      return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
    }

    const { session, turn } = await AiEvalService.processTurn(
      agentId,
      userMessageContent,
      isStart,
      agentName,
      scenarioId
    );

    return NextResponse.json({
      reply: turn.dialogue,
      coaching: turn, // Turn response matches CoachingData interface closely
      passed: session.status === 'passed',
      failed: session.status === 'failed',
      customerProfile: session.customerProfile,
      messages: session.messages,
      turnCount: session.turnCount
    });

  } catch (err: any) {
    console.error('AI Eval Route Error:', err);
    return NextResponse.json({ 
      error: 'Evaluation failed', 
      details: err.message 
    }, { status: 500 });
  }
}
