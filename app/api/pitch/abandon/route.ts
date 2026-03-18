import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI } from '@/lib/openai';
import { fsAdd as gcsAdd } from '@/lib/firestore-db';
import type { PitchMessage } from '@/types';

// Summarize and persist an abandoned pitch session.
// Called when the agent quits before closing a sale.
// Uses gpt-4o-mini with a small message window — keeps cost minimal.
const SUMMARY_WINDOW = 6;

export async function POST(req: NextRequest) {
  try {
    const { sessionId, level, messages, agentId, agentName } = await req.json();

    if (!messages?.length) {
      return NextResponse.json({ ok: true });
    }

    // Compact: only summarize the last SUMMARY_WINDOW messages
    const window: PitchMessage[] = (messages as PitchMessage[]).slice(-SUMMARY_WINDOW);
    const transcript = window
      .map(m => `${m.role === 'user' ? 'Agent' : 'Customer'}: ${m.content}`)
      .join('\n');

    let summary = '';
    try {
      const openai = getOpenAI();
      const res = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a sales training assistant. Summarize the pitch session in 1-2 sentences in Thai. Focus on where the agent got stuck or why they did not close the sale.',
          },
          {
            role: 'user',
            content: `Level: ${level}\nTotal messages: ${(messages as PitchMessage[]).length}\n\nLast ${SUMMARY_WINDOW} messages:\n${transcript}`,
          },
        ],
        max_tokens: 120,
        temperature: 0.3,
      });
      summary = res.choices[0].message.content ?? '';
    } catch {
      // Summary is best-effort; still save the record without it
    }

    if (agentId) {
      await gcsAdd('pitch_abandoned', {
        sessionId,
        agentId,
        agentName: agentName ?? '',
        level,
        messageCount: (messages as PitchMessage[]).length,
        summary,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Pitch abandon error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
