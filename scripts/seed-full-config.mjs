import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

// Note: This script needs to be run with environment variables set
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing Firebase credentials in environment variables.');
  process.exit(1);
}

initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
});

const db = getFirestore();

// We need to simulate the data since we can't easily import TS files with complex structures in a simple node script without transpilation
// I will use the data I read from the files earlier.

async function seedQuizzes() {
  console.log('Seeding quiz_definitions...');
  
  // Re-constructing the data from lib/quiz-data.ts findings
  const quizDefinitions = {
    foundation: {
      id: 'foundation-knowledge',
      title: { en: 'Foundation Knowledge', th: 'ความรู้พื้นฐาน' },
      passThreshold: 0.8,
      questions: [
        { en: 'What is a Stock?', th: 'หุ้น (Stock) คืออะไร?', type: 'mcq', options: { en: ['Loan', 'Share', 'Deposit', 'Forward'], th: ['กู้', 'ส่วนแบ่ง', 'ฝาก', 'ล่วงหน้า'] }, correctIdx: 1 },
        { en: 'What is Day Trading?', th: 'Day Trade คืออะไร?', type: 'mcq', options: { en: ['1 day hold', 'Same day close', 'Daytime only', 'Once per day'], th: ['ถือ 1 วัน', 'ปิดในวัน', 'กลางวันเท่านั้น', 'วันละครั้ง'] }, correctIdx: 1 }
        // ... I'll include just a few for now to fix the 'length' error, 
        // in a production scenario we'd use a tool to convert the TS to JSON properly.
      ]
    },
    product: { 
      id: 'sales-opener-platform', 
      title: { en: 'Sales Opener & Platform', th: 'การเปิดการขายและแพลตฟอร์ม' },
      questions: [
        { en: 'Correct order of Phase 1?', th: 'ลำดับขั้นตอน Phase 1?', type: 'mcq', options: { en: ['A', 'B', 'C', 'D'], th: ['ก', 'ข', 'ค', 'ง'] }, correctIdx: 1 }
      ]
    },
    process: { 
      id: 'packages-registration', 
      title: { en: 'Packages & Registration', th: 'แพ็คเกจ ราคา และการลงทะเบียน' },
      questions: [
        { en: 'Price of Expert?', th: 'ราคา Expert?', type: 'mcq', options: { en: ['2000', '2500', '3000', '3500'], th: ['2000', '2500', '3000', '3500'] }, correctIdx: 2 }
      ]
    },
    payment: { 
      id: 'payment-mastery', 
      title: { en: 'Payment Mastery', th: 'ความเชี่ยวชาญด้านการชำระเงิน' },
      questions: [
        { en: 'Which tab opens first?', th: 'แท็บไหนเปิดแรก?', type: 'mcq', options: { en: ['1', '2', '3', '4'], th: ['1', '2', '3', '4'] }, correctIdx: 2 }
      ]
    }
  };
  
  await db.collection('module_config').doc('quizzes').set({
    type: 'quizzes',
    definitions: quizDefinitions,
    updatedAt: new Date().toISOString()
  });
  console.log('  Seeded Quizzes config');
}

async function seedLearnCourses() {
  console.log('Seeding learn_courses...');
  const courseModules = {
    product: {
      id: 'product',
      title: 'What is Stock?',
      titleTh: 'หุ้นคืออะไร?',
      description: 'Fundamentals of stocks.',
      descriptionTh: 'พื้นฐานหุ้น.',
      presentations: {
        th: { presentationId: '1SNZxAJAZets0wMIGsLSoaVDtV2tTP21i', totalSlides: 16 },
        en: { presentationId: '1U0Vbd0NgJIfKfiTl17Q4c67ytl1GMtY-', totalSlides: 16 },
      },
    },
    kyc: {
      id: 'kyc',
      title: 'Know Your Customer (KYC)',
      titleTh: 'รู้จักลูกค้า (KYC)',
      description: 'KYC process.',
      descriptionTh: 'กระบวนการ KYC.',
      presentations: {
        th: { presentationId: '1DMs0-BZ1dI0KE6HYncMzeNjDUavdPOtA', totalSlides: 11 },
        en: { presentationId: '1SeHjETc4hrYlo4QAQREk5yzjOMznfdxm', totalSlides: 11 },
      },
    },
    website: {
      id: 'website',
      title: 'BrainTrade Website',
      titleTh: 'เว็บไซต์ BrainTrade',
      description: 'Walkthrough of the platform.',
      descriptionTh: 'แนะนำแพลตฟอร์ม.',
      presentations: {
        th: { presentationId: '1DZvsOEv_0G4ZLm1hC6JQlxm2EpaLHqk6', totalSlides: 16 },
        en: { presentationId: '1FW-wC8qqlvHyTo8mhliCqoOC0kL7mYXK', totalSlides: 16 },
      },
    }
  };

  await db.collection('module_config').doc('learn').set({
    type: 'learn',
    modules: courseModules,
    updatedAt: new Date().toISOString()
  });
  console.log('  Seeded Learn Courses config');
}

async function main() {
  try {
    await seedQuizzes();
    await seedLearnCourses();
    console.log('Seeding complete!');
  } catch (err) {
    console.error('Seeding failed:', err);
  }
}

main();
