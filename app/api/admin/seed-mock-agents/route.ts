import { NextRequest, NextResponse } from 'next/server';
import { fsSet, fsGetAll } from '@/lib/server/db';
import { Agent } from '@/types';

export const MOCKUP_AGENTS = [
  {
    id: 'mock-agent-alex-rivers',
    name: 'Alex Rivers',
    stageName: 'Alex R.',
    status: 'Fresh Starter',
    progress: 0,
    quiz: {},
    evalCompletedLevels: [],
    evalPassedScenarios: [],
    learnedModules: []
  },
  {
    id: 'mock-agent-sarah-jenkins',
    name: 'Sarah Jenkins',
    stageName: 'Sarah J.',
    status: 'Quiz Specialist',
    progress: 35,
    quiz: {
      foundation: { bestScore: 90, passed: true, attempts: 1, history: [{ score: 9, total: 10, passed: true, timestamp: new Date().toISOString() }] },
      product: { bestScore: 80, passed: true, attempts: 1, history: [{ score: 8, total: 10, passed: true, timestamp: new Date().toISOString() }] }
    },
    evalCompletedLevels: [],
    evalPassedScenarios: [],
    learnedModules: ['foundation', 'product']
  },
  {
    id: 'mock-agent-michael-chang',
    name: 'Michael Chang',
    stageName: 'Mike C.',
    status: 'AI Challenger',
    progress: 65,
    quiz: {
      foundation: { bestScore: 100, passed: true, attempts: 1, history: [{ score: 10, total: 10, passed: true, timestamp: new Date().toISOString() }] },
      product: { bestScore: 90, passed: true, attempts: 1, history: [{ score: 9, total: 10, passed: true, timestamp: new Date().toISOString() }] },
      compliance: { bestScore: 80, passed: true, attempts: 1, history: [{ score: 8, total: 10, passed: true, timestamp: new Date().toISOString() }] }
    },
    evalCompletedLevels: [1, 2],
    evalPassedScenarios: ['price-skeptic', 'impatient-buyer'],
    learnedModules: ['foundation', 'product', 'compliance']
  },
  {
    id: 'mock-agent-emily-davis',
    name: 'Emily Davis',
    stageName: 'Emily D.',
    status: 'Pending Human QA',
    progress: 88,
    quiz: {
      foundation: { bestScore: 100, passed: true, attempts: 1, history: [{ score: 10, total: 10, passed: true, timestamp: new Date().toISOString() }] },
      product: { bestScore: 90, passed: true, attempts: 1, history: [{ score: 9, total: 10, passed: true, timestamp: new Date().toISOString() }] },
      compliance: { bestScore: 90, passed: true, attempts: 1, history: [{ score: 9, total: 10, passed: true, timestamp: new Date().toISOString() }] },
      closing: { bestScore: 100, passed: true, attempts: 1, history: [{ score: 10, total: 10, passed: true, timestamp: new Date().toISOString() }] }
    },
    evalCompletedLevels: [1, 2, 3, 4],
    evalPassedScenarios: ['price-skeptic', 'impatient-buyer', 'technical-gatekeeper', 'hesitant-referral'],
    learnedModules: ['foundation', 'product', 'compliance', 'closing']
  },
  {
    id: 'mock-agent-david-miller',
    name: 'David Miller',
    stageName: 'David M.',
    status: 'Certified Graduate',
    progress: 100,
    quiz: {
      foundation: { bestScore: 100, passed: true, attempts: 1, history: [{ score: 10, total: 10, passed: true, timestamp: new Date().toISOString() }] },
      product: { bestScore: 100, passed: true, attempts: 1, history: [{ score: 10, total: 10, passed: true, timestamp: new Date().toISOString() }] },
      compliance: { bestScore: 90, passed: true, attempts: 1, history: [{ score: 9, total: 10, passed: true, timestamp: new Date().toISOString() }] },
      closing: { bestScore: 100, passed: true, attempts: 1, history: [{ score: 10, total: 10, passed: true, timestamp: new Date().toISOString() }] }
    },
    evalCompletedLevels: [1, 2, 3, 4],
    evalPassedScenarios: ['price-skeptic', 'impatient-buyer', 'technical-gatekeeper', 'hesitant-referral'],
    learnedModules: ['foundation', 'product', 'compliance', 'closing']
  },
  {
    id: 'mock-agent-jordan-vance',
    name: 'Jordan Vance',
    stageName: 'Jordan V.',
    status: 'Needs Remediation',
    progress: 42,
    quiz: {
      foundation: { bestScore: 60, passed: false, attempts: 2, history: [{ score: 6, total: 10, passed: false, timestamp: new Date().toISOString() }] }
    },
    evalCompletedLevels: [],
    evalPassedScenarios: [],
    learnedModules: ['foundation']
  }
];

export async function POST(req: NextRequest) {
  try {
    const seeded: Agent[] = [];

    for (const mock of MOCKUP_AGENTS) {
      // 1. Seed Agent Profile
      const agentDoc: Agent = {
        id: mock.id,
        name: mock.name,
        stageName: mock.stageName,
        normalizedName: mock.name.toLowerCase(),
        active: true,
        createdAt: new Date()
      };

      await fsSet('agents', mock.id, agentDoc);

      // 2. Seed Agent Progress
      await fsSet('agent_progress', mock.id, {
        agentId: mock.id,
        quiz: mock.quiz,
        evalCompletedLevels: mock.evalCompletedLevels,
        evalPassedScenarios: mock.evalPassedScenarios,
        learnedModules: mock.learnedModules,
        updatedAt: new Date().toISOString()
      });

      seeded.push(agentDoc);
    }

    return NextResponse.json({
      success: true,
      count: seeded.length,
      agents: seeded
    });
  } catch (err: any) {
    console.error('Seed mock agents error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ mockupAgents: MOCKUP_AGENTS });
}
