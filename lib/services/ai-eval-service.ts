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
      console.error('[AiEvalService] Failed to load session from Firestore:', err);
      // Don't throw yet, we might be starting fresh
    }

    // When starting fresh, always discard any existing session so we get a clean slate
    if (isStart && session) {
      console.log('[AiEvalService] Discarding existing session for fresh start');
      await fsDelete(this.COLLECTION_SESSIONS, agentId);
      session = null;
    }

    // b. Resolve scenario ID — explicit param takes priority, then existing session, then default
    const actualScenarioId = (isStart && scenarioId)
      ? scenarioId
      : (session?.scenarioId || 'default');

    console.log(`[AiEvalService] Using scenarioId: ${actualScenarioId}`);

    let scenario: AiEvalScenario | null = null;
    try {
      scenario = await fsGet<AiEvalScenario>(this.COLLECTION_SCENARIOS, actualScenarioId)
                 || await fsGet<AiEvalScenario>(this.COLLECTION_SCENARIOS, 'default');
    } catch (err) {
      console.error('[AiEvalService] Firestore error fetching scenario:', err);
    }

    if (!scenario) {
      console.log('[AiEvalService] Scenario not found, seeding default');
      scenario = await this.seedDefaultScenario();
    }

    if (!session) {
      console.log('[AiEvalService] Initializing new session');
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
    }

    // d. Build LLM Orchestration
    console.log('[AiEvalService] Calling AI...');
    const turn = await this.callAI(session, scenario, isStart);
    console.log('[AiEvalService] AI returned dialogue:', turn.dialogue.substring(0, 30) + '...');
    
    // e. Update Session State
    session.messages.push({
      role: 'assistant',
      content: turn.dialogue,
      timestamp: new Date().toISOString()
    });
    session.coaching[session.messages.length - 1] = turn;
    session.currentMood = turn.mood;
    session.customerProfile.mood = turn.mood;  // keep customerProfile in sync for ChatView emoji
    session.lastUpdate = new Date().toISOString();

    // Check Win/Fail Conditions
    if (turn.intent === 'buy' || (turn.score >= scenario.passThreshold && session.turnCount >= (scenario.minTurnsToWin ?? 5))) {
      console.log('[AiEvalService] Status: PASSED');
      session.status = 'passed';
      await this.logCompletion(session, true);
    } else if (turn.intent === 'hang_up' || session.turnCount >= scenario.maxTurns) {
      console.log('[AiEvalService] Status: FAILED');
      session.status = 'failed';
      await this.logCompletion(session, false);
    }

    // f. Save/Clean Session
    try {
      if (session.status === 'active') {
        await fsSet(this.COLLECTION_SESSIONS, agentId, session);
      } else {
        await fsDelete(this.COLLECTION_SESSIONS, agentId);
      }
    } catch (err) {
      console.error('[AiEvalService] Failed to save/delete session in Firestore:', err);
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
    let config: any = null;
    try {
      config = await fsGet<any>('module_config', 'ai_eval');
    } catch (err) {
      console.warn('[AiEvalService] Failed to fetch module_config, using auto provider');
    }

    const providerSetting = config?.provider || 'auto';
    const provider = providerSetting === 'auto' ? this.determineProvider(session.messages, scenario) : providerSetting;
    console.log(`[AiEvalService] LLM Provider: ${provider}`);
    
    const systemPrompt = this.buildSystemPrompt(session, scenario, isStart);
    
    const windowedHistory = session.messages.slice(-12).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }));

    if (isStart && windowedHistory.length === 0) {
      windowedHistory.push({ role: 'user', content: '[ลูกค้ารับสาย]' });
    }

    let raw = '';
    try {
      if (provider === 'gemini') {
        const model = getGeminiModel({
          systemInstruction: {
            role: 'system',
            parts: [{ text: systemPrompt }]
          }
        });
        if (!model) {
          console.error('[AiEvalService] Gemini Model Initialization Failed (API Key missing?)');
          throw new Error('Gemini API Missing or Invalid');
        }
        const chat = model.startChat({
          history: windowedHistory.slice(0, -1).map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
          generationConfig: { responseMimeType: 'application/json', temperature: 0.7 }
        });
        const last = windowedHistory[windowedHistory.length - 1]?.content || '...';
        const res = await chat.sendMessage(last);
        raw = res.response.text();
      } else {
        const openai = getOpenAI();
        if (!openai) {
          console.error('[AiEvalService] OpenAI Initialization Failed (API Key missing?)');
          throw new Error('OpenAI API Missing or Invalid');
        }
        const res = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: systemPrompt }, ...windowedHistory],
          response_format: { type: 'json_object' },
          temperature: 0.7
        });
        raw = res.choices[0].message.content || '{}';
      }
    } catch (err: any) {
      console.error('[AiEvalService] LLM API Call Error:', err);
      throw new Error(`AI Provider Error: ${err.message}`);
    }

    // Parse and Validate with Zod
    try {
      const cleaned = this.cleanJson(raw);
      const parsed = JSON.parse(cleaned);
      return AiEvalTurnResponseSchema.parse(parsed);
    } catch (err) {
      console.error('[AiEvalService] AI Response Validation/Parsing Failed:', err, '\nRaw Output:', raw);
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
- Criteria ที่ต้องประเมิน: ${(scenario.requiredCriteria || ['rapport', 'objectionHandling', 'credibility', 'closing', 'naturalness']).join(', ')}
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
  "criteria": { ${(scenario.requiredCriteria || ['rapport', 'objectionHandling', 'credibility', 'closing', 'naturalness']).map(c => `"${c}": 1-10`).join(', ')} },
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
