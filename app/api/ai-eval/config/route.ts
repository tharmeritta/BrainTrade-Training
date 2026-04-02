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
    const unlockMode = configData?.unlockMode || 'sequential';
    const scenarios = scenariosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    
    // Check for Master Sandbox Scenario
    const masterScenario = scenarios.find(s => s.isMaster === true && s.isActive === true);
    const masterScenarioId = masterScenario?.id || null;
    
    // Dynamic Level Completion Logic
    const progressData = progressDoc?.exists ? progressDoc.data() : {};
    const passedScenarios = progressData?.evalPassedScenarios || [];
    const legacyCompletedLevels = progressData?.evalCompletedLevels || [];
    
    // Group active scenarios by level
    const difficultyMap: Record<string, number> = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };
    const levelToScenarios: Record<number, string[]> = {};
    scenarios.forEach((s: any) => {
      const lv = difficultyMap[s.difficulty] || 1;
      if (!levelToScenarios[lv]) levelToScenarios[lv] = [];
      levelToScenarios[lv].push(s.id);
    });

    // A level is completed if:
    // 1. Sequential: ALL active scenarios in that level are passed
    // 2. Flexible: AT LEAST ONE active scenario in that level is passed
    const dynamicCompletedLevels = Object.keys(levelToScenarios)
      .map(Number)
      .filter(lv => {
        const activeIds = levelToScenarios[lv];
        if (activeIds.length === 0) return false;
        
        if (unlockMode === 'flexible') {
          return activeIds.some(id => passedScenarios.includes(id));
        }
        return activeIds.every(id => passedScenarios.includes(id));
      });

    const completedLevels = Array.from(new Set([...legacyCompletedLevels, ...dynamicCompletedLevels])).sort();

    return NextResponse.json({
      guideline: configData?.agentGuideline || FALLBACK_AGENT_GUIDELINE,
      passThreshold: configData?.passThreshold || 7,
      criteria: configData?.criteria || ['rapport', 'objectionHandling', 'credibility', 'closing', 'naturalness'],
      unlockMode,
      scenarios,
      completedLevels,
      passedScenarios,
      masterScenarioId
    });
  } catch (err) {
    console.error('Fetch AI eval config error:', err);
    return NextResponse.json({ guideline: FALLBACK_AGENT_GUIDELINE }, { status: 500 });
  }
}
