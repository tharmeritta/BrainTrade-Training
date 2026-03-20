import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/session';
import { getOpenAI } from '@/lib/openai';

const SYSTEM_PROMPT = `You are an expert AI assistant that converts raw quiz text into a strictly formatted JSON structure.
The user will provide raw text containing quiz questions, options, correct answers, and explanations.
Your job is to parse this text and return a JSON object with a single key "questions" containing an array of question objects.

Each question object MUST follow this TypeScript interface:
interface QuestionData {
  en: string; // The question in English
  th: string; // The question in Thai
  type: 'mcq' | 'tf' | 'fill'; // Use 'mcq' for multiple choice
  options?: {
    en: string[]; // Array of options in English
    th: string[]; // Array of options in Thai (must match length of en)
  };
  correctIdx?: number; // 0-based index of the correct option
  explain?: {
    en: string; // Explanation in English
    th: string; // Explanation in Thai
  };
}

Rules:
1. If the input text is missing a language (e.g., only English is provided), you MUST translate it accurately into the other language (Thai or English) to complete the structure.
2. If explanations are missing, generate a brief, helpful explanation.
3. Ensure 'options.en' and 'options.th' have the exact same number of items.
4. 'correctIdx' must correctly point to the right answer.
5. Provide ONLY valid JSON in the response.

Example Output format:
{
  "questions": [
    {
      "en": "What is Forex?",
      "th": "Forex คืออะไร?",
      "type": "mcq",
      "options": {
        "en": ["Foreign Exchange", "Food Export", "Forward Extra", "Financial Exit"],
        "th": ["การแลกเปลี่ยนเงินตราต่างประเทศ", "การส่งออกอาหาร", "สัญญาซื้อขายล่วงหน้าพิเศษ", "ทางออกทางการเงิน"]
      },
      "correctIdx": 0,
      "explain": {
        "en": "Forex stands for Foreign Exchange.",
        "th": "Forex ย่อมาจากการแลกเปลี่ยนเงินตราต่างประเทศ"
      }
    }
  ]
}
`;

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { rawText } = await req.json();
    if (!rawText) {
      return NextResponse.json({ error: 'Missing rawText' }, { status: 400 });
    }

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: rawText }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const resultText = completion.choices[0].message.content;
    if (!resultText) {
      throw new Error('No response from AI');
    }

    const parsed = JSON.parse(resultText);
    return NextResponse.json({ questions: parsed.questions });

  } catch (err: any) {
    console.error('Parse quiz error:', err);
    return NextResponse.json({ error: err.message || 'Failed to parse text' }, { status: 500 });
  }
}
