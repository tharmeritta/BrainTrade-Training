/**
 * CLI Script to Seed Mockup Agent Users for Developer Testing
 * 
 * Usage:
 *   node scripts/seed-mock-agents.mjs
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local
const envPath = join(__dirname, '../.env.local');
if (existsSync(envPath)) {
  const envFile = readFileSync(envPath, 'utf-8');
  for (const line of envFile.split('\n')) {
    const [key, ...rest] = line.split('=');
    if (key && !key.startsWith('#') && rest.length) {
      process.env[key.trim()] = rest.join('=').trim().replace(/^"|"$/g, '');
    }
  }
}

function initAdmin() {
  if (getApps().length > 0) return getFirestore();
  const saJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  const projectId = process.env.FIREBASE_PROJECT_ID || 'bt-training-firebase';

  if (saJson && saJson.startsWith('{')) {
    const parsed = JSON.parse(saJson);
    initializeApp({ credential: cert(parsed), projectId: parsed.project_id || projectId });
  } else {
    initializeApp({ projectId });
  }

  return getFirestore();
}

const MOCKUP_AGENTS = [
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

async function seed() {
  console.log('[Seed] Seeding Developer Mockup Agents into Firestore...');
  const db = initAdmin();

  for (const agent of MOCKUP_AGENTS) {
    // 1. Seed Agents collection
    await db.collection('agents').doc(agent.id).set({
      id: agent.id,
      name: agent.name,
      stageName: agent.stageName,
      normalizedName: agent.name.toLowerCase(),
      active: true,
      createdAt: new Date().toISOString()
    }, { merge: true });

    // 2. Seed Progress collection
    await db.collection('agent_progress').doc(agent.id).set({
      agentId: agent.id,
      quiz: agent.quiz,
      evalCompletedLevels: agent.evalCompletedLevels,
      evalPassedScenarios: agent.evalPassedScenarios,
      learnedModules: agent.learnedModules,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log(`  ✓ Seeded: ${agent.name} (${agent.status} - ${agent.progress}%)`);
  }

  console.log('\n✨ Successfully seeded 6 developer mockup agent users!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
