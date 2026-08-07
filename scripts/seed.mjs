/**
 * Unified Database Seeding Script for BrainTrade Training
 * 
 * Usage:
 *   node scripts/seed.mjs --admin       (Seed initial admin user)
 *   node scripts/seed.mjs --quizzes     (Seed quiz defaults)
 *   node scripts/seed.mjs --scenarios   (Seed telesales customer personas)
 *   node scripts/seed.mjs --all         (Seed all resources)
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local if present
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

async function seedAdmin(db) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@braintrade.com';
  const adminPass = process.env.ADMIN_PASSWORD || 'password123';
  const adminName = process.env.ADMIN_NAME || 'System Admin';

  console.log(`[Seed] Seeding Admin user (${adminEmail})...`);
  const staffRef = db.collection('staff_accounts');
  const snap = await staffRef.where('username', '==', adminEmail).get();

  if (!snap.empty) {
    console.log('  -> Admin account already exists.');
    return;
  }

  await staffRef.add({
    username: adminEmail,
    password: adminPass,
    name: adminName,
    role: 'admin',
    active: true,
    createdAt: new Date().toISOString()
  });

  console.log('✓ Admin account created successfully.');
}

async function seedQuizzes(db) {
  console.log('[Seed] Seeding default quizzes...');
  const quizRef = db.collection('config').doc('quizzes');
  await quizRef.set({
    updatedAt: FieldValue.serverTimestamp(),
    version: 1,
    seeded: true
  }, { merge: true });
  console.log('✓ Quiz configuration seeded.');
}

async function seedScenarios(db) {
  console.log('[Seed] Seeding Telesales AI Customer Scenarios...');
  const scenariosRef = db.collection('ai_eval_scenarios');

  const TELESALES_SCENARIOS = [
    {
      id: 'angry_skeptic',
      name: 'The Angry Skeptic',
      description: 'Customer believes stock trading is too risky or a scam. Tests empathy & risk disclosure.',
      difficulty: 'beginner',
      customerPersona: 'Skeptical retail investor worried about losing money.',
      initialMood: 'Hostile / Skeptical',
      objective: 'Address risk concerns, build rapport, and explain regulation clearly without guaranteeing profits.',
      winCondition: 'Customer agrees to receive the starter information guide.',
      failCondition: 'Trainee guarantees returns or argues aggressively.',
      passThreshold: 70,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'busy_trader',
      name: 'The Busy Executive',
      description: 'Customer claims they do not have time to trade. Tests concise 30-second elevator pitch.',
      difficulty: 'intermediate',
      customerPersona: 'Busy senior manager with limited time for phone calls.',
      initialMood: 'Impatient / Hurried',
      objective: 'Deliver value proposition in under 30 seconds and highlight automated platform tools.',
      winCondition: 'Customer schedules a 5-minute demo callback.',
      failCondition: 'Trainee rambles for more than 40 seconds without asking a qualifying question.',
      passThreshold: 75,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'fee_negotiator',
      name: 'The Fee Negotiator',
      description: 'Customer pushes hard for fee discounts. Tests value justification over price-cutting.',
      difficulty: 'advanced',
      customerPersona: 'Cost-conscious investor comparing brokerage commissions.',
      initialMood: 'Analytical / Demanding',
      objective: 'Justify platform value, premium execution, and educational support rather than dropping prices.',
      winCondition: 'Customer understands value proposition and commits to opening a demo account.',
      failCondition: 'Trainee offers unauthorized discounts or fails to explain value.',
      passThreshold: 80,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'competitor_loyalist',
      name: 'The Competitor Loyalist',
      description: 'Customer uses a rival trading platform. Tests competitive differentiation.',
      difficulty: 'expert',
      customerPersona: 'Experienced trader loyal to an existing broker.',
      initialMood: 'Confident / Defensive',
      objective: 'Highlight unique BrainTrade analytical tools & local support without insulting rival platform.',
      winCondition: 'Customer agrees to try a side-by-side demo account.',
      failCondition: 'Trainee insults the competitor or gets defensive.',
      passThreshold: 85,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  for (const s of TELESALES_SCENARIOS) {
    await scenariosRef.doc(s.id).set(s, { merge: true });
  }

  console.log('✓ Seeded 4 Telesales Customer Scenarios into Firestore.');
}

async function main() {
  const args = process.argv.slice(2);
  const doAll = args.includes('--all') || args.length === 0;
  const doAdmin = doAll || args.includes('--admin');
  const doQuizzes = doAll || args.includes('--quizzes');
  const doScenarios = doAll || args.includes('--scenarios');

  const db = initAdmin();

  if (doAdmin) await seedAdmin(db);
  if (doQuizzes) await seedQuizzes(db);
  if (doScenarios) await seedScenarios(db);

  console.log('\n✓ Seeding complete.');
}

main().catch(err => {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});
