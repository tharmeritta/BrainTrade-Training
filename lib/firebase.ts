import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  databaseURL:       process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId:     process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
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
