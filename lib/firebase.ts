import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

/**
 * Clean environment variables that may have quotes or hidden newlines (CRLF).
 * Also attempts to extract a value from a JS-like snippet if the entire config 
 * was accidentally pasted into a single environment variable.
 */
function clean(val: string | undefined, key?: string): string {
  if (!val) return '';
  let s = val.trim();

  // If the value looks like a JS snippet (contains "const firebaseConfig" or similar)
  // and we have a key to look for, try to extract it.
  if (key && (s.includes('firebaseConfig') || s.includes('apiKey:'))) {
    const regex = new RegExp(`${key}:\\s*["']([^"']+)["']`);
    const match = s.match(regex);
    if (match && match[1]) return match[1].trim();
  }

  // Remove wrapping quotes
  while ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.substring(1, s.length - 1).trim();
  }
  // Remove any remaining control characters or newlines
  return s.replace(/[\r\n]/g, '').trim();
}

const rawApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

const firebaseConfig = {
  apiKey:            clean(rawApiKey, 'apiKey'),
  authDomain:        clean(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || rawApiKey, 'authDomain'),
  projectId:         clean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || rawApiKey, 'projectId'),
  databaseURL:       clean(process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || rawApiKey, 'databaseURL'),
  storageBucket:     clean(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || rawApiKey, 'storageBucket'),
  messagingSenderId: clean(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || rawApiKey, 'messagingSenderId'),
  appId:             clean(process.env.NEXT_PUBLIC_FIREBASE_APP_ID || rawApiKey, 'appId'),
  measurementId:     clean(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || rawApiKey, 'measurementId'),
};

if (typeof window !== 'undefined') {
  console.log('[Firebase Client] Config loaded for project:', firebaseConfig.projectId);
  if (!firebaseConfig.apiKey) {
    console.error('[Firebase Client] CRITICAL: apiKey is missing!');
  } else {
    console.log('[Firebase Client] apiKey exists:', firebaseConfig.apiKey.substring(0, 8) + '...');
  }
}

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db  = getFirestore(app);
export const rtdb = getDatabase(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Analytics is browser-only
export const getClientAnalytics = () =>
  isSupported().then(yes => yes ? getAnalytics(app) : null);
