import { getOpenAI } from '@/lib/openai';
import { getGeminiModel } from '@/lib/gemini';
import { fsGet, fsSet, fsAdd } from '@/lib/firestore-db';
import {
  AiEvalScenario,
  AiEvalTurnResponse,
} from '@/types/ai-eval';

export class AiAuditService {
  private static readonly COLLECTION_SCENARIOS = 'aiev_scenarios';
  private static readonly COLLECTION_LOGS      = 'ai_eval_logs_v2';

  /**
   * 1. Fetch transcript from ChatGPT shared link
   */
  static async fetchChatTranscript(link: string): Promise<string> {
    try {
      const response = await fetch(link, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const html = await response.text();

      // ChatGPT shared links store data in __NEXT_DATA__ script tag
      const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
      if (nextDataMatch) {
        const jsonData = JSON.parse(nextDataMatch[1]);
        const messages = jsonData.props?.pageProps?.sharedConversation?.messages || [];
        
        return messages
          .filter((m: any) => m.role === 'user' || m.role === 'assistant')
          .map((m: any) => {
            const role = m.role === 'user' ? 'Agent' : 'Customer';
            const text = m.content?.parts?.join('\n') || '';
            return `${role}: ${text}`;
          })
          .join('\n\n');
      }

      // Fallback: simple regex for pre-rendered content if __NEXT_DATA__ fails
      // (Though ChatGPT usually relies on __NEXT_DATA__)
      return "Transcript could not be extracted automatically. Please ensure the link is a valid ChatGPT shared link.";
    } catch (err) {
      console.error('[AiAuditService] fetchChatTranscript error:', err);
      throw new Error('Failed to fetch transcript from the provided link.');
    }
  }

  /**
   * 2. Audit transcript using LLM (Dual-model fallback: Gemini <-> OpenAI)
   */
  static async auditTranscript(
    agentId: string,
    agentName: string,
    scenarioId: string,
    transcript: string
  ): Promise<AiEvalTurnResponse> {
    const scenario = await fsGet<AiEvalScenario>(this.COLLECTION_SCENARIOS, scenarioId);
    if (!scenario) throw new Error('Scenario not found');

    const auditorPrompt = `You are a Senior Sales Auditor at BrainTrade Thailand.
Your task is to audit a sales practice transcript between an Agent and a Customer (AI).

SCENARIO CONTEXT:
Name: ${scenario.name}
Description: ${scenario.description}
Customer Persona: ${scenario.customerPersona || scenario.systemPrompt}
Objective: ${scenario.objective}
Win Condition: ${scenario.winCondition}

AUDIT INSTRUCTIONS:
${scenario.auditInstructions || 'Audit the agent based on standard sales quality criteria.'}

CRITERIA:
1. Rapport: Did the agent build trust and connection?
2. Objection Handling: Did the agent address concerns professionally?
3. Credibility: Did the agent provide accurate and convincing info?
4. Closing: Did the agent attempt to close or move to next step?
5. Naturalness: Was the conversation flow natural?

TRANSCRIPT:
\"\"\"
${transcript}
\"\"\"

INSTRUCTIONS:
- Analyze the agent's performance based on the scenario and criteria.
- Assign a score (0-100) for the overall performance.
- Provide scores (0-10) for each specific criterion.
- Determine the verdict: "passed" if they meet the win condition and score >= ${scenario.passThreshold || 70}, otherwise "failed".
- Provide constructive feedback (strengths, improvements, coaching tip).

RESPONSE FORMAT (JSON):
{
  "verdict": "passed" | "failed",
  "verdictReason": "Brief explanation of the verdict",
  "score": 0-100,
  "criteria": {
    "rapport": 0-10,
    "objectionHandling": 0-10,
    "credibility": 0-10,
    "closing": 0-10,
    "naturalness": 0-10
  },
  "strengths": "...",
  "improvements": "...",
  "coachingTip": "...",
  "dialogue": "Summary of audit results for the agent"
}`;

    let auditResult: AiEvalTurnResponse | null = null;
    let lastError: any = null;

    // --- Strategy: Try Gemini First ---
    const geminiModel = getGeminiModel({
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    });

    if (geminiModel) {
      try {
        console.log('[AiAuditService] Attempting audit with Gemini...');
        const result = await geminiModel.generateContent(auditorPrompt);
        const text = result.response.text();
        auditResult = JSON.parse(text);
        console.log('[AiAuditService] Gemini Audit Success.');
      } catch (err) {
        console.warn('[AiAuditService] Gemini failed, falling back to OpenAI...', err);
        lastError = err;
      }
    }

    // --- Fallback: Try OpenAI (gpt-4o-mini) if Gemini failed or is unavailable ---
    if (!auditResult) {
      const openai = getOpenAI();
      if (openai) {
        try {
          console.log('[AiAuditService] Attempting audit with OpenAI (gpt-4o-mini)...');
          const res = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: auditorPrompt }],
            response_format: { type: 'json_object' },
            temperature: 0.2,
          });
          auditResult = JSON.parse(res.choices[0].message.content || '{}');
          console.log('[AiAuditService] OpenAI Audit Success.');
        } catch (err) {
          console.error('[AiAuditService] OpenAI also failed.', err);
          lastError = err;
        }
      }
    }

    if (!auditResult) {
      throw new Error(`Audit failed on both AI models. Last error: ${lastError?.message || 'Unknown error'}`);
    }

    // Log completion
    await this.logAuditCompletion(agentId, agentName, scenario, auditResult);

    return auditResult;
  }

  private static async logAuditCompletion(
    agentId: string,
    agentName: string,
    scenario: AiEvalScenario,
    result: AiEvalTurnResponse
  ) {
    const passed = result.verdict === 'passed';
    const score = result.score || 0;

    await fsAdd(this.COLLECTION_LOGS, {
      agentId,
      agentName,
      scenarioId: scenario.id,
      level: scenario.level || 1,
      difficulty: scenario.difficulty || 'beginner',
      passed,
      score,
      isAudit: true,
      timestamp: new Date().toISOString(),
    });

    if (passed) {
      const existing = await fsGet<any>('agent_progress', agentId)
        || { agentId, evalCompletedLevels: [], evalPassedScenarios: [] };
      
      const level = scenario.level || 1;
      const levels = Array.from(new Set([...(existing.evalCompletedLevels || []), level])).sort();
      const scenarios = Array.from(new Set([...(existing.evalPassedScenarios || []), scenario.id]));
      
      await fsSet('agent_progress', agentId, { 
        ...existing, 
        evalCompletedLevels: levels, 
        evalPassedScenarios: scenarios 
      });
    }
  }
}
