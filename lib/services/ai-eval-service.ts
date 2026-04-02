import { getOpenAI } from '@/lib/openai';
import { getGeminiModel } from '@/lib/gemini';
import { fsGet, fsSet, fsDelete, fsAdd } from '@/lib/firestore-db';
import crypto from 'crypto';
import { 
  AiEvalScenario, 
  AiEvalSession, 
  AiEvalTurnResponse, 
  AiEvalTurnResponseSchema 
} from '@/types/ai-eval';
import { PitchMessage } from '@/types';

/* ─── Service Implementation ────────────────────────────────────────────────── */

export class AiEvalService {
  
  private static readonly COLLECTION_SCENARIOS = 'aiev_scenarios';
  private static readonly COLLECTION_SESSIONS  = 'aiev_sessions_v2';
  private static readonly COLLECTION_LOGS      = 'ai_eval_logs_v2';

  /**
   * 1. Start a new session or reset an existing one.
   */
  static async startSession(
    agentId: string, 
    agentName: string, 
    scenarioId: string = 'level_1_round_1'
  ): Promise<AiEvalSession> {
    
    // Fetch scenario (fallback to level_1 if not found)
    let scenario = await fsGet<AiEvalScenario>(this.COLLECTION_SCENARIOS, scenarioId);
    if (!scenario) {
      await this.seedAllScenarios();
      scenario = await fsGet<AiEvalScenario>(this.COLLECTION_SCENARIOS, scenarioId) || await this.seedDefaultScenario();
    }

    const session: AiEvalSession = {
      id: crypto.randomUUID(),
      agentId,
      agentName,
      scenarioId,
      level: scenario.level || 1,
      round: 1,
      messages: [],
      coaching: {},
      currentMood: scenario.initialMood,
      customerProfile: {
        name: scenario.name.split(' ')[0] || 'ลูกค้า',
        occupation: scenario.description,
        age: 30, // Default or parsed from persona
        objective: scenario.objective
      },
      status: 'active',
      turnCount: 0,
      turnCountInRound: 0,
      startTime: new Date().toISOString(),
      lastUpdate: new Date().toISOString()
    };

    return session;
  }

  /**
   * 2. Process a turn (User message -> AI response + Coaching).
   */
  static async processTurn(
    agentId: string,
    userMessage?: string,
    isStart: boolean = false,
    agentName?: string,
    scenarioId?: string
  ): Promise<{ session: AiEvalSession; turn: AiEvalTurnResponse }> {
    console.log(`[AiEvalService] processTurn - agentId: ${agentId}, isStart: ${isStart}, scenarioId: ${scenarioId}`);

    // a. Load current active session
    let session: AiEvalSession | null = null;
    try {
      session = await fsGet<AiEvalSession>(this.COLLECTION_SESSIONS, agentId);
    } catch (err) {
      console.error('[AiEvalService] Failed to load session:', err);
    }

    if (isStart && session) {
      console.log('[AiEvalService] Fresh start, discarding session');
      await fsDelete(this.COLLECTION_SESSIONS, agentId);
      session = null;
    }

    const actualScenarioId = (isStart && scenarioId)
      ? scenarioId
      : (session?.scenarioId || 'level_1_round_1');

    let scenario: AiEvalScenario | null = await fsGet<AiEvalScenario>(this.COLLECTION_SCENARIOS, actualScenarioId);
    if (!scenario) {
      await this.seedAllScenarios();
      scenario = await fsGet<AiEvalScenario>(this.COLLECTION_SCENARIOS, actualScenarioId) || await this.seedDefaultScenario();
    }

    if (!session) {
      session = await this.startSession(agentId, agentName || 'Agent', actualScenarioId);
    }

    // c. Add user message
    if (userMessage && !isStart) {
      session.messages.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
      });
      session.turnCount++;
      session.turnCountInRound++;
    }

    // d. Orchestration: Persona Dialogue first
    console.log('[AiEvalService] Calling Persona AI...');
    const personaProvider = this.determineProvider(session.messages as any, scenario);
    let turn = await this.callPersonaAI(session, scenario, isStart, personaProvider);
    
    // e. Check for Round End
    const isMaxTurns = session.turnCountInRound >= (scenario.maxTurnsPerRound || 6);
    const isIntentEnd = turn.intent === 'buy' || turn.intent === 'hang_up';

    if (isMaxTurns || isIntentEnd) {
      console.log(`[AiEvalService] Round Ended. Level: ${scenario.level}, Round: ${session.round}`);
      
      // Use GPT-4o (Standard) for Level 4 for elite coaching, else gpt-4o-mini
      const evaluatorModel = scenario.level === 4 ? 'gpt-4o' : 'gpt-4o-mini';
      const evaluation = await this.callEvaluatorAI(session, scenario, turn.dialogue, evaluatorModel);
      
      // Hard-coded Strict Validation: No single criteria < 5
      const criteria = evaluation.criteria || {};
      const hasLowScore = Object.values(criteria).some(val => val < 5);
      const totalScore = evaluation.score || 0;
      
      // Update Win/Fail status based on evaluation
      let hasPassedRound = totalScore >= scenario.passThreshold && !hasLowScore;
      
      // Special feedback if failed due to single low score
      if (totalScore >= scenario.passThreshold && hasLowScore) {
        evaluation.improvements = `⚠️ ตกเกณฑ์มาตรฐาน: แม้คะแนนรวมจะถึง แต่คุณมีบางหัวข้อที่ได้ต่ำกว่า 5 คะแนน (ต้องได้ 5+ ทุกหัวข้อถึงจะผ่าน)\n\n${evaluation.improvements}`;
      }

      const isExceptional = totalScore >= 45; 

      turn = { ...turn, ...evaluation, isRoundEnd: true, score: totalScore };

      if (hasPassedRound) {
        // SKIP ROUND 2 Logic: If score >= 45, or if already in round 2
        if (isExceptional || session.round >= (scenario.maxRounds || 2)) {
          session.status = 'passed';
          await this.logCompletion(session, true);
        } else {
          session.round++;
          session.turnCountInRound = 0;
        }
      } else {
        // FAIL Logic: If intent was hang_up or max turns reached without passing
        // If it was the last round, it's a definitive fail
        if (session.round >= (scenario.maxRounds || 2) || (isIntentEnd && turn.intent === 'hang_up')) {
          session.status = 'failed';
          await this.logCompletion(session, false);
        } else {
          // Retry in Round 2
          session.round++;
          session.turnCountInRound = 0;
        }
      }
    }

    // f. Update Session State
    session.messages.push({
      role: 'assistant',
      content: turn.dialogue,
      timestamp: new Date().toISOString()
    });
    
    if (turn.isRoundEnd) {
      session.coaching[session.messages.length - 1] = turn;
    }
    
    session.lastUpdate = new Date().toISOString();

    // Save
    try {
      if (session.status === 'active') {
        await fsSet(this.COLLECTION_SESSIONS, agentId, session);
      } else {
        await fsDelete(this.COLLECTION_SESSIONS, agentId);
      }
    } catch (err) {
      console.error('[AiEvalService] Save error:', err);
    }

    return { session, turn };
  }

  /**
   * 3. Persona Dialogue Call (Fast & Focused)
   */
  private static async callPersonaAI(
    session: AiEvalSession, 
    scenario: AiEvalScenario,
    isStart: boolean,
    provider: 'openai' | 'gemini' = 'gemini'
  ): Promise<AiEvalTurnResponse> {
    
    const isHardMode = (scenario.level || 1) >= 3;
    const systemPrompt = `
คุณคือลูกค้าคนไทย: ${scenario.customerPersona}
ระดับความยาก: Level ${scenario.level || 1} ${isHardMode ? '(โหมดเข้มงวด - ปฏิเสธเก่ง สงสัยเยอะ)' : '(โหมดปกติ)'}
บริบทสินค้า: คอร์สเทรด BrainTrade Thailand (มี Coach, AI, Campus)

กติกาการสนทนา:
- ตอบโต้สั้นๆ เป็นธรรมชาติที่สุด (ภาษาพูดคนไทย)
- ${isHardMode ? 'คุณมีความสงสัยสูงมาก ไม่เชื่อใจง่ายๆ จะถามจี้จุดอ่อน หรือเปรียบเทียบกับคู่แข่งเสมอ' : 'คุณมีความลังเลตามปกติของลูกค้าทั่วไป'}
- ห้ามหลุดบทบาท AI หรือ Coach เด็ดขาด
- ห้ามให้คำแนะนำหรือประเมินพนักงานในบทสนทนา
- อารมณ์ปัจจุบัน: ${session.currentMood}

ตอบกลับเป็น JSON:
{
  "dialogue": "บทพูดของคุณ",
  "intent": "continue | buy | hang_up",
  "mood": "อารมณ์ที่เปลี่ยนไป (ถ้ามี)"
}
    `.trim();

    const windowedHistory = session.messages.slice(-6).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }));

    if (isStart && windowedHistory.length === 0) {
      windowedHistory.push({ role: 'user', content: '[ลูกค้ารับสาย]' });
    }

    let raw = '{}';
    if (provider === 'gemini') {
      const model = getGeminiModel({ model: 'gemini-3-flash' });
      if (!model) throw new Error('Gemini API Missing');
      const chat = model.startChat({
        history: windowedHistory.map(h => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }]
        })),
        generationConfig: { responseMimeType: 'application/json' }
      });
      const res = await chat.sendMessage(systemPrompt);
      raw = res.response.text();
    } else {
      const openai = getOpenAI();
      if (!openai) throw new Error('OpenAI API Missing');
      const res = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }, ...windowedHistory],
        response_format: { type: 'json_object' },
        temperature: 0.8
      });
      raw = res.choices[0].message.content || '{}';
    }

    const parsed = JSON.parse(this.cleanJson(raw));
    
    return {
      dialogue: parsed.dialogue || "ครับ...",
      intent: parsed.intent || "continue",
      mood: parsed.mood || session.currentMood,
      isRoundEnd: false
    };
  }

  /**
   * 4. Evaluator Call (The "Professional Coach")
   */
  private static async callEvaluatorAI(
    session: AiEvalSession,
    scenario: AiEvalScenario,
    lastDialogue: string,
    model: string = 'gpt-4o-mini'
  ): Promise<Partial<AiEvalTurnResponse>> {
    
    const transcript = session.messages.map(m => `${m.role === 'user' ? 'พนักงาน' : 'ลูกค้า'}: ${m.content}`).join('\n');
    const fullTranscript = `${transcript}\nลูกค้า: ${lastDialogue}`;

    const isLevel4 = scenario.level === 4;
    const systemPrompt = `
คุณคือ "หัวหน้าทีมขายและครูฝึกเทเลเซลล์ระดับเหรียญทอง" ที่มีความเข้มงวดสูงมาก (Strict Mentor)
จงประเมินบทสนทนาตามเกณฑ์ 1-10 คะแนน (ให้คะแนนแบบอนุรักษ์นิยม - ไม่ให้คะแนนง่ายๆ):

ระดับความคาดหวัง: Level ${scenario.level || 1} ${isLevel4 ? '(มาตรฐานสูงสุด: ต้องไร้ที่ติ)' : '(มาตรฐานมืออาชีพ)'}

เกณฑ์การให้คะแนน:
1. rapport: การสร้างความสัมพันธ์ (ถ้าพูดจาเป็นหุ่นยนต์ หรือไม่ฟังลูกค้า ให้ 1-4)
2. objectionHandling: การรับมือข้อโต้แย้ง (ถ้าข้ามคำถามลูกค้า หรือตอบไม่เคลียร์ ให้ 1-4)
3. credibility: ความน่าเชื่อถือ (ถ้าข้อมูลผิด หรือน้ำเสียงไม่มั่นใจ ให้ 1-4)
4. closing: การปิดการขาย (ถ้าไม่พยายามปิดการขาย หรือปิดแบบยัดเยียดเกินไป ให้ 1-4)
5. naturalness: ความเป็นธรรมชาติ (ถ้าใช้สคริปต์แข็งทื่อ หรือภาษาไม่เป็นธรรมชาติ ให้ 1-4)

กติกาเหล็ก:
- คะแนนรวม >= 35/50 ถึงจะผ่าน
- **สำคัญมาก**: หากมีเกณฑ์ใดเกณฑ์หนึ่งได้ต่ำกว่า 5 คะแนน จะถือว่า "ตก" ทันที (แม้คะแนนรวมจะสูงก็ตาม)
- สำหรับ Level 4: หากพนักงานไม่สามารถตอบคำถาม Technical หรือเลข License ได้อย่างถูกต้อง ให้คะแนน Credibility ต่ำกว่า 5 ทันที

กรณีสอบตก:
- ในส่วน "coachingScript" ให้เขียน "Golden Script" ที่สมบูรณ์แบบที่สุด เพื่อให้พนักงานเห็นภาพว่า 'มือโปร' เขาพูดกันอย่างไร

ตอบกลับเป็น JSON เท่านั้น:
{
  "score": (คะแนนรวม 0-50),
  "criteria": { "rapport": 0, "objectionHandling": 0, "credibility": 0, "closing": 0, "naturalness": 0 },
  "strengths": "จุดเด่น (ถ้ามีจริงๆ)",
  "improvements": "จุดที่ต้องปรับปรุงอย่างละเอียด",
  "coachingScript": "Golden Script (Model Answer)",
  "coachingTip": "เทคนิคเชิงลึกสำหรับ Level นี้"
}
    `.trim();

    const openai = getOpenAI();
    if (!openai) throw new Error('OpenAI API Missing');

    const res = await openai.chat.completions.create({
      model: model as any,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `บทสนทนา:\n${fullTranscript}` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const raw = res.choices[0].message.content || '{}';
    return JSON.parse(this.cleanJson(raw));
  }

  static async seedAllScenarios() {
    const scenarios: AiEvalScenario[] = [
      {
        id: 'level_1',
        level: 1,
        name: 'Level 1: ลูกค้าปฏิเสธทั่วไป',
        description: 'เน้นการรับมือคำปฏิเสธเบื้องต้น',
        difficulty: 'beginner',
        customerPersona: 'สุ่มบทบาท: 1.พนักงานออฟฟิศ ยุ่ง 2.แม่บ้าน ต้องถามสามี 3.ผู้สูงอายุ ไม่เก่งเทคโนโลยี',
        initialMood: 'ไม่สนใจ',
        objective: 'ต้องการจบการสนทนาเร็วที่สุด',
        passThreshold: 35,
        requiredCriteria: ['rapport', 'objectionHandling', 'credibility', 'closing', 'naturalness'],
        maxTurnsPerRound: 6,
        maxRounds: 2,
        maxTurns: 12,
        minTurnsToWin: 3,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'level_2',
        level: 2,
        name: 'Level 2: ลูกค้าสงสัยสินค้า',
        description: 'เน้นการตอบคำถามเรื่องความคุ้มค่าและความเชื่อมั่น',
        difficulty: 'intermediate',
        customerPersona: 'สุ่มบทบาท: 1.นักธุรกิจ ต้องการหลักฐาน 2.Freelancer เคยขาดทุน 3.พยาบาล กลัวเสียเงินเปล่า',
        initialMood: 'ระมัดระวัง',
        objective: 'ต้องการหลักฐานความสำเร็จและเหตุผลที่ต้องจ่ายเงิน',
        passThreshold: 35,
        requiredCriteria: ['rapport', 'objectionHandling', 'credibility', 'closing', 'naturalness'],
        maxTurnsPerRound: 6,
        maxRounds: 2,
        maxTurns: 12,
        minTurnsToWin: 3,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'level_3',
        level: 3,
        name: 'Level 3: ลูกค้าต่อรองและเปรียบเทียบ',
        description: 'เน้นการรักษา Value และการเปรียบเทียบกับคู่แข่ง',
        difficulty: 'advanced',
        customerPersona: 'สุ่มบทบาท: 1.พ่อค้าออนไลน์ ต่อรองเก่ง 2.พนักงานธนาคาร รู้จักตลาด 3.นักศึกษา งบจำกัด',
        initialMood: 'ต่อรอง',
        objective: 'ต้องการส่วนลด หรือเหตุผลที่แพงกว่า YouTube/คู่แข่ง',
        passThreshold: 35,
        requiredCriteria: ['rapport', 'objectionHandling', 'credibility', 'closing', 'naturalness'],
        maxTurnsPerRound: 6,
        maxRounds: 2,
        maxTurns: 12,
        minTurnsToWin: 3,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'level_4',
        level: 4,
        name: 'Level 4: Boss Level (Hard)',
        description: 'เน้นความอดทนและการตอบคำถามเชิงเทคนิคขั้นสูง',
        difficulty: 'expert',
        customerPersona: 'สุ่มบทบาท: 1.เหยื่อแชร์ลูกโซ่ ไม่ไว้ใจใคร 2.นักลงทุนมืออาชีพ ถาม Technical 3.ลูกค้าอารมณ์ร้อน กดดัน',
        initialMood: 'ไม่พอใจ/ท้าทาย',
        objective: 'ต้องการทดสอบความรู้จริงของพนักงานและเลข License',
        passThreshold: 40,
        requiredCriteria: ['rapport', 'objectionHandling', 'credibility', 'closing', 'naturalness'],
        maxTurnsPerRound: 6,
        maxRounds: 2,
        maxTurns: 12,
        minTurnsToWin: 3,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const s of scenarios) {
      await fsSet(this.COLLECTION_SCENARIOS, s.id, s);
    }
  }

  /* ─── Helpers ───────────────────────────────────────────────────────────── */

  private static determineProvider(messages: PitchMessage[], scenario?: AiEvalScenario): 'openai' | 'gemini' {
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasGemini = !!process.env.GEMINI_API_KEY;
    if (!hasOpenAI) return 'gemini';
    if (!hasGemini) return 'openai';

    // Get the latest message to analyze
    const latestMessage = messages.length > 0 ? messages[messages.length - 1].content : '';
    const isThai = /[\u0e00-\u0e7f]/.test(latestMessage || scenario?.customerPersona || '');

    if (!isThai) return 'openai'; // English is best handled by OpenAI by default

    // THAI COMPLEXITY ANALYSIS
    let complexityScore = 0;
    
    // 1. Length Factor (Complexity increases with length)
    if (latestMessage.length > 150) complexityScore += 3;
    else if (latestMessage.length > 80) complexityScore += 1;

    // 2. Logical Keywords (Complexity increases with reasoning)
    const complexKeywords = [
      'เพราะอะไร', 'ทำไม', 'อย่างไร', 'เปรียบเทียบ', 'ต่างจาก', 
      'ความเสี่ยง', 'กลยุทธ์', 'ขั้นตอน', 'อธิบาย', 'เหตุผล'
    ];
    complexKeywords.forEach(word => {
      if (latestMessage.includes(word)) complexityScore += 2;
    });

    // 3. Technical/Questioning Density
    if (latestMessage.includes('?') || latestMessage.includes('ช่วย')) complexityScore += 1;

    console.log(`[AiEvalService] Thai Complexity Score: ${complexityScore} (Threshold: 4)`);

    // Decision: 
    // Score >= 4 -> OpenAI (Better for multi-step logic and technical reasoning)
    // Score < 4  -> Gemini (Better for natural, fast, conversational Thai)
    return complexityScore >= 4 ? 'openai' : 'gemini';
  }

  private static cleanJson(raw: string): string {
    return raw.replace(/```json/g, '').replace(/```/g, '').trim();
  }

  private static async logCompletion(session: AiEvalSession, passed: boolean) {
    const scenario = await fsGet<AiEvalScenario>(this.COLLECTION_SCENARIOS, session.scenarioId);
    const difficultyMap: Record<string, number> = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };
    const level = scenario ? difficultyMap[scenario.difficulty] || 1 : 1;

    await fsAdd(this.COLLECTION_LOGS, {
      agentId: session.agentId,
      agentName: session.agentName,
      scenarioId: session.scenarioId,
      difficulty: scenario?.difficulty || 'beginner',
      passed,
      finalTurnCount: session.turnCount,
      timestamp: new Date().toISOString()
    });
    
    if (passed) {
      // Update global progress
      const existing = await fsGet<any>('agent_progress', session.agentId) || { agentId: session.agentId, evalCompletedLevels: [], evalPassedScenarios: [] };
      const levels = Array.from(new Set([...(existing.evalCompletedLevels || []), level])).sort();
      const scenarios = Array.from(new Set([...(existing.evalPassedScenarios || []), session.scenarioId]));
      await fsSet('agent_progress', session.agentId, { ...existing, evalCompletedLevels: levels, evalPassedScenarios: scenarios });
    }
  }

  private static async seedDefaultScenario(): Promise<AiEvalScenario> {
    const scenario: AiEvalScenario = {
      id: 'default',
      name: 'ลูกค้าทั่วไป (มือใหม่)',
      description: 'ลูกค้าคนไทยที่สนใจการลงทุนแต่ยังลังเลเรื่องความปลอดภัยและความคุ้มค่า',
      difficulty: 'beginner',
      customerPersona: 'ชื่อ สมชาย อายุ 45 ทำธุรกิจส่วนตัว มีเงินเย็นแต่กลัวโดนหลอก เคยเล่นหุ้นไทยนิดหน่อย ไม่รู้จัก BrainTrade',
      initialMood: 'สงสัยและระมัดระวัง',
      objective: 'ต้องการความมั่นใจว่า BrainTrade มีคนสอนจริงๆ ไม่ใช่แค่ส่งวิดีโอมาให้ดู',
      passThreshold: 7,
      requiredCriteria: ['rapport', 'objectionHandling', 'credibility', 'closing', 'naturalness'],
      maxTurns: 12,
      maxTurnsPerRound: 6,
      maxRounds: 2,
      minTurnsToWin: 5,
      winCondition: 'เมื่อเซลล์อธิบายเรื่องโค้ชส่วนตัว 1:1 ได้อย่างชัดเจนและจริงใจ',
      failCondition: 'เมื่อเซลล์พูดจาเป็นหุ่นยนต์ หรือไม่ตอบคำถามเรื่องความปลอดภัย',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await fsSet(this.COLLECTION_SCENARIOS, 'default', scenario);
    return scenario;
  }
}
