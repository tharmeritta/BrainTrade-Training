import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';

// --- CONFIGURATION ---
// Replace this with the path to your service account key if running outside of App Hosting/Emulator
const SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_PATH; 

function initAdmin() {
  if (getApps().length > 0) return getFirestore();

  const projectId = process.env.FIREBASE_PROJECT_ID || 'bt-training-firebase';
  
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    console.log('Connecting to Firestore Emulator...');
    initializeApp({ projectId });
  } else if (SERVICE_ACCOUNT_PATH) {
    const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
    initializeApp({
      credential: cert(serviceAccount),
      projectId
    });
  } else {
    // Attempt ADC
    initializeApp({ projectId });
  }
  
  return getFirestore();
}

const QUIZ_DEFAULTS = {
  definitions: {
    foundation: {
      title: { en: 'Foundation Quiz', th: 'ควิซพื้นฐาน' },
      passThreshold: 0.7,
      questions: [
        {
          en: 'What is a stock?',
          th: 'หุ้นคืออะไร?',
          type: 'mcq',
          options: {
            en: ['A loan', 'Ownership in a company', 'A bank deposit', 'A contract'],
            th: ['สัญญาเงินกู้', 'ส่วนของความเป็นเจ้าของในบริษัท', 'เงินฝากธนาคาร', 'สัญญาการค้า']
          },
          correctIdx: 1,
          explain: { en: 'Stocks represent ownership.', th: 'หุ้นคือความเป็นเจ้าของ' }
        }
      ]
    },
    product: {
      title: { en: 'Product Knowledge', th: 'ความรู้ผลิตภัณฑ์' },
      passThreshold: 0.7,
      questions: []
    },
    process: {
      title: { en: 'Sales Process', th: 'กระบวนการขาย' },
      passThreshold: 0.7,
      questions: []
    }
  }
};

async function seed() {
  const db = initAdmin();
  const docRef = db.collection('module_config').doc('quizzes');
  
  console.log('Checking existing configuration...');
  const doc = await docRef.get();
  
  if (doc.exists) {
    console.log('Configuration already exists. Merging missing system modules...');
    const existingData = doc.data();
    const updatedDefinitions = { ...QUIZ_DEFAULTS.definitions, ...(existingData.definitions || {}) };
    await docRef.update({ definitions: updatedDefinitions, updatedAt: new Date().toISOString() });
  } else {
    console.log('No configuration found. Creating new default quizzes...');
    await docRef.set({ ...QUIZ_DEFAULTS, updatedAt: new Date().toISOString() });
  }
  
  console.log('Done! Your Admin Adjustments tab will now show "foundation", "product", and "process".');
}

seed().catch(console.error);
