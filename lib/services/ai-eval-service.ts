import { updateGlobalAiEvalStats, updateAgentOverallScore } from './stats-service';
import { getOpenAI } from '@/lib/openai';
import { generateText } from '@/lib/ai';
import { fsGet, fsSet, fsDelete, fsAdd } from '@/lib/server/db';
import crypto from 'crypto';
import {
  AiEvalScenario,
  AiEvalSession,
  AiEvalTurnResponse,
  } from '@/types/ai-eval';
  import { PitchMessage } from '@/types';
  import { getActiveTrainingPeriod } from '@/lib/server/training';

/* --- Service Implementation -------------------------------------------------- */

export class AiEvalService {

  private static readonly COLLECTION_SCENARIOS = 'aiev_scenarios';
  private static readonly COLLECTION_SESSIONS  = 'aiev_sessions_v2';
  private static readonly COLLECTION_LOGS      = 'ai_eval_logs_v2';

  private static scenarioCache = new Map<string, { scenario: AiEvalScenario; timestamp: number }>();
  private static CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Helper to retrieve scenario with 5-minute memory cache.
   */
  private static async getScenario(scenarioId: string): Promise<AiEvalScenario> {
    const cached = this.scenarioCache.get(scenarioId);
    if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
      return cached.scenario;
    }

    let scenario = await fsGet<AiEvalScenario>(this.COLLECTION_SCENARIOS, scenarioId);
    if (!scenario) {
      await this.seedAllScenarios();
      scenario = await fsGet<AiEvalScenario>(this.COLLECTION_SCENARIOS, scenarioId) || await this.seedDefaultScenario();
    }

    this.scenarioCache.set(scenarioId, { scenario, timestamp: Date.now() });
    return scenario;
  }

  /**
   * 1. Start a new session.
   */
  static async startSession(
    agentId: string,
    agentName: string,
    scenarioId: string = 'level_1'
  ): Promise<AiEvalSession> {

    const scenario = await this.getScenario(scenarioId);
    const activePeriod = await getActiveTrainingPeriod(agentId);

    const session: AiEvalSession = {
      id: crypto.randomUUID(),
      agentId,
      agentName,
      scenarioId,
      level: scenario.level || 1,
      round: 1,
      messages: [],
      coaching: {},
      currentMood: typeof scenario.initialMood === 'string' ? scenario.initialMood : scenario.initialMood?.th || scenario.initialMood?.en || 'ปกติ',
      customerProfile: {
        name: 'ลูกค้า',
        occupation: typeof scenario.description === 'string' ? scenario.description : typeof scenario.customerPersona === 'string' ? scenario.customerPersona : scenario.customerPersona?.th || scenario.customerPersona?.en || '',
        age: 35,
        objective: typeof scenario.objective === 'string' ? scenario.objective : scenario.objective?.th || scenario.objective?.en || '',
      },
      status: 'active',
      turnCount: 0,
      turnCountInRound: 0,
      startTime: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      trainingPeriodId: activePeriod?.id,
    };

    return session;
  }

  /**
   * 2. Process a turn — single ChatGPT call, reads verdict directly.
   */
  static async processTurn(
    agentId: string,
    userMessage?: string,
    isStart: boolean = false,
    agentName?: string,
    scenarioId?: string
  ): Promise<{ session: AiEvalSession; turn: AiEvalTurnResponse }> {
    console.log(`[AiEvalService] processTurn — agentId: ${agentId}, isStart: ${isStart}, scenarioId: ${scenarioId}`);

    // a. Load active session
    let session: AiEvalSession | null = null;
    try {
      session = await fsGet<AiEvalSession>(this.COLLECTION_SESSIONS, agentId);
    } catch (err) {
      console.error('[AiEvalService] Failed to load session:', err);
    }

    if (isStart && session) {
      await fsDelete(this.COLLECTION_SESSIONS, agentId);
      session = null;
    }

    const actualScenarioId = (isStart && scenarioId)
      ? scenarioId
      : (session?.scenarioId || 'level_1');

    const scenario = await this.getScenario(actualScenarioId);

    if (!session) {
      session = await this.startSession(agentId, agentName || 'Agent', actualScenarioId);
    }

    // b. Add user message
    if (userMessage && !isStart) {
      session.messages.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString(),
      });
      session.turnCount++;
      session.turnCountInRound++;
    }

    // c. Single ChatGPT call — returns dialogue + verdict
    console.log('[AiEvalService] Calling ChatGPT...');
    const turn = await this.callChatGPT(session, scenario, isStart);

    // d. Read verdict — the system knows pass/fail directly from ChatGPT's response
    if (turn.verdict === 'passed') {
      session.status = 'passed';
      session.verdictReason = turn.verdictReason || '';
      session.coaching[session.messages.length] = turn;
      await this.logCompletion(session, true, turn.score || 80);
    } else if (turn.verdict === 'failed') {
      session.status = 'failed';
      session.verdictReason = turn.verdictReason || '';
      session.coaching[session.messages.length] = turn;
      await this.logCompletion(session, false, turn.score || 20);
    }

    // e. Append assistant message to history
    session.messages.push({
      role: 'assistant',
      content: turn.dialogue || '',
      timestamp: new Date().toISOString(),
    });
    session.lastUpdate = new Date().toISOString();

    // f. Save or clear session
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
   * 3. Single ChatGPT call — customer dialogue + verdict in one response.
   */
  private static async callChatGPT(
    session: AiEvalSession,
    scenario: AiEvalScenario,
    isStart: boolean
  ): Promise<AiEvalTurnResponse> {
    const rawSystemPrompt = scenario.systemPrompt || this.buildFallbackSystemPrompt(scenario);
    const systemPrompt = this.injectVariables(rawSystemPrompt, session, scenario);

    const history: { role: 'user' | 'assistant'; content: string }[] = session.messages
      .slice(-12)
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    if (isStart && history.length === 0) {
      history.push({ role: 'user', content: '[ลูกค้ารับสาย]' });
    }

    const openai = getOpenAI();
    let raw = '';

    try {
      if (openai) {
        try {
          const isMaster = scenario.isMaster === true;
          const model = (isMaster || (scenario.level || 1) >= 4) ? 'gpt-4o' : 'gpt-4o-mini';
          const res = await openai.chat.completions.create({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              ...history,
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
          });
          raw = res.choices[0].message.content || '{}';
        } catch (err: any) {
          console.warn('[AiEvalService] OpenAI call failed, falling back to generateText (Gemini):', err.message);
          const prompt = `${systemPrompt}\n\nChat History:\n${history.map(h => `${h.role}: ${h.content}`).join('\n')}\n\nRespond in JSON format: {"dialogue": "...", "verdict": "continue|passed|failed", "score": 80, "coachingTip": "..."}`;
          raw = await generateText(prompt);
        }
      } else {
        // Dual-Model Fallback: Use Gemini API if OpenAI API key is missing
        const prompt = `${systemPrompt}\n\nChat History:\n${history.map(h => `${h.role}: ${h.content}`).join('\n')}\n\nRespond in JSON format: {"dialogue": "...", "verdict": "continue|passed|failed", "score": 80, "coachingTip": "..."}`;
        raw = await generateText(prompt);
      }
    } catch (outerErr: any) {
      console.warn('[AiEvalService] All AI Providers failed. Triggering Plan B Rule Engine:', outerErr.message);
      const lastUserMsg = [...session.messages].reverse().find(m => m.role === 'user')?.content || '';
      raw = JSON.stringify({
        dialogue: lastUserMsg.includes('ราคา') || lastUserMsg.includes('แพง') 
          ? 'เข้าใจครับ ราคานี้รวมระบบ Mentor สแกนสัญญาณ และสิทธิ์เรียนย้อนหลังตลอดชีพไหมครับ?'
          : 'ครับ... ขออนุญาตสอบถามรายละเอียดรูปแบบการเรียนการสอนเพิ่มเติมนิดนึงครับ',
        verdict: 'continue',
        score: 75,
        coachingTip: 'นำเสนอคุณค่าของคอร์สเรียนและความเป็นมืออาชีพของทีมโค้ช'
      });
    }
    let parsed: any = {};
    try {
      const cleaned = this.cleanJson(raw);
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.warn('[AiEvalService] Failed to parse JSON response from LLM, using fallback text:', raw);
      parsed = { dialogue: raw || 'ครับ... ขออนุญาตสอบถามเพิ่มเติมครับ' };
    }

    // Robust mapping for common JSON keys used by AI models
    const dialogue = parsed.dialogue || parsed.message || parsed.content || parsed.text || 'ครับ...';
    const rawVerdict = String(parsed.verdict || parsed.status || 'continue').toLowerCase();
    
    let verdict: 'continue' | 'passed' | 'failed' = 'continue';
    if (rawVerdict.includes('pass')) verdict = 'passed';
    else if (rawVerdict.includes('fail')) verdict = 'failed';
    else if (rawVerdict.includes('hang') || rawVerdict.includes('stop')) verdict = 'failed';

    return {
      dialogue,
      verdict,
      verdictReason: parsed.reason || parsed.verdictReason || parsed.explanation || '',
      score:         parsed.score ?? parsed.performance ?? undefined,
      strengths:     parsed.strengths || parsed.positive || undefined,
      improvements:  parsed.improvements || parsed.negative || undefined,
      coachingTip:   parsed.coachingTip || parsed.tip || parsed.coaching || undefined,
      // Map verdict → legacy intent field for backward compat with existing UI
      intent:        verdict === 'passed' ? 'buy' : verdict === 'failed' ? 'hang_up' : 'continue',
      isRoundEnd:    verdict === 'passed' || verdict === 'failed',
    };
  }

  /**
   * Inject session and scenario variables into the prompt.
   * Allows admins to use {{agentName}}, {{customerName}}, etc. in their pasted prompts.
   */
  private static injectVariables(prompt: string, session: AiEvalSession, scenario: AiEvalScenario): string {
    return prompt
      .replace(/{{agentName}}/g, session.agentName || 'พนักงาน')
      .replace(/{{customerName}}/g, session.customerProfile.name || 'ลูกค้า')
      .replace(/{{scenarioName}}/g, typeof scenario.name === 'string' ? scenario.name : scenario.name?.th || scenario.name?.en || '')
      .replace(/{{difficulty}}/g, scenario.difficulty || '')
      .replace(/{{level}}/g, (scenario.level || 1).toString())
      .replace(/{{turnCount}}/g, session.turnCount.toString());
  }

  /**
   * 4. Build a default system prompt from legacy scenario fields.
   *    Used as fallback when scenario.systemPrompt is not set.
   */
  private static buildFallbackSystemPrompt(scenario: AiEvalScenario): string {
    const maxTurns = scenario.maxTurns || 12;
    const persona = scenario.customerPersona || scenario.description || 'ลูกค้าทั่วไป';
    const mood = scenario.initialMood || 'ปกติ';
    const objective = scenario.objective || 'ต้องการข้อมูลเพิ่มเติม';
    const win = scenario.winCondition || 'พนักงานตอบคำถาม สร้างความเชื่อมั่น และปิดการขายได้';
    const fail = scenario.failCondition || 'พนักงานพูดแบบหุ่นยนต์ ไม่รับฟัง หรือสนทนาครบ 12 ครั้งแล้ว';

    return `🚨 คำเตือนสำคัญที่สุด: คุณคือ "ลูกค้าผู้สนใจซื้อ" เท่านั้น! ห้ามสวมบทบาทเป็นเซลส์ พนักงานขาย หรือโค้ชเด็ดขาด!
หน้าที่ของคุณคือรับสายและตั้งคำถามหรือโต้แย้งในฐานะลูกค้าที่ถูกพนักงานขาย (User) โทรหา

เล่นบทเป็นลูกค้าคนไทย: ${persona}
อารมณ์เริ่มต้น: ${mood}
เป้าหมายของลูกค้า: ${objective}
สินค้าที่พนักงานจะเสนอขายให้คุณ: คอร์สเทรด BrainTrade Thailand — Coach 1:1 / AI วิเคราะห์ตลาด / BrainTrade Campus

✅ PASS เมื่อ: ${win}
❌ FAIL เมื่อ: ${fail}

กติกา:
- ตอบสั้นๆ เป็นธรรมชาติ ในมุมมองของ "ลูกค้าคนไทย" ที่พนักงานกำลังขายของให้ ห้ามหลุดบทบาทไปขายของเอง
- หากสนทนาครบ ${maxTurns} ครั้งแล้วยังไม่ตัดสิน ให้ตัดสิน failed

ตอบกลับเป็น JSON เสมอ:
{"dialogue":"...","verdict":"continue","reason":"","score":null,"strengths":null,"improvements":null,"coachingTip":null}

เมื่อ verdict เป็น passed หรือ failed: ใส่ score (0-100), strengths, improvements, coachingTip
ห้ามบอก verdict แก่พนักงานใน dialogue เด็ดขาด`;
  }

  /* --- Seed Data ------------------------------------------------------------ */

  static async seedAllScenarios() {
    const scenarios: AiEvalScenario[] = [
      {
        id: 'level_1',
        level: 1,
        required: true,
        name: 'Level 1: ลูกค้ามือใหม่ผู้สุภาพและสนใจเรียนรู้',
        description: 'เน้นการสร้างความสนิทสนม รับมือข้อโต้แย้งเรื่องราคาและเวลาอย่างเป็นกันเอง',
        difficulty: 'beginner',
        customerPersona: 'คุณพลอย/คุณสมชาย: พนักงานออฟฟิศที่เป็นกันเอง สุภาพ สนใจอยากเรียนเทรดแต่กังวลเรื่องงบและเวลา',
        initialMood: 'เป็นกันเอง แต่ลังเลเรื่องงบประมาณและเวลา',
        objective: 'ต้องการคำแนะนำที่เป็นกันเอง เข้าใจง่าย และความคุ้มค่าของการเรียนรู้กับโค้ช 1:1',
        systemPrompt: `เล่นบทเป็นลูกค้าคนไทยมือใหม่ที่เป็นกันเอง ชื่อคุณพลอยหรือคุณสมชาย
สินค้า: คอร์สเทรด BrainTrade Thailand — โค้ชส่วนตัว 1:1 / AI ช่วยวิเคราะห์ตลาด / BrainTrade Campus
อารมณ์เริ่มต้น: เป็นกันเอง สุภาพ มีความสนใจอยากพัฒนาทักษะการเทรด แต่ลังเลเรื่องค่าใช้จ่ายและเวลา ตอบสั้นๆ เป็นธรรมชาติ สไตล์คนไทยที่เป็นมิตร ห้ามหลุดบทบาท

✅ PASS เมื่อ: พนักงานสร้างความเป็นกันเอง (Rapport) ได้ดี รับฟัง อธิบายความคุ้มค่าของการเรียนกับโค้ช และชวนทดลองนัดหมาย 1:1 อย่างเป็นธรรมชาติ
❌ FAIL เมื่อ: พนักงานพูดจาแข็งกระด้างแบบหุ่นยนต์ ไม่รับฟัง ยัดเยียดสินค้า หรือสนทนาครบ 12 ครั้งแล้ว

ตอบกลับเป็น JSON เสมอ:
{"dialogue":"...","verdict":"continue","reason":"","score":null,"strengths":null,"improvements":null,"coachingTip":null}

เมื่อ verdict เป็น passed/failed: ใส่ score (0-100), strengths, improvements, coachingTip ด้วย
ห้ามบอก verdict แก่พนักงานใน dialogue เด็ดขาด`,
        passThreshold: 70,
        requiredCriteria: ['rapport', 'objectionHandling', 'credibility', 'closing', 'naturalness'],
        maxTurnsPerRound: 6,
        maxRounds: 2,
        maxTurns: 12,
        minTurnsToWin: 3,
        isActive: true,
        isMaster: false,
        bypassPrompt: 'Act as a friendly, polite Thai beginner prospect who is interested in trading but slightly hesitant about cost and time. If the agent builds warm rapport, reframes the value of 1:1 coaching, and naturally invites you to a demo, say "PASSED".',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'level_2',
        level: 2,
        required: true,
        name: 'Level 2: ลูกค้าสงสัยสินค้า',
        description: 'เน้นการตอบคำถามเรื่องความคุ้มค่าและความเชื่อมั่น',
        difficulty: 'intermediate',
        customerPersona: 'สุ่มบทบาท: 1.นักธุรกิจ ต้องการหลักฐาน 2.Freelancer เคยขาดทุน 3.พยาบาล กลัวเสียเงินเปล่า',
        initialMood: 'ระมัดระวัง',
        objective: 'ต้องการหลักฐานความสำเร็จและเหตุผลที่ต้องจ่ายเงิน',
        systemPrompt: `เล่นบทเป็นลูกค้าคนไทย สุ่มเลือก 1 บทบาท: นักธุรกิจที่ต้องการหลักฐานจริงจัง / Freelancer ที่เคยขาดทุนมาก่อน / พยาบาลที่กลัวเสียเงินเปล่า
สินค้า: คอร์สเทรด BrainTrade Thailand — Coach 1:1 / AI วิเคราะห์ตลาด / BrainTrade Campus
อารมณ์เริ่มต้น: ระมัดระวัง สงสัยมาก ต้องการหลักฐานก่อนตัดสินใจ ตอบสั้นๆ เป็นธรรมชาติ ห้ามหลุดบทบาท

✅ PASS เมื่อ: พนักงานอธิบาย Coach 1:1 และระบบ AI ได้ชัดเจน มีหลักฐานความสำเร็จ ทำให้ลูกค้ามีความเชื่อมั่น
❌ FAIL เมื่อ: พนักงานตอบกว้างๆ ไม่มีข้อมูลจริง หรือสนทนาครบ 12 ครั้งแล้ว

ตอบกลับเป็น JSON เสมอ:
{"dialogue":"...","verdict":"continue","reason":"","score":null,"strengths":null,"improvements":null,"coachingTip":null}

เมื่อ verdict เป็น passed/failed: ใส่ score (0-100), strengths, improvements, coachingTip ด้วย
ห้ามบอก verdict แก่พนักงานใน dialogue เด็ดขาด`,
        passThreshold: 75,
        requiredCriteria: ['rapport', 'objectionHandling', 'credibility', 'closing', 'naturalness'],
        maxTurnsPerRound: 6,
        maxRounds: 2,
        maxTurns: 12,
        minTurnsToWin: 3,
        isActive: true,
        isMaster: false,
        bypassPrompt: 'Act as a cautious Thai customer who has lost money before. Ask for proof about the AI system and coach support. If the agent explains credibly, say "PASSED".',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'level_3',
        level: 3,
        required: true,
        name: 'Level 3: ลูกค้าต่อรองและเปรียบเทียบ',
        description: 'เน้นการรักษา Value และการเปรียบเทียบกับคู่แข่ง',
        difficulty: 'advanced',
        customerPersona: 'สุ่มบทบาท: 1.พ่อค้าออนไลน์ ต่อรองเก่ง 2.พนักงานธนาคาร รู้จักตลาด 3.นักศึกษา งบจำกัด',
        initialMood: 'ต่อรอง',
        objective: 'ต้องการส่วนลด หรือเหตุผลที่แพงกว่า YouTube/คู่แข่ง',
        systemPrompt: `เล่นบทเป็นลูกค้าคนไทย สุ่มเลือก 1 บทบาท: พ่อค้าออนไลน์ที่ต่อรองเก่ง / พนักงานธนาคารที่รู้จักตลาด / นักศึกษางบจำกัด
สินค้า: คอร์สเทรด BrainTrade Thailand — Coach 1:1 / AI วิเคราะห์ตลาด / BrainTrade Campus
อารมณ์เริ่มต้น: อยากต่อรอง เปรียบเทียบกับ YouTube หรือคู่แข่งตลอด ตอบสั้นๆ เป็นธรรมชาติ ห้ามหลุดบทบาท

✅ PASS เมื่อ: พนักงานรักษา Value ได้โดยไม่ลดราคา อธิบายความแตกต่างจาก YouTube ได้ชัดเจน
❌ FAIL เมื่อ: พนักงานยอมลดราคาง่ายๆ ตอบเรื่อง Value ได้ไม่ชัด หรือสนทนาครบ 12 ครั้งแล้ว

ตอบกลับเป็น JSON เสมอ:
{"dialogue":"...","verdict":"continue","reason":"","score":null,"strengths":null,"improvements":null,"coachingTip":null}

เมื่อ verdict เป็น passed/failed: ใส่ score (0-100), strengths, improvements, coachingTip ด้วย
ห้ามบอก verdict แก่พนักงานใน dialogue เด็ดขาด`,
        passThreshold: 80,
        requiredCriteria: ['rapport', 'objectionHandling', 'credibility', 'closing', 'naturalness'],
        maxTurnsPerRound: 6,
        maxRounds: 2,
        maxTurns: 12,
        minTurnsToWin: 3,
        isActive: true,
        isMaster: false,
        bypassPrompt: 'Act as a Thai customer who keeps comparing with free YouTube content. If the agent defends the value of 1:1 coaching without giving a discount, say "PASSED".',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'level_4',
        level: 4,
        required: true,
        name: 'Level 4: Boss Level (Hard)',
        description: 'เน้นความอดทนและการตอบคำถามเชิงเทคนิคขั้นสูง',
        difficulty: 'expert',
        customerPersona: 'สุ่มบทบาท: 1.เหยื่อแชร์ลูกโซ่ ไม่ไว้ใจใคร 2.นักลงทุนมืออาชีพ ถาม Technical 3.ลูกค้าอารมณ์ร้อน กดดัน',
        initialMood: 'ไม่พอใจ/ท้าทาย',
        objective: 'ต้องการทดสอบความรู้จริงของพนักงานและเลข License',
        systemPrompt: `เล่นบทเป็นลูกค้าคนไทย สุ่มเลือก 1 บทบาท: เหยื่อแชร์ลูกโซ่ที่ไม่ไว้ใจใคร / นักลงทุนมืออาชีพที่ถามเชิงเทคนิค / ลูกค้าอารมณ์ร้อนที่กดดัน
สินค้า: คอร์สเทรด BrainTrade Thailand — Coach 1:1 / AI วิเคราะห์ตลาด / BrainTrade Campus
อารมณ์เริ่มต้น: ไม่พอใจ ท้าทาย กดดัน ถามจี้เรื่อง License และข้อมูล Technical ตอบสั้นๆ เป็นธรรมชาติ ห้ามหลุดบทบาท

✅ PASS เมื่อ: พนักงานสงบ มืออาชีพ ตอบคำถาม Technical และ License ได้ถูกต้อง รับมือแรงกดดันได้
❌ FAIL เมื่อ: พนักงานหลุดอารมณ์ ตอบข้อมูลผิด หรือสนทนาครบ 12 ครั้งแล้ว

ตอบกลับเป็น JSON เสมอ:
{"dialogue":"...","verdict":"continue","reason":"","score":null,"strengths":null,"improvements":null,"coachingTip":null}

เมื่อ verdict เป็น passed/failed: ใส่ score (0-100), strengths, improvements, coachingTip ด้วย
ห้ามบอก verdict แก่พนักงานใน dialogue เด็ดขาด`,
        passThreshold: 85,
        requiredCriteria: ['rapport', 'objectionHandling', 'credibility', 'closing', 'naturalness'],
        maxTurnsPerRound: 6,
        maxRounds: 2,
        maxTurns: 12,
        minTurnsToWin: 3,
        isActive: true,
        isMaster: false,
        bypassPrompt: 'Act as an aggressive Thai investor. Demand the company license number and technical details about the AI. If the agent stays professional under pressure and gives accurate info, say "PASSED".',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const s of scenarios) {
      await fsSet(this.COLLECTION_SCENARIOS, s.id, s);
    }
  }

  /* --- Helpers -------------------------------------------------------------- */

  private static cleanJson(raw: string): string {
    return raw.replace(/```json/g, '').replace(/```/g, '').trim();
  }

  /**
   * Log a completed evaluation to ai_eval_logs_v2 and update agent_progress.
   * score is 0-100, returned by ChatGPT in the verdict response.
   */
  private static async logCompletion(session: AiEvalSession, passed: boolean, score: number) {
    const scenario = await fsGet<AiEvalScenario>(this.COLLECTION_SCENARIOS, session.scenarioId);
    const level = scenario?.level || session.level || 1;

    await Promise.all([
      fsAdd(this.COLLECTION_LOGS, {
        agentId:        session.agentId,
        agentName:      session.agentName,
        scenarioId:     session.scenarioId,
        level,
        difficulty:     scenario?.difficulty || 'beginner',
        passed,
        score,
        finalTurnCount: session.turnCount,
        timestamp:      new Date().toISOString(),
        trainingPeriodId: session.trainingPeriodId,
      }),
      updateGlobalAiEvalStats(score, passed),
      updateAgentOverallScore(session.agentId, session.agentName)
    ]);

    if (passed) {
      const existing = await fsGet<any>('agent_progress', session.agentId)
        || { agentId: session.agentId, evalCompletedLevels: [], evalPassedScenarios: [] };
      const levels    = Array.from(new Set([...(existing.evalCompletedLevels || []), level])).sort();
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
      level: 1,
      required: false,
      customerPersona: 'ชื่อ สมชาย อายุ 45 ทำธุรกิจส่วนตัว มีเงินเย็นแต่กลัวโดนหลอก เคยเล่นหุ้นไทยนิดหน่อย ไม่รู้จัก BrainTrade',
      initialMood: 'สงสัยและระมัดระวัง',
      objective: 'ต้องการความมั่นใจว่า BrainTrade มีคนสอนจริงๆ ไม่ใช่แค่ส่งวิดีโอมาให้ดู',
      systemPrompt: `เล่นบทเป็น สมชาย อายุ 45 เจ้าของธุรกิจส่วนตัว มีเงินเย็นแต่กลัวโดนหลอก เคยเล่นหุ้นไทยนิดหน่อย ไม่รู้จัก BrainTrade
สินค้า: คอร์สเทรด BrainTrade Thailand — Coach 1:1 / AI วิเคราะห์ตลาด / BrainTrade Campus
อารมณ์เริ่มต้น: สงสัยและระมัดระวัง ตอบสั้นๆ เป็นธรรมชาติ ห้ามหลุดบทบาท

✅ PASS เมื่อ: พนักงานอธิบายเรื่อง Coach 1:1 ได้ชัดเจนและจริงใจ ทำให้ลูกค้ามีความเชื่อมั่น
❌ FAIL เมื่อ: พนักงานพูดจาเป็นหุ่นยนต์ ไม่ตอบคำถามเรื่องความปลอดภัย หรือสนทนาครบ 12 ครั้งแล้ว

ตอบกลับเป็น JSON เสมอ:
{"dialogue":"...","verdict":"continue","reason":"","score":null,"strengths":null,"improvements":null,"coachingTip":null}

เมื่อ verdict เป็น passed/failed: ใส่ score (0-100), strengths, improvements, coachingTip ด้วย
ห้ามบอก verdict แก่พนักงานใน dialogue เด็ดขาด`,
      passThreshold: 35,
      requiredCriteria: ['rapport', 'objectionHandling', 'credibility', 'closing', 'naturalness'],
      maxTurns: 12,
      maxTurnsPerRound: 6,
      maxRounds: 2,
      minTurnsToWin: 5,
      winCondition: 'เมื่อเซลล์อธิบายเรื่องโค้ชส่วนตัว 1:1 ได้อย่างชัดเจนและจริงใจ',
      failCondition: 'เมื่อเซลล์พูดจาเป็นหุ่นยนต์ หรือไม่ตอบคำถามเรื่องความปลอดภัย',
      isActive: true,
      isMaster: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await fsSet(this.COLLECTION_SCENARIOS, 'default', scenario);
    return scenario;
  }
}
