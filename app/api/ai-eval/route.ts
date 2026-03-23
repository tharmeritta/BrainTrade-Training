import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI } from '@/lib/openai';
import { fsAdd } from '@/lib/firestore-db';
import { getAdminDb } from '@/lib/firebase-admin';
import type { PitchMessage } from '@/types';

/* ─── System Prompt ─────────────────────────────────────────────────────────── */
// IMPORTANT: This prompt uses response_format: json_object.
// Any custom prompt stored in Firestore must also follow the JSON schema below.

const FALLBACK_SYSTEM_PROMPT = `คุณคือ "ลูกค้าคนไทย" ที่กำลังรับสายจากพนักงานเทเลเซลล์

ผู้ใช้งาน = พนักงานขาย (เซลล์) ที่กำลังฝึกหัด
คุณ = ลูกค้าคนไทย ห้ามออกนอกบทบาทนี้โดยเด็ดขาด

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ระดับบุคลิกลูกค้า:

Level 1 – ลูกค้าปฏิเสธทั่วไป
พูดสั้น ปฏิเสธ เช่น "ไม่สนใจ" / "ยังไม่ว่าง" / "ขอคิดดูก่อน" / "มีใช้อยู่แล้ว"

Level 2 – ลูกค้าสงสัยสินค้า
ตั้งคำถาม ไม่ไว้ใจ เช่น "มันดีจริงไหม?" / "มีหลักฐานไหม?" / "กลัวโดนหลอก" / "ไม่แน่ใจว่าคุ้มไหม"

Level 3 – ลูกค้าต่อรอง/เปรียบเทียบ
กดราคา เปรียบเทียบ เช่น "แพงไปนะ" / "ที่อื่นถูกกว่า" / "ขอส่วนลดได้ไหม" / "ถ้าไม่ลดก็ไม่เอา"

Level 4 – ลูกค้ากดดัน/ทดสอบ
ไม่ไว้ใจ กดดัน เช่น "โดนเทเลเซลล์หลอกมาแล้ว" / "อยากรู้รายละเอียดทุกอย่าง" / "พยายามหาจุดอ่อน"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ตอบกลับทุกครั้งในรูปแบบ JSON object เท่านั้น ใช้ schema นี้เสมอ:

{
  "customerLine": "บทพูดของลูกค้า สั้น กระชับ เป็นธรรมชาติแบบคนไทย",
  "score": คะแนนรวม 1-10,
  "strengths": "จุดดีของเซลล์ในรอบนี้ อธิบายกระชับ",
  "improvements": "สิ่งที่เซลล์ต้องปรับปรุงทันที อธิบายกระชับ",
  "coachingScript": "ตัวอย่างประโยคที่เซลล์ควรพูดในสถานการณ์นี้ เขียนเป็นประโยคเต็มที่ใช้ได้จริง",
  "coachingTip": "ชื่อเทคนิคและวิธีประยุกต์ใช้กับลูกค้าแบบนี้โดยเฉพาะ",
  "passed": true หรือ false
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

กติกาการให้คะแนน (score):
ประเมิน 5 ด้านรวมกัน ได้แก่ การสร้างความสัมพันธ์ / การรับมือข้อโต้แย้ง / ความน่าเชื่อถือ / การนำไปสู่การปิดการขาย / ความเป็นธรรมชาติแบบภาษาไทย
score >= 7 → passed = true
score < 7  → passed = false

กติกาการเขียน customerLine:
- ภาษาที่ใช้: ภาษาไทยที่เป็นกันเอง สมจริง ไม่เป็นทางการเกินไป
- ถ้า passed = true → customerLine = "[ประโยคสรุปจบจากลูกค้าแบบยอมรับข้อเสนอ] 🎉 ผ่าน Level [ระบุเลข] แล้ว!"
- ถ้า passed = false → พูดเป็นลูกค้าต่อ เพิ่มความกดดันหรือข้อสงสัยขึ้นเล็กน้อยจากรอบที่แล้ว

กติกา coachingScript และ coachingTip:
- ถ้า score <= 4: coachingScript ต้องเป็นประโยคเต็มที่ใช้ได้จริงทันที อย่างน้อย 1 ประโยค
- ถ้า score >= 8: coachingTip ให้เป็นเทคนิคขั้นสูงที่ช่วยพัฒนาเพิ่มเติม
- coachingTip ควรอ้างชื่อเทคนิคจริง เช่น WIIFM, Mirror & Bridge, Feel-Felt-Found, Assumptive Close ฯลฯ

ข้อห้ามเด็ดขาด:
- ห้ามพูดในฐานะครูฝึก เทรนเนอร์ หรือ AI ใน customerLine
- ห้ามให้คะแนน 0 หรือ null
- ห้ามตอบนอก JSON schema`;

/* ─── Prompt loader ─────────────────────────────────────────────────────────── */

async function loadFullConfig(): Promise<any> {
  try {
    const db = getAdminDb();
    const doc = await db.collection('module_config').doc('ai_eval').get();
    if (doc.exists) {
      return doc.data();
    }
  } catch (err) {
    console.error('Firestore AI eval config load error:', err);
  }
  return { systemPrompt: FALLBACK_SYSTEM_PROMPT };
}

/* ─── Coaching shape ────────────────────────────────────────────────────────── */

export interface CoachingData {
  score: number;
  strengths: string;
  improvements: string;
  coachingScript: string;
  coachingTip: string;
}

/* ─── POST handler ──────────────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const { level, messages, agentId, agentName, isStart } = await req.json();

    if (![1, 2, 3, 4].includes(level)) {
      return NextResponse.json({ error: 'Invalid level' }, { status: 400 });
    }

    const openai      = getOpenAI();
    const config      = await loadFullConfig();
    const systemPrompt = config.systemPrompt || FALLBACK_SYSTEM_PROMPT;
    const levelPrompt  = config[`level${level}Prompt`] || `\n\nระดับที่ต้องฝึกในครั้งนี้คือ Level ${level} — ให้บุคลิกลูกค้าตรงตามระดับนี้ทันที`;

    // Sliding window — cap token usage
    // Sanitize: ensure role is valid and content is a string to prevent 400 errors
    const sanitizedMessages = (messages as PitchMessage[])
      .slice(-10)
      .filter(m => m && typeof m.content === 'string' && m.content.trim().length > 0);

    // For session start: inject a phone-pickup trigger so the AI generates the
    // customer's opening line before the agent has said anything.
    const windowedMessages = (isStart && sanitizedMessages.length === 0)
      ? [{ role: 'user' as const, content: '[ลูกค้ารับสาย — เริ่มต้นบทสนทนา]' }]
      : sanitizedMessages;

    const agentNameContext = agentName ? `\nคุณกำลังคุยกับพนักงานชื่อ: ${agentName}` : '';

    // For the opening line, instruct the AI to just say a greeting — no scoring.
    const startHint = isStart && sanitizedMessages.length === 0
      ? '\n\nหมายเหตุ: นี่คือจุดเริ่มต้น ลูกค้าเพิ่งรับสาย ให้ customerLine เป็นประโยครับสายสั้นๆ เป็นธรรมชาติ (เช่น "ฮัลโหล?" หรือ "สวัสดีค่ะ มีอะไรไหม?") ให้ score = 5, passed = false, strengths/improvements/coachingScript/coachingTip = ""'
      : '';

    // OpenAI's json_object format MANDATES that the word "json" appears in the prompt.
    // We append a safety instruction to ensure this requirement is always met.
    const jsonSafety = '\n\nIMPORTANT: You must respond with a valid JSON object.';

    // OpenAI requires the first non-system message to be from 'user'.
    // If the conversation starts with the AI's opening greeting (assistant role),
    // prepend a silent trigger so the role ordering is valid.
    const messagesForOpenAI = windowedMessages.map((m: PitchMessage) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));
    if (messagesForOpenAI.length > 0 && messagesForOpenAI[0].role === 'assistant') {
      messagesForOpenAI.unshift({ role: 'user', content: '[สาย]' });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: (systemPrompt + levelPrompt + agentNameContext + startHint + jsonSafety) as string },
        ...messagesForOpenAI,
      ],
      max_tokens: isStart ? 300 : 1000,
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0].message.content ?? '{}';

    // Parse structured response
    let customerLine = '';
    let coaching: CoachingData | null = null;
    let passed = false;

    try {
      const parsed = JSON.parse(raw);

      customerLine = parsed.customerLine ?? '';
      passed       = isStart ? false : parsed.passed === true;

      if (!isStart && parsed.score != null) {
        coaching = {
          score:          Math.max(1, Math.min(10, Number(parsed.score) || 5)),
          strengths:      parsed.strengths      ?? '',
          improvements:   parsed.improvements   ?? '',
          coachingScript: parsed.coachingScript ?? '',
          coachingTip:    parsed.coachingTip    ?? '',
        };
      }
    } catch {
      // JSON parse failed — fall back to raw text, no coaching
      customerLine = raw;
      passed       = !isStart && (raw.includes('ผ่าน Level') || raw.includes('🎉'));
    }

    // Log every scored turn (not the opening greeting) so staff can track history
    if (!isStart && agentId && agentName && coaching) {
      await fsAdd('ai_eval_logs', {
        agentId,
        agentName,
        level,
        passed,
        score: coaching.score * 10,          // convert AI 1-10 → 0-100 for display
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ reply: customerLine, coaching, passed });
  } catch (err: any) {
    console.error('AI eval chat error:', err);
    
    // Provide more specific error feedback if possible
    const status = err?.status || 500;
    const message = err?.message || 'Server error';
    const errorDetail = err?.response?.data?.error || null;

    return NextResponse.json({ 
      error: 'Failed to generate AI response', 
      details: message,
      errorDetail
    }, { status });
  }
}
