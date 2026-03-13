import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { geminiModel } from '@/lib/gemini';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { inputText } = await req.json();

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

    const result = await geminiModel.generateContent(prompt);
    const raw = result.response.text().trim();
    const parsed = JSON.parse(raw);

    const adminDb = getAdminDb();
    await adminDb.collection('ai_eval_logs').add({
      userId: user.uid,
      inputText,
      claudeScore: parsed.score,
      feedback: JSON.stringify(parsed),
      timestamp: FieldValue.serverTimestamp(),
    });

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('AI eval error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
