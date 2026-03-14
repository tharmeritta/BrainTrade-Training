// One-time script to create/fix the first admin user
// Run with: node scripts/seed-admin.mjs
// Delete this file after running.

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '../.env.local');
const envFile = readFileSync(envPath, 'utf-8');
for (const line of envFile.split('\n')) {
  const [key, ...rest] = line.split('=');
  if (key && !key.startsWith('#') && rest.length) {
    process.env[key.trim()] = rest.join('=').trim().replace(/^"|"$/g, '');
  }
}

// ─── CONFIGURE YOUR ADMIN HERE ───────────────────────────────────────────────
// Set ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME in .env.local before running
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME     = process.env.ADMIN_NAME || 'Admin';
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.local');
  process.exit(1);
}
// ─────────────────────────────────────────────────────────────────────────────

initializeApp({
  credential: cert({
    projectId:   process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const auth = getAuth();
const db   = getFirestore();

async function run() {
  console.log(`Setting up admin: ${ADMIN_EMAIL}`);

  // Get or create the user
  let uid;
  try {
    const existing = await auth.getUserByEmail(ADMIN_EMAIL);
    uid = existing.uid;
    console.log(`Found existing user: ${uid}`);
    // Force set the password
    await auth.updateUser(uid, { password: ADMIN_PASSWORD, displayName: ADMIN_NAME });
    console.log('✓ Password updated');
  } catch {
    const newUser = await auth.createUser({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, displayName: ADMIN_NAME });
    uid = newUser.uid;
    console.log(`Created new user: ${uid}`);
  }

  // Set admin role claim
  await auth.setCustomUserClaims(uid, { role: 'admin' });
  console.log('✓ Admin claim set');

  // Write Firestore doc
  await db.collection('users').doc(uid).set({
    uid,
    name:      ADMIN_NAME,
    email:     ADMIN_EMAIL,
    role:      'admin',
    createdBy: 'seed',
    active:    true,
    createdAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  console.log('✓ Firestore doc written');

  console.log(`\n✓ Done!`);
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log('\nDelete scripts/seed-admin.mjs now.');
}

run().catch(err => {
  console.error('Failed:', err.message);
  process.exit(1);
});
