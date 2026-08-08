import { AiEvalScenario } from '@/types/ai-eval';

export const PRESET_TEMPLATES: Partial<AiEvalScenario>[] = [
  {
    name: {
      th: 'การรับมือข้อโต้แย้งเรื่องราคาแพง',
      en: 'Handling Price Skepticism & ROI'
    },
    difficulty: 'beginner',
    passThreshold: 70,
    customerPersona: {
      th: 'คุณสมชาย เจ้าของธุรกิจ SME ที่กังวลเรื่องงบประมาณและมองว่าราคาสูงกว่าคู่แข่ง',
      en: 'Khun Somchai, SME business owner concerned about budget and competitor prices.'
    },
    initialMood: {
      th: 'ลังเลและกังวลเรื่องราคา',
      en: 'Hesitant and price-sensitive'
    },
    objective: {
      th: 'อธิบายความคุ้มค่าและนำเสนอคุณค่า ROI เพื่อขอนัดหมาย 1:1',
      en: 'Demonstrate ROI value and schedule a 1:1 consultation call.'
    },
    situation: {
      th: '"ราคาของคุณแพงกว่าที่อื่นตั้ง 30% ทำไมผมต้องจ่ายแพงขนาดนั้นด้วย?"',
      en: '"Your pricing is 30% higher than competitors. Why should I pay so much more?"'
    },
    required: true,
    isActive: true,
    choices: [
      {
        id: 'A',
        text: {
          th: 'อธิบายว่าจุดเด่นบริการและระบบดูแลของเราช่วยลดความเสี่ยงเสียเงิน และเพิ่มกำไรเฉลี่ย 15-20% พร้อมเสนอขอนัด 15 นาทีเพื่อแสดงตัวเลขจริง',
          en: 'Explain our premium risk reduction & 15-20% avg profit boost, then offer a 15-min demo to present actual ROI figures.'
        },
        isCorrect: true,
        score: 10,
        explanation: {
          th: 'ยอดเยี่ยม! การเชื่อมโยงราคาไปที่ ROI และขอนัดหมายตรงจุดช่วยสร้างความน่าเชื่อถือโดยไม่ต้องลดราคา',
          en: 'Excellent! Reframing price into ROI builds credibility and secures the meeting without unapproved discounts.'
        }
      },
      {
        id: 'B',
        text: {
          th: 'ลดราคาให้ทันที 20% หากลูกค้าตกลงตัดสินใจวันนี้',
          en: 'Offer an immediate 20% discount if the customer agrees to sign today.'
        },
        isCorrect: false,
        score: 4,
        explanation: {
          th: 'ไม่แนะนำ การลดราคาทันทีทำให้ลูกค้ารู้สึกว่าผลิตภัณฑ์ตั้งราคาเกินจริงและลดทอนมูลค่าแบรนด์',
          en: 'Not recommended. Instant discounting erodes brand value and implies inflated pricing.'
        }
      },
      {
        id: 'C',
        text: {
          th: 'บอกลูกค้าว่าคู่แข่งคุณภาพแย่กว่าและไม่มีมาตรฐาน',
          en: 'Tell the customer that competitors offer poor quality and low standards.'
        },
        isCorrect: false,
        score: 2,
        explanation: {
          th: 'การโจมตีคู่แข่งสร้างความรู้สึกติดลบและทำให้ภาพลักษณ์พนักงานขายดูไม่เป็นมืออาชีพ',
          en: 'Attacking competitors creates a negative impression and looks unprofessional.'
        }
      },
      {
        id: 'D',
        text: {
          th: 'บอกลูกค้าว่าราคานี้เป็นราคากลาง เปลี่ยนแปลงไม่ได้ ถ้าไม่ไหวแนะนำให้ดูที่อื่น',
          en: 'State that pricing is fixed and suggest they look elsewhere if they cannot afford it.'
        },
        isCorrect: false,
        score: 0,
        explanation: {
          th: 'ปฏิเสธโอกาสการขายและขับไล่ลูกค้าอย่างรุนแรง',
          en: 'Dismisses the sales opportunity and turns away the prospect.'
        }
      }
    ]
  },
  {
    name: {
      th: 'ผู้บริหารไม่มีเวลาฟังสคริปต์ยาว',
      en: 'The Impatient Executive Pitch'
    },
    difficulty: 'intermediate',
    passThreshold: 75,
    customerPersona: {
      th: 'คุณอนันต์ CEO บริษัทเติบโตเร็ว เกลียดการฟังบทพูดขายยาวๆ ต้องการสรุปผลลัพธ์ใน 1 นาที',
      en: 'Khun Ananda, fast-scaling CEO who hates long pitches and demands bottom-line facts in 1 minute.'
    },
    initialMood: {
      th: 'รีบร้อนและตรงไปตรงมา',
      en: 'Impatient and direct'
    },
    objective: {
      th: 'นำเสนอ Elevator Pitch กระชับและล็อคเวลานัดหมาย 15 นาที',
      en: 'Deliver concise elevator pitch and secure a 15-minute briefing slot.'
    },
    situation: {
      th: '"ผมมีเวลาแค่ 1 นาที พูดเข้าประเด็นเลยว่าระบบคุณช่วยบริษัทผมยังไง?"',
      en: '"I only have 1 minute. Get straight to the point—how does your system help my company?"'
    },
    required: true,
    isActive: true,
    choices: [
      {
        id: 'A',
        text: {
          th: 'สรุปผลลัพธ์หลักใน 2 ประโยค: "เราช่วยลดเวลาทำงานทีมขาย 40% และเพิ่มยอดปิดการขาย 25% ครับ ขอเวลา 15 นาทีสัปดาห์หน้าเปิดเคสตัวอย่างให้ดู"',
          en: 'Summarize core results in 2 sentences: "We cut sales team admin time by 40% and boost closing rates by 25%. Can I get 15 mins next week to present a case study?"'
        },
        isCorrect: true,
        score: 10,
        explanation: {
          th: 'ตรงเป้าหมาย! เคารพเวลาผู้บริหารและใช้สถิติตัวเลขชัดเจน',
          en: 'Bullseye! Respects executive time constraints and leverages compelling metrics.'
        }
      },
      {
        id: 'B',
        text: {
          th: 'เริ่มอ่านประวัติบริษัทและความสำเร็จตั้งแต่ก่อตั้งเมื่อ 5 ปีก่อน',
          en: 'Begin reading company history and milestones from 5 years ago.'
        },
        isCorrect: false,
        score: 2,
        explanation: {
          th: 'ผู้บริหารจะวางสายทันทีเพราะเสียเวลา',
          en: 'The executive will hang up immediately due to wasted time.'
        }
      },
      {
        id: 'C',
        text: {
          th: 'ขอส่งสไลด์ 50 หน้าไปให้ทางอีเมลอ่านเอง',
          en: 'Offer to send a 50-page presentation slide deck via email.'
        },
        isCorrect: false,
        score: 5,
        explanation: {
          th: 'ผู้บริหารที่ยุ่งมากแทบไม่มีเวลาเปิดอ่านสไลด์ยาวๆ โดยไม่มีการสรุป',
          en: 'Busy executives rarely read unrequested 50-page slide decks.'
        }
      },
      {
        id: 'D',
        text: {
          th: 'ถามผู้บริหารกลับว่าทำไมถึงมีเวลาให้น้อยขนาดนี้',
          en: 'Ask the executive why they have so little time for a call.'
        },
        isCorrect: false,
        score: 0,
        explanation: {
          th: 'สร้างความขุ่นเคืองและเสียมารยาทในการสื่อสาร',
          en: 'Offensive and rude response.'
        }
      }
    ]
  }
];
