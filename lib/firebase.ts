import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

/**
 * Clean environment variables that may have quotes or hidden newlines (CRLF).
 */
function clean(val: string | undefined): string {
  if (!val) return '';
  let s = val.trim();
  // Remove wrapping quotes
  while ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.substring(1, s.length - 1).trim();
  }
  // Remove any remaining control characters or newlines
  return s.replace(/[\r\n]/g, '').trim();
}

const firebaseConfig = {
  apiKey:            clean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain:        clean(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId:         clean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  databaseURL:       clean(process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL),
  storageBucket:     clean(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: clean(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId:             clean(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
  measurementId:     clean(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID),
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
