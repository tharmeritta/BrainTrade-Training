import { getOpenAI } from '@/lib/openai';
import { getGeminiModel } from '@/lib/gemini';
import { fsGet, fsSet, fsAdd } from '@/lib/server/db';
import { updateGlobalAiEvalStats, updateAgentOverallScore } from './stats-service';
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
      console.log(`[AiAuditService] Fetching transcript from: ${link}`);
      const response = await fetch(link, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch the link: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();

      // ChatGPT shared links store data in __NEXT_DATA__ script tag
      const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
      if (nextDataMatch) {
        let jsonData;
        try {
          jsonData = JSON.parse(nextDataMatch[1]);
        } catch (e) {
          console.error('[AiAuditService] JSON parse error for __NEXT_DATA__');
          throw new Error('Failed to parse ChatGPT data structure.');
        }
        
        const pageProps = jsonData.props?.pageProps || {};
        const sharedConv = pageProps.sharedConversation || pageProps.serverResponse?.data || pageProps.initialResponse?.data || {};
        
        // 1. Try direct messages array
        let messages = sharedConv.messages || (sharedConv.conversation?.messages);
        
        // 2. Try mapping structure (new ChatGPT format)
        if (!messages && sharedConv.conversation?.mapping) {
          const mapping = sharedConv.conversation.mapping;
          messages = Object.values(mapping)
            .map((node: any) => node.message)
            .filter((msg: any) => msg && (msg.role === 'user' || msg.role === 'assistant'));
          
          // Sort by create_time if available
          messages.sort((a: any, b: any) => (a.create_time || 0) - (b.create_time || 0));
        }

        if (messages && messages.length > 0) {
          return messages
            .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant'))
            .map((m: any) => {
              const role = m.role === 'user' ? 'Agent' : 'Customer';
              
              // Handle different content structures
              let text = '';
              const content = m.content;
              
              if (content) {
                if (content.parts) {
                  text = content.parts.map((p: any) => typeof p === 'string' ? p : (p.text || '')).join('\n');
                } else if (typeof content === 'string') {
                  text = content;
                } else if (content.text) {
                  text = content.text;
                }
              }
              
              return `${role}: ${text.trim()}`;
            })
            .filter((line: string) => line.length > 8) // Filter out empty-ish messages
            .join('\n\n');
        }
      }

      // If we are here, we might be blocked or the structure changed significantly
      const cloudflareBlock = html.includes('Cloudflare') || html.includes('captcha') || html.includes('challenge-platform') || html.includes('cf-browser-verification');
      
      if (cloudflareBlock) {
          console.warn('[AiAuditService] Cloudflare block detected in ChatGPT link.');
          throw new Error('Access to the ChatGPT link was blocked by security filters (Cloudflare). This often happens with automated requests. Please try again later or use a different link.');
      }

      console.warn('[AiAuditService] Could not find messages in __NEXT_DATA__. HTML length:', html.length);
      // Log more diagnostic info
      if (html.length > 0) {
        console.log('[AiAuditService] HTML Title:', html.match(/<title>([^<]+)<\/title>/)?.[1] || 'No title');
        console.log('[AiAuditService] __NEXT_DATA__ present:', !!nextDataMatch);
        if (nextDataMatch) {
            console.log('[AiAuditService] __NEXT_DATA__ preview:', nextDataMatch[1].substring(0, 500));
        }
      }

      throw new Error("Transcript could not be extracted automatically. This might be due to a change in ChatGPT's link structure or the link being set to private. Please ensure the link is a valid public shared link.");
    } catch (err: any) {
      console.error('[AiAuditService] fetchChatTranscript error:', err.message);
      throw err; // Re-throw to be caught by the route handler
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
    if (!transcript || transcript.trim().length < 10) {
      throw new Error('Transcript is too short or empty. Please provide a valid conversation.');
    }
    const scenario = await fsGet<AiEvalScenario>(this.COLLECTION_SCENARIOS, scenarioId);
    if (!scenario) throw new Error('Scenario not found');

    const winCondition = scenario.winCondition || 'พนักงานตอบคำถามและปิดการขายได้';
    const auditInstructions = scenario.auditInstructions || `ตรวจสอบว่าพนักงานสามารถ:
1. ${winCondition}
2. รับมือข้อโต้แย้งได้อย่างเป็นธรรมชาติ
3. มีความเป็นมืออาชีพและให้ข้อมูลที่ถูกต้อง`;

    const auditorPrompt = `You are a Senior Sales Auditor at BrainTrade Thailand.
Your task is to audit a sales practice transcript between an Agent and a Customer (AI).

SCENARIO CONTEXT:
Name: ${scenario.name}
Description: ${scenario.description}
Customer Persona: ${scenario.customerPersona || scenario.systemPrompt}
Objective: ${scenario.objective || 'Not specified'}
Win Condition: ${winCondition}

AUDIT INSTRUCTIONS:
${auditInstructions}

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

    // 1. Log the audit result
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

    // 2. Update agent_progress (aggregate record)
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

    // 3. Update scores and global stats (must happen AFTER progress update for accuracy)
    await Promise.all([
      updateGlobalAiEvalStats(score, passed),
      updateAgentOverallScore(agentId, agentName)
    ]);
  }
}
