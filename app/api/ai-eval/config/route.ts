import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export const revalidate = 0; // Disable caching

const FALLBACK_AGENT_GUIDELINE = `สวัสดีครับ/ค่ะ! ยินดีต้อนรับสู่ AI Evaluation

ในการทดสอบนี้ คุณจะได้รับสายจาก "ลูกค้าคนไทย" ที่ขับเคลื่อนด้วย AI
หน้าที่ของคุณคือ โน้มน้าวลูกค้าให้สนใจและปิดการขายให้ได้

เกณฑ์การผ่าน:
- คะแนนรวม ≥ 7/10 ถือว่าผ่าน
- ประเมิน 5 ด้าน: Rapport, Objection Handling, Credibility, Closing, Naturalness

เคล็ดลับ:
- แนะนำตัวและสร้างความไว้วางใจก่อน
- ฟังและตอบข้อโต้แย้งของลูกค้าอย่างมืออาชีพ
- ใช้ภาษาที่เป็นกันเอง เป็นธรรมชาติ
- ปิดการขายด้วยความมั่นใจ`;

export async function GET(req: NextRequest) {
  try {
    const db = getAdminDb();
    const agentId = req.nextUrl.searchParams.get('agentId');
    
    const [configDoc, scenariosSnap, progressDoc] = await Promise.all([
      db.collection('module_config').doc('ai_eval').get(),
      db.collection('aiev_scenarios').where('isActive', '==', true).get(),
      agentId ? db.collection('agent_progress').doc(agentId).get() : Promise.resolve(null)
    ]);

    const configData = configDoc.exists ? configDoc.data() : {};
    const scenarios = scenariosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const completedLevels = progressDoc?.exists ? (progressDoc.data()?.evalCompletedLevels || []) : [];

    return NextResponse.json({
      guideline: configData?.agentGuideline || FALLBACK_AGENT_GUIDELINE,
      passThreshold: configData?.passThreshold || 7,
      criteria: configData?.criteria || ['rapport', 'objectionHandling', 'credibility', 'closing', 'naturalness'],
      scenarios,
      completedLevels
    });
  } catch (err) {
    console.error('Fetch AI eval guideline error:', err);
    return NextResponse.json({ guideline: FALLBACK_AGENT_GUIDELINE });
  }
}
