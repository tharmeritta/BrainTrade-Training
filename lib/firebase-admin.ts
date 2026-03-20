import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  const projectId   = process.env.FIREBASE_PROJECT_ID   || process.env.GCS_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.GCS_CLIENT_EMAIL;
  
  // Robust private key parsing
  let rawKey = process.env.FIREBASE_PRIVATE_KEY || process.env.GCS_PRIVATE_KEY;
  
  if (rawKey) {
    // 1. Remove potential surrounding quotes if the secret was stored as a quoted string
    rawKey = rawKey.trim();
    if (rawKey.startsWith('"') && rawKey.endsWith('"')) {
      rawKey = rawKey.substring(1, rawKey.length - 1);
    }
    // 2. Convert literal \n strings to real newlines
    rawKey = rawKey.replace(/\\n/g, '\n');
  }

  const privateKey = rawKey;

  if (!projectId || !clientEmail || !privateKey) {
    const missing = [];
    if (!projectId) missing.push('PROJECT_ID');
    if (!clientEmail) missing.push('CLIENT_EMAIL');
    if (!privateKey) missing.push('PRIVATE_KEY');
    
    console.error('Firebase Admin Init Failed. Missing vars:', missing.join(', '));
    throw new Error(`Missing Firebase Admin credentials: ${missing.join(', ')}`);
  }

  // Diagnostic (Safe): Check key structure without logging the actual secret
  console.log('Firebase Admin Diagnostics:', {
    projectId,
    clientEmail,
    keyLength: privateKey.length,
    keyStartsWithPrefix: privateKey.startsWith('-----BEGIN PRIVATE KEY-----'),
    keyEndsWithSuffix: privateKey.includes('-----END PRIVATE KEY-----'),
    newlineCount: (privateKey.match(/\n/g) || []).length
  });
  
  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export const getAdminDb = () => getFirestore(getAdminApp());
