import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI } from '@/lib/openai';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { PitchMessage } from '@/types';

import { getAdminDb } from '@/lib/firebase-admin';

async function loadPrompt(level: 1 | 2 | 3): Promise<string> {
  try {
    const db = getAdminDb();
    const doc = await db.collection('module_config').doc(`pitch_l${level}`).get();
    if (doc.exists && doc.data()?.prompt) {
      return doc.data()?.prompt;
    }
  } catch (err) {
    console.error('Firestore prompt load error:', err);
  }

  // Fallback to local file if Firestore fails or doc not found
  try {
    const filePath = join(process.cwd(), 'prompts', `pitch-l${level}.txt`);
    return readFileSync(filePath, 'utf-8');
  } catch {
    return 'You are a professional tele-sales trainer. Simulate a sales conversation.';
  }
}

// Keep only the most recent messages to cap token usage as conversations grow.
const HISTORY_WINDOW = 10;

export async function POST(req: NextRequest) {
  try {
    const { level, messages } = await req.json();

    if (![1, 2, 3].includes(level)) {
      return NextResponse.json({ error: 'Invalid level' }, { status: 400 });
    }

    const systemPrompt = await loadPrompt(level as 1 | 2 | 3);

    // Sliding window: only send the last HISTORY_WINDOW messages to the AI.
    // The system prompt provides enough context for the AI to remain coherent.
    const windowedMessages = (messages as PitchMessage[]).slice(-HISTORY_WINDOW);
    const openaiMessages = windowedMessages.map((m: PitchMessage) => ({
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

    // Detect if the customer has confirmed purchase AND payment/money reflection.
    // Uses gpt-4o-mini — this is a simple yes/no classification, not a reasoning task.
    let closedSale = false;
    try {
      const classifier = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
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
