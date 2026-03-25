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
  return s;
}

const cleanId = (s: string) => s.replace(/[^a-zA-Z0-9-]/g, '').trim();
const cleanEmail = (s: string) => s.replace(/[^a-zA-Z0-9@._-]/g, '').trim();

/**
 * Robustly initializes the Firebase Admin SDK.
 */
function getAdminApp(): App {
  const apps = getApps();
  if (apps.length > 0) return apps[0];

  // 1. Gather all possible sources
  const saJson        = cleanValue(process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GCS_SERVICE_ACCOUNT);
  const envProjectId  = cleanId(cleanValue(process.env.FIREBASE_PROJECT_ID || process.env.GCS_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID));
  const envEmail      = cleanEmail(cleanValue(process.env.FIREBASE_CLIENT_EMAIL || process.env.GCS_CLIENT_EMAIL));
  const envPrivateKey = cleanValue(process.env.FIREBASE_PRIVATE_KEY || process.env.GCS_PRIVATE_KEY);

  let projectId   = envProjectId;
  let clientEmail = envEmail;
  let rawKey      = envPrivateKey;

  // 2. Extract from JSON if provided (overrides env vars)
  if (saJson && saJson.startsWith('{')) {
    try {
      const parsed = JSON.parse(saJson);
      if (parsed.project_id)   projectId   = cleanId(parsed.project_id);
      if (parsed.client_email) clientEmail = cleanEmail(parsed.client_email);
      if (parsed.private_key)  rawKey      = parsed.private_key;
    } catch (e) {
      console.warn('[Firebase Admin] Failed to parse Service Account JSON:', (e as Error).message);
    }
  }

  // 3. Handle JSON-in-PrivateKey (sometimes people put the whole JSON in the Private Key var)
  if (rawKey && rawKey.startsWith('{')) {
    try {
      const parsed = JSON.parse(rawKey);
      rawKey = parsed.private_key || '';
      if (!projectId && parsed.project_id)   projectId   = cleanId(parsed.project_id);
      if (!clientEmail && parsed.client_email) clientEmail = cleanEmail(parsed.client_email);
    } catch (e) {}
  }

  // 4. Base64 check for the private key
  if (rawKey && !rawKey.includes('-----BEGIN')) {
    const stripped = rawKey.replace(/\s/g, '');
    // If it looks like base64 (no spaces/newlines, long enough)
    if (stripped.length > 100 && /^[a-zA-Z0-9+/=]+$/.test(stripped)) {
      try {
        const decoded = Buffer.from(stripped, 'base64').toString('utf8');
        if (decoded.includes('-----BEGIN') || decoded.trim().startsWith('{')) {
          rawKey = decoded.trim();
          // If it was a base64-encoded JSON, re-check
          if (rawKey.startsWith('{')) {
            const parsed = JSON.parse(rawKey);
            rawKey = parsed.private_key || '';
            if (!projectId && parsed.project_id)   projectId   = cleanId(parsed.project_id);
            if (!clientEmail && parsed.client_email) clientEmail = cleanEmail(parsed.client_email);
          }
        }
      } catch (e) {}
    }
  }

  // 5. Robust PEM Key Sanitization
  // We want to ensure it's a clean "BEGIN...END" block with actual newlines.
  let privateKey = rawKey.replace(/\\n/g, '\n').trim();

  // If it's still not a valid PEM, try to reconstruct it from the base64 blob
  if (privateKey && (!privateKey.includes('-----BEGIN') || privateKey.includes('\n') === false)) {
    // Strip everything that isn't base64
    const base64 = privateKey
      .replace('-----BEGIN PRIVATE KEY-----', '')
      .replace('-----END PRIVATE KEY-----', '')
      .replace(/\s/g, '');
    
    // Reconstruct with 64-char lines as per PEM spec
    const lines = base64.match(/.{1,64}/g) || [];
    privateKey = `-----BEGIN PRIVATE KEY-----\n${lines.join('\n')}\n-----END PRIVATE KEY-----`;
  }
  
  // Ensure it has actual newlines, not just spaces
  if (privateKey.includes(' ') && !privateKey.includes('\n')) {
     privateKey = privateKey.replace(/\s+/g, '\n');
  }

  // Final check for mandatory fields
  if (!projectId || !clientEmail || !privateKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Firebase Admin] Missing credentials, using placeholders for emulator mode.');
      projectId = projectId || 'bt-training-firebase';
      clientEmail = clientEmail || 'dummy@example.com';
      privateKey = privateKey || '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC7...dummy...\n-----END PRIVATE KEY-----';
    } else {
      const missing = [];
      if (!projectId)   missing.push('PROJECT_ID');
      if (!clientEmail) missing.push('CLIENT_EMAIL');
      if (!privateKey)  missing.push('PRIVATE_KEY');
      console.error('[Firebase Admin] Initialization failed - missing:', missing.join(', '));
      throw new Error(`Firebase Admin credentials incomplete: ${missing.join(', ')}`);
    }
  }

  try {
    console.log('[Firebase Admin] Initializing for project:', projectId);
    console.log('[Firebase Admin] Service Account:', clientEmail);
    console.log('[Firebase Admin] Private Key Length:', privateKey ? privateKey.length : 0);
    console.log('[Firebase Admin] Private Key (First 40 chars):', JSON.stringify(privateKey.substring(0, 40)));
    console.log('[Firebase Admin] Private Key (Last 40 chars):', JSON.stringify(privateKey.substring(privateKey.length - 40)));
    console.log('[Firebase Admin] Private Key Contains Newlines:', privateKey.includes('\n'));
    console.log('[Firebase Admin] Private Key Header Correct:', privateKey.startsWith('-----BEGIN PRIVATE KEY-----'));
    
    // Some versions of firebase-admin use snake_case, some camelCase. 
    // We provide both as an object that satisfies the ServiceAccount interface.
    const serviceAccount = {
      projectId:    projectId,
      clientEmail:  clientEmail,
      privateKey:   privateKey,
      // @ts-ignore
      project_id:    projectId,
      client_email:  clientEmail,
      private_key:   privateKey,
    };

    const databaseURL = cleanValue(process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL);
    
    // --- Admin Emulator Logic ---
    if (process.env.NODE_ENV === 'development') {
      console.log('[Firebase Admin] Setting emulator environment variables...');
      process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
      process.env.FIREBASE_DATABASE_EMULATOR_HOST = 'localhost:9000';
      process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
      process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199';
    }

    return initializeApp({
      projectId,
      credential: cert(serviceAccount as any),
      databaseURL,
    });
  } catch (err: any) {
    console.error('[Firebase Admin] initializeApp fatal error:', err.message);
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
