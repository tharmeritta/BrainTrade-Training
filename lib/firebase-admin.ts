import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth, Auth } from 'firebase-admin/auth';

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
  // Strip hidden newlines/carriage returns that break API keys
  return s.replace(/[\r\n]/g, '').trim();
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
  let saJson        = cleanValue(process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GCS_SERVICE_ACCOUNT);
  let projectId     = cleanValue(process.env.FIREBASE_PROJECT_ID      || process.env.GCS_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  let clientEmail   = cleanValue(process.env.FIREBASE_CLIENT_EMAIL    || process.env.GCS_CLIENT_EMAIL);
  let rawPrivateKey = cleanValue(process.env.FIREBASE_PRIVATE_KEY     || process.env.GCS_PRIVATE_KEY);
  let source = 'individual-vars';

  // 1b. If saJson looks like base64, decode it first
  if (saJson && !saJson.startsWith('{') && (saJson.length > 100)) {
    try {
      const decoded = Buffer.from(saJson, 'base64').toString('utf8');
      if (decoded.trim().startsWith('{')) {
        saJson = decoded.trim();
      }
    } catch (e) {
      // Not base64, continue
    }
  }

  // 2. If saJson is provided, extract its values for anything missing
  if (saJson && saJson.startsWith('{')) {
    try {
      const parsed = JSON.parse(saJson);
      source = 'service-account-json';
      // Prefer values from the JSON as it's the definitive source
      if (parsed.project_id)   projectId   = parsed.project_id;
      if (parsed.client_email) clientEmail = parsed.client_email;
      if (parsed.private_key)  rawPrivateKey = parsed.private_key;
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
  let privateKey = rawPrivateKey.replace(/\\n/g, '\n').replace(/\r/g, '').trim();
  
  // Ensure PEM headers/footers if missing but it looks like a key
  if (privateKey && !privateKey.includes('-----BEGIN PRIVATE KEY-----') && privateKey.length > 100) {
    console.warn('[Firebase Admin] Private key missing PEM header, attempting to wrap it.');
    privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
  }

  // If it has headers but no newlines, it's definitely broken for Google
  if (privateKey && privateKey.includes('-----BEGIN PRIVATE KEY-----') && !privateKey.includes('\n', privateKey.indexOf('-----BEGIN PRIVATE KEY-----') + 26)) {
     console.warn('[Firebase Admin] Private key has headers but no internal newlines. This will likely fail.');
     // We could try to fix it here, but it's risky. Let's at least log it.
  }

  // 6. Mandatory field check
  if (!projectId || !clientEmail || !privateKey) {
    const missing = [];
    if (!projectId)   missing.push('PROJECT_ID');
    if (!clientEmail) missing.push('CLIENT_EMAIL');
    if (!privateKey)  missing.push('PRIVATE_KEY');
    
    console.error('Firebase Admin Init Failed. Missing required environment variables:', missing.join(', '));
    throw new Error(`Firebase Admin credentials incomplete. Please check your .env.local or env.yaml for: ${missing.join(', ')}`);
  }

  // 7. Safe Diagnostics (Logged once per initialization)
  try {
    console.log('[Firebase Admin Diagnostics]', {
      source,
      projectId: (projectId || '').toString().substring(0, 10) + '...',
      clientEmail: (clientEmail || '').toString().substring(0, 15) + '...',
      keyLength: (privateKey || '').length,
      hasNewlines: (privateKey || '').includes('\n'),
      isPem: (privateKey || '').includes('-----BEGIN PRIVATE KEY-----')
    });
  } catch (diagErr) {
    console.warn('[Firebase Admin] Diagnostics failed:', diagErr);
  }

  try {
    const config = {
      projectId: (projectId || '').trim(),
      credential: cert({
        projectId: (projectId || '').trim(),
        clientEmail: (clientEmail || '').trim(),
        privateKey: (privateKey || '').trim(),
      }),
    };
    
    console.log('[Firebase Admin] Attempting initializeApp with projectId:', config.projectId);
    
    const app = initializeApp(config);
    console.log('[Firebase Admin] initializeApp success');
    return app;
  } catch (err: any) {
    console.error('Firebase Admin initializeApp fatal error:', err.message);
    throw err;
  }
}

// Returns the Firebase Storage bucket (uses NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET env var)
export const getAdminStorage = () => {
  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const storage = getStorage(getAdminApp());
  return bucket ? storage.bucket(bucket) : storage.bucket();
};

// Module-level cache for the Firestore instance
let cachedDb: Firestore | null = null;

/**
 * Returns the Firestore Admin DB instance, initializing the App if necessary.
 * Caches the Firestore instance for efficiency across multiple calls.
 */
export const getAdminDb = (): Firestore => {
  try {
    if (!cachedDb) {
      const app = getAdminApp();
      cachedDb = getFirestore(app);
      // Test the connection immediately if possible? No, Firestore is lazy.
    }
    return cachedDb;
  } catch (e: any) {
    console.error('[Firebase Admin] getAdminDb fatal error:', e.message);
    throw e;
  }
};

export const getAdminAuth = (): Auth => {
  return getAuth(getAdminApp());
};
