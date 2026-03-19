import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI } from '@/lib/openai';
import { fsAdd } from '@/lib/firestore-db';
import { getAdminDb } from '@/lib/firebase-admin';
import type { PitchMessage } from '@/types';

const FALLBACK_SYSTEM_PROMPT = `คุณคือ "ครูฝึกเทเลเซลล์มืออาชีพ" ที่มีประสบการณ์ฝึกพนักงานขายทางโทรศัพท์มากกว่า 15 ปี โดยเชี่ยวชาญพฤติกรรมลูกค้าคนไทย

หน้าที่ของคุณคือจำลองสถานการณ์ฝึกอบรม (Roleplay Simulation) เพื่อทดสอบและพัฒนาทักษะการรับมือข้อโต้แย้งของลูกค้าไทยสำหรับพนักงานเทเลเซลล์

รูปแบบการฝึกมีทั้งหมด 4 ระดับ โดยความยากจะเพิ่มขึ้นตามลำดับ

Level 1 – ลูกค้าปฏิเสธทั่วไป
ตัวอย่าง:
- ไม่สนใจ
- ยังไม่ว่าง
- ขอคิดดูก่อน
- มีใช้อยู่แล้ว

Level 2 – ลูกค้าสงสัยสินค้า
ตัวอย่าง:
- มันดีจริงไหม
- มีหลักฐานอะไร
- กลัวไม่คุ้ม
- กลัวโดนหลอก

Level 3 – ลูกค้าต่อรอง/เปรียบเทียบ
ตัวอย่าง:
- แพงไป
- ที่อื่นถูกกว่า
- ขอส่วนลดได้ไหม
- ถ้าไม่ลดก็ไม่เอา

Level 4 – ทดสอบภาวะกดดัน
ตัวอย่าง:
- ไม่ไว้ใจเทเลเซลล์
- โดนหลอกมาก่อน
- ถามรายละเอียดลึก
- ทดสอบความรู้ของเซลล์
- พยายามกดดันเซลล์

กติกาการฝึก:

1. คุณจะสวมบทบาทเป็น "ลูกค้า"
2. ผู้ฝึก (ผู้ใช้) ต้องตอบโต้เหมือนกำลังขายจริง
3. เมื่อบทสนทนาในแต่ละรอบจบ คุณจะประเมินผล

เกณฑ์การประเมิน (ให้คะแนน 1-10)
- การสร้างความสัมพันธ์
- การรับมือข้อโต้แย้ง
- ความน่าเชื่อถือ
- การปิดการขาย
- ความเป็นธรรมชาติแบบคนไทย

ถ้าคะแนนรวมต่ำกว่า 7 ถือว่า "ไม่ผ่าน"

ถ้าไม่ผ่าน:
- อธิบายข้อผิดพลาด
- แนะนำวิธีตอบที่ดีกว่า
- ให้ลองใหม่

ถ้าผ่าน:
- เลื่อนไปยัง Level ถัดไป

เมื่อผ่านครบ Level 1 ถึง Level 4 ให้ประกาศว่า

"คุณผ่านการทดสอบเทเลเซลล์ระดับมืออาชีพแล้ว"

รูปแบบการแสดงผลในแต่ละรอบต้องเป็นดังนี้:

สถานการณ์:
(อธิบายบริบทสั้น ๆ)

ลูกค้า:
(บทพูดของลูกค้า)

จากนั้นรอให้ผู้ใช้ตอบก่อนจึงดำเนินบทสนทนาต่อ

เมื่อบทสนทนาจบรอบ ให้แสดง

ผลการประเมิน
คะแนน:
จุดแข็ง:
จุดที่ต้องปรับปรุง:
ตัวอย่างคำตอบที่ดีกว่า:

จากนั้นจึงแจ้งว่า
ผ่าน / ไม่ผ่าน`;

async function loadSystemPrompt(): Promise<string> {
  try {
    const db = getAdminDb();
    const doc = await db.collection('module_config').doc('ai_eval').get();
    if (doc.exists && doc.data()?.systemPrompt) {
      return doc.data()?.systemPrompt;
    }
  } catch (err) {
    console.error('Firestore AI eval prompt load error:', err);
  }
  return FALLBACK_SYSTEM_PROMPT;
}

export async function POST(req: NextRequest) {
  try {
    const { level, messages, agentId, agentName } = await req.json();

    if (![1, 2, 3, 4].includes(level)) {
      return NextResponse.json({ error: 'Invalid level' }, { status: 400 });
    }

    const openai = getOpenAI();
    const systemPrompt = await loadSystemPrompt();

    const levelContext = `\n\nในการฝึกครั้งนี้ให้เริ่มต้นที่ Level ${level} ทันที`;

    // Sliding window: only send the last 10 messages to cap token usage.
    const windowedMessages = (messages as PitchMessage[]).slice(-10);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt + levelContext },
        ...windowedMessages.map((m: PitchMessage) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
      max_tokens: 800,
      temperature: 0.85,
    });

    const reply = completion.choices[0].message.content ?? '';

    // Detect if the trainer has declared this round as passed.
    // Uses gpt-4o-mini — simple yes/no classification doesn't need gpt-4o.
    let passed = false;
    try {
      const classifier = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a classifier. Read the Thai text and determine if the trainer explicitly declared the trainee has PASSED (ผ่าน) this round — meaning a positive verdict with score >= 7. Return only valid JSON. If the text says "ไม่ผ่าน" or shows a negative verdict, return false.',
          },
          {
            role: 'user',
            content: `Text: "${reply}"\n\nRespond with: {"passed": true} or {"passed": false}`,
          },
        ],
        max_tokens: 20,
        temperature: 0,
        response_format: { type: 'json_object' },
      });
      const parsed = JSON.parse(classifier.choices[0].message.content ?? '{"passed":false}');
      passed = parsed.passed === true;
    } catch {
      passed = false;
    }

    if (passed && agentId && agentName) {
      await fsAdd('ai_eval_logs', { agentId, agentName, level, passed: true });
    }

    return NextResponse.json({ reply, passed });
  } catch (err) {
    console.error('AI eval chat error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
