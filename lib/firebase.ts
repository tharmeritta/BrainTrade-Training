import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCFcOBpUmDe3Zz0vGHeS44xdBR3GQtCMtw",
  authDomain: "bt-training-firebase.firebaseapp.com",
  projectId: "bt-training-firebase",
  storageBucket: "bt-training-firebase.firebasestorage.app",
  messagingSenderId: "723552528953",
  appId: "1:723552528953:web:c033c03310682e3ce2bbe8",
  measurementId: "G-V82RGZ1M3C"
};

function getFirebaseApp(): FirebaseApp {
  if (getApps().length) return getApp();
  return initializeApp(firebaseConfig);
}

export const getAuthClient = (): Auth => getAuth(getFirebaseApp());
export const getDb = (): Firestore => getFirestore(getFirebaseApp());
export const getAnalyticsClient = () => {
  if (typeof window !== 'undefined') {
    return getAnalytics(getFirebaseApp());
  }
  return null;
};
