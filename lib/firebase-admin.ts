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
  let saJson        = cleanValue(process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GCS_SERVICE_ACCOUNT);
  let projectId     = cleanId(cleanValue(process.env.FIREBASE_PROJECT_ID || process.env.GCS_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID));
  let clientEmail   = cleanEmail(cleanValue(process.env.FIREBASE_CLIENT_EMAIL || process.env.GCS_CLIENT_EMAIL));
  let rawPrivateKey = cleanValue(process.env.FIREBASE_PRIVATE_KEY || process.env.GCS_PRIVATE_KEY);
  let source = 'individual-vars';

  // 1b. If saJson looks like base64, decode it first
  if (saJson && !saJson.startsWith('{') && (saJson.length > 100)) {
    try {
      const decoded = Buffer.from(saJson, 'base64').toString('utf8');
      if (decoded.trim().startsWith('{')) saJson = decoded.trim();
    } catch (e) {}
  }

  // 2. Extract from JSON if provided
  if (saJson && saJson.startsWith('{')) {
    try {
      const parsed = JSON.parse(saJson);
      source = 'service-account-json';
      if (parsed.project_id)   projectId   = cleanId(parsed.project_id);
      if (parsed.client_email) clientEmail = cleanEmail(parsed.client_email);
      if (parsed.private_key)  rawPrivateKey = parsed.private_key;
    } catch (e) {
      console.warn('[Firebase Admin] Failed to parse JSON:', (e as Error).message);
    }
  }

  // 3. Base64 check for the private key
  if (rawPrivateKey && !rawPrivateKey.includes('\n') && !rawPrivateKey.includes(' ') && !rawPrivateKey.includes('-----BEGIN')) {
    try {
      const decoded = Buffer.from(rawPrivateKey, 'base64').toString('utf8');
      if (decoded.includes('-----BEGIN') || decoded.trim().startsWith('{')) {
        rawPrivateKey = decoded.trim();
      }
    } catch (e) {}
  }

  // 4. Handle JSON-in-PrivateKey
  if (rawPrivateKey.startsWith('{')) {
    try {
      const parsed = JSON.parse(rawPrivateKey);
      rawPrivateKey = parsed.private_key || '';
      if (!projectId)   projectId   = cleanId(parsed.project_id || '');
      if (!clientEmail) clientEmail = cleanEmail(parsed.client_email || '');
    } catch (e) {}
  }

  // 5. Aggressive PEM Key Sanitization
  let privateKey = rawPrivateKey
    .replace(/\\n/g, '\n')
    .replace(/\r/g, '')
    .split('\n')
    .map(line => line.trim()) // Remove any spaces at start/end of EACH line
    .join('\n')
    .trim();
  
  if (privateKey && !privateKey.includes('-----BEGIN PRIVATE KEY-----') && privateKey.length > 100) {
    privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
  }

  // 6. Mandatory field check
  if (!projectId || !clientEmail || !privateKey) {
    const missing = [];
    if (!projectId)   missing.push('PROJECT_ID');
    if (!clientEmail) missing.push('CLIENT_EMAIL');
    if (!privateKey)  missing.push('PRIVATE_KEY');
    throw new Error(`Firebase Admin credentials incomplete: ${missing.join(', ')}`);
  }

  try {
    const config = {
      projectId,
      credential: cert({ projectId, clientEmail, privateKey }),
    };
    
    console.log('[Firebase Admin] Initializing with Project ID:', projectId);
    console.log('[Firebase Admin] Service Account Email:', clientEmail);
    
    return initializeApp(config);
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
