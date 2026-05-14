import { getGeminiModel } from '@/lib/gemini';
import { getAdminDb } from '@/lib/server/firebase-admin';
import { fsGetAll } from '@/lib/server/db';
import { Agent, AgentEvaluation, TrainingPeriod } from '@/types';

export interface SemanticAuditResult {
  category: 'configuration' | 'evaluations' | 'integrity';
  status: 'pass' | 'warn' | 'fail';
  finding: string;
  recommendation: string;
}

export class SemanticAuditService {
  /**
   * Performs a deep semantic audit using Gemini
   */
  static async runFullAudit(): Promise<{ 
    timestamp: string;
    overallStatus: 'healthy' | 'degraded';
    findings: SemanticAuditResult[];
  }> {
    const db = getAdminDb();
    const findings: SemanticAuditResult[] = [];

    // 1. Fetch data for analysis
    const [configs, evaluations, agents] = await Promise.all([
      this.fetchConfigs(db),
      this.fetchEvaluations(db),
      this.fetchAgents(db)
    ]);

    // 2. Perform Analysis Layers
    const [configAudit, evalAudit, journeyAudit] = await Promise.all([
      this.auditConfigs(configs),
      this.auditEvaluations(evaluations),
      this.auditAgentJourneys(agents, evaluations)
    ]);

    findings.push(...configAudit, ...evalAudit, ...journeyAudit);

    const overallStatus = findings.some(f => f.status === 'fail') ? 'degraded' : 'healthy';

    return {
      timestamp: new Date().toISOString(),
      overallStatus,
      findings
    };
  }

  private static async fetchConfigs(db: FirebaseFirestore.Firestore) {
    const ids = ['learn', 'quizzes', 'ai_eval'];
    const data: any = {};
    for (const id of ids) {
      const doc = await db.collection('configs').doc(id).get();
      data[id] = doc.data();
    }
    return data;
  }

  private static async fetchEvaluations(db: FirebaseFirestore.Firestore) {
    const snap = await db.collection('agent_evaluations')
      .orderBy('evaluatedAt', 'desc')
      .limit(30)
      .get();
    return snap.docs.map(d => d.data() as AgentEvaluation);
  }

  private static async fetchAgents(db: FirebaseFirestore.Firestore) {
    const snap = await db.collection('agents').where('active', '==', true).limit(50).get();
    return snap.docs.map(d => d.data() as Agent);
  }

  /**
   * Layer 1: Config Logic Audit
   */
  private static async auditConfigs(configs: any): Promise<SemanticAuditResult[]> {
    const model = getGeminiModel({ 
      generationConfig: { temperature: 0.1, responseMimeType: "application/json" } 
    });
    if (!model) return [];

    const prompt = `Analyze the following system configurations for a sales training platform.
Look for logic contradictions, unclear instructions, or mismatch between learning and testing.

CONFIGS:
${JSON.stringify(configs, null, 2)}

RESPONSE FORMAT (JSON Array):
[{ "status": "pass" | "warn" | "fail", "finding": "...", "recommendation": "..." }]`;

    try {
      const result = await model.generateContent(prompt);
      const data = JSON.parse(result.response.text());
      return data.map((d: any) => ({ ...d, category: 'configuration' }));
    } catch (err) {
      console.error('Audit configs error:', err);
      return [{ category: 'configuration', status: 'warn', finding: 'AI failed to analyze configs', recommendation: 'Retry audit' }];
    }
  }

  /**
   * Layer 2: Human Evaluation Sentiment Audit
   */
  private static async auditEvaluations(evals: AgentEvaluation[]): Promise<SemanticAuditResult[]> {
    if (evals.length === 0) return [];
    
    const model = getGeminiModel({ 
      generationConfig: { temperature: 0.1, responseMimeType: "application/json" } 
    });
    if (!model) return [];

    // Strip unnecessary fields to save tokens
    const simpleEvals = evals.map(e => ({
      score: e.totalScore,
      comment: e.comments,
      notes: e.sessionNotes,
      evaluator: e.evaluatorName
    }));

    const prompt = `Analyze these human evaluation records. 
Check if the score matches the sentiment of the comments. 
Flag if an evaluator is being inconsistent or provides poor feedback.

EVALUATIONS:
${JSON.stringify(simpleEvals, null, 2)}

RESPONSE FORMAT (JSON Array):
[{ "status": "pass" | "warn" | "fail", "finding": "...", "recommendation": "..." }]`;

    try {
      const result = await model.generateContent(prompt);
      const data = JSON.parse(result.response.text());
      return data.map((d: any) => ({ ...d, category: 'evaluations' }));
    } catch (err) {
      console.error('Audit evaluations error:', err);
      return [{ category: 'evaluations', status: 'warn', finding: 'AI failed to analyze evaluations', recommendation: 'Retry audit' }];
    }
  }

  /**
   * Layer 3: Agent Journey & Integrity
   */
  private static async auditAgentJourneys(agents: Agent[], evals: AgentEvaluation[]): Promise<SemanticAuditResult[]> {
    const model = getGeminiModel({ 
      generationConfig: { temperature: 0.1, responseMimeType: "application/json" } 
    });
    if (!model) return [];

    const data = {
      agentCount: agents.length,
      graduatedCount: agents.filter(a => a.graduated).length,
      recentScores: agents.map(a => a.overallScore).filter(Boolean)
    };

    const prompt = `Analyze the current state of agent progress.
Look for statistical anomalies (e.g., too many 100% scores, or suspiciously high graduation rate).

DATA:
${JSON.stringify(data, null, 2)}

RESPONSE FORMAT (JSON Array):
[{ "status": "pass" | "warn" | "fail", "finding": "...", "recommendation": "..." }]`;

    try {
      const result = await model.generateContent(prompt);
      const data = JSON.parse(result.response.text());
      return data.map((d: any) => ({ ...d, category: 'integrity' }));
    } catch (err) {
      console.error('Audit journey error:', err);
      return [{ category: 'integrity', status: 'warn', finding: 'AI failed to analyze journeys', recommendation: 'Retry audit' }];
    }
  }
}
