import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';

const saPath = "c:\\Users\\Admin\\Downloads\\bt-training-firebase-5fc1fa7b7eea.json";
const sa = JSON.parse(readFileSync(saPath, 'utf8'));

initializeApp({ credential: cert(sa) });
const db = getFirestore();

async function seed() {
  const quizDefinitions = {
    foundation: {
      id: 'foundation-knowledge',
      title: { en: 'Foundation Knowledge', th: 'ความรู้พื้นฐาน' },
      description: {
        en: '30 questions across 5 topics — Stocks, Trading, Brokers, Forex/Crypto/CFD, and Sales Skills.',
        th: '30 ข้อ ใน 5 หัวข้อ — หุ้น การเทรด โบรกเกอร์ Forex/Crypto/CFD และทักษะการขาย',
      },
      passThreshold: 0.8,
      phases: [
        { name: { en: 'Part 1: Stocks & Markets', th: 'ส่วนที่ 1: หุ้นและตลาดการเงิน' }, color: '#D97706', light: '#FEF3C7' },
        { name: { en: 'Part 2: Trading Styles', th: 'ส่วนที่ 2: การเทรดและสไตล์การลงทุน' }, color: '#185FA5', light: '#E6F1FB' },
      ],
      questions: [
        { phase: 0, en: 'What is a Stock?', th: 'หุ้น (Stock) คืออะไร?', type: 'mcq', options: { en: ['Loan', 'Share', 'Deposit', 'Forward'], th: ['กู้', 'ส่วนแบ่ง', 'ฝาก', 'ล่วงหน้า'] }, correctIdx: 1 },
        { phase: 1, en: 'What is Day Trading?', th: 'Day Trade คืออะไร?', type: 'mcq', options: { en: ['1 day hold', 'Same day close', 'Daytime only', 'Once per day'], th: ['ถือ 1 วัน', 'ปิดในวัน', 'กลางวันเท่านั้น', 'วันละครั้ง'] }, correctIdx: 1 }
      ]
    },
    product: {
      id: 'sales-opener-platform',
      title: { en: 'Sales Opener & Platform', th: 'การเปิดการขายและแพลตฟอร์ม' },
      description: {
        en: '9 questions across 2 phases — Opener flow and platform feature demos.',
        th: '9 ข้อ ใน 2 ขั้นตอน — การเปิดการขายและการสาธิตฟีเจอร์บนแพลตฟอร์ม',
      },
      phases: [
        { name: { en: 'Phase 1: Opener', th: 'ขั้นที่ 1: การเปิดการขาย' }, color: '#0F6E56', light: '#E1F5EE' },
      ],
      questions: [
        { phase: 0, en: 'Where is the View Demo button?', th: 'ปุ่ม View Demo อยู่ที่ไหน?', type: 'mcq', options: { en: ['Top', 'Bottom', 'Center', 'Left'], th: ['บน', 'ล่าง', 'กลาง', 'ซ้าย'] }, correctIdx: 2 }
      ]
    },
    process: {
      id: 'packages-registration',
      title: { en: 'Packages & Registration', th: 'แพ็คเกจ ราคา และการลงทะเบียน' },
      description: {
        en: '10 questions across 2 phases — Pricing tiers and the registration walkthrough.',
        th: '10 ข้อ ใน 2 ขั้นตอน — ระดับราคาแพ็คเกจและขั้นตอนการลงทะเบียน',
      },
      phases: [
        { name: { en: 'Phase 3: Packages & Pricing', th: 'ขั้นที่ 3: แพ็คเกจและราคา' }, color: '#BA7517', light: '#FAEEDA' },
      ],
      questions: [
        { phase: 0, en: 'Price of Expert package?', th: 'ราคาแพ็คเกจ Expert?', type: 'mcq', options: { en: ['$2000', '$2500', '$3000', '$3500'], th: ['2000', '2500', '3000', '3500'] }, correctIdx: 2 }
      ]
    },
    payment: {
      id: 'payment-mastery',
      title: { en: 'Payment Mastery', th: 'ความเชี่ยวชาญด้านการชำระเงิน' },
      description: {
        en: '8 questions — Broker selection, account activation, and deposit process.',
        th: '8 ข้อ — การเลือกโบรกเกอร์ การเปิดใช้งานบัญชี และขั้นตอนการฝากเงิน',
      },
      phases: [
        { name: { en: 'Phase 5: Payment Mastery', th: 'ขั้นที่ 5: ความเชี่ยวชาญด้านการชำระเงิน' }, color: '#993C1D', light: '#FAECE7' },
      ],
      questions: [
        { phase: 0, en: 'Which broker should be selected?', th: 'ควรเลือกโบรกเกอร์ใด?', type: 'mcq', options: { en: ['Exness', 'Zenstox', 'XM', 'FBS'], th: ['Exness', 'Zenstox', 'XM', 'FBS'] }, correctIdx: 1 }
      ]
    }
  };

  await db.collection('module_config').doc('quizzes').set({
    type: 'quizzes',
    definitions: quizDefinitions,
    updatedAt: new Date().toISOString()
  });

  const learnModules = {
    product: {
      id: 'product',
      title: 'What is Stock?', titleTh: 'หุ้นคืออะไร?',
      description: 'Fundamentals of stocks.', descriptionTh: 'พื้นฐานหุ้น.',
      presentations: {
        th: { presentationId: '1SNZxAJAZets0wMIGsLSoaVDtV2tTP21i', totalSlides: 16 },
        en: { presentationId: '1U0Vbd0NgJIfKfiTl17Q4c67ytl1GMtY-', totalSlides: 16 },
      },
    },
    kyc: {
      id: 'kyc',
      title: 'Know Your Customer (KYC)', titleTh: 'รู้จักลูกค้า (KYC)',
      description: 'KYC process.', descriptionTh: 'กระบวนการ KYC.',
      presentations: {
        th: { presentationId: '1DMs0-BZ1dI0KE6HYncMzeNjDUavdPOtA', totalSlides: 11 },
        en: { presentationId: '1SeHjETc4hrYlo4QAQREk5yzjOMznfdxm', totalSlides: 11 },
      },
    },
    website: {
      id: 'website',
      title: 'BrainTrade Website', titleTh: 'เว็บไซต์ BrainTrade',
      description: 'Walkthrough of the platform.', descriptionTh: 'แนะนำแพลตฟอร์ม.',
      presentations: {
        th: { presentationId: '1DZvsOEv_0G4ZLm1hC6JQlxm2EpaLHqk6', totalSlides: 16 },
        en: { presentationId: '1FW-wC8qqlvHyTo8mhliCqoOC0kL7mYXK', totalSlides: 16 },
      },
    }
  };

  await db.collection('module_config').doc('learn').set({
    type: 'learn',
    modules: learnModules,
    updatedAt: new Date().toISOString()
  });

  console.log('Seeding complete with descriptions and phases.');
}

seed().catch(console.error);
