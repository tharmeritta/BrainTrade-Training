import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI } from '@/lib/openai';
import { fsAdd } from '@/lib/firestore-db';
import { getAdminDb } from '@/lib/firebase-admin';
import type { PitchMessage } from '@/types';

/* ─── Coaching shape ────────────────────────────────────────────────────────── */

interface CoachingData {
  score: number;
  criteria?: {
    rapport: number;
    objectionHandling: number;
    credibility: number;
    closing: number;
    naturalness: number;
  };
  strengths: string;
  improvements: string;
  coachingScript: string;
  coachingTip: string;
  metadata?: Record<string, any>; // For dynamic/extra fields
}

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
  "Customer": {
    "Name": "ชื่อเล่นลูกค้า",
    "Occupation": "อาชีพ",
    "Age": อายุ (ตัวเลข),
    "Mood": "อารมณ์ปัจจุบัน (เช่น หงุดหงิด, สนใจ, ลังเล, พอใจ)"
  },
  "Objective": "วัตถุประสงค์สั้นๆ ของลูกค้าในรอบนี้",
  "Dialogue": "บทพูดของลูกค้า สั้น กระชับ เป็นธรรมชาติแบบคนไทย",
  "Score": คะแนนรวม 1-10,
  "Criteria": {
    "rapport": 1-10,
    "objectionHandling": 1-10,
    "credibility": 1-10,
    "closing": 1-10,
    "naturalness": 1-10
  },
  "Strengths": "จุดเด่นของเซลล์ในรอบนี้",
  "Improvements": "สิ่งที่เซลล์ต้องปรับปรุงทันที",
  "CoachingScript": "ตัวอย่างประโยคที่เซลล์ควรพูดในสถานการณ์นี้",
  "CoachingTip": "ชื่อเทคนิคและวิธีประยุกต์ใช้",
  "BuyingSignal": "สัญญาณการซื้อที่พบ (ถ้ามี) หรือประเมินว่าใกล้ปิดการขายได้กี่ %",
  "passed": true หรือ false
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

กติกาการให้คะแนน:
ประเมิน 5 ด้านใน Criteria (Rapport, Objection Handling, Credibility, Closing, Naturalness)
- score >= 7 → passed = true
- score < 7  → passed = false

กติกาการเขียน Dialogue:
- ภาษาที่ใช้: ภาษาไทยที่เป็นกันเอง สมจริง ไม่เป็นทางการเกินไป
- ถ้า passed = true → Dialogue = "[ประโยคสรุปจบจากลูกค้าแบบยอมรับข้อเสนอ] 🎉 ผ่าน Level [ระบุเลข] แล้ว!"
- ถ้า passed = false → พูดเป็นลูกค้าต่อ เพิ่มความกดดันหรือข้อสงสัยขึ้นเล็กน้อยจากรอบที่แล้ว

ข้อห้ามเด็ดขาด:
- ห้ามพูดในฐานะครูฝึก เทรนเนอร์ หรือ AI ใน Dialogue
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

    const agentNameContext = agentName ? `\n\n[Context]\nชื่อพนักงานขายที่โทรมาคือ: ${agentName}\n**ห้าม** คุณแอบอ้างว่าชื่อนี้เด็ดขาด คุณคือลูกค้า!` : '';

    // Final Role Enforcement Safety
    const roleEnforcement = `\n\n[Strict Rules]
1. You are the CUSTOMER (ลูกค้า).
2. You are NOT the Agent (เอเจนต์/พนักงานขาย).
3. Do NOT use the name "${agentName}" for yourself.
4. Your response must be what a CUSTOMER would say when receiving a call.
5. Use the JSON format provided below.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: (systemPrompt + levelPrompt + agentNameContext + startHint + jsonSafety + roleEnforcement) as string },
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
    let customerProfile: any = null;

    try {
      const parsed = JSON.parse(raw);

      // Highly flexible key detection
      customerLine = parsed.Dialogue || parsed.dialogue || 
                     parsed.customerLine || parsed.customer_line || 
                     parsed.response || parsed.Reply || parsed.reply || '';
      
      // If customerLine contains "ลูกค้า: ", strip it for a cleaner UI
      if (customerLine.startsWith('ลูกค้า: ')) {
        customerLine = customerLine.replace('ลูกค้า: ', '');
      }

      passed = isStart ? false : (parsed.passed === true || (typeof parsed.passed === 'string' && parsed.passed.toLowerCase() === 'true'));

      // Extract Customer Profile if present
      if (parsed.Customer) {
        customerProfile = {
          name: parsed.Customer.Name || parsed.Customer.name || '',
          occupation: parsed.Customer.Occupation || parsed.Customer.occupation || '',
          age: parsed.Customer.Age || parsed.Customer.age || 0,
          mood: parsed.Customer.Mood || parsed.Customer.mood || '',
          objective: parsed.Objective || parsed.objective || ''
        };
      }

      if (!isStart && (parsed.score != null || parsed.Score != null)) {
        const scoreVal = parsed.score ?? parsed.Score;
        const crit = parsed.Criteria || parsed.criteria;
        
        coaching = {
          score:          Math.max(1, Math.min(10, Number(scoreVal) || 5)),
          strengths:      parsed.Strengths      ?? parsed.strengths      ?? '',
          improvements:   parsed.Improvements   ?? parsed.improvements   ?? '',
          coachingScript: parsed.CoachingScript ?? parsed.coachingScript ?? '',
          coachingTip:    parsed.CoachingTip    ?? parsed.coachingTip    ?? '',
          metadata:       {}
        };

        if (parsed.BuyingSignal || parsed.buying_signal) {
          coaching.metadata!.buyingSignal = parsed.BuyingSignal || parsed.buying_signal;
        }

        // Catch-all for any other new fields that might be added to the prompt later
        const knownKeys = ['Customer', 'Objective', 'Dialogue', 'Score', 'Criteria', 'Strengths', 'Improvements', 'CoachingScript', 'CoachingTip', 'passed', 'BuyingSignal', 'customerLine', 'score', 'strengths', 'improvements', 'coachingScript', 'coachingTip'];
        Object.keys(parsed).forEach(k => {
          if (!knownKeys.includes(k) && !knownKeys.map(kk => kk.toLowerCase()).includes(k.toLowerCase())) {
            coaching!.metadata![k] = parsed[k];
          }
        });

        if (crit) {
          coaching.criteria = {
            rapport:           Number(crit.rapport) || 5,
            objectionHandling: Number(crit.objectionHandling || crit.objection_handling) || 5,
            credibility:       Number(crit.credibility) || 5,
            closing:           Number(crit.closing) || 5,
            naturalness:       Number(crit.naturalness) || 5
          };
        }
      }
    } catch {
      // JSON parse failed — fall back to raw text, no coaching
      customerLine = raw;
      passed       = !isStart && (raw.includes('ผ่าน Level') || raw.includes('🎉'));
    }

    // Final fallback: if customerLine is still empty but raw has content, use raw.
    if (!customerLine && raw && raw !== '{}') {
      customerLine = raw;
    }

    if (!customerLine && !isStart) {
      customerLine = '... (ไม่สามารถดึงคำตอบจาก AI ได้ กรุณาลองใหม่อีกครั้ง)';
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

    return NextResponse.json({ 
      reply: customerLine, 
      coaching, 
      passed,
      customerProfile 
    });
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
