import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI } from '@/lib/openai';
import { getGeminiModel } from '@/lib/gemini';
import { fsAdd, fsGet, fsSet, fsDelete } from '@/lib/firestore-db';
import { getAdminDb } from '@/lib/firebase-admin';
import type { PitchMessage } from '@/types';

/* ─── Types & Interfaces ────────────────────────────────────────────────────── */

interface CoachingData {
  score: number;
  criteria?: Record<string, number>;
  strengths: string;
  improvements: string;
  coachingScript: string;
  coachingTip: string;
  metadata?: Record<string, any>;
}

interface ActiveEvalSession {
  agentId: string;
  agentName: string;
  sessionId: string;
  level: number;
  messages: PitchMessage[];
  savedAt: number;
  customerProfile?: any;
  coaching?: Record<number, CoachingData>;
}

interface ProgressRecord {
  agentId: string;
  agentName: string;
  evalCompletedLevels: number[];
  evalSavedLevel: number | null;
  updatedAt?: string;
}

/* ─── Helpers ───────────────────────────────────────────────────────────────── */

async function markEvalPassed(agentId: string, agentName: string, level: number = 1): Promise<void> {
  const existing = await fsGet<ProgressRecord>('agent_progress', agentId) ?? {
    agentId, agentName, evalCompletedLevels: [], evalSavedLevel: null,
  };
  const levels = Array.from(new Set([...existing.evalCompletedLevels, level])).sort((a, b) => a - b);
  await fsSet('agent_progress', agentId, {
    ...existing,
    agentId,
    agentName: agentName || existing.agentName,
    evalCompletedLevels: levels,
    evalSavedLevel: null,
    updatedAt: new Date().toISOString(),
  });
  // Clean up the active session upon passing
  await fsDelete('aiev_active', agentId).catch(() => {});
}

async function loadFullConfig(): Promise<any> {
  try {
    const db = getAdminDb();
    const doc = await db.collection('module_config').doc('ai_eval').get();
    if (doc.exists) return doc.data();
  } catch (err) {
    console.error('Firestore AI eval config load error:', err);
  }
  return { 
    systemPrompt: FALLBACK_SYSTEM_PROMPT,
    passThreshold: 7,
    criteria: FALLBACK_CRITERIA
  };
}

function cleanJsonString(raw: string): string {
  // Remove markdown code blocks if present
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '');
  }
  return cleaned.trim();
}

/* ─── AI Call Wrapper ───────────────────────────────────────────────────────── */

async function callAI(
  provider: 'openai' | 'gemini',
  messages: { role: 'user' | 'assistant'; content: string }[],
  systemPrompt: string,
  isStart: boolean
): Promise<string> {
  if (provider === 'gemini') {
    const model = getGeminiModel();
    if (!model) throw new Error('Gemini API key is not configured');

    const chat = model.startChat({
      history: messages.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      systemInstruction: systemPrompt,
      generationConfig: {
        maxOutputTokens: isStart ? 400 : 1200,
        temperature: 0.8,
        responseMimeType: 'application/json',
      },
    });

    const lastMsg = messages.length > 0 ? messages[messages.length - 1].content : '[สาย]';
    const result = await chat.sendMessage(lastMsg);
    return result.response.text();
  }

  // Default to OpenAI
  const openai = getOpenAI();
  if (!openai) throw new Error('OpenAI API key is not configured');

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    max_tokens: isStart ? 400 : 1200,
    temperature: 0.8,
    response_format: { type: 'json_object' },
  });

  return completion.choices[0].message.content ?? '{}';
}

/* ─── System Prompt ─────────────────────────────────────────────────────────── */

const FALLBACK_CRITERIA = ['rapport', 'objectionHandling', 'credibility', 'closing', 'naturalness'];

const FALLBACK_SYSTEM_PROMPT = `คุณคือ "ลูกค้าคนไทย" ที่กำลังรับสายจากพนักงานเทเลเซลล์ (Tele-sales)

ผู้ใช้งาน = พนักงานขาย (เซลล์) ที่กำลังฝึกหัด
คุณ = ลูกค้าคนไทย ห้ามออกนอกบทบาทนี้โดยเด็ดขาด

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

กติกาการแสดงตน:
1. ภาษาที่ใช้: ภาษาไทยที่เป็นกันเอง สมจริง ไม่เป็นทางการเกินไป (ภาษาพูดปกติ)
2. บทพูดลูกค้า (Dialogue): ต้องสั้น กระชับ เป็นธรรมชาติแบบคนไทยคุยโทรศัพท์
3. ห้ามพูดในฐานะครูฝึก เทรนเนอร์ หรือ AI ใน Dialogue
4. ห้ามทักทายซ้ำซ้อนถ้าคุยกันไปแล้ว

การประเมินผล:
- ให้คะแนนใน Criteria (Rapport, Objection Handling, Credibility, Closing, Naturalness) 1-10
- หากผู้ใช้งานสามารถสร้างความไว้วางใจ และโน้มน้าวใจได้ดี ให้คะแนนสูงขึ้น
- score >= 7 → passed = true
- score < 7  → passed = false

ตอบกลับทุกครั้งในรูปแบบ JSON object เท่านั้น ใช้ schema นี้เสมอ:

{
  "Customer": {
    "Name": "ชื่อเล่นลูกค้า",
    "Occupation": "อาชีพ",
    "Age": อายุ (ตัวเลข),
    "Mood": "อารมณ์ปัจจุบัน (เช่น หงุดหงิด, สนใจ, ลังเล, พอใจ)"
  },
  "Objective": "วัตถุประสงค์สั้นๆ ของลูกค้าในรอบนี้",
  "Dialogue": "บทพูดของลูกค้า (ห้ามมีคำว่า ลูกค้า: นำหน้า)",
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
  "BuyingSignal": "สัญญาณการซื้อที่พบ (ถ้ามี)",
  "passed": true หรือ false
}`;

/* ─── POST handler ──────────────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, agentName, isStart, message: userMessageContent } = body;
    const level = Number(body.level) || 1;

    if (!agentId) {
      return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
    }

    // 1. Load Session from Server Source-of-Truth
    let session = await fsGet<ActiveEvalSession>('aiev_active', agentId);
    
    // If it's a start request or session doesn't exist, initialize it
    if (isStart || !session) {
      session = {
        agentId,
        agentName: agentName || 'Agent',
        sessionId: body.sessionId || crypto.randomUUID(),
        level,
        messages: [],
        savedAt: Date.now(),
        coaching: {}
      };
    }

    // 2. Append User Message if provided
    if (userMessageContent && !isStart) {
      session.messages.push({
        role: 'user',
        content: userMessageContent,
        timestamp: new Date().toISOString()
      });
    }

    // 3. Load Configuration
    const config = await loadFullConfig();
    const systemPrompt = config.systemPrompt || FALLBACK_SYSTEM_PROMPT;
    const passThreshold = Number(config.passThreshold) || 7;
    const configCriteria = Array.isArray(config.criteria) ? config.criteria : FALLBACK_CRITERIA;

    // 4. Provider Selection Logic
    const lastUserMsg = session.messages.length > 0 ? session.messages[session.messages.length - 1].content : '';
    const hasThai = /[\u0e00-\u0e7f]/.test(lastUserMsg);
    
    let provider: 'openai' | 'gemini' = config.provider === 'gemini' ? 'gemini' : 'openai';
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasGemini = !!process.env.GEMINI_API_KEY;

    if (hasOpenAI && hasGemini) {
      provider = hasThai ? 'gemini' : 'openai';
    } else if (!hasOpenAI && hasGemini) {
      provider = 'gemini';
    } else if (hasOpenAI && !hasGemini) {
      provider = 'openai';
    }

    // 5. Build AI Context
    const windowedMessages = session.messages.slice(-12);
    const messagesForAI = (isStart && windowedMessages.length === 0)
      ? [{ role: 'user' as const, content: '[ลูกค้ารับสาย — เริ่มต้นบทสนทนา]' }]
      : windowedMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    const contextHint = `\n\n[Context]\nพนักงานขายชื่อ: ${session.agentName}\nคุณคือลูกค้า ห้ามสวมบทบาทพนักงานขาย`;
    const startHint = isStart ? '\n\nหมายเหตุ: นี่คือจุดเริ่มต้น ให้ Dialogue เป็นประโยครับสายสั้นๆ เช่น "ฮัลโหล สวัสดีค่ะ?"' : '';
    const jsonSafety = '\n\nIMPORTANT: Respond ONLY with a valid JSON object.';

    // 6. Call AI
    const rawResponse = await callAI(
      provider,
      messagesForAI,
      systemPrompt + contextHint + startHint + jsonSafety,
      isStart
    );

    // 7. Parse & Process Response
    let parsed: any;
    try {
      parsed = JSON.parse(cleanJsonString(rawResponse));
    } catch (err) {
      console.error('AI JSON Parse Error:', err, rawResponse);
      // Attempt recovery if it's just raw text
      parsed = { Dialogue: rawResponse, Score: 5, passed: false };
    }

    const replyContent = parsed.Dialogue || parsed.dialogue || parsed.customerLine || (typeof parsed === 'string' ? parsed : '...');
    const scoreVal = Number(parsed.Score ?? parsed.score ?? 5);
    const passed = !isStart && (parsed.passed === true || scoreVal >= passThreshold);

    const aiMessage: PitchMessage = {
      role: 'assistant',
      content: replyContent,
      timestamp: new Date().toISOString()
    };

    session.messages.push(aiMessage);
    session.savedAt = Date.now();

    // Update Customer Profile
    if (parsed.Customer) {
      session.customerProfile = {
        name: parsed.Customer.Name || parsed.Customer.name || '',
        occupation: parsed.Customer.Occupation || parsed.Customer.occupation || '',
        age: parsed.Customer.Age || parsed.Customer.age || 0,
        mood: parsed.Customer.Mood || parsed.Customer.mood || '',
        objective: parsed.Objective || parsed.objective || ''
      };
    }

    // Process Coaching
    let turnCoaching: CoachingData | null = null;
    if (!isStart) {
      const critObj: Record<string, number> = {};
      const rawCrit = parsed.Criteria || parsed.criteria || {};
      configCriteria.forEach((k: string) => {
        critObj[k] = Number(rawCrit[k] || rawCrit[k.toLowerCase()] || 5);
      });

      turnCoaching = {
        score: scoreVal,
        criteria: critObj,
        strengths: parsed.Strengths || parsed.strengths || '',
        improvements: parsed.Improvements || parsed.improvements || '',
        coachingScript: parsed.CoachingScript || parsed.coachingScript || '',
        coachingTip: parsed.CoachingTip || parsed.coachingTip || '',
        metadata: parsed.BuyingSignal ? { buyingSignal: parsed.BuyingSignal } : {}
      };

      if (!session.coaching) session.coaching = {};
      session.coaching[session.messages.length - 1] = turnCoaching;
    }

    // 8. Finalize Turn
    if (passed) {
      await markEvalPassed(agentId, session.agentName, level);
      // Log completion
      await fsAdd('ai_eval_logs', {
        agentId, agentName: session.agentName, level, passed: true, score: scoreVal * 10, timestamp: new Date().toISOString()
      });
    } else {
      // Save active session
      await fsSet('aiev_active', agentId, session);
      
      // Log turn (optional, but good for analytics)
      if (!isStart) {
        await fsAdd('ai_eval_logs', {
          agentId, agentName: session.agentName, level, passed: false, score: scoreVal * 10, timestamp: new Date().toISOString()
        });
      }
    }

    return NextResponse.json({
      reply: replyContent,
      coaching: turnCoaching,
      passed,
      customerProfile: session.customerProfile,
      messages: session.messages // Return full history to sync client
    });

  } catch (err: any) {
    console.error('AI Eval Route Error:', err);
    return NextResponse.json({ 
      error: 'Evaluation failed', 
      details: err.message 
    }, { status: 500 });
  }
}
