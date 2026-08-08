import { NextRequest, NextResponse } from 'next/server';
import { getGeminiModel } from '@/lib/gemini';
import { requireAdminOrManager } from '@/lib/session/server';

export async function POST(req: NextRequest) {
  try {
    await requireAdminOrManager();
    const { topic, difficulty = 'beginner' } = await req.json();

    if (!topic?.trim()) {
      return NextResponse.json({ error: 'Topic or prompt is required' }, { status: 400 });
    }

    const model = getGeminiModel();
    if (!model) {
      return NextResponse.json({ error: 'Gemini model unavailable' }, { status: 500 });
    }

    const prompt = `You are a Senior Sales Training Architect for BrainTrade.
Generate a realistic, high-impact telesales customer scenario with 4 multiple-choice options (A, B, C, D) for sales agent training.

Topic / Focus: "${topic}"
Difficulty Level: "${difficulty}"

You MUST respond strictly with a valid JSON object following this exact schema:
{
  "name": {
    "th": "ชื่อสถานการณ์ภาษาไทย",
    "en": "English Scenario Name"
  },
  "customerPersona": {
    "th": "ข้อมูลลูกค้าและบุคลิกภาษาไทย",
    "en": "Customer persona and background in English"
  },
  "initialMood": {
    "th": "อารมณ์เริ่มต้นภาษาไทย",
    "en": "Initial customer mood in English"
  },
  "objective": {
    "th": "เป้าหมายที่พนักงานขายต้องทำภาษาไทย",
    "en": "Sales agent objective in English"
  },
  "situation": {
    "th": "สถานการณ์และข้อโต้แย้งที่ลูกค้าพูดหรือเผชิญภาษาไทย",
    "en": "The specific dilemma/situation spoken by the customer in English"
  },
  "difficulty": "${difficulty}",
  "passThreshold": 70,
  "choices": [
    {
      "id": "A",
      "text": { "th": "ตัวเลือก A ภาษาไทย", "en": "Choice A in English" },
      "isCorrect": true,
      "score": 10,
      "explanation": { 
        "th": "คำอธิบายว่าทำไมข้อนี้ถูกต้อง/มีประสิทธิภาพมากที่สุดภาษาไทย", 
        "en": "Explanation of why this choice is the most effective in English" 
      }
    },
    {
      "id": "B",
      "text": { "th": "ตัวเลือก B ภาษาไทย", "en": "Choice B in English" },
      "isCorrect": false,
      "score": 6,
      "explanation": { 
        "th": "คำอธิบายว่าทำไมข้อนี้ใช้ได้แต่ยังไม่ดีที่สุดภาษาไทย", 
        "en": "Explanation of why this choice is average in English" 
      }
    },
    {
      "id": "C",
      "text": { "th": "ตัวเลือก C ภาษาไทย", "en": "Choice C in English" },
      "isCorrect": false,
      "score": 4,
      "explanation": { 
        "th": "คำอธิบายว่าทำไมข้อนี้ส่งผลเสียต่อการขายภาษาไทย", 
        "en": "Explanation of why this choice harms the sales conversation in English" 
      }
    },
    {
      "id": "D",
      "text": { "th": "ตัวเลือก D ภาษาไทย", "en": "Choice D in English" },
      "isCorrect": false,
      "score": 2,
      "explanation": { 
        "th": "คำอธิบายว่าทำไมข้อนี้ผิดพลาดร้ายแรงภาษาไทย", 
        "en": "Explanation of why this choice is a major mistake in English" 
      }
    }
  ]
}

Ensure high professional quality, natural Thai and English phrasing, realistic sales objections, and actionable explanations.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const scenarioData = JSON.parse(responseText);

    return NextResponse.json({ success: true, scenario: scenarioData });
  } catch (err: any) {
    console.error('AI Scenario Generation Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate scenario with AI' }, { status: 500 });
  }
}
