import { getOpenAI } from '@/lib/openai';
import { getGeminiModel } from '@/lib/gemini';
import { fsGet, fsSet, fsDelete, fsAdd } from '@/lib/firestore-db';
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
    scenarioId: string = 'default'
  ): Promise<AiEvalSession> {
    
    // Fetch scenario (fallback to default if not found)
    let scenario = await fsGet<AiEvalScenario>(this.COLLECTION_SCENARIOS, scenarioId);
    if (!scenario) {
      scenario = await this.seedDefaultScenario();
    }

    const session: AiEvalSession = {
      id: crypto.randomUUID(),
      agentId,
      agentName,
      scenarioId,
      level: 1,
      messages: [],
      coaching: {},
      currentMood: scenario.initialMood,
      customerProfile: {
        name: 'คุณสมชาย', // Can be randomized later
        occupation: 'ธุรกิจส่วนตัว',
        age: 45,
        objective: scenario.objective
      },
      status: 'active',
      turnCount: 0,
      startTime: new Date().toISOString(),
      lastUpdate: new Date().toISOString()
    };

    // Note: We don't save to DB yet, we'll do it after the first AI call
    return session;
  }

  /**
   * 2. Process a turn (User message -> AI response + Coaching).
   */
  static async processTurn(
    agentId: string,
    userMessage?: string,
    isStart: boolean = false
  ): Promise<{ session: AiEvalSession; turn: AiEvalTurnResponse }> {
    
    // a. Load current active session
    let session = await fsGet<AiEvalSession>(this.COLLECTION_SESSIONS, agentId);
    
    // b. Load Scenario
    const scenarioIdFromReq = session?.scenarioId || (isStart ? (userMessage && userMessage.length < 50 ? userMessage : 'default') : 'default');
    // Note: If isStart is true, the 'userMessage' field might actually contain the scenarioId from the client
    const actualScenarioId = (isStart && userMessage && !userMessage.includes(' ')) ? userMessage : scenarioIdFromReq;

    const scenario = await fsGet<AiEvalScenario>(this.COLLECTION_SCENARIOS, actualScenarioId) 
                     || await fsGet<AiEvalScenario>(this.COLLECTION_SCENARIOS, 'default')
                     || await this.seedDefaultScenario();

    if (!session) {
      session = await this.startSession(agentId, 'Agent', actualScenarioId);
    }

    // c. Add user message
    if (userMessage && !isStart) {
      session.messages.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
      });
      session.turnCount++;
    }

    // d. Build LLM Orchestration
    const turn = await this.callAI(session, scenario, isStart);
    
    // e. Update Session State
    session.messages.push({
      role: 'assistant',
      content: turn.dialogue,
      timestamp: new Date().toISOString()
    });
    session.coaching[session.messages.length - 1] = turn;
    session.currentMood = turn.mood;
    session.lastUpdate = new Date().toISOString();

    // Check Win/Fail Conditions
    if (turn.intent === 'buy' || (turn.score >= scenario.passThreshold && session.turnCount >= 5)) {
      session.status = 'passed';
      await this.logCompletion(session, true);
    } else if (turn.intent === 'hang_up' || session.turnCount >= scenario.maxTurns) {
      session.status = 'failed';
      await this.logCompletion(session, false);
    }

    // f. Save/Clean Session
    if (session.status === 'active') {
      await fsSet(this.COLLECTION_SESSIONS, agentId, session);
    } else {
      await fsDelete(this.COLLECTION_SESSIONS, agentId);
    }

    return { session, turn };
  }

  /**
   * 3. Orchestrated AI Call
   * Uses "Shadow Coach" pattern to combine Persona + Evaluation
   */
  private static async callAI(
    session: AiEvalSession, 
    scenario: AiEvalScenario,
    isStart: boolean
  ): Promise<AiEvalTurnResponse> {
    
    // Fetch global config to check provider override
    const config = await fsGet<any>('module_config', 'ai_eval');
    const providerSetting = config?.provider || 'auto';
    const provider = providerSetting === 'auto' ? this.determineProvider(session.messages, scenario) : providerSetting;
    
    const systemPrompt = this.buildSystemPrompt(session, scenario, isStart);
    
    const windowedHistory = session.messages.slice(-12).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }));

    if (isStart && windowedHistory.length === 0) {
      windowedHistory.push({ role: 'user', content: '[ลูกค้ารับสาย]' });
    }

    let raw: string;
    if (provider === 'gemini') {
      const model = getGeminiModel();
      if (!model) throw new Error('Gemini API Missing');
      const chat = model.startChat({
        history: windowedHistory.slice(0, -1).map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        systemInstruction: systemPrompt,
        generationConfig: { responseMimeType: 'application/json', temperature: 0.7 }
      });
      const last = windowedHistory[windowedHistory.length - 1]?.content || '...';
      const res = await chat.sendMessage(last);
      raw = res.response.text();
    } else {
      const openai = getOpenAI();
      if (!openai) throw new Error('OpenAI API Missing');
      const res = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }, ...windowedHistory],
        response_format: { type: 'json_object' },
        temperature: 0.7
      });
      raw = res.choices[0].message.content || '{}';
    }

    // Parse and Validate with Zod
    try {
      const parsed = JSON.parse(this.cleanJson(raw));
      return AiEvalTurnResponseSchema.parse(parsed);
    } catch (err) {
      console.error('AI Response Validation Failed:', err, raw);
      // Fallback recovery object
      return {
        dialogue: "ขอโทษทีครับ พอดีสัญญาณไม่ค่อยดี คุณว่ายังไงนะ?",
        mood: session.currentMood,
        objectiveState: "stalled",
        intent: "continue",
        score: 5,
        criteria: { rapport: 5, objectionHandling: 5, credibility: 5, closing: 5, naturalness: 5 },
        strengths: "พยายามสื่อสาร",
        improvements: "รอสัญญาณชัดเจนอีกครั้ง",
        coachingScript: "ลองทวนประโยคก่อนหน้าดูครับ",
        coachingTip: "Technical Recovery"
      };
    }
  }

  /* ─── Prompt Engineering ────────────────────────────────────────────────── */

  private static buildSystemPrompt(session: AiEvalSession, scenario: AiEvalScenario, isStart: boolean): string {
    return `
คุณคือระบบ AI อัจฉริยะที่ทำหน้าที่ 2 บทบาทพร้อมกันในโครงสร้าง JSON เดียว:
1. ROLE: ${scenario.name} (ลูกค้าคนไทย)
2. SHADOW COACH: ผู้เชี่ยวชาญการขายระดับโลกที่จะประเมินพนักงานขายแบบ Real-time

[CUSTOMER PERSONA]
- ประวัติ: ${scenario.customerPersona}
- วัตถุประสงค์ของลูกค้า: ${session.customerProfile.objective}
- อารมณ์เริ่มต้น: ${session.currentMood}
- กติกา: พูดภาษาไทยที่เป็นธรรมชาติที่สุด ห้ามหลุดบทบาท AI เด็ดขาด สั้น กระชับ สมจริง

[EVALUATION RULES]
- ประเมินพนักงานขายชื่อ: ${session.agentName}
- เกณฑ์การผ่าน: ${scenario.passThreshold}/10
- Criteria ที่ต้องประเมิน: ${scenario.requiredCriteria.join(', ')}
- ${scenario.evaluatorInstructions || ''}

[DECISION LOGIC - Intent]
- 'continue': ยังคุยต่อได้ มีเรื่องให้ถามหรือคัดค้าน
- 'buy': เซลล์ทำได้ยอดเยี่ยม ปิดการขายได้ประทับใจ หรือทำตามเงื่อนไข: ${scenario.winCondition || 'N/A'}
- 'hang_up': เซลล์พูดจาไม่ดี ตื้อจนน่ารำคาญ หรือทำตามเงื่อนไข: ${scenario.failCondition || 'N/A'}

[RESPONSE FORMAT]
ตอบกลับเป็น JSON Object ตาม Schema นี้เท่านั้น:
{
  "dialogue": "บทพูดของลูกค้า (ภาษาไทย)",
  "mood": "อารมณ์ปัจจุบันของลูกค้า",
  "objectiveState": "ความคืบหน้าของวัตถุประสงค์ลูกค้า",
  "intent": "continue | buy | hang_up",
  "score": (คะแนนรวม 1-10),
  "criteria": { ${scenario.requiredCriteria.map(c => `"${c}": 1-10`).join(', ')} },
  "strengths": "จุดเด่นของเซลล์ในรอบนี้",
  "improvements": "สิ่งที่ควรปรับปรุง",
  "coachingScript": "ประโยคตัวอย่างที่เซลล์ควรพูด (Actionable)",
  "coachingTip": "ชื่อเทคนิคและวิธีใช้",
  "buyingSignal": "สัญญาณการซื้อที่พบ (ถ้ามี)"
}
    `.trim();
  }

  /* ─── Helpers ───────────────────────────────────────────────────────────── */

  private static determineProvider(messages: PitchMessage[], scenario?: AiEvalScenario): 'openai' | 'gemini' {
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasGemini = !!process.env.GEMINI_API_KEY;
    if (hasOpenAI && hasGemini) {
      let textToTest = '';
      if (messages && messages.length > 0) {
        textToTest = messages[messages.length - 1]?.content || '';
      } else if (scenario) {
        textToTest = `${scenario.name} ${scenario.description} ${scenario.customerPersona}`;
      }
      return /[\u0e00-\u0e7f]/.test(textToTest) ? 'gemini' : 'openai';
    }
    return hasGemini ? 'gemini' : 'openai';
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
      const existing = await fsGet<any>('agent_progress', session.agentId) || { agentId: session.agentId, evalCompletedLevels: [] };
      const levels = Array.from(new Set([...(existing.evalCompletedLevels || []), level])).sort();
      await fsSet('agent_progress', session.agentId, { ...existing, evalCompletedLevels: levels });
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
