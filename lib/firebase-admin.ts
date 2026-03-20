import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

/**
 * Clean surrounding quotes from an environment variable value.
 * Helpful for Docker, .env, or some CI platforms that wrap secrets in quotes.
 */
function cleanValue(val: string | undefined): string {
  if (!val) return '';
  let s = val.trim();
  while ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.substring(1, s.length - 1).trim();
  }
  return s;
}

/**
 * Robustly initializes the Firebase Admin SDK.
 * Handles single JSON string (FIREBASE_SERVICE_ACCOUNT), base64 encoded strings, 
 * and multiple individual environment variables.
 */
function getAdminApp(): App {
  const apps = getApps();
  if (apps.length > 0) return apps[0];

  // 1. Gather all possible sources (Standard and GCS aliases)
  const saJson       = cleanValue(process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GCS_SERVICE_ACCOUNT);
  let projectId     = cleanValue(process.env.FIREBASE_PROJECT_ID      || process.env.GCS_PROJECT_ID);
  let clientEmail   = cleanValue(process.env.FIREBASE_CLIENT_EMAIL    || process.env.GCS_CLIENT_EMAIL);
  let rawPrivateKey = cleanValue(process.env.FIREBASE_PRIVATE_KEY     || process.env.GCS_PRIVATE_KEY);

  // 2. If saJson is provided, extract its values for anything missing
  if (saJson && saJson.startsWith('{')) {
    try {
      const parsed = JSON.parse(saJson);
      if (!projectId)   projectId   = parsed.project_id   || '';
      if (!clientEmail) clientEmail = parsed.client_email || '';
      if (!rawPrivateKey) rawPrivateKey = parsed.private_key || '';
    } catch (e) {
      console.warn('[Firebase Admin] Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', (e as Error).message);
    }
  }

  // 3. Base64 check for the private key
  if (rawPrivateKey && !rawPrivateKey.includes('\n') && !rawPrivateKey.includes(' ') && !rawPrivateKey.includes('-----BEGIN')) {
    try {
      const decoded = Buffer.from(rawPrivateKey, 'base64').toString('utf8');
      if (decoded.includes('-----BEGIN') || decoded.trim().startsWith('{')) {
        rawPrivateKey = decoded.trim();
      }
    } catch (e) {
      // Not base64, continue with original
    }
  }

  // 4. If the private key variable itself contains the full JSON string
  if (rawPrivateKey.startsWith('{')) {
    try {
      const parsed = JSON.parse(rawPrivateKey);
      rawPrivateKey = parsed.private_key || '';
      if (!projectId)   projectId   = parsed.project_id   || '';
      if (!clientEmail) clientEmail = parsed.client_email || '';
    } catch (e) {
      // Not valid JSON, continue with original
    }
  }

  // 5. Final sanitization of the private key (PEM formatting)
  const privateKey = rawPrivateKey.replace(/\\n/g, '\n').replace(/\r/g, '').trim();

  // 6. Mandatory field check
  if (!projectId || !clientEmail || !privateKey) {
    const missing = [];
    if (!projectId)   missing.push('PROJECT_ID');
    if (!clientEmail) missing.push('CLIENT_EMAIL');
    if (!privateKey)  missing.push('PRIVATE_KEY');
    
    console.error('Firebase Admin Init Failed. Missing vars:', missing.join(', '));
    throw new Error(`Missing Firebase Admin credentials: ${missing.join(', ')}`);
  }

  // 7. Safe Diagnostics (Logged once per initialization)
  console.log('[Firebase Admin Diagnostics]', {
    projectId,
    clientEmail,
    keyLength: privateKey.length,
    keyPrefix: privateKey.substring(0, 26) + '...',
    hasNewlines: privateKey.includes('\n'),
    isPem: privateKey.includes('-----BEGIN PRIVATE KEY-----')
  });

  try {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } catch (err: any) {
    console.error('Firebase Admin initializeApp failed:', err);
    throw err;
  }
}

// Module-level cache for the Firestore instance
let cachedDb: Firestore | null = null;

/**
 * Returns the Firestore Admin DB instance, initializing the App if necessary.
 * Caches the Firestore instance for efficiency across multiple calls.
 */
export const getAdminDb = (): Firestore => {
  if (!cachedDb) {
    const app = getAdminApp();
    cachedDb = getFirestore(app);
  }
  return cachedDb;
};
