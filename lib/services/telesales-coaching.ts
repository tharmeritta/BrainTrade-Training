import { generateText } from '@/lib/ai';
import { PitchMessage } from '@/types';

export interface CoachingBrief {
  overallScore: number;
  competencies: {
    rapport: number;
    objectionHandling: number;
    valuePitch: number;
    compliance: number;
  };
  strengths: string[];
  gaps: string[];
  complianceAlerts: string[];
  trainerScript: string;
}

/**
 * Generate a 1-click Telesales Coaching Brief for Lead Trainers & Managers.
 */
export async function generateCoachingBrief(
  scenarioName: string,
  messages: PitchMessage[],
  score?: number
): Promise<CoachingBrief> {
  const transcriptText = messages
    .map(m => `${m.role === 'user' ? 'Trainee' : 'Customer'}: ${m.content}`)
    .join('\n');

  const systemPrompt = `You are a world-class Telesales Head of Training.
Analyze the following sales call transcript and produce a JSON coaching brief for the Lead Trainer.
Output MUST be valid JSON with this exact schema:
{
  "overallScore": number (0-100),
  "competencies": {
    "rapport": number (0-100),
    "objectionHandling": number (0-100),
    "valuePitch": number (0-100),
    "compliance": number (0-100)
  },
  "strengths": [string, string],
  "gaps": [string, string],
  "complianceAlerts": [string],
  "trainerScript": string
}
Rules:
- If trainee promised guaranteed stock profits, set compliance score < 50 and add a complianceAlert.
- Keep trainerScript practical, encouraging, and specific to the customer's objection.`;

  const userPrompt = `Scenario: ${scenarioName}
Current Score: ${score ?? 70}

Transcript:
${transcriptText || 'No transcript available.'}`;

  try {
    const raw = await generateText(userPrompt, systemPrompt);
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      overallScore: parsed.overallScore ?? score ?? 70,
      competencies: {
        rapport: parsed.competencies?.rapport ?? 75,
        objectionHandling: parsed.competencies?.objectionHandling ?? 70,
        valuePitch: parsed.competencies?.valuePitch ?? 70,
        compliance: parsed.competencies?.compliance ?? 90,
      },
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Good initial greeting'],
      gaps: Array.isArray(parsed.gaps) ? parsed.gaps : ['Needs sharper objection handling'],
      complianceAlerts: Array.isArray(parsed.complianceAlerts) ? parsed.complianceAlerts : [],
      trainerScript: parsed.trainerScript || 'Focus on asking open-ended questions when encountering risk pushback.',
    };
  } catch (err: any) {
    console.error('Coaching brief generation error:', err.message);
    return {
      overallScore: score ?? 70,
      competencies: { rapport: 75, objectionHandling: 70, valuePitch: 70, compliance: 90 },
      strengths: ['Maintained polite tone throughout session'],
      gaps: ['Work on addressing specific customer objections'],
      complianceAlerts: [],
      trainerScript: 'Review objection handling techniques for risk-averse customers.',
    };
  }
}
