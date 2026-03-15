import { NextRequest, NextResponse } from 'next/server';
import { getGeminiModel } from '@/lib/gemini';
import { gcsAdd } from '@/lib/gcs';

export async function POST(req: NextRequest) {
  try {
    const { inputText, agentId, agentName } = await req.json();

    if (!inputText || inputText.trim().length < 10) {
      return NextResponse.json({ error: 'Input too short' }, { status: 400 });
    }

    const prompt = `You are a professional sales coach evaluating a sales pitch for a stock/investment trading course.

Evaluate the following sales pitch and respond in JSON format with these fields:
- score: number from 0-100
- strengths: string[] (3-5 bullet points in Thai)
- improvements: string[] (3-5 bullet points in Thai)
- overall: string (1-2 sentence summary in Thai)

Sales pitch:
"""
${inputText}
"""

Respond ONLY with valid JSON, no markdown, no code blocks.`;

    const result = await getGeminiModel().generateContent(prompt);
    const parsed = JSON.parse(result.response.text().trim());

    if (agentId && agentName) {
      await gcsAdd('ai_eval_logs', { agentId, agentName, score: parsed.score, feedback: parsed.overall });
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('AI eval error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
