import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI } from '@/lib/openai';
import type { PitchMessage } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { messages, level } = await req.json();

    const conversationText = (messages as PitchMessage[])
      .map(m => `${m.role === 'user' ? 'Sales Agent' : 'Customer'}: ${m.content}`)
      .join('\n');

    const systemPrompt = `You are an expert sales training coach evaluating a pitch simulation.

The sales agent was practicing selling a trading/stock investment course to an AI customer (Level ${level} difficulty). The customer decided to purchase.

Analyze the full conversation carefully and return a JSON object with these exact fields:
{
  "reason": "2-3 sentences in Thai explaining the key moments and arguments that convinced the customer to buy",
  "strengths": ["specific strength 1 in Thai", "specific strength 2 in Thai"],
  "weaknesses": ["specific area to improve 1 in Thai", "specific area to improve 2 in Thai"]
}

Rules:
- Write all values in Thai language
- Provide 2-4 strengths and 2-4 weaknesses
- Be specific — reference actual things said in the conversation
- Make feedback actionable so the agent knows exactly what to do differently
- Do not be vague. Bad example: "พูดดี". Good example: "ถามคำถามเปิดเพื่อค้นหา painpoint ของลูกค้าได้อย่างมีประสิทธิภาพ"
- Return only valid JSON with no extra text or markdown`;

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Conversation:\n\n${conversationText}` },
      ],
      max_tokens: 800,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content ?? '{}');
    return NextResponse.json(result);
  } catch (err) {
    console.error('Pitch evaluate error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
