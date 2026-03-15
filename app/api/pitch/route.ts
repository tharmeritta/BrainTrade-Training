import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI } from '@/lib/openai';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { PitchMessage } from '@/types';

function loadPrompt(level: 1 | 2 | 3): string {
  const filePath = join(process.cwd(), 'prompts', `pitch-l${level}.txt`);
  return readFileSync(filePath, 'utf-8');
}

export async function POST(req: NextRequest) {
  try {
    const { level, messages } = await req.json();

    if (![1, 2, 3].includes(level)) {
      return NextResponse.json({ error: 'Invalid level' }, { status: 400 });
    }

    const systemPrompt = loadPrompt(level as 1 | 2 | 3);

    const openaiMessages = messages.map((m: PitchMessage) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...openaiMessages,
      ],
      max_tokens: 500,
      temperature: 0.9,
    });

    const reply = completion.choices[0].message.content ?? '';
    return NextResponse.json({ reply });
  } catch (err) {
    console.error('Pitch API error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
