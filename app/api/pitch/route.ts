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

    // Get customer AI reply
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

    // Detect if the customer has confirmed purchase AND payment/money reflection
    let closedSale = false;
    try {
      const classifier = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'You are a sales outcome classifier. Determine if the customer\'s message clearly indicates BOTH: (1) they have decided to purchase the product/course, AND (2) they have confirmed payment or that money has reflected in their account. Return only valid JSON with no extra text.',
          },
          {
            role: 'user',
            content: `Customer's latest message: "${reply}"\n\nRespond with: {"closedSale": true} or {"closedSale": false}`,
          },
        ],
        max_tokens: 20,
        temperature: 0,
        response_format: { type: 'json_object' },
      });
      const parsed = JSON.parse(classifier.choices[0].message.content ?? '{"closedSale":false}');
      closedSale = parsed.closedSale === true;
    } catch {
      closedSale = false;
    }

    return NextResponse.json({ reply, closedSale });
  } catch (err) {
    console.error('Pitch API error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
