export type Language = 'en' | 'th';
export type QuestionType = 'tf' | 'mcq' | 'fill';

export interface QuizPhase {
  name: Record<Language, string>;
  color: string;
  light: string;
}

export interface QuestionData {
  en: string;
  th: string;
  type: QuestionType;
  a?: string;
  options?: { en: string[]; th: string[] };
  correctIdx?: number;
  phase?: number;   // index into QuizDefinition.phases[]
  isNew?: boolean;
  explain?: { en: string; th: string };
}

export interface QuizUIOverrides {
  scoreLabel?: Record<Language, string>;
  finishTitle?: Record<Language, string>;
  finishSub?: Record<Language, string>;
  feedbackHigh?: Record<Language, string>;
  feedbackMid?: Record<Language, string>;
  feedbackLow?: Record<Language, string>;
}

export interface QuizDefinition {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  questions: QuestionData[];
  phases?: QuizPhase[];
  uiOverrides?: QuizUIOverrides;
}

export const UI_STRINGS: Record<Language, {
  qLabel: string; scoreLabel: string; finishTitle: string; finishSub: string;
  outOf: string; correct: string; incorrect: string; submit: string;
  placeholder: string; trueTxt: string; falseTxt: string;
  msgHigh: string; msgMed: string; msgLow: string; backToHome: string; hello: string;
  passed: string; failed: string; tryAgain: string; passThreshold: string;
  selectQuiz: string; allPhases: string; seeResults: string; prev: string; next: string;
  yourScore: string; pctCorrect: string; answerKey: string;
  yourAnswer: string; correctAnswer: string;
}> = {
  en: {
    qLabel: 'Question', scoreLabel: 'Score', finishTitle: 'Quiz Complete',
    finishSub: 'Your Results', outOf: 'out of', correct: 'Correct ✓',
    incorrect: 'Incorrect. Correct answer:', submit: 'Submit',
    placeholder: 'Enter your answer...', trueTxt: 'True', falseTxt: 'False',
    msgHigh: 'Excellent — ready to close deals!',
    msgMed: 'Strong — minor gaps to review.',
    msgLow: 'Needs work — re-read the training material.',
    backToHome: 'Back to Dashboard', hello: 'Hello',
    passed: 'PASSED', failed: 'NOT PASSED', tryAgain: 'Retake Quiz',
    passThreshold: 'Passing score: 70%',
    selectQuiz: 'Choose an Assessment',
    allPhases: 'All Phases',
    seeResults: 'See Results',
    prev: '← Prev',
    next: 'Next →',
    yourScore: 'Your Score',
    pctCorrect: '% correct',
    answerKey: 'Answer Key',
    yourAnswer: 'You answered:',
    correctAnswer: 'Correct:',
  },
  th: {
    qLabel: 'ข้อที่', scoreLabel: 'คะแนน', finishTitle: 'ทำแบบทดสอบเสร็จแล้ว',
    finishSub: 'ผลลัพธ์ของคุณ', outOf: 'จาก', correct: 'ถูกต้อง ✓',
    incorrect: 'ไม่ถูกต้อง คำตอบที่ถูกคือ:', submit: 'ส่งคำตอบ',
    placeholder: 'กรุณาระบุคำตอบ...', trueTxt: 'จริง', falseTxt: 'เท็จ',
    msgHigh: 'ยอดเยี่ยม — พร้อมปิดดีลได้แล้ว!',
    msgMed: 'ดีมาก — มีบางจุดที่ควรทบทวน',
    msgLow: 'ต้องปรับปรุง — แนะนำให้อ่านเนื้อหาการอบรมอีกครั้ง',
    backToHome: 'กลับสู่แดชบอร์ด', hello: 'สวัสดี',
    passed: 'ผ่าน', failed: 'ไม่ผ่าน', tryAgain: 'ทำใหม่อีกครั้ง',
    passThreshold: 'เกณฑ์ผ่าน: 70%',
    selectQuiz: 'เลือกแบบทดสอบ',
    allPhases: 'ทุกขั้นตอน',
    seeResults: 'ดูผลลัพธ์',
    prev: '← ก่อนหน้า',
    next: 'ถัดไป →',
    yourScore: 'คะแนนของคุณ',
    pctCorrect: '% ถูกต้อง',
    answerKey: 'เฉลย',
    yourAnswer: 'คุณตอบ:',
    correctAnswer: 'คำตอบที่ถูก:',
  },
};

// ─── Phase 1: Opener ─────────────────────────────────────────────────────────
const PHASE1_OPENER: QuestionData[] = [
  {
    phase: 0,
    en: 'What is the correct order of the Phase 1 opener flow?',
    th: 'ลำดับขั้นตอนที่ถูกต้องของ Phase 1 การเปิดการขายคืออะไร?',
    type: 'mcq',
    options: {
      en: [
        'Show packages → introduce SmartBrain AI → View Demo',
        'Introduce SmartBrain AI → show 6 packages → use View Demo if price asked too early',
        'Ask for budget → show packages → introduce SmartBrain AI',
        'Introduce SmartBrain AI → View Demo → show packages',
      ],
      th: [
        'แสดงแพ็คเกจ → แนะนำ SmartBrain AI → View Demo',
        'แนะนำ SmartBrain AI → แสดง 6 แพ็คเกจ → ใช้ View Demo หากลูกค้าถามราคาเร็วเกินไป',
        'ถามงบประมาณ → แสดงแพ็คเกจ → แนะนำ SmartBrain AI',
        'แนะนำ SmartBrain AI → View Demo → แสดงแพ็คเกจ',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'Step 1: Introduce SmartBrain AI. Step 2: Show 6 Packages. Step 3: Use View Demo if customer asks for price too early.',
      th: 'ขั้นที่ 1: แนะนำ SmartBrain AI  ขั้นที่ 2: แสดง 6 แพ็คเกจ  ขั้นที่ 3: ใช้ View Demo เมื่อลูกค้าถามราคาก่อนเห็นคุณค่าของสินค้า',
    },
  },
  {
    phase: 0,
    en: "Where is the 'View Demo' button located on the website?",
    th: "ปุ่ม 'View Demo' อยู่ที่ไหนบนเว็บไซต์?",
    type: 'mcq',
    options: {
      en: ['Top-right corner', 'Bottom-left footer', 'Center / middle of the screen', 'Left sidebar'],
      th: ['มุมบนขวา', 'ส่วนท้ายด้านซ้าย', 'ตรงกลาง/กึ่งกลางหน้าจอ', 'แถบด้านซ้าย'],
    },
    correctIdx: 2,
    explain: {
      en: 'The View Demo button is in the center of the screen — used to refocus the customer on product value when they ask for price too early.',
      th: 'ปุ่ม View Demo อยู่ตรงกลางของหน้าจอ — ใช้เพื่อดึงความสนใจลูกค้ากลับมาที่คุณค่าของสินค้า เมื่อลูกค้าถามราคาก่อนกำหนด',
    },
  },
  {
    phase: 0,
    en: "When should you use the 'View Demo' button as a sales tactic?",
    th: "ควรใช้ปุ่ม 'View Demo' เป็นเทคนิคการขายเมื่อใด?",
    type: 'mcq',
    options: {
      en: [
        'At the very start before introducing any product',
        'Whenever the customer seems bored',
        "When the customer asks for price before you've shown product value",
        'After confirming payment',
      ],
      th: [
        'ตั้งแต่ต้น ก่อนแนะนำสินค้า',
        'เมื่อลูกค้าดูเบื่อหน่าย',
        'เมื่อลูกค้าถามราคาก่อนที่คุณจะได้แสดงคุณค่าของสินค้า',
        'หลังยืนยันการชำระเงิน',
      ],
    },
    correctIdx: 2,
    explain: {
      en: "Step 3: Use 'View Demo' to redirect the conversation back to product value if the customer asks for price too early.",
      th: "ขั้นที่ 3: ใช้ 'View Demo' เพื่อเปลี่ยนทิศทางการสนทนากลับสู่คุณค่าของสินค้า หากลูกค้าถามราคาก่อนเวลาอันควร",
    },
  },
];

// ─── Phase 2: Demo Platform ───────────────────────────────────────────────────
const PHASE2_DEMO: QuestionData[] = [
  {
    phase: 1,
    en: 'Which two courses are recommended for complete beginners?',
    th: 'คอร์สใดสองคอร์สที่แนะนำสำหรับผู้เริ่มต้นมือใหม่?',
    type: 'mcq',
    options: {
      en: [
        'Technical Analysis & Risk Management',
        'Brief History of Trading & Chart Patterns',
        'Trading Psychology & Market Scanner',
        'Economic Calendar & Campus Live Sessions',
      ],
      th: [
        'Technical Analysis และ Risk Management',
        'Brief History of Trading และ Chart Patterns',
        'Trading Psychology และ Market Scanner',
        'Economic Calendar และ Campus Live Sessions',
      ],
    },
    correctIdx: 1,
    explain: {
      en: "Step 6: Recommend 'Brief History of Trading' or 'Chart Patterns' for beginner customers.",
      th: "ขั้นที่ 6: แนะนำ 'Brief History of Trading' หรือ 'Chart Patterns' สำหรับลูกค้าที่เพิ่งเริ่มต้น",
    },
  },
  {
    phase: 1,
    en: 'A customer says they panic-sell every time the market drops. Which resource solves this?',
    th: 'ลูกค้าบอกว่าตัวเองมักตื่นตระหนกและขายทุกครั้งที่ตลาดลง สิ่งใดแก้ปัญหานี้ได้?',
    type: 'mcq',
    options: {
      en: ['Economic Calendar', 'Market Scanner', 'Trading Psychology (E-Book)', 'Daily Technical Analysis'],
      th: ['Economic Calendar', 'Market Scanner', 'Trading Psychology (E-Book)', 'Daily Technical Analysis'],
    },
    correctIdx: 2,
    explain: {
      en: 'Step 8: Trading Psychology is the targeted solution for customers who struggle with panic selling.',
      th: 'ขั้นที่ 8: Trading Psychology คือทางออกเฉพาะสำหรับลูกค้าที่มีปัญหาเรื่องการขายด้วยความตื่นตระหนก',
    },
  },
  {
    phase: 1,
    en: 'What is the primary benefit of the Market Scanner tool?',
    th: 'ประโยชน์หลักของเครื่องมือ Market Scanner คืออะไร?',
    type: 'mcq',
    options: {
      en: [
        'It teaches basic charting',
        'It sends email alerts for news events',
        'It automates trade detection — finds opportunities even while you sleep',
        'It books 1-on-1 mentor sessions',
      ],
      th: [
        'สอนการวิเคราะห์กราฟพื้นฐาน',
        'ส่งอีเมลแจ้งเตือนเหตุการณ์ข่าว',
        'ค้นหาโอกาสเทรดแบบอัตโนมัติ แม้กระทั่งขณะนอนหลับ',
        'จองเซสชัน Mentor แบบตัวต่อตัว',
      ],
    },
    correctIdx: 2,
    explain: {
      en: 'Step 11: The Market Scanner automates trade detection — finding opportunities around the clock, even while you sleep.',
      th: 'ขั้นที่ 11: Market Scanner ค้นหาโอกาสการเทรดโดยอัตโนมัติตลอด 24 ชั่วโมง แม้กระทั่งขณะที่ลูกค้าหลับอยู่',
    },
  },
  {
    phase: 1,
    en: 'How does the Economic Calendar protect a trader?',
    th: 'Economic Calendar ปกป้องนักเทรดอย่างไร?',
    type: 'mcq',
    options: {
      en: [
        'It shows broker fee schedules',
        'It helps traders avoid entering trades during high-impact news events',
        'It tracks daily profit/loss automatically',
        'It displays live broker spreads',
      ],
      th: [
        'แสดงตารางค่าธรรมเนียมของโบรกเกอร์',
        'ช่วยให้นักเทรดหลีกเลี่ยงการเข้าเทรดช่วงที่มีข่าวสำคัญที่ส่งผลกระทบสูง',
        'ติดตามกำไร/ขาดทุนรายวันโดยอัตโนมัติ',
        'แสดง Spread ของโบรกเกอร์แบบเรียลไทม์',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'Step 12: The Economic Calendar flags high-impact news events, helping traders avoid entering positions during volatile periods.',
      th: 'ขั้นที่ 12: Economic Calendar แสดงสัญญาณเตือนเหตุการณ์ข่าวที่ส่งผลกระทบสูง ช่วยให้นักเทรดหลีกเลี่ยงการเข้าเทรดในช่วงที่ตลาดผันผวน',
    },
  },
  {
    phase: 1,
    en: 'The Trading Interface is described as comparable to which two professional platforms?',
    th: 'Trading Interface ถูกเปรียบเทียบกับแพลตฟอร์มมืออาชีพใดสองแพลตฟอร์ม?',
    type: 'mcq',
    options: {
      en: ['Bloomberg Terminal & Reuters Eikon', 'MetaTrader & TradingView', 'NinjaTrader & Webull', 'Thinkorswim & eToro'],
      th: ['Bloomberg Terminal และ Reuters Eikon', 'MetaTrader และ TradingView', 'NinjaTrader และ Webull', 'Thinkorswim และ eToro'],
    },
    correctIdx: 1,
    explain: {
      en: 'Step 13: The Trading Interface is professional-grade, comparable in quality to MetaTrader and TradingView.',
      th: 'ขั้นที่ 13: Trading Interface มีมาตรฐานระดับมืออาชีพ มีคุณภาพเทียบเท่า MetaTrader และ TradingView',
    },
  },
  {
    phase: 1,
    en: "What does 'The Campus' offer?",
    th: "'The Campus' มีบริการอะไรบ้าง?",
    type: 'mcq',
    options: {
      en: [
        'Recorded weekend webinars only',
        'Live pre-market sessions with experts, in local language with international coverage',
        'A static video library with PDF downloads',
        'Monthly one-on-one mentoring calls',
      ],
      th: [
        'เฉพาะ Webinar ที่บันทึกไว้ในวันหยุดสุดสัปดาห์',
        'เซสชันสดก่อนตลาดเปิด โดยผู้เชี่ยวชาญ เป็นภาษาท้องถิ่น ครอบคลุมตลาดต่างประเทศ',
        'คลังวิดีโอพร้อม PDF สำหรับดาวน์โหลด',
        'การโค้ชแบบ 1-ต่อ-1 รายเดือน',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'Steps 14–15: The Campus offers live pre-market sessions led by experts, conducted in the local language and covering international markets.',
      th: 'ขั้นที่ 14-15: The Campus มีเซสชันสดก่อนตลาดเปิดนำโดยผู้เชี่ยวชาญ ดำเนินการเป็นภาษาท้องถิ่น ครอบคลุมตลาดการเงินระหว่างประเทศ',
    },
  },
];

// ─── Phase 3: Packages & Pricing ──────────────────────────────────────────────
const PHASE3_PACKAGES: QuestionData[] = [
  {
    phase: 0,
    en: 'What is the price of the Expert (ผู้เชี่ยวชาญ) package?',
    th: 'ราคาของแพ็คเกจ Expert (ผู้เชี่ยวชาญ) คือเท่าไหร่?',
    type: 'mcq',
    options: {
      en: ['$2,000', '$2,500', '$3,000', '$3,500'],
      th: ['2,000 USD', '2,500 USD', '3,000 USD', '3,500 USD'],
    },
    correctIdx: 2,
    explain: {
      en: 'Step 16: The Expert Package is $3,000 (original price was $3,500, now discounted).',
      th: 'ขั้นที่ 16: แพ็คเกจ Expert ราคา 3,000 USD (ราคาเดิม 3,500 USD ลดราคาแล้ว)',
    },
  },
  {
    phase: 0,
    en: 'What is the price of the Intermediate (ผู้เริ่มต้น) package?',
    th: 'ราคาของแพ็คเกจ Intermediate (ผู้เริ่มต้น) คือเท่าไหร่?',
    type: 'mcq',
    options: {
      en: ['$100', '$200', '$300', '$500'],
      th: ['100 USD', '200 USD', '300 USD', '500 USD'],
    },
    correctIdx: 1,
    explain: {
      en: 'Step 17: The Intermediate (ผู้เริ่มต้น) package is priced at $200.',
      th: 'ขั้นที่ 17: แพ็คเกจ Intermediate (ผู้เริ่มต้น) ราคา 200 USD',
    },
  },
  {
    phase: 0,
    en: 'How many AI queries per month does the $500 (ระดับกลาง) package include?',
    th: 'แพ็คเกจ 500 USD (ระดับกลาง) รวมการสอบถาม AI กี่ครั้งต่อเดือน?',
    type: 'mcq',
    options: {
      en: ['20', '30', '40', '50'],
      th: ['20 ครั้ง', '30 ครั้ง', '40 ครั้ง', '50 ครั้ง'],
    },
    correctIdx: 2,
    explain: {
      en: '$100–$200 packages include 20 AI queries/month. The $500 package gets 40. Each tier upgrade adds 20 queries.',
      th: 'แพ็คเกจ 100-200 USD ได้ 20 ครั้ง/เดือน แพ็คเกจ 500 USD ได้ 40 ครั้ง การอัปเกรดแต่ละระดับเพิ่มขึ้น 20 ครั้ง',
    },
  },
  {
    phase: 0,
    en: 'A customer upgrades from $500 to $1,000. How many AI queries do they now get per month?',
    th: 'ลูกค้าอัปเกรดจาก 500 USD เป็น 1,000 USD จะได้รับการสอบถาม AI กี่ครั้งต่อเดือน?',
    type: 'mcq',
    options: {
      en: ['40', '50', '60', '80'],
      th: ['40 ครั้ง', '50 ครั้ง', '60 ครั้ง', '80 ครั้ง'],
    },
    correctIdx: 2,
    explain: {
      en: 'AI queries increase by 20 per upgrade tier: $500 = 40 queries, $1,000 = 60 queries.',
      th: 'การสอบถาม AI เพิ่มขึ้น 20 ครั้งต่อการอัปเกรดหนึ่งระดับ: 500 USD = 40 ครั้ง, 1,000 USD = 60 ครั้ง',
    },
  },
  {
    phase: 0,
    en: 'Is a Dedicated Trainer included in the $100 Introductory (มือใหม่) package?',
    th: 'แพ็คเกจ 100 USD มือใหม่ (Introductory) รวม Dedicated Trainer ด้วยหรือไม่?',
    type: 'mcq',
    options: {
      en: [
        'No — only from $500 and above',
        'No — only from $200 and above',
        'Yes — included even in the $100 package',
        'Yes — but only for the first 30 days',
      ],
      th: [
        'ไม่ — เฉพาะแพ็คเกจ 500 USD ขึ้นไป',
        'ไม่ — เฉพาะแพ็คเกจ 200 USD ขึ้นไป',
        'ใช่ — รวมอยู่แม้แต่ในแพ็คเกจ 100 USD',
        'ใช่ — แต่เฉพาะ 30 วันแรกเท่านั้น',
      ],
    },
    correctIdx: 2,
    explain: {
      en: 'Step 19: A Dedicated Trainer is included in every package tier, starting from the $100 Introductory package.',
      th: 'ขั้นที่ 19: Dedicated Trainer รวมอยู่ในทุกแพ็คเกจ ตั้งแต่แพ็คเกจเริ่มต้น 100 USD ขึ้นไป',
    },
  },
  {
    phase: 0,
    en: 'The มือใหม่ (Introductory) package is priced at $100. What was the original price?',
    th: 'แพ็คเกจมือใหม่ (Introductory) ราคา 100 USD ราคาเดิมก่อนลดคือเท่าไหร่?',
    type: 'mcq',
    options: {
      en: ['$129', '$149', '$159', '$179'],
      th: ['129 USD', '149 USD', '159 USD', '179 USD'],
    },
    correctIdx: 2,
    explain: {
      en: 'The original price was $159, discounted to $100 as shown in the package pricing card.',
      th: 'ราคาเดิมคือ 159 USD ลดเหลือ 100 USD ตามที่แสดงในการ์ดราคาของแพ็คเกจ',
    },
  },
  {
    phase: 0,
    isNew: true,
    en: 'How much bonus can an agent offer to a customer?',
    th: 'เอเย่นต์สามารถเสนอโบนัสให้ลูกค้าได้เท่าไหร่?',
    type: 'mcq',
    options: {
      en: ['25% only', '50% only', '100% only', '50% or 100% — both are valid options'],
      th: ['25% เท่านั้น', '50% เท่านั้น', '100% เท่านั้น', '50% หรือ 100% — ทั้งสองตัวเลือกใช้ได้'],
    },
    correctIdx: 3,
    explain: {
      en: 'Agents have the flexibility to offer either a 50% or 100% bonus — both are valid depending on the situation.',
      th: 'เอเย่นต์มีความยืดหยุ่นในการเสนอโบนัส 50% หรือ 100% ได้ โดยทั้งสองตัวเลือกนั้นถูกต้อง ขึ้นอยู่กับสถานการณ์',
    },
  },
];

// ─── Phase 4: Registration ────────────────────────────────────────────────────
const PHASE4_REGISTRATION: QuestionData[] = [
  {
    phase: 1,
    en: 'Where do you direct a customer who is ready to register?',
    th: 'คุณส่งลูกค้าที่พร้อมลงทะเบียนไปที่เว็บไซต์ใด?',
    type: 'mcq',
    options: {
      en: ['smartbrainai.com', 'thebraintrade.com', '200invest.com', 'zenstox.com/register'],
      th: ['smartbrainai.com', 'thebraintrade.com', '200invest.com', 'zenstox.com/register'],
    },
    correctIdx: 1,
    explain: {
      en: 'Step 20: Guide customers to thebraintrade.com to begin registration.',
      th: 'ขั้นที่ 20: นำลูกค้าไปที่ thebraintrade.com เพื่อเริ่มต้นการลงทะเบียน',
    },
  },
  {
    phase: 1,
    en: 'What are the password requirements for the platform?',
    th: 'รหัสผ่านของแพลตฟอร์มมีข้อกำหนดอย่างไร?',
    type: 'mcq',
    options: {
      en: [
        'Minimum 6 characters, 1 uppercase only',
        'Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number',
        'Minimum 10 characters, 1 symbol, 1 number',
        'Minimum 8 characters, 1 symbol only',
      ],
      th: [
        'อย่างน้อย 6 ตัวอักษร ตัวพิมพ์ใหญ่ 1 ตัว',
        'อย่างน้อย 8 ตัวอักษร ตัวพิมพ์ใหญ่ 1 ตัว ตัวพิมพ์เล็ก 1 ตัว ตัวเลข 1 ตัว',
        'อย่างน้อย 10 ตัวอักษร 1 สัญลักษณ์ 1 ตัวเลข',
        'อย่างน้อย 8 ตัวอักษร 1 สัญลักษณ์เท่านั้น',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'Step 21: Password must be at least 8 characters with 1 uppercase letter, 1 lowercase letter, and 1 number.',
      th: 'ขั้นที่ 21: รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร ประกอบด้วยตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว ตัวพิมพ์เล็กอย่างน้อย 1 ตัว และตัวเลขอย่างน้อย 1 ตัว',
    },
  },
  {
    phase: 1,
    en: 'How many free courses does a new free account receive?',
    th: 'บัญชีฟรีใหม่ได้รับคอร์สเรียนฟรีกี่คอร์ส?',
    type: 'mcq',
    options: {
      en: ['1 free course', '2 free courses', '3 free courses', 'No free courses'],
      th: ['1 คอร์สฟรี', '2 คอร์สฟรี', '3 คอร์สฟรี', 'ไม่มีคอร์สฟรี'],
    },
    correctIdx: 1,
    explain: {
      en: 'Step 22: New free accounts receive 2 free courses upon registration.',
      th: 'ขั้นที่ 22: บัญชีฟรีใหม่จะได้รับ 2 คอร์สฟรีทันทีเมื่อลงทะเบียน',
    },
  },
];

// ─── Phase 5: Payment Mastery ─────────────────────────────────────────────────
const PHASE5_PAYMENT: QuestionData[] = [
  {
    phase: 0,
    en: 'Which tab does the system automatically open first in the payment flow?',
    th: 'ระบบจะเปิดแท็บใดโดยอัตโนมัติแรกในขั้นตอนการชำระเงิน?',
    type: 'mcq',
    options: {
      en: ['The 1st tab (Account)', 'The 2nd tab (Deposit)', 'The 3rd tab (Trade)', 'The 4th tab (Withdraw)'],
      th: ['แท็บที่ 1 (Account)', 'แท็บที่ 2 (Deposit)', 'แท็บที่ 3 (Trade)', 'แท็บที่ 4 (Withdraw)'],
    },
    correctIdx: 2,
    explain: {
      en: "Step 23: The system automatically opens the 'Trade' tab (3rd tab) in the broker payment flow.",
      th: "ขั้นที่ 23: ระบบจะเปิดแท็บ 'Trade' (แท็บที่ 3) โดยอัตโนมัติในขั้นตอนการชำระเงินกับโบรกเกอร์",
    },
  },
  {
    phase: 0,
    en: 'Which broker should be selected for the deposit?',
    th: 'ควรเลือกโบรกเกอร์ใดสำหรับการฝากเงิน?',
    type: 'mcq',
    options: {
      en: ['IC Markets or Exness', 'Zenstox / 200 Invest', 'XM or FBS', 'Pepperstone or FP Markets'],
      th: ['IC Markets หรือ Exness', 'Zenstox / 200 Invest', 'XM หรือ FBS', 'Pepperstone หรือ FP Markets'],
    },
    correctIdx: 1,
    explain: {
      en: 'Step 24: Select Zenstox or 200 Invest as the official broker partner for the deposit.',
      th: 'ขั้นที่ 24: เลือก Zenstox หรือ 200 Invest เป็นพาร์ทเนอร์โบรกเกอร์อย่างเป็นทางการสำหรับการฝากเงิน',
    },
  },
  {
    phase: 0,
    en: 'What two actions must be completed on the broker page before proceeding?',
    th: 'ต้องดำเนินการสองอย่างใดบนหน้าโบรกเกอร์ก่อนดำเนินการต่อ?',
    type: 'mcq',
    options: {
      en: [
        'Enter promo code and select account type',
        "Check Terms & Conditions and click 'Open Account'",
        'Upload ID and verify email',
        'Select leverage and deposit currency',
      ],
      th: [
        'กรอกโค้ดโปรโมชั่นและเลือกประเภทบัญชี',
        "ติ๊กยอมรับข้อกำหนดและเงื่อนไข แล้วคลิก 'Open Account'",
        'อัปโหลด ID และยืนยันอีเมล',
        'เลือก Leverage และสกุลเงินสำหรับฝาก',
      ],
    },
    correctIdx: 1,
    explain: {
      en: "Step 25: Tick the Terms & Conditions checkbox, then click 'Open Account' to proceed.",
      th: "ขั้นที่ 25: ติ๊กยอมรับข้อกำหนดและเงื่อนไข จากนั้นคลิก 'Open Account' เพื่อดำเนินการต่อ",
    },
  },
  {
    phase: 0,
    en: 'What status indicator confirms the broker account is live and ready?',
    th: 'สัญญาณบ่งชี้สถานะใดยืนยันว่าบัญชีโบรกเกอร์พร้อมใช้งานแล้ว?',
    type: 'mcq',
    options: {
      en: ["Blue 'Verified' badge", "Orange 'Processing' status", "Green 'Active Broker' status", "Yellow 'Pending Review' label"],
      th: ["ป้าย 'Verified' สีน้ำเงิน", "สถานะ 'Processing' สีส้ม", "สถานะ 'Active Broker' สีเขียว", "ป้าย 'Pending Review' สีเหลือง"],
    },
    correctIdx: 2,
    explain: {
      en: "Step 26: Wait for the green 'Active Broker' status before proceeding with the deposit.",
      th: "ขั้นที่ 26: รอจนกว่าสถานะ 'Active Broker' สีเขียวจะปรากฏก่อนดำเนินการฝากเงิน",
    },
  },
  {
    phase: 0,
    en: 'In the financial info section, what specific checkbox must the customer tick?',
    th: 'ในส่วนข้อมูลทางการเงิน ลูกค้าต้องติ๊กช่องกาเครื่องหมายใดโดยเฉพาะ?',
    type: 'mcq',
    options: {
      en: [
        "'I am a professional trader'",
        "'I am not a U.S. citizen'",
        "'I agree to margin trading'",
        "'I am above 21 years old'",
      ],
      th: [
        "'ฉันเป็นนักเทรดมืออาชีพ'",
        "'ฉันไม่ใช่พลเมืองสหรัฐอเมริกา'",
        "'ฉันยินยอมทำการเทรดด้วยมาร์จิ้น'",
        "'ฉันมีอายุเกิน 21 ปี'",
      ],
    },
    correctIdx: 1,
    explain: {
      en: "Step 27: The customer must tick 'Not a U.S. citizen' in the financial information section.",
      th: "ขั้นที่ 27: ลูกค้าต้องติ๊กช่อง 'ไม่ใช่พลเมืองสหรัฐอเมริกา' ในส่วนข้อมูลทางการเงิน",
    },
  },
  {
    phase: 0,
    en: 'How much should the customer enter as the deposit amount?',
    th: 'ลูกค้าควรกรอกจำนวนเงินฝากเป็นเท่าไหร่?',
    type: 'mcq',
    options: {
      en: [
        'Any round number above the package minimum',
        'The exact USD price of their chosen package',
        'A 10% deposit to hold the spot',
        'Any amount between $50–$100 to start',
      ],
      th: [
        'ตัวเลขกลมๆ ที่เกินกว่าราคาขั้นต่ำของแพ็คเกจ',
        'ราคา USD ที่แน่นอนตรงตามแพ็คเกจที่เลือก',
        'วางเงินมัดจำ 10% เพื่อจองสิทธิ์',
        'จำนวนใดก็ได้ระหว่าง 50-100 USD เพื่อเริ่มต้น',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'Step 28: Enter the exact USD price of the chosen package as the deposit amount — not more, not less.',
      th: 'ขั้นที่ 28: กรอกราคา USD ที่แน่นอนของแพ็คเกจที่เลือกเป็นจำนวนเงินฝาก ไม่มากไม่น้อยกว่านั้น',
    },
  },
  {
    phase: 0,
    en: "The customer doesn't have their ID ready during registration. What do you advise?",
    th: 'ลูกค้าไม่มี ID พร้อมระหว่างการลงทะเบียน คุณแนะนำอย่างไร?',
    type: 'mcq',
    options: {
      en: [
        'Ask them to come back another day',
        'Tell them ID is mandatory — no exceptions',
        "Click 'I'll do it later' to bypass KYC temporarily",
        'Submit with a placeholder and update later',
      ],
      th: [
        'ให้พวกเขากลับมาใหม่อีกวัน',
        'บอกว่า ID จำเป็นต้องใช้ — ไม่มีข้อยกเว้น',
        "คลิก 'I'll do it later' เพื่อข้าม KYC ชั่วคราว",
        'ส่งข้อมูลสำรองไปก่อนแล้วอัปเดตภายหลัง',
      ],
    },
    correctIdx: 2,
    explain: {
      en: "Step 29: If no ID is available, click 'I'll do it later' to temporarily bypass KYC and continue registration.",
      th: "ขั้นที่ 29: หากไม่มี ID พร้อม ให้คลิก 'I'll do it later' เพื่อข้าม KYC ชั่วคราวและดำเนินการลงทะเบียนต่อไป",
    },
  },
  {
    phase: 0,
    en: 'After completing registration, within how long is the customer guaranteed a mentor contact?',
    th: 'หลังจากลงทะเบียนเสร็จสมบูรณ์ ลูกค้าได้รับการรับประกันว่าจะมี Mentor ติดต่อภายในกี่ชั่วโมง?',
    type: 'mcq',
    options: {
      en: ['24 hours', '48 hours', '72 hours', '1 week'],
      th: ['24 ชั่วโมง', '48 ชั่วโมง', '72 ชั่วโมง', '1 สัปดาห์'],
    },
    correctIdx: 2,
    explain: {
      en: 'Step 30: Mentor contact is guaranteed within 72 hours of completing registration.',
      th: 'ขั้นที่ 30: รับประกันว่า Mentor จะติดต่อภายใน 72 ชั่วโมงหลังจากลงทะเบียนเสร็จสมบูรณ์',
    },
  },
];

// ─── Module → Quiz mapping ───────────────────────────────────────────────────
export const MODULE_QUIZ_MAP: Record<string, QuizDefinition> = {
  product: {
    id: 'sales-opener-platform',
    title: { en: 'Sales Opener & Platform', th: 'การเปิดการขายและแพลตฟอร์ม' },
    description: {
      en: '9 questions across 2 phases — Opener flow and platform feature demos.',
      th: '9 ข้อ ใน 2 ขั้นตอน — การเปิดการขายและการสาธิตฟีเจอร์บนแพลตฟอร์ม',
    },
    phases: [
      { name: { en: 'Phase 1: Opener', th: 'ขั้นที่ 1: การเปิดการขาย' }, color: '#0F6E56', light: '#E1F5EE' },
      { name: { en: 'Phase 2: Demo Platform', th: 'ขั้นที่ 2: การสาธิตแพลตฟอร์ม' }, color: '#185FA5', light: '#E6F1FB' },
    ],
    questions: [...PHASE1_OPENER, ...PHASE2_DEMO],
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
      { name: { en: 'Phase 4: Registration', th: 'ขั้นที่ 4: การลงทะเบียน' }, color: '#534AB7', light: '#EEEDFE' },
    ],
    questions: [...PHASE3_PACKAGES, ...PHASE4_REGISTRATION],
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
    questions: PHASE5_PAYMENT,
  },
};

export const PASS_THRESHOLD = 0.7; // 70%
