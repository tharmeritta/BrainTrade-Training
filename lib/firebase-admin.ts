import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp(): App | null {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('Firebase Admin environment variables are missing. Skipping initialization.');
    return null;
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
  });
}

export const getAdminAuth = () => {
  const app = getAdminApp();
  if (!app) throw new Error('Firebase Admin SDK not initialized');
  return getAuth(app);
};

export const getAdminDb = () => {
  const app = getAdminApp();
  if (!app) throw new Error('Firebase Admin SDK not initialized');
  return getFirestore(app);
};
