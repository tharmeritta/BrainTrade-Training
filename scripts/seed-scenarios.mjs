/**
 * CLI Script to Seed Full 10-Scenario Bilingual AI Training Curriculum into Firestore
 * 
 * Usage:
 *   node scripts/seed-scenarios.mjs
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local
const envPath = join(__dirname, '../.env.local');
if (existsSync(envPath)) {
  const envFile = readFileSync(envPath, 'utf-8');
  for (const line of envFile.split('\n')) {
    const [key, ...rest] = line.split('=');
    if (key && !key.startsWith('#') && rest.length) {
      process.env[key.trim()] = rest.join('=').trim().replace(/^"|"$/g, '');
    }
  }
}

function initAdmin() {
  if (getApps().length > 0) return getFirestore();
  const saJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  const projectId = process.env.FIREBASE_PROJECT_ID || 'bt-training-firebase';

  if (saJson && saJson.startsWith('{')) {
    const parsed = JSON.parse(saJson);
    initializeApp({ credential: cert(parsed), projectId: parsed.project_id || projectId });
  } else {
    initializeApp({ projectId });
  }

  return getFirestore();
}

const FULL_CURRICULUM_SCENARIOS = [
  // LEVEL 1: FOUNDATION
  {
    id: 'telesales-objection-handling-th',
    level: 1,
    name: {
      th: '1. การรับมือข้อโต้แย้งเรื่องราคาและการสร้างความคุ้มค่า (ROI)',
      en: '1. Price Objection Handling & ROI Value Pitch'
    },
    difficulty: 'beginner',
    passThreshold: 70,
    required: true,
    isActive: true,
    customerPersona: {
      th: 'คุณสมชาย เจ้าของธุรกิจ SME ที่ลังเลเรื่องงบประมาณและต้องการเปรียบเทียบกับคู่แข่ง',
      en: 'Khun Somchai, SME business owner hesitant about budget and wanting to compare with competitors.'
    },
    initialMood: { th: 'ลังเลและระมัดระวังเรื่องงบประมาณ', en: 'Hesitant and price-sensitive' },
    objective: { th: 'อธิบายความคุ้มค่า ROI ขจัดความกังวลเรื่องราคา และเสนอนัดหมายสาธิตระบบ 1:1', en: 'Address price concerns, explain ROI value, and book a 1:1 demo call.' },
    situation: {
      th: '"บริการของคุณราคาแพงกว่าคู่แข่งตั้ง 30% ทำไมผมต้องจ่ายแพงกว่าด้วยล่ะ?"',
      en: '"Your service is 30% more expensive than competitors! Why should I pay more?"'
    },
    choices: [
      {
        id: 'A',
        text: {
          th: 'อธิบายว่าจุดเด่นระบบของเราช่วยลดความเสี่ยงเสียเงิน และเพิ่มกำไรเฉลี่ย 15-20% พร้อมเสนอขอนัด 15 นาทีเพื่อแสดงตัวเลขจริง',
          en: 'Explain our premium risk reduction & 15-20% avg profit boost, then offer a 15-min demo to present actual ROI figures.'
        },
        isCorrect: true, score: 10,
        explanation: {
          th: 'ยอดเยี่ยมมาก! การเปลี่ยนมุมมองจากเรื่องราคาไปที่มูลค่ากำไร (ROI) และขอนัดหมายอย่างมืออาชีพช่วยปิดการขายได้โดยไม่ต้องลดราคา',
          en: 'Excellent! Reframing price into ROI value and requesting the meeting builds credibility without unapproved discounts.'
        }
      },
      {
        id: 'B',
        text: { th: 'เสนอส่วนลดให้ทันที 20% หากลูกค้าตกลงตัดสินใจทำสัญญาเลยในวันนี้', en: 'Offer an immediate 20% discount if the customer agrees to sign today.' },
        isCorrect: false, score: 5,
        explanation: { th: 'การลดราคาทันทีโดยไม่มีเงื่อนไขทำให้ลูกค้ารู้สึกว่าผลิตภัณฑ์ตั้งราคาเผื่อลดและลดทอนภาพลักษณ์แบรนด์', en: 'Instant discounting erodes brand value and implies inflated pricing.' }
      },
      {
        id: 'C',
        text: { th: 'บอกลูกค้าว่าคู่แข่งคุณภาพแย่กว่า และระบบไม่มีมาตรฐานเทียบเท่าเรา', en: 'Tell the customer that competitors offer poor quality and low standards.' },
        isCorrect: false, score: 2,
        explanation: { th: 'การพูดโจมตีคู่แข่งทำให้ภาพลักษณ์พนักงานดูไม่เป็นมืออาชีพและสร้างความรู้สึกติดลบแก่ลูกค้า', en: 'Attacking competitors creates a negative impression and looks unprofessional.' }
      },
      {
        id: 'D',
        text: { th: 'บอกว่าเป็นราคากลางบริษัท เปลี่ยนแปลงไม่ได้ ถ้าไม่ไหวแนะนำให้ลองดูเจ้าอื่นแทน', en: 'State that pricing is fixed and suggest they look elsewhere if they cannot afford it.' },
        isCorrect: false, score: 0,
        explanation: { th: 'เป็นการปฏิเสธโอกาสการขายและขับไล่ลูกค้าอย่างรุนแรง', en: 'Dismisses the sales opportunity and turns away the prospect.' }
      }
    ]
  },
  {
    id: 'gatekeeper-bypass-th',
    level: 1,
    name: {
      th: '2. การผ่านด่านฝ่ายคัดกรองสาย (Gatekeeper Bypass)',
      en: '2. Cold Call Gatekeeper Bypass'
    },
    difficulty: 'beginner',
    passThreshold: 70,
    required: true,
    isActive: true,
    customerPersona: {
      th: 'คุณภา พนักงานต้อนรับผู้เคร่งครัดที่ไม่ยอมโอนสายให้ผู้บริหารหากไม่มีนัดหมาย',
      en: 'Khun Pha, strict receptionist who guards management phone calls.'
    },
    initialMood: { th: 'ทางการและตั้งการการ์ดสูง', en: 'Formal and protective' },
    objective: { th: 'สร้างความน่าเชื่อถือ สื่อสารอย่างมั่นใจ และขอโอนสายหาผู้มีอำนาจตัดสินใจ', en: 'Build authority, communicate with confidence, and secure call transfer to decision maker.' },
    situation: {
      th: '"ทางเราไม่อนุญาตให้โอนสายขายของค่ะ กรุณาส่งอีเมลเสนอราคาเข้ามาที่ส่วนกลางแทนนะคะ"',
      en: '"We do not allow sales calls to be transferred. Please send your proposal to our central email."'
    },
    choices: [
      {
        id: 'A',
        text: {
          th: 'ตอบรับด้วยความสุภาพ: "ขอบคุณครับคุณภา พอดีเรื่องนี้เป็นข้อมูลวิเคราะห์ประสิทธิภาพยอดขายที่คุณวิชัย MD ร้องขอไว้ ผมควรจดชื่ออีเมลตรงคุณวิชัยเลย หรือขอเรียนสายสั้นๆ 1 นาทีดีครับ?"',
          en: 'Polite authority: "Thank you Khun Pha. This pertains to the sales performance analysis MD Khun Wichai requested. Should I send it directly to his personal email or speak for 1 min?"'
        },
        isCorrect: true, score: 10,
        explanation: {
          th: 'ดีเยี่ยม! การใช้น้ำเสียงเป็นทางการ อ้างอิงประเด็นสำคัญของผู้บริหาร และให้ทางเลือกแก่ Gatekeeper ช่วยเพิ่มโอกาสผ่านสายสูงมาก',
          en: 'Excellent! Professional tone, referencing executive priorities, and giving clear choices maximizes transfer rates.'
        }
      },
      {
        id: 'B',
        text: { th: 'วางสายทันทีและลองโทรใหม่วันหลังเผื่อเปลี่ยนคนรับสาย', en: 'Hang up immediately and call back another day hoping for a different receptionist.' },
        isCorrect: false, score: 3,
        explanation: { th: 'ยอมแพ้เร็วเกินไปโดยไม่ได้พยายามสร้างคุณค่าหรือขอข้อมูลเพิ่มเติม', en: 'Gives up too early without establishing value or gathering context.' }
      },
      {
        id: 'C',
        text: { th: 'ส่งอีเมลไปที่ info@company.com ตามที่พนักงานบอกแล้วรอการติดต่อกลับ', en: 'Send an email to info@company.com as told and wait passively.' },
        isCorrect: false, score: 4,
        explanation: { th: 'อีเมลส่วนกลางมีอัตราการตอบกลับต่ำมาก (น้อยกว่า 2%) ควรพยายามขอชื่อผู้ดูแลโดยตรง', en: 'Central emails have less than 2% response rates; always aim for direct contact details.' }
      },
      {
        id: 'D',
        text: { th: 'แสดงอารมณ์หงุดหงิดและบอกว่าเรื่องนี้เป็นเรื่องด่วนระดับผู้บริหาร ห้ามขัดขวาง', en: 'Show frustration and demand to speak to executive immediately.' },
        isCorrect: false, score: 0,
        explanation: { th: 'การใส่อารมณ์กับ Gatekeeper จะทำให้ชื่อบริษัทถูกแบล็กลิสต์จากการติดต่อทันที', en: 'Rudeness guarantees blacklisting from future communications.' }
      }
    ]
  },

  // LEVEL 2: VALUE PITCH & DISCOVERY
  {
    id: 'executive-pitch-th',
    level: 2,
    name: {
      th: '3. การเสนอขายผู้บริหารที่ไม่มีเวลา (Impatient CEO Pitch)',
      en: '3. Elevator Pitch for Impatient Executives'
    },
    difficulty: 'intermediate',
    passThreshold: 75,
    required: true,
    isActive: true,
    customerPersona: {
      th: 'คุณอนันต์ CEO บริษัทเติบโตเร็ว เกลียดการฟังบทพูดยาวๆ ต้องการสรุปผลลัพธ์ใน 1 นาที',
      en: 'Khun Ananda, fast-scaling CEO who hates long pitches and demands bottom-line facts in 1 minute.'
    },
    initialMood: { th: 'รีบร้อนและตรงไปตรงมา', en: 'Impatient and direct' },
    objective: { th: 'นำเสนอ Elevator Pitch กระชับและล็อคเวลานัดหมาย 15 นาที', en: 'Deliver concise elevator pitch and secure a 15-minute briefing slot.' },
    situation: {
      th: '"ผมมีเวลาแค่ 1 นาที สรุปสั้นๆ มาเลยว่าระบบคุณช่วยบริษัทผมได้ยังไง?"',
      en: '"I only have 1 minute. Get straight to the point—how does your system help my company?"'
    },
    choices: [
      {
        id: 'A',
        text: {
          th: 'สรุปผลลัพธ์หลักใน 2 ประโยค: "เราช่วยลดเวลาทำงานทีมขาย 40% และเพิ่มยอดปิดการขาย 25% ครับ ขอเวลา 15 นาทีสัปดาห์หน้าเปิดเคสตัวอย่างให้ดู"',
          en: 'Summarize core results in 2 sentences: "We cut sales team admin time by 40% and boost closing rates by 25%. Can I get 15 mins next week to present a case study?"'
        },
        isCorrect: true, score: 10,
        explanation: { th: 'ตรงเป้าหมาย! เคารพเวลาผู้บริหารและใช้สถิติตัวเลขชัดเจน', en: 'Bullseye! Respects executive time constraints and leverages compelling metrics.' }
      },
      {
        id: 'B',
        text: { th: 'เริ่มอ่านประวัติบริษัทและความสำเร็จตั้งแต่ก่อตั้งเมื่อ 5 ปีก่อน', en: 'Begin reading company history and milestones from 5 years ago.' },
        isCorrect: false, score: 2,
        explanation: { th: 'ผู้บริหารจะวางสายทันทีเพราะเสียเวลา', en: 'The executive will hang up immediately due to wasted time.' }
      },
      {
        id: 'C',
        text: { th: 'ขอส่งสไลด์ 50 หน้าไปให้ทางอีเมลอ่านเอง', en: 'Offer to send a 50-page presentation slide deck via email.' },
        isCorrect: false, score: 5,
        explanation: { th: 'ผู้บริหารที่ยุ่งมากแทบไม่มีเวลาเปิดอ่านสไลด์ยาวๆ โดยไม่มีการสรุป', en: 'Busy executives rarely read unrequested 50-page slide decks.' }
      },
      {
        id: 'D',
        text: { th: 'ถามผู้บริหารกลับว่าทำไมถึงมีเวลาให้น้อยขนาดนี้', en: 'Ask the executive why they have so little time for a call.' },
        isCorrect: false, score: 0,
        explanation: { th: 'สร้างความขุ่นเคืองและเสียมารยาทในการสื่อสาร', en: 'Offensive and rude response.' }
      }
    ]
  },
  {
    id: 'happy-with-existing-th',
    level: 2,
    name: {
      th: '4. การขจัดข้อโต้แย้ง "พึงพอใจกับระบบเดิมอยู่แล้ว"',
      en: '4. Handling "Happy with Existing Provider" Objection'
    },
    difficulty: 'intermediate',
    passThreshold: 75,
    required: true,
    isActive: true,
    customerPersona: {
      th: 'คุณกิตติ ผู้จัดการฝ่ายขายที่ใชิระบบเดิมมา 3 ปีและไม่อยากเปลี่ยนความยุ่งยาก',
      en: 'Khun Kitti, Sales Manager using a legacy tool for 3 years and reluctant to change.'
    },
    initialMood: { th: 'เฉยชาและปฏิเสธการเปลี่ยนแปลง', en: 'Complacent and resistant to change' },
    objective: { th: 'ค้นหาจุดเจ็บปวด (Pain Point) ที่ซ่อนอยู่ และกระตุ้นความตระหนักรู้ถึงโอกาสเติบโต', en: 'Uncover hidden pain points and stimulate awareness for growth opportunities.' },
    situation: {
      th: '"ตอนนี้บริษัทเราใชิระบบของเจ้าอื่นอยู่แล้ว ก็ใช้งานได้ดี ไม่มีปัญหาอะไร จึงยังไม่สนใจเปลี่ยนครับ"',
      en: '"We are already using another software and it works fine. We have no interest in changing."'
    },
    choices: [
      {
        id: 'A',
        text: {
          th: 'ชื่นชมระบบเดิม แล้วถามคำถามเจาะลึก: "ยินดีด้วยครับที่คุณกิตติมีระบบใช้อยู่แล้ว แต่ขอสอบถามครับว่า ในช่วงพีคเสลส์ ทีมงานเคยเจอปัญหารายงานอัปเดตช้าหรือวิเคราะห์สคริปต์หลุดบ้างไหมครับ?"',
          en: 'Validate their current setup, then probe: "Great that you have a setup. May I ask—during peak sales, does your team experience delayed reporting or script compliance gaps?"'
        },
        isCorrect: true, score: 10,
        explanation: { th: 'ยอดเยี่ยม! การไม่ขัดแย้งแต่ใช้คำถามปลายเปิดเจาะจุดเจ็บปวดซ่อนเร้นช่วยเปิดใจลูกค้าได้ดีที่สุด', en: 'Outstanding! Validating first and probing with open questions exposes hidden inefficiencies.' }
      },
      {
        id: 'B',
        text: { th: 'ตื๊อให้ลองใช้ของเราคู่กันไปเลยเพื่อดูความแตกต่าง', en: 'Push them to run our software in parallel to compare.' },
        isCorrect: false, score: 5,
        explanation: { th: 'ทำให้ลูกค้ารู้สึกว่าเพิ่มภาระงานและต้นทุนโดยไม่จำเป็น', en: 'Creates perception of added friction and redundant costs.' }
      },
      {
        id: 'C',
        text: { th: 'บอกลูกค้าว่าระบบที่เขาใช้อยู่ล้าสมัยแล้ว ควรเลิกใช้', en: 'Tell the customer their current system is obsolete and out of date.' },
        isCorrect: false, score: 1,
        explanation: { th: 'การวิจารณ์การตัดสินใจในอดีตของลูกค้าทำให้เกิดการต่อต้านทันที', en: 'Criticizing customer past decisions triggers immediate defensive hostility.' }
      },
      {
        id: 'D',
        text: { th: 'กล่าวขอบคุณและขออนุญาตวางสายทันที', en: 'Thank them and end the call immediately.' },
        isCorrect: false, score: 0,
        explanation: { th: 'ทิ้งโอกาสขายโดยไม่ได้ทำการค้นหาความต้องการเชิงลึก (Discovery)', en: 'Abandons lead without attempting discovery.' }
      }
    ]
  },
  {
    id: 'feature-vs-outcome-th',
    level: 2,
    name: {
      th: '5. การโน้มน้าวด้วยผลลัพธ์ธุรกิจ ไม่ใช่แค่ฟีเจอร์ (Outcome Pitch)',
      en: '5. Business Outcome Pitching vs. Feature Dumping'
    },
    difficulty: 'intermediate',
    passThreshold: 75,
    required: false,
    isActive: true,
    customerPersona: {
      th: 'คุณวราภรณ์ สมาชิกบอร์ดบริหารที่สนใจเฉพาะผลตอบแทนธุรกิจ ไม่สนใจศัพท์เทคนิค',
      en: 'Khun Waraporn, Board Member interested strictly in business return, not tech jargon.'
    },
    initialMood: { th: 'เน้นผลลัพธ์และตัวเลข', en: 'Outcome and numbers focused' },
    objective: { th: 'เปลี่ยนภาษาเทคนิคให้เป็นภาษาผลกำไรและประสิทธิภาพองค์กร', en: 'Translate technical capabilities into bottom-line profitability & efficiency.' },
    situation: {
      th: '"ไม่ต้องเล่าฟีเจอร์ AI ซับซ้อนให้ฟังหรอกนะ ช่วยบอกตรงๆ ว่าระบบนี้ทำให้ยอดขายบริษัทเติบโตได้ยังไง?"',
      en: '"Skip the complicated AI features—tell me straight how this system grows company revenue?"'
    },
    choices: [
      {
        id: 'A',
        text: {
          th: 'เน้นผลลัพธ์ 3 ด้าน: 1. ช่วยเพิ่มจำนวนการโทรของเสลส์ 30% 2. คัดกรองเคสปิดง่ายให้เสลส์ลุยทันที 3. ช่วยให้ยอดปิดสัญญาเฉลี่ยต่อคนโตขึ้น 20%',
          en: 'Focus on 3 outcomes: 1. Boost call capacity by 30% 2. Auto-prioritize high-value leads 3. Lift rep closing conversion by 20%.'
        },
        isCorrect: true, score: 10,
        explanation: { th: 'ดีเยี่ยม! การสื่อสารด้วยผลลัพธ์ธุรกิจ (Business Outcomes) ตรงใจระดับผู้บริหารสูงสุด', en: 'Perfect! Pitching business outcomes aligns directly with executive priorities.' }
      },
      {
        id: 'B',
        text: { th: 'อธิบายเรื่องอัลกอริทึม Machine Learning และ LLM Neural Network', en: 'Explain Machine Learning algorithms and LLM Neural Network architecture.' },
        isCorrect: false, score: 3,
        explanation: { th: 'ศัพท์เทคนิคซับซ้อนทำให้ผู้บริหารเบื่อและรู้สึกว่าใช้งานยาก', en: 'Technical jargon confuses executive prospects.' }
      },
      {
        id: 'C',
        text: { th: 'อ่านรายชื่อฟีเจอร์ทั้งหมด 20 ข้อในโบรชัวร์ให้ฟัง', en: 'Read out all 20 feature items listed on the brochure.' },
        isCorrect: false, score: 4,
        explanation: { th: 'การอ่านฟีเจอร์พรั่งพรู (Feature Dumping) ไม่ช่วยแสดงมูลค่าธุรกิจ', en: 'Feature dumping fails to connect product capabilities to business metrics.' }
      },
      {
        id: 'D',
        text: { th: 'บอกว่าถ้าซื้อตอนนี้จะมีของแถมและคอร์สอบรมฟรีให้', en: 'Offer free merchandise and training sessions if they buy now.' },
        isCorrect: false, score: 1,
        explanation: { th: 'ของแถมเล็กน้อยไม่สามารถชดเชยความคุ้มค่าระดับองค์กรได้', en: 'Gimmicks do not substitute for strategic business ROI.' }
      }
    ]
  },

  // LEVEL 3: ADVANCED TRUST & FRICTION REMOVAL
  {
    id: 'security-compliance-th',
    level: 3,
    name: {
      th: '6. การสร้างความมั่นใจเรื่องความปลอดภัยข้อมูล (Security & PDPA)',
      en: '6. Security & Data Compliance Concern'
    },
    difficulty: 'advanced',
    passThreshold: 80,
    required: true,
    isActive: true,
    customerPersona: {
      th: 'คุณธนิน Chief Information Security Officer (CISO) ที่กังวลเรื่องข้อมูลลูกค้ารั่วไหล',
      en: 'Khun Thanin, CISO protective of customer data privacy and regulatory compliance.'
    },
    initialMood: { th: 'เข้มงวดและสงสัยในความปลอดภัย', en: 'Strict and security-skeptical' },
    objective: { th: 'ยืนยันมาตรฐานความปลอดภัย ISO/PDPA และเสนอด้านเทคนิคเข้าร่วมประชุม', en: 'Validate ISO/PDPA compliance standards and invite technical team to security review.' },
    situation: {
      th: '"บริษัทเราทำงานกับข้อมูลการเงินลูกค้า การใช้ระบบคลาวด์ภายนอกมีโอกาสทำข้อมูลรั่วไหลและขัดต่อกฎหมาย PDPA ชัดๆ!"',
      en: '"We handle financial data. Using external cloud AI will risk data leaks and violate PDPA laws!"'
    },
    choices: [
      {
        id: 'A',
        text: {
          th: 'ยืนยันด้วยมาตรฐานรับรอง: "เข้าใจความกังวลของคุณธนินครับ ระบบเราได้รับรอง ISO 27001 และปฏิบัติตาม PDPA 100% มีการเข้ารหัสข้อมูล Bank-grade AES-256 ขอส่งเอกสาร Compliance Whitepaper ให้คุณธนินประเมินครับ"',
          en: 'Reassure with certifications: "Understood Khun Thanin. We are ISO 27001 certified, 100% PDPA compliant with Bank-grade AES-256 encryption. Let me send our Security Whitepaper for your review."'
        },
        isCorrect: true, score: 10,
        explanation: { th: 'สมบูรณ์แบบ! อ้างอิงมาตรฐานสากล (ISO/PDPA) และเสนอหลักฐานเชิงเอกสารอย่างเป็นมืออาชีพ', en: 'Flawless! Referencing official certifications and whitepapers builds enterprise trust.' }
      },
      {
        id: 'B',
        text: { th: 'บอกว่ารับประกัน 100% ว่าไม่มีทางรั่วไหลแน่นอน เชื่อมือเราได้เลย', en: 'Give verbal promise that leaks are 100% impossible and to just trust us.' },
        isCorrect: false, score: 3,
        explanation: { th: 'คำพูดลอยๆ โดยไม่มีหลักฐานมาตรฐานรองรับไม่สามารถสร้างความเชื่อมั่นแก่ฝ่าย Security ได้', en: 'Verbal promises without documentation are rejected by IT security officers.' }
      },
      {
        id: 'C',
        text: { th: 'แย้งว่าบริษัทอื่นเขาก็ใช้กันเยอะแยะ ไม่เห็นมีปัญหาอะไร', en: 'Argue that many other companies use it without any issues.' },
        isCorrect: false, score: 2,
        explanation: { th: 'การอ้างบริษัทอื่นโดยไม่อิงกฎหมายและความปลอดภัยถือเป็นการละเลยความกังวลของลูกค้า', en: 'Social proof does not replace formal regulatory compliance.' }
      },
      {
        id: 'D',
        text: { th: 'หลีกเลี่ยงการตอบและรีบเปลี่ยนเรื่องไปคุยเรื่องส่วนลดแทน', en: 'Avoid the question and pivot immediately to price discounts.' },
        isCorrect: false, score: 0,
        explanation: { th: 'การเลี่ยงตอบเรื่องความปลอดภัยจะทำให้ถูกตัดออกจากกระบวนการจัดซื้อทันที', en: 'Evading security questions disqualifies the deal.' }
      }
    ]
  },
  {
    id: 'no-onboarding-time-th',
    level: 3,
    name: {
      th: '7. การลดแรงต้านเรื่องความยุ่งยากในการเริ่มต้น (Implementation Friction)',
      en: '7. "No Time for Onboarding" Implementation Friction'
    },
    difficulty: 'advanced',
    passThreshold: 80,
    required: true,
    isActive: true,
    customerPersona: {
      th: 'คุณศิริพร หัวหน้าทีมยุทธศาสตร์ที่กลัวทีมงานต้องเสียเวลาเรียนรู้ระบบใหม่จนเสียยอดขาย',
      en: 'Khun Siriporn, Strategy Lead afraid of onboarding downtime hurting sales targets.'
    },
    initialMood: { th: 'กังวลเรื่องเวลาและภาระงาน', en: 'Worried about workload and downtime' },
    objective: { th: 'นำเสนอแผนเริ่มต้นด่วน (Plug & Play Onboarding) ที่ไร้รอยต่อใน 48 ชม.', en: 'Present seamless 48-hour onboarding plan with dedicated Customer Success support.' },
    situation: {
      th: '"ตอนนี้ทีมเรายุ่งกับเป้าไตรมาสนี้มาก ไม่มีเวลามานั่งเรียนรู้คอร์สอบรมระบบใหม่หรอก ไว้ปีหน้าค่อยคุยกันใหม่"',
      en: '"Our team is swamped with Q3 targets. We have no time to learn new software. Call us next year."'
    },
    choices: [
      {
        id: 'A',
        text: {
          th: 'เสนอวิธีเซ็ตอัปด่วน: "เข้าใจเลยครับ! ระบบเราออกแบบเป็น Plug & Play ทีมงานใช้เวลาเรียนรู้แค่ 30 นาที และเรามีทีม Customer Success ช่วยย้ายข้อมูลให้ฟรีทั้งหมดโดยไม่ต้องหยุดงานครับ"',
          en: 'Offer fast-track onboarding: "Fully understand! Our platform is Plug & Play requiring only 30-min setup. Our Customer Success team migrates all your data for free with zero downtime."'
        },
        isCorrect: true, score: 10,
        explanation: { th: 'ดีเยี่ยม! ขจัดความกังวลเรื่องเวลา ยืนยันความง่าย และเสนอการดูแลแบบ VIP', en: 'Outstanding! Directly addresses downtime fears and offers zero-friction onboarding.' }
      },
      {
        id: 'B',
        text: { th: 'ตกลงยอมรอไว้โทรติดตามใหม่ปีหน้าตามที่ลูกค้าบอก', en: 'Agree passively and promise to call back next year.' },
        isCorrect: false, score: 3,
        explanation: { th: 'การยอมผัดวันประกันพละไปปีหน้าทำให้เลื่อนดีลออกไปโดยไม่จำเป็น', en: 'Delays sales cycle by 12 months unnecessarily.' }
      },
      {
        id: 'C',
        text: { th: 'บอกลูกค้าว่าถ้าไม่เริ่มวันนี้จะตามคู่แข่งไม่ทันแน่นอน', en: 'Tell the customer they will fall behind competitors if they do not act now.' },
        isCorrect: false, score: 4,
        explanation: { th: 'ขู่ให้กลัว (FOMO) โดยไม่ได้ช่วยแก้ปัญหาความยุ่งยากในการใช้งานจริง', en: 'Creates pressure without solving the operational bottleneck.' }
      },
      {
        id: 'D',
        text: { th: 'บอกว่าระบบใช้งานง่ายมากๆ ขนาดเด็กประถมยังใช้เป็นเลย', en: 'Say the system is so simple even an elementary student can use it.' },
        isCorrect: false, score: 0,
        explanation: { th: 'ใช้น้ำเสียงดูถูกสติปัญญาและทักษะของทีมงานลูกค้า', en: 'Condescending remark offensive to prospect team.' }
      }
    ]
  },
  {
    id: 'payment-terms-pushback-th',
    level: 3,
    name: {
      th: '8. การรับมือข้อเรียกร้องเทอมการจ่ายเงิน (Credit Terms Pushback)',
      en: '8. Handling Post-paid & Extended Credit Terms Pushback'
    },
    difficulty: 'advanced',
    passThreshold: 80,
    required: false,
    isActive: true,
    customerPersona: {
      th: 'คุณประวิทย์ ฝ่ายจัดซื้อที่ยืนยันต้องจ่ายเงินแบบ Credit Term 90 วันเท่านั้น',
      en: 'Khun Prawit, Procurement Manager insisting on 90-day post-paid credit terms.'
    },
    initialMood: { th: 'แข็งกร้าวเรื่องระเบียบการเงิน', en: 'Rigid on financial policy' },
    objective: { th: 'รักษาเงื่อนไขการชำระเงินของบริษัท พร้อมเสนอทางออกที่ยืดหยุ่นและเป็นธรรม', en: 'Protect company payment terms while presenting win-win flexible options.' },
    situation: {
      th: '"ระเบียบบริษัทเราต้องจ่ายเงินหลังใช้งาน 90 วันเท่านั้น ถ้าระบบคุณรับเงื่อนไขนี้ไม่ได้ เราคงเปิดซัพพลายเออร์ให้ไม่ได้ครับ"',
      en: '"Company policy requires 90-day post-paid terms. If you cannot accept this, we cannot onboard you."'
    },
    choices: [
      {
        id: 'A',
        text: {
          th: 'เสนอโซลูชันแบ่งจ่ายครึ่งทาง: "เข้าใจระเบียบฝ่ายจัดซื้อครับ ปกติ SaaS เราเป็นแบบล่วงหน้า แต่สำหรับองค์กรท่าน เราขอเสนอแบ่งชำระเป็น 2 งวด หรือใช้บัตรเครดิตองค์กรเพื่อรักษาระยะเครดิต 60-90 วันของท่านได้ครับ"',
          en: 'Offer win-win middle ground: "Understand company policy! Standard SaaS is prepaid, but for your organization we can split into 2 milestones or process via corporate credit card to match your 90-day cycle."'
        },
        isCorrect: true, score: 10,
        explanation: { th: 'ยอดเยี่ยม! ยืดหยุ่นแก้ปัญหาให้จัดซื้อโดยไม่ต้องเสียเปรียบกระแสเงินสดบริษัท', en: 'Creative financial structuring that respects procurement rules without cashflow risks.' }
      },
      {
        id: 'B',
        text: { th: 'ยอมรับเงื่อนไข Credit Term 90 วันทันทีโดยไม่อนุมัติฝ่ายบัญชี', en: 'Accept 90-day credit terms immediately without finance approval.' },
        isCorrect: false, score: 4,
        explanation: { th: 'สร้างความเสี่ยงด้านกระแสเงินสดและละเมิดนโยบายบริษัท', en: 'Violates internal finance risk controls.' }
      },
      {
        id: 'C',
        text: { th: 'ปฏิเสธทันทีและบอกว่าระเบียบบริษัทลูกค้านั้นล้าสมัย', en: 'Refuse flatly and comment that their procurement policy is outdated.' },
        isCorrect: false, score: 1,
        explanation: { th: 'สร้างความขัดแย้งและหักหน้าฝ่ายจัดซื้อ', en: 'Creates conflict with key procurement decision makers.' }
      },
      {
        id: 'D',
        text: { th: 'ขอวางเงินประกันส่วนตัวเพื่อยอมให้เคสดำเนินต่อ', en: 'Offer to put down personal security deposit to proceed.' },
        isCorrect: false, score: 0,
        explanation: { th: 'ผิดนโยบายการขายขั้นรุนแรง', en: 'Severe violation of professional sales code.' }
      }
    ]
  },

  // LEVEL 4: MASTER CLASS & GRADUATION CLOSE
  {
    id: 'multi-stakeholder-stalling-th',
    level: 4,
    name: {
      th: '9. การปลดล็อกดีลติดค้างในคณะกรรมการ (Multi-stakeholder Stalling)',
      en: '9. Unstalling Multi-stakeholder Board Decisions'
    },
    difficulty: 'expert',
    passThreshold: 85,
    required: true,
    isActive: true,
    customerPersona: {
      th: 'คุณอภิสิทธิ์ Project Lead ที่ชอบโครงการแต่ดีลค้างเพราะต้องรอประชุมบอร์ดใหญ่',
      en: 'Khun Aphisit, Project Lead who likes the solution but deal is stuck in board committee.'
    },
    initialMood: { th: 'ติดขัดและไม่อยากออกตัวแรง', en: 'Stuck and non-committal' },
    objective: { th: 'ช่วย Champion ทำสรุป Executive Summary และขอเข้าร่วมตอบข้อซักถามบอร์ด 10 นาที', en: 'Equip internal Champion with Executive Summary & offer 10-min Q&A presence at board meeting.' },
    situation: {
      th: '"ผมชอบระบบคุณนะ แต่โครงการนี้ต้องเข้าที่ประชุมกรรมการใหญ่เดือนหน้า คงต้องรอผลสรุปตอนนั้นครับ"',
      en: '"I like your system, but this requires full board approval next month. We just have to wait."'
    },
    choices: [
      {
        id: 'A',
        text: {
          th: 'เสนอเป็นผู้ช่วย Champion: "ยินดีครับคุณอภิสิทธิ์! เพื่อช่วยให้บอร์ดอนุมัติง่ายขึ้น ผมขอทำสรุป 1-Page Business Case พร้อมตาราง ROI ให้ และถ้าสะดวก ผมขอสแตนด์บายทาง Zoom 10 นาทีเพื่อช่วยตอบคำถามเทคนิคให้บอร์ดด้วยครับ"',
          en: 'Empower the champion: "Gladly Khun Aphisit! To help you secure swift board approval, I will draft a 1-page Business Case with ROI. I can also standby on Zoom for 10 mins to answer technical questions."'
        },
        isCorrect: true, score: 10,
        explanation: { th: 'กลยุทธ์ระดับเซียน! การสนับสนุน Internal Champion ด้วยเครื่องมือตัดสินใจช่วยผลักดันดีลให้ปิดสำเร็จเร็วขึ้น 2 เท่า', en: 'Master strategy! Supporting the internal Champion with decision assets accelerates closing by 2x.' }
      },
      {
        id: 'B',
        text: { th: 'นั่งรอเงียบๆ จนกว่าจะถึงวันประชุมบอร์ดเดือนหน้า', en: 'Wait passively until the board meeting next month.' },
        isCorrect: false, score: 3,
        explanation: { th: 'การปล่อยดีลไว้นานเกินไปทำให้โมเมนตัมการขายลดลงและมีโอกาสถูกพับโครงการสูง', en: 'Passive waiting kills deal momentum and risks project cancellation.' }
      },
      {
        id: 'C',
        text: { th: 'ขอเบอร์ติดต่อบอร์ดบริหารทุกคนเพื่อโทรไปโน้มน้าวทีละคน', en: 'Request phone numbers of all board members to pitch them individually.' },
        isCorrect: false, score: 2,
        explanation: { th: 'ข้ามหน้าข้ามตา Project Lead และสร้างความรำคาญแก่ผู้บริหารระดับสูง', en: 'Bypasses internal Champion and annoys senior executives.' }
      },
      {
        id: 'D',
        text: { th: 'ขู่ว่าถ้าไม่สรุปในสัปดาห์นี้ ข้อเสนอพิเศษทั้งหมดจะถูกยกเลิก', en: 'Threaten that all discounts expire if not approved this week.' },
        isCorrect: false, score: 1,
        explanation: { th: 'ขู่เข็ญอย่างไร้เหตุผลกับกระบวนการบอร์ดสร้างความขุ่นเคืองอย่างมาก', en: 'False pressure alienates enterprise buyers.' }
      }
    ]
  },
  {
    id: 'final-trial-close-th',
    level: 4,
    name: {
      th: '10. การปิดการขายขั้นเด็ดขาดและการสร้างความเร่งด่วน (Trial Close & Urgency)',
      en: '10. Master Trial Close & Creating Authentic Urgency'
    },
    difficulty: 'expert',
    passThreshold: 85,
    required: true,
    isActive: true,
    customerPersona: {
      th: 'คุณวิชัย เจ้าของกิจการที่พอใจทุกอย่างแต่ชอบผลัดวันเซ็นสัญญาไปเรื่อยๆ',
      en: 'Khun Wichai, business owner satisfied with everything but keeps delaying contract signing.'
    },
    initialMood: { th: 'ผ่อนคลายและเรื่อยเปื่อย', en: 'Relaxed and indecisive' },
    objective: { th: 'ใช้เทคนิค Trial Close สรุปประโยชน์ ปิดการขาย และรับการเซ็นสัญญาจบการฝึกอบรม!', en: 'Execute Trial Close, summarize value, secure contract signature for graduation!' },
    situation: {
      th: '"ข้อเสนอดีมากครับทุกอย่างโอเคหมดเลย เดี๋ยวขอคิดดูอีกนิดหน่อย สัปดาห์หน้าค่อยโทรมาใหม่นะครับ"',
      en: '"Great offer! Everything looks good. Let me think a bit more, call me back next week."'
    },
    choices: [
      {
        id: 'A',
        text: {
          th: 'ใช้คำถามปิดการขายแบบสรุป (Assumptive Summary Close): "คุณวิชัยครับ เราเห็นตรงกันแล้วว่าระบบช่วยเพิ่มยอดขาย 25% และแก้ปัญหาทีมงานได้ตรงจุด หากเริ่มสัปดาห์นี้ ทีมงานจะได้เริ่มใช้ทันเปิดตัวสินค้าเดือนหน้า ผมส่งลิงก์เซ็นสัญญาอิเล็กทรอนิกส์ให้ตอนนี้เลยนะครับ?"',
          en: 'Assumptive Summary Close: "Khun Wichai, we agree the system boosts sales by 25% and solves key pain points. Signing today ensures your team is onboarded in time for next month product launch. May I send the e-signature link now?"'
        },
        isCorrect: true, score: 10,
        explanation: { th: 'ยอดเยี่ยมระดับเพชรน้ำหนึ่ง! การสรุปความเห็นพ้อง (Agreement Points) เชื่อมโยงกับ Timeline สำคัญของลูกค้า ช่วยปิดการขายได้เด็ดขาด!', en: 'Diamond standard close! Summarizing agreed benefits linked to customer timeline seals the contract!' }
      },
      {
        id: 'B',
        text: { th: 'ตอบว่าได้ครับ สัปดาห์หน้าจะโทรมาสอบถามใหม่', en: 'Agree and promise to call back next week.' },
        isCorrect: false, score: 3,
        explanation: { th: 'ปล่อยให้ดีลหลุดมือในขั้นตอนสุดท้ายทั้งที่ลูกค้าพร้อมปิดการขายแล้ว', en: 'Loses closing momentum right at the finish line.' }
      },
      {
        id: 'C',
        text: { th: 'ถามลูกค้าว่ายังติดปัญหาอะไรอยู่อีกถึงไม่ยอมเซ็นตอนนี้', en: 'Ask aggressively why they refuse to sign right now.' },
        isCorrect: false, score: 2,
        explanation: { th: 'ใช้น้ำเสียงกดดันและบีบบังคับทำให้ลูกค้าอึดอัด', en: 'Aggressive pressure turns prospect defensive.' }
      },
      {
        id: 'D',
        text: { th: 'ยอมเสนอแถมฟรีให้อีก 3 เดือนทันทีถ้าเซ็นสัญญาภายใน 5 นาทีนี้', en: 'Offer 3 free months if they sign within the next 5 minutes.' },
        isCorrect: false, score: 1,
        explanation: { th: 'ให้ของแถมพุ่มพวงโดยไม่จำเป็น เสียรายได้บริษัทโดยไม่เกิดประโยชน์', en: 'Gives away margins unnecessarily when prospect is already sold.' }
      }
    ]
  }
];

async function seed() {
  console.log('[Seed] Seeding Full 10-Scenario Bilingual Curriculum into Firestore...');
  const db = initAdmin();

  for (const s of FULL_CURRICULUM_SCENARIOS) {
    const data = {
      ...s,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await db.collection('aiev_scenarios').doc(s.id).set(data, { merge: true });
    console.log(`  ✓ Level ${s.level} | ${s.name.th} (${s.id})`);
  }

  console.log('\n✨ Successfully seeded full 10-scenario bilingual curriculum!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
