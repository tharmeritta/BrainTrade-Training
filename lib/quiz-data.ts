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
  passThreshold?: number; // override global 0.7 default
}

// ─── Certification Quiz: Part 1 — Ecosystem & Journey ────────────────────────
const CERT_PART1: QuestionData[] = [
  {
    phase: 0,
    en: 'What is the most accurate description of BrainTrade?',
    th: 'คำอธิบายใดถูกต้องที่สุดเกี่ยวกับ BrainTrade?',
    type: 'mcq',
    options: {
      en: [
        'A regulated forex broker offering live trading accounts',
        'A complete trading education ecosystem combining learning, practice, and trading',
        'A standalone video course library for trading beginners',
        'A social trading network that connects professional traders',
      ],
      th: [
        'โบรกเกอร์ Forex ที่ได้รับใบอนุญาตซึ่งเปิดบัญชีเทรดจริงให้ผู้ใช้',
        'ระบบนิเวศการศึกษาด้านการเทรดแบบครบวงจร ที่รวมการเรียนรู้ การฝึกฝน และการเทรดไว้ในที่เดียว',
        'คลังวิดีโอคอร์สสำหรับนักเทรดมือใหม่เพียงอย่างเดียว',
        'เครือข่าย Social Trading ที่เชื่อมต่อนักเทรดมืออาชีพทั่วโลก',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'BrainTrade is NOT a broker. It is a full trading education ecosystem covering Learning (courses/eBooks), Practice (coach/AI), and Trading (broker integration) — all in one platform.',
      th: 'BrainTrade ไม่ใช่โบรกเกอร์ แต่เป็นระบบนิเวศการศึกษาด้านการเทรดแบบครบวงจร ที่รวม 3 เสาหลักไว้ด้วยกัน ได้แก่ เรียนรู้ (คอร์ส/eBooks), ฝึกฝน (โค้ช/AI) และเทรดจริง (เชื่อมต่อโบรกเกอร์) ทั้งหมดในแพลตฟอร์มเดียว',
    },
  },
  {
    phase: 0,
    en: "Which of the following is NOT part of BrainTrade's three core pillars?",
    th: 'ข้อใดไม่ใช่หนึ่งในสามเสาหลักของ BrainTrade?',
    type: 'mcq',
    options: {
      en: [
        'Learn — structured video courses and eBooks',
        'Manage — portfolio management and tax reporting',
        'Practice — personal coach and AI market analysis',
        'Trade — sync with a trusted broker to execute real trades',
      ],
      th: [
        'เรียนรู้ — คอร์สวิดีโอและ eBooks ที่มีโครงสร้างชัดเจน',
        'จัดการ — รายงานการจัดการพอร์ตและภาษีการลงทุน',
        'ฝึกฝน — โค้ชส่วนตัวและการวิเคราะห์ตลาดด้วย AI',
        'เทรดจริง — เชื่อมต่อโบรกเกอร์ที่เชื่อถือได้เพื่อเปิดออเดอร์จริง',
      ],
    },
    correctIdx: 1,
    explain: {
      en: "BrainTrade's three pillars are Learn, Practice, and Trade. 'Manage' (portfolio management/tax reporting) is not part of the platform.",
      th: "สามเสาหลักของ BrainTrade คือ เรียนรู้, ฝึกฝน และเทรดจริง ไม่มีเสาหลักชื่อว่า 'จัดการ' (การจัดการพอร์ต/ภาษี) ในแพลตฟอร์ม",
    },
  },
  {
    phase: 0,
    en: "A prospect asks: 'Do I need trading experience to join BrainTrade?' — What is the correct response?",
    th: "ลูกค้าถามว่า 'ต้องมีประสบการณ์เทรดก่อนไหม?' — ควรตอบอย่างไร?",
    type: 'mcq',
    options: {
      en: [
        'Yes, a minimum of 6 months of trading experience is required',
        'No, BrainTrade is designed for complete beginners and includes a coach from day one',
        'Only if you purchase the Advanced package or higher',
        'Experience is not required, but you must pass an entry assessment first',
      ],
      th: [
        'ใช่ ต้องมีประสบการณ์เทรดอย่างน้อย 6 เดือน',
        'ไม่จำเป็นเลย BrainTrade ออกแบบมาสำหรับมือใหม่สมบูรณ์ และมีโค้ชดูแลตั้งแต่วันแรก',
        'ไม่จำเป็น แต่ใช้ได้เฉพาะแพ็คเกจระดับแอดวานซ์ขึ้นไปเท่านั้น',
        'ไม่จำเป็น แต่ต้องผ่านการทดสอบก่อนเริ่มใช้งาน',
      ],
    },
    correctIdx: 1,
    explain: {
      en: "BrainTrade explicitly states 'no prior experience needed.' The platform starts from absolute zero and provides a personal coach to guide every client from day one.",
      th: "BrainTrade ระบุชัดเจนว่า 'ไม่ต้องมีประสบการณ์มาก่อน' แพลตฟอร์มเริ่มต้นจากพื้นฐานศูนย์ และมีโค้ชส่วนตัวพาทำตั้งแต่วันแรก",
    },
  },
  {
    phase: 0,
    en: 'BrainTrade is registered under which legal entity?',
    th: 'BrainTrade จดทะเบียนภายใต้นิติบุคคลใด?',
    type: 'mcq',
    options: {
      en: [
        'BrainTrade Holdings PLC, registered in the United Kingdom',
        'BT NEXUS LIMITED, registered in Seychelles',
        'BrainTrade Asia Co., Ltd., registered in Thailand',
        'Global Academy Corp, registered in Cyprus',
      ],
      th: [
        'BrainTrade Holdings PLC จดทะเบียนในสหราชอาณาจักร',
        'BT NEXUS LIMITED จดทะเบียนในเซเชลส์',
        'BrainTrade Asia Co., Ltd. จดทะเบียนในประเทศไทย',
        'Global Academy Corp จดทะเบียนในไซปรัส',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'BrainTrade operates under BT NEXUS LIMITED, registered in Seychelles. This is the official legal entity behind the platform.',
      th: 'BrainTrade ดำเนินงานภายใต้ BT NEXUS LIMITED ซึ่งจดทะเบียนในเซเชลส์ นี่คือนิติบุคคลอย่างเป็นทางการของแพลตฟอร์ม',
    },
  },
  {
    phase: 0,
    en: 'Which statement best differentiates BrainTrade from a typical online course marketplace?',
    th: 'ข้อใดอธิบายความแตกต่างระหว่าง BrainTrade กับแพลตฟอร์มคอร์สออนไลน์ทั่วไปได้ดีที่สุด?',
    type: 'mcq',
    options: {
      en: [
        'BrainTrade offers a wider variety of unrelated courses across multiple industries',
        'BrainTrade provides a personal human coach, AI tools, real-time signals, and broker integration — all in one platform',
        'BrainTrade charges lower prices than any competitor on the market',
        'BrainTrade issues certificates of completion recognized by financial regulators',
      ],
      th: [
        'BrainTrade มีคอร์สหลากหลายครอบคลุมหลายสาขาวิชา ไม่ใช่แค่การเทรด',
        'BrainTrade มีโค้ชส่วนตัว AI เครื่องมือวิเคราะห์ สัญญาณตลาด และการเชื่อมต่อโบรกเกอร์ ทั้งหมดในแพลตฟอร์มเดียว',
        'BrainTrade ตั้งราคาต่ำกว่าคู่แข่งทุกรายในตลาด',
        'BrainTrade ออกใบรับรองที่หน่วยงานกำกับดูแลทางการเงินรับรอง',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'The key differentiator is the ecosystem: structured courses + personal coach + AI ExtraBrain + market signals + broker integration in a single platform — not just videos.',
      th: 'จุดต่างสำคัญคือระบบนิเวศครบวงจร: คอร์ส + โค้ชส่วนตัว + AI ExtraBrain + สัญญาณตลาด + เชื่อมต่อโบรกเกอร์ ในแพลตฟอร์มเดียว — ไม่ใช่แค่วิดีโอ',
    },
  },
  {
    phase: 0,
    en: "What is the primary focus of a client's FIRST month on BrainTrade?",
    th: 'เดือนแรกของการใช้ BrainTrade ลูกค้าควรมุ่งเน้นสิ่งใดเป็นหลัก?',
    type: 'mcq',
    options: {
      en: [
        'Executing live trades independently with minimal coach contact',
        'Building a foundation through structured learning and receiving continuous coach feedback',
        'Connecting their broker account and activating Copy Trading signals',
        'Completing an advanced certification exam before proceeding',
      ],
      th: [
        'เปิดออเดอร์เทรดจริงโดยอิสระโดยไม่ต้องติดต่อโค้ช',
        'สร้างพื้นฐานความรู้ผ่านการเรียนอย่างมีโครงสร้างและรับ Feedback จากโค้ชอย่างต่อเนื่อง',
        'เชื่อมต่อบัญชีโบรกเกอร์และเปิดใช้งาน Copy Trading ทันที',
        'สอบผ่านข้อสอบรับรองก่อนจึงเข้าสู่โมดูลถัดไป',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'Month 1 is dedicated to Learn & Practice: building trading foundations, working through structured video courses, and receiving continuous feedback from the personal coach.',
      th: 'เดือนที่ 1 คือระยะ \'เรียนรู้และฝึกฝน\' — สร้างพื้นฐานการเทรด เรียนคอร์สที่มีโครงสร้าง และรับ Feedback จากโค้ชส่วนตัวอย่างต่อเนื่อง',
    },
  },
  {
    phase: 0,
    en: 'In the second month of BrainTrade, a client is expected to:',
    th: 'ในเดือนที่สองของ BrainTrade ลูกค้าคาดว่าจะทำสิ่งใด?',
    type: 'mcq',
    options: {
      en: [
        'Repeat all beginner courses from month one before advancing',
        'Begin trading independently with confidence while using signals and broker sync',
        'Take a written exam to qualify for the advanced modules',
        'Contact their coach daily for approval before placing any trade',
      ],
      th: [
        'ทบทวนคอร์สพื้นฐานเดือนแรกซ้ำอีกครั้งก่อนก้าวหน้า',
        'เริ่มเทรดอย่างอิสระด้วยความมั่นใจ พร้อมใช้สัญญาณตลาดและเชื่อมต่อโบรกเกอร์',
        'สอบข้อเขียนเพื่อผ่านคุณสมบัติก่อนเข้าโมดูลขั้นสูง',
        'ติดต่อโค้ชทุกวันเพื่อขออนุมัติก่อนเปิดออเดอร์',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'Month 2 is Grow & Trade — clients move from learning mode to trading independently, using real-time signals, Copy Trading, and their synced broker account.',
      th: 'เดือนที่ 2 คือระยะ \'เติบโตและเทรดจริง\' — ลูกค้าเคลื่อนจากการเรียนสู่การเทรดอิสระ ใช้สัญญาณ Real-time Copy Trading และบัญชีโบรกเกอร์ที่ซิงค์แล้ว',
    },
  },
  {
    phase: 0,
    en: 'Which phrase best summarizes the 60-Day Journey for use in a client pitch?',
    th: 'ประโยคใดสรุป Journey 60 วัน ได้ดีที่สุดสำหรับใช้ Pitch ลูกค้า?',
    type: 'mcq',
    options: {
      en: [
        "'Learn everything there is to know about trading in two months'",
        "'BrainTrade takes clients from complete beginner to confident real trader in 60 days'",
        "'Sixty days of theory that prepares you to open a broker account on your own'",
        "'A self-paced program with no deadlines or structured path'",
      ],
      th: [
        "'เรียนรู้ทุกอย่างเกี่ยวกับการเทรดภายในสองเดือน'",
        "'BrainTrade พาลูกค้าจากมือใหม่สมบูรณ์ไปสู่เทรดเดอร์ที่มั่นใจได้จริงใน 60 วัน'",
        "'หกสิบวันของทฤษฎีที่เตรียมพร้อมให้คุณเปิดบัญชีโบรกเกอร์เอง'",
        "'โปรแกรมแบบ Self-pace ไม่มีเส้นทางที่กำหนดไว้ล่วงหน้า'",
      ],
    },
    correctIdx: 1,
    explain: {
      en: "The approved key message for the 60-Day Journey pitch is: 'BrainTrade takes clients from complete beginner to confident real trader in 60 days.' This is a specific pitch-ready phrase.",
      th: "ประโยค Key Message สำหรับ Pitch: 'BrainTrade พาลูกค้าจากมือใหม่สมบูรณ์ไปสู่เทรดเดอร์ที่มั่นใจได้จริงใน 60 วัน' — นี่คือประโยคที่ได้รับการอนุมัติให้ใช้ในการขาย",
    },
  },
  {
    phase: 0,
    en: 'A client says they want to trade immediately without going through the learning phase. What is the best response?',
    th: 'ลูกค้าบอกว่าอยากเทรดทันทีโดยไม่ผ่านขั้นตอนการเรียน ควรตอบสนองอย่างไร?',
    type: 'mcq',
    options: {
      en: [
        'Agree and activate their Copy Trading signals right away without onboarding',
        'Explain that the 60-day structure is designed to build confidence first — rushing can lead to preventable losses',
        'Transfer them directly to the broker partner without BrainTrade involvement',
        'Offer a refund since the platform is not suitable for experienced traders',
      ],
      th: [
        'ยินดีและเปิดใช้งาน Copy Trading ทันทีโดยไม่ต้องเริ่มต้น',
        'อธิบายว่าโครงสร้าง 60 วันออกแบบมาเพื่อสร้างความมั่นใจก่อน การรีบข้ามขั้นตอนอาจนำไปสู่การขาดทุนที่หลีกเลี่ยงได้',
        'โอนลูกค้าไปยังพาร์ทเนอร์โบรกเกอร์โดยตรงโดยไม่เกี่ยวกับ BrainTrade',
        'คืนเงินเพราะแพลตฟอร์มไม่เหมาะกับนักเทรดที่มีประสบการณ์',
      ],
    },
    correctIdx: 1,
    explain: {
      en: "The structured 60-day journey is BrainTrade's core value proposition. Skipping it removes the learning safety net. The coach guides this transition progressively for best outcomes.",
      th: 'Journey 60 วัน คือคุณค่าหลักของ BrainTrade การข้ามขั้นตอนนำไปสู่ความเสี่ยงที่ป้องกันได้ โค้ชจะนำทางการเปลี่ยนผ่านนี้อย่างค่อยเป็นค่อยไปเพื่อผลลัพธ์ที่ดีที่สุด',
    },
  },
];

// ─── Certification Quiz: Part 2 — Features & Pricing ────────────────────────
const CERT_PART2: QuestionData[] = [
  {
    phase: 1,
    en: 'Which BrainTrade feature is described as the PRIMARY selling point and strongest differentiator?',
    th: "ฟีเจอร์ใดของ BrainTrade ถูกกำหนดให้เป็น 'จุดขายหลัก' ที่โดดเด่นที่สุด?",
    type: 'mcq',
    options: {
      en: [
        'AI ExtraBrain market analysis tool',
        'Real-time market signals with Copy Trading',
        'Personal Coach — 1-on-1 human mentorship',
        'Live Campus weekly webinars',
      ],
      th: [
        'เครื่องมือวิเคราะห์ตลาด AI ExtraBrain',
        'สัญญาณตลาด Real-time พร้อม Copy Trading',
        'โค้ชส่วนตัว — การดูแลแบบ 1 ต่อ 1 จากมนุษย์จริงๆ',
        'Live Campus ประจำสัปดาห์',
      ],
    },
    correctIdx: 2,
    explain: {
      en: "The Personal Coach 1-on-1 is designated as the primary selling point. It's the feature no competitor truly replicates — a real human who knows the client's goals and provides real-time support.",
      th: 'โค้ชส่วนตัว 1:1 คือจุดขายหลักที่กำหนดไว้ ไม่มีคู่แข่งรายใดสามารถเลียนแบบได้จริงๆ — มนุษย์จริงที่รู้จักเป้าหมายของลูกค้าและให้การสนับสนุน Real-time',
    },
  },
  {
    phase: 1,
    en: 'What does the AI ExtraBrain tool do?',
    th: 'AI ExtraBrain ทำหน้าที่อะไร?',
    type: 'mcq',
    options: {
      en: [
        'It automatically places trades on behalf of the client without human intervention',
        'It analyzes market data in real-time, highlights patterns, and identifies key risk reference zones',
        'It sends daily SMS alerts about breaking financial news to subscribed clients',
        'It generates personalized trading certificates after completing each course module',
      ],
      th: [
        'เปิดออเดอร์เทรดอัตโนมัติแทนลูกค้าโดยไม่ต้องมีการแทรกแซงจากมนุษย์',
        'วิเคราะห์ข้อมูลตลาด Real-time ชี้รูปแบบที่น่าสนใจ และระบุพื้นที่อ้างอิงความเสี่ยง',
        'ส่ง SMS แจ้งข่าวการเงินสำคัญรายวันให้ผู้สมัคร',
        'ออกใบรับรองส่วนตัวหลังจบแต่ละโมดูลคอร์ส',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'AI ExtraBrain is an AI-powered market analysis assistant. It analyzes real-time data, highlights structural patterns, and identifies risk zones — helping clients understand market behavior, not trade automatically.',
      th: 'AI ExtraBrain คือผู้ช่วยวิเคราะห์ตลาดที่ขับเคลื่อนด้วย AI วิเคราะห์ข้อมูล Real-time ชี้รูปแบบเชิงโครงสร้าง และระบุจุดอ้างอิงความเสี่ยง — ช่วยให้ลูกค้าเข้าใจพฤติกรรมตลาด ไม่ใช่เปิดออเดอร์อัตโนมัติ',
    },
  },
  {
    phase: 1,
    en: 'What does the Live Campus feature include?',
    th: 'Live Campus ของ BrainTrade ประกอบด้วยอะไร?',
    type: 'mcq',
    options: {
      en: [
        'One-time orientation sessions held only during the first week of enrollment',
        'Weekly live webinars, market updates, and a full archive of past event replays',
        'Monthly printed newsletters mailed to all active subscribers',
        'A physical classroom in Bangkok open to local clients only',
      ],
      th: [
        'เซสชันปฐมนิเทศครั้งเดียวในสัปดาห์แรกของการสมัคร',
        'Webinar สดประจำสัปดาห์ อัปเดตตลาด และคลัง Replay ย้อนหลัง',
        'จดหมายข่าวรายเดือนที่จัดส่งทางไปรษณีย์ให้สมาชิก',
        'ห้องเรียนแบบกายภาพในกรุงเทพฯ สำหรับลูกค้าในประเทศไทยเท่านั้น',
      ],
    },
    correctIdx: 1,
    explain: {
      en: "Live Campus is BrainTrade's live event hub — it includes weekly webinars with real coaches, live market updates, pre-market kickoff sessions, and a replay archive for those who miss live sessions.",
      th: 'Live Campus คือศูนย์กลาง Live Events ของ BrainTrade — ประกอบด้วย Webinar สดรายสัปดาห์ เซสชันพรีมาร์เก็ต และคลัง Replay สำหรับผู้ที่ไม่สามารถเข้าร่วมสดได้',
    },
  },
  {
    phase: 1,
    en: 'A client asks what Copy Trading means. Which answer is correct?',
    th: 'ลูกค้าถามว่า Copy Trading คืออะไร — คำตอบใดถูกต้อง?',
    type: 'mcq',
    options: {
      en: [
        "Copying another trader's portfolio holdings into a spreadsheet for personal review",
        'Acting on real-time Buy/Sell signals from the platform to mirror recommended trades',
        'Duplicating your own trades automatically across multiple broker accounts',
        "Purchasing a pre-made trading strategy template from BrainTrade's marketplace",
      ],
      th: [
        'การคัดลอกพอร์ตโฟลิโอของนักเทรดคนอื่นลงในสเปรดชีต',
        'การทำตามสัญญาณ Buy/Sell ของแพลตฟอร์มเพื่อสะท้อนออเดอร์ที่แนะนำ',
        'การทำซ้ำออเดอร์ของตัวเองโดยอัตโนมัติในหลายบัญชีโบรกเกอร์',
        'การซื้อเทมเพลตกลยุทธ์สำเร็จรูปจาก BrainTrade Marketplace',
      ],
    },
    correctIdx: 1,
    explain: {
      en: "Copy Trading on BrainTrade means using the real-time market signals provided by the platform to mirror trade recommendations. It's ideal for beginners who want actionable guidance.",
      th: 'Copy Trading บน BrainTrade หมายถึงการใช้สัญญาณ Buy/Sell Real-time ที่แพลตฟอร์มให้มาเพื่อทำตามคำแนะนำออเดอร์ — เหมาะสำหรับมือใหม่ที่ต้องการแนวทางที่นำปฏิบัติได้',
    },
  },
  {
    phase: 1,
    en: 'How many video courses are included in the BrainTrade Academy?',
    th: 'BrainTrade Academy มีวิดีโอคอร์สทั้งหมดกี่หัวข้อ?',
    type: 'mcq',
    options: {
      en: ['8', '10', '15', '20'],
      th: ['8', '10', '15', '20'],
    },
    correctIdx: 2,
    explain: {
      en: 'BrainTrade\'s Academy includes 15 video courses covering everything from trading history and fundamentals to technical analysis, crypto, Fibonacci, advanced trading, and expert-level content.',
      th: 'BrainTrade Academy มีคอร์สวิดีโอ 15 หัวข้อ ครอบคลุมตั้งแต่ประวัติการเทรด พื้นฐาน การวิเคราะห์เทคนิค คริปโต ฟีโบนัชชี การเทรดขั้นสูง ไปจนถึงระดับผู้เชี่ยวชาญ',
    },
  },
  {
    phase: 1,
    en: 'Which of the following Market Scanner tools is available in BrainTrade?',
    th: 'Market Scanner ชนิดใดมีอยู่ใน BrainTrade?',
    type: 'mcq',
    options: {
      en: [
        'Dividend Reinvestment Scanner',
        'Momentum Breakout Scanner',
        'Earnings Surprise Detector',
        'IPO Opportunity Tracker',
      ],
      th: [
        'Dividend Reinvestment Scanner',
        'Momentum Breakout Scanner',
        'Earnings Surprise Detector',
        'IPO Opportunity Tracker',
      ],
    },
    correctIdx: 1,
    explain: {
      en: "BrainTrade's Market Scanners include: Trend Scanner, Momentum Breakout Scanner, Pivot Reversal Scanner, and Dynamic Balance Scanner. Dividend and IPO scanners are not part of the platform.",
      th: 'BrainTrade มี Market Scanners: Trend Scanner, Momentum Breakout Scanner, Pivot Reversal Scanner และ Dynamic Balance Scanner — ไม่มี Dividend หรือ IPO Scanners',
    },
  },
  {
    phase: 1,
    en: 'How many pricing packages does BrainTrade currently offer?',
    th: 'BrainTrade มีแพ็คเกจทั้งหมดกี่แพ็คเกจ?',
    type: 'mcq',
    options: {
      en: ['4', '5', '6', '8'],
      th: ['4', '5', '6', '8'],
    },
    correctIdx: 2,
    explain: {
      en: 'BrainTrade offers exactly 6 packages: Novice, Starter, Intermediate, Advanced, Expert, and Professional.',
      th: 'BrainTrade มี 6 แพ็คเกจ ได้แก่: มือใหม่, ผู้เริ่มต้น, ระดับกลาง, ระดับสูง, ระดับแอดวานซ์ และผู้เชี่ยวชาญ',
    },
  },
  {
    phase: 1,
    en: 'What is the current selling price of the Novice package?',
    th: "ราคาขายปัจจุบันของแพ็คเกจ 'มือใหม่' คือเท่าใด?",
    type: 'mcq',
    options: {
      en: ['$159', '$129', '$100', '$75'],
      th: ['159 USD', '129 USD', '100 USD', '75 USD'],
    },
    correctIdx: 2,
    explain: {
      en: 'The Novice package has a regular price of $159 and a current special selling price of $100 — a saving of $59. Duration: 1 month.',
      th: 'แพ็คเกจมือใหม่มีราคาปกติ $159 และราคาพิเศษปัจจุบันคือ $100 — ประหยัด $59 ระยะเวลา 1 เดือน',
    },
  },
  {
    phase: 1,
    en: 'A client wants 9 months of coaching support. Which package should you recommend?',
    th: 'ลูกค้าต้องการรับการสนับสนุนจากโค้ชเป็นเวลา 9 เดือน ควรแนะนำแพ็คเกจใด?',
    type: 'mcq',
    options: {
      en: ['Advanced ($1,000)', 'Expert ($2,000)', 'Intermediate ($500)', 'Professional ($3,000)'],
      th: ['ระดับสูง (1,000 USD)', 'ระดับแอดวานซ์ (2,000 USD)', 'ระดับกลาง (500 USD)', 'ผู้เชี่ยวชาญ (3,000 USD)'],
    },
    correctIdx: 1,
    explain: {
      en: 'The Expert package provides 9 months of access at $2,000 (regular $2,999) with 80 AI questions/month. This is the only package with exactly a 9-month duration.',
      th: 'แพ็คเกจระดับแอดวานซ์ให้การเข้าถึง 9 เดือนในราคา $2,000 (ปกติ $2,999) พร้อม AI 80 คำถาม/เดือน — เป็นแพ็คเกจเดียวที่มีระยะเวลา 9 เดือนพอดี',
    },
  },
  {
    phase: 1,
    en: 'How many AI ExtraBrain questions per month does the Intermediate package include?',
    th: "แพ็คเกจ 'ระดับกลาง' มีโควต้า AI ExtraBrain กี่คำถามต่อเดือน?",
    type: 'mcq',
    options: {
      en: ['20', '30', '40', '60'],
      th: ['20', '30', '40', '60'],
    },
    correctIdx: 2,
    explain: {
      en: 'The Intermediate package (3 months, $500) includes 40 AI ExtraBrain questions per month. Novice and Starter include 20/month; Advanced has 60/month.',
      th: 'แพ็คเกจระดับกลาง (3 เดือน, $500) มี AI ExtraBrain 40 คำถาม/เดือน — มือใหม่และผู้เริ่มต้นได้ 20/เดือน; ระดับสูงได้ 60/เดือน',
    },
  },
  {
    phase: 1,
    en: 'Which features are included in EVERY BrainTrade package regardless of tier?',
    th: 'ฟีเจอร์ใดบ้างที่รวมอยู่ในทุกแพ็คเกจ BrainTrade โดยไม่มีข้อยกเว้น?',
    type: 'mcq',
    options: {
      en: [
        'Personal Coach, AI ExtraBrain, Live Campus, Market Signals, and all Courses',
        'Personal Coach and AI ExtraBrain only — Signals and Campus are premium add-ons',
        'Only courses and eBooks — all other features require separate purchase',
        'Personal Coach and Live Campus only — AI requires the Intermediate tier or above',
      ],
      th: [
        'โค้ชส่วนตัว, AI ExtraBrain, Live Campus, สัญญาณตลาด และคอร์สทั้งหมด',
        'เฉพาะโค้ชส่วนตัวและ AI ExtraBrain — สัญญาณและ Campus ต้องซื้อเพิ่ม',
        'เฉพาะคอร์สและ eBooks — ฟีเจอร์อื่นต้องซื้อแยกต่างหาก',
        'โค้ชส่วนตัวและ Live Campus เท่านั้น — AI ต้องการแพ็คเกจระดับกลางขึ้นไป',
      ],
    },
    correctIdx: 0,
    explain: {
      en: 'Every BrainTrade package — even Novice at $100 — includes the full suite: Personal Coach, AI ExtraBrain, Live Campus, Market Signals with Copy Trading, all video courses, and all eBooks.',
      th: 'ทุกแพ็คเกจ BrainTrade — แม้แต่มือใหม่ $100 — รวมทุกอย่าง: โค้ชส่วนตัว, AI ExtraBrain, Live Campus, สัญญาณตลาดพร้อม Copy Trading, คอร์สวิดีโอทั้งหมด และ eBooks ทั้งหมด',
    },
  },
  {
    phase: 1,
    en: 'A client is comparing Novice ($100/1 month) vs. Starter ($200/2 months). What is the best upsell argument?',
    th: 'ลูกค้าเปรียบเทียบแพ็ค มือใหม่ ($100/1 เดือน) กับ ผู้เริ่มต้น ($200/2 เดือน) — ข้อโต้แย้งในการ Upsell ที่ดีที่สุดคืออะไร?',
    type: 'mcq',
    options: {
      en: [
        'The Starter package includes more video courses not available in Novice',
        'Starter gives twice the coaching time for only $100 more — better value per month',
        'The Starter package has a higher AI quota of 40 questions per month',
        'Starter includes Copy Trading access while Novice does not',
      ],
      th: [
        'ผู้เริ่มต้นมีคอร์สวิดีโอเพิ่มเติมที่ไม่มีในมือใหม่',
        'ผู้เริ่มต้นให้เวลาโค้ชเป็นสองเท่าในราคาเพิ่มเพียง $100 — คุ้มค่ากว่าต่อเดือน',
        'ผู้เริ่มต้นมีโควต้า AI สูงกว่าถึง 40 คำถามต่อเดือน',
        'ผู้เริ่มต้นรวม Copy Trading ในขณะที่มือใหม่ไม่มี',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'The strongest upsell from Novice to Starter is value per month: double the coaching duration (2 months vs 1) for only $100 more — the AI quota remains the same (20/month for both).',
      th: 'การ Upsell ที่แข็งแกร่งที่สุดจากมือใหม่ไปผู้เริ่มต้นคือความคุ้มค่าต่อเดือน: ระยะเวลาโค้ชเพิ่มสองเท่า (2 เดือน vs 1 เดือน) ในราคาเพิ่มเพียง $100 — โควต้า AI ยังเท่ากัน (20/เดือน)',
    },
  },
];

// ─── Certification Quiz: Part 3 — Sales Process & Handling ──────────────────
const CERT_PART3: QuestionData[] = [
  {
    phase: 2,
    en: 'What is the CORRECT sequence of the BrainTrade 5-step call flow?',
    th: 'ลำดับขั้นตอน Call Flow 5 ขั้นตอนของ BrainTrade ที่ถูกต้องคือข้อใด?',
    type: 'mcq',
    options: {
      en: [
        'Open → Present → Discover → Close → Follow Up',
        'Open → Discover → Present → Close → Follow Up',
        'Discover → Open → Present → Follow Up → Close',
        'Present → Open → Discover → Close → Follow Up',
      ],
      th: [
        'ทักทาย → นำเสนอ → ค้นหา → ปิดการขาย → ติดตาม',
        'ทักทาย → ค้นหา → นำเสนอ → ปิดการขาย → ติดตาม',
        'ค้นหา → ทักทาย → นำเสนอ → ติดตาม → ปิดการขาย',
        'นำเสนอ → ทักทาย → ค้นหา → ปิดการขาย → ติดตาม',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'The correct sequence is: (1) Open/Greet → (2) Discover/Qualify → (3) Present/Pitch → (4) Close/Convert → (5) Follow Up/Retain. Discovering Pain Points before presenting is critical.',
      th: 'ลำดับที่ถูกต้องคือ: (1) ทักทาย → (2) ค้นหา/คัดกรอง → (3) นำเสนอ → (4) ปิดการขาย → (5) ติดตาม — การค้นหา Pain Point ก่อนนำเสนอเป็นสิ่งสำคัญมาก',
    },
  },
  {
    phase: 2,
    en: 'During the Opening step, how much time should you ask the client for?',
    th: 'ในขั้นตอนการทักทาย ควรขอเวลาจากลูกค้าเท่าไหร่?',
    type: 'mcq',
    options: {
      en: ['10 minutes', '5 minutes', '3 minutes', '1 minute'],
      th: ['10 นาที', '5 นาที', '3 นาที', '1 นาที'],
    },
    correctIdx: 2,
    explain: {
      en: "The standard opening script asks for '3 minutes' — short enough to not seem threatening, long enough to get through the initial pitch and gauge interest.",
      th: "สคริปต์การทักทายมาตรฐานขอเวลา '3 นาที' — สั้นพอที่จะไม่ดูน่ากลัว แต่นานพอที่จะผ่าน Pitch เบื้องต้นและวัดความสนใจได้",
    },
  },
  {
    phase: 2,
    en: 'What is the PRIMARY goal of the Discover/Qualify step?',
    th: "เป้าหมายหลักของขั้นตอน 'ค้นหา/คัดกรอง' คืออะไร?",
    type: 'mcq',
    options: {
      en: [
        'To immediately quote the price and create urgency before the client can object',
        'To introduce all 6 packages and ask which one the client prefers',
        "To uncover the client's Pain Points and level of trading experience",
        "To confirm the client's billing address and payment method",
      ],
      th: [
        'เสนอราคาทันทีและสร้างความเร่งด่วนก่อนที่ลูกค้าจะค้านได้',
        'แนะนำแพ็คเกจทั้ง 6 ตัวและถามว่าลูกค้าชอบแบบไหน',
        'เข้าใจ Pain Point และระดับประสบการณ์การเทรดของลูกค้า',
        'ยืนยันที่อยู่สำหรับออกใบแจ้งหนี้และวิธีการชำระเงิน',
      ],
    },
    correctIdx: 2,
    explain: {
      en: "The Discover step is about qualification: understanding the client's experience level (Beginner/Intermediate/Advanced), their goals, and their Pain Points — so you can present the most relevant solution.",
      th: 'ขั้นตอนค้นหาคือการคัดกรอง: เข้าใจระดับประสบการณ์ เป้าหมาย และ Pain Point — เพื่อนำเสนอสิ่งที่ตรงความต้องการที่สุด',
    },
  },
  {
    phase: 2,
    en: 'Which type of information should guide your presentation in the Present step?',
    th: 'ในขั้นตอนนำเสนอ ควรใช้ข้อมูลใดเป็นแนวทางในการพรีเซนต์?',
    type: 'mcq',
    options: {
      en: [
        'The most expensive package available, to maximize commission',
        "The client's Pain Points uncovered during the Discover step",
        'A standard script that is identical for every prospect',
        'The package with the lowest price to minimize objections',
      ],
      th: [
        'แพ็คเกจที่แพงที่สุดเสมอ เพื่อเพิ่มรายได้สูงสุด',
        'Pain Point ของลูกค้าที่ค้นพบในขั้นตอนค้นหา',
        'สคริปต์มาตรฐานเดิมที่ใช้กับทุก Prospect',
        'แพ็คเกจราคาต่ำที่สุด เพื่อลดการค้านราคา',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'Effective presenting means matching what you pitch to the Pain Points you discovered. If a client is afraid of losing money, lead with Risk Management and AI ExtraBrain. If they have no time, emphasize 24/7 access.',
      th: 'การนำเสนอที่มีประสิทธิภาพหมายถึงการจับคู่สิ่งที่ Pitch กับ Pain Point ที่ค้นพบ หากลูกค้ากลัวขาดทุน ให้นำเสนอ Risk Management และ AI ExtraBrain ก่อน',
    },
  },
  {
    phase: 2,
    en: 'What is the recommended follow-up timeframe if a client does not buy on the first call?',
    th: 'หากลูกค้าไม่ซื้อในการโทรครั้งแรก ควร Follow-up ภายในกี่ชั่วโมง?',
    type: 'mcq',
    options: {
      en: ['Within 1 week', 'Within 48 hours', 'Within 24 hours', 'Within 72 hours'],
      th: ['ภายใน 1 สัปดาห์', 'ภายใน 48 ชั่วโมง', 'ภายใน 24 ชั่วโมง', 'ภายใน 72 ชั่วโมง'],
    },
    correctIdx: 2,
    explain: {
      en: 'The standard follow-up rule is within 24 hours — no exceptions. Leads cool very quickly. A timely follow-up shows professionalism and keeps the client\'s interest alive.',
      th: 'กฎ Follow-up มาตรฐานคือภายใน 24 ชั่วโมง — ไม่มีข้อยกเว้น Leads เย็นตัวเร็วมาก การติดตามทันเวลาแสดงถึงความเป็นมืออาชีพและรักษาความสนใจของลูกค้า',
    },
  },
  {
    phase: 2,
    en: "A client says: 'It's too expensive.' Which response best follows the BrainTrade objection handling approach?",
    th: "ลูกค้าบอกว่า 'แพงเกินไป' — การตอบสนองใดสอดคล้องกับแนวทาง BrainTrade ที่ดีที่สุด?",
    type: 'mcq',
    options: {
      en: [
        'Immediately offer a further discount below the listed price to close the deal',
        "Remind them that the regular price is $159 and today's price is $100 — a $59 saving — and that one good trade can make it worthwhile",
        'Agree that the product is expensive and suggest they wait for a sale period',
        'Redirect to the cheapest package and avoid discussing value',
      ],
      th: [
        'เสนอส่วนลดเพิ่มเติมทันทีเพื่อปิดการขาย',
        'บอกว่าราคาปกติคือ 159 USD แต่ตอนนี้เหลือ 100 USD — ประหยัด 59 USD และโค้ชดูแลตลอด 1 เดือน ออเดอร์ดีๆ แค่ครั้งเดียวก็คุ้มแล้ว',
        'เห็นด้วยว่าสินค้าแพง และแนะนำให้รอโปรโมชันพิเศษ',
        'เปลี่ยนเป็นแพ็คเกจราคาต่ำที่สุดและหลีกเลี่ยงการพูดถึงคุณค่า',
      ],
    },
    correctIdx: 1,
    explain: {
      en: "The correct approach highlights the saving (regular $159 → now $100 = $59 off), reinforces value (personal coach all month), and uses ROI framing ('one good trade makes it worth it') — never offer unauthorized discounts.",
      th: "วิธีที่ถูกต้องคือเน้นการประหยัด (159 USD → 100 USD = ลด 59 USD) เสริมด้วยคุณค่า (โค้ชส่วนตัวตลอดเดือน) และใช้กรอบ ROI ('ออเดอร์ดีๆ แค่ครั้งเดียวก็คุ้มแล้ว') — ห้ามเสนอส่วนลดพิเศษนอกเหนือราคาที่กำหนด",
    },
  },
  {
    phase: 2,
    en: "A client says: 'I've tried online courses before and they didn't work.' What is the most effective response?",
    th: "ลูกค้าบอกว่า 'เคยลองคอร์สออนไลน์แล้วแต่ไม่ได้ผล' — การตอบสนองใดมีประสิทธิภาพมากที่สุด?",
    type: 'mcq',
    options: {
      en: [
        'Apologize and agree that most online courses are ineffective, including BrainTrade',
        'Explain that BrainTrade is different because of the 1-on-1 personal coach who provides real-time answers — not just passive video content',
        'Offer to send a free trial video and follow up in a week',
        'Suggest the client try a free YouTube channel first to assess their interest',
      ],
      th: [
        'ขอโทษและเห็นด้วยว่าคอร์สออนไลน์ส่วนใหญ่ไม่มีประสิทธิภาพ รวมถึง BrainTrade ด้วย',
        'อธิบายว่า BrainTrade แตกต่างเพราะมีโค้ชส่วนตัว 1:1 ที่ให้คำตอบแบบ Real-time — ไม่ใช่แค่คอนเทนต์วิดีโอทั่วไป',
        'เสนอให้ส่งวิดีโอทดลองฟรีและ Follow-up ในอาทิตย์หน้า',
        'แนะนำให้ลองดู YouTube ก่อนเพื่อประเมินความสนใจ',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'The key differentiator for this objection is the personal coach — a real human who answers questions in real time. Most courses are passive (watch and forget); BrainTrade is active and personalized.',
      th: 'จุดต่างสำคัญสำหรับข้อโต้แย้งนี้คือโค้ชส่วนตัว — มนุษย์จริงที่ตอบคำถาม Real-time คอร์สส่วนใหญ่เป็นแบบ Passive (ดูแล้วลืม) แต่ BrainTrade เป็น Active และเฉพาะบุคคล',
    },
  },
  {
    phase: 2,
    en: 'The Feel-Felt-Found technique starts with acknowledging the client\'s feelings. What comes SECOND?',
    th: 'เทคนิค Feel-Felt-Found เริ่มต้นด้วยการรับรู้ความรู้สึกของลูกค้า ขั้นตอนที่สองคืออะไร?',
    type: 'mcq',
    options: {
      en: [
        'Found — sharing what other clients discovered after using BrainTrade',
        'Felt — sharing that many other clients have felt the same way',
        'Fix — providing an immediate solution to their concern',
        'Follow — committing to follow up with more information',
      ],
      th: [
        'Found — แชร์ว่าลูกค้าคนอื่นค้นพบอะไรหลังใช้ BrainTrade',
        'Felt — แชร์ว่าลูกค้าคนอื่นมากมายก็เคยรู้สึกแบบเดียวกัน',
        'Fix — ให้วิธีแก้ปัญหาทันที',
        'Follow — สัญญาว่าจะ Follow-up พร้อมข้อมูลเพิ่มเติม',
      ],
    },
    correctIdx: 1,
    explain: {
      en: "The Feel-Felt-Found sequence is: (1) FEEL — 'I understand how you feel...', (2) FELT — 'Many clients felt exactly the same way...', (3) FOUND — 'But what they found after using BrainTrade was...'",
      th: "ลำดับ Feel-Felt-Found คือ: (1) FEEL — 'เข้าใจเลยครับว่าลูกค้ารู้สึก...', (2) FELT — 'ลูกค้าหลายคนก็เคยรู้สึกแบบเดียวกันครับ...', (3) FOUND — 'แต่สิ่งที่พวกเขาค้นพบหลังใช้ BrainTrade คือ...'",
    },
  },
  {
    phase: 2,
    en: "A client says: 'I don't have time to study.' Which response addresses this most effectively?",
    th: "ลูกค้าบอกว่า 'ไม่มีเวลาเรียน' — การตอบสนองใดแก้ไขข้อโต้แย้งนี้ได้ดีที่สุด?",
    type: 'mcq',
    options: {
      en: [
        'Suggest they wait until they have more free time before purchasing',
        "Explain that BrainTrade is 100% online and accessible 24/7 — even at 2am — and that the coach works around the client's schedule",
        'Offer to downgrade their package to a shorter duration to reduce the time commitment',
        'Recommend they hire a personal assistant to manage their study schedule',
      ],
      th: [
        'แนะนำให้รอจนกว่าจะมีเวลาว่างมากกว่านี้',
        'อธิบายว่า BrainTrade เป็นออนไลน์ 100% เข้าถึงได้ตลอด 24 ชม. แม้แต่ตี 2 และโค้ชก็ยืดหยุ่นตามเวลาของลูกค้า',
        'เสนอลดระยะเวลาแพ็คเกจลงเพื่อลดภาระ',
        'แนะนำให้จ้างผู้ช่วยส่วนตัวมาจัดการตารางเรียน',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'BrainTrade is fully online with no fixed class times. The platform and coach are flexible. Emphasizing 24/7 access and a coach who works around the client\'s schedule directly neutralizes the time objection.',
      th: 'BrainTrade เป็นออนไลน์ 100% ไม่มีเวลาเรียนที่กำหนดตายตัว แพลตฟอร์มและโค้ชมีความยืดหยุ่น การเน้นการเข้าถึง 24/7 และโค้ชที่ทำงานตามตารางของลูกค้า จะตอบข้อโต้แย้งเรื่องเวลาได้ตรงจุด',
    },
  },
  {
    phase: 2,
    en: "Which objection is best countered by highlighting BrainTrade's Risk Management curriculum and AI ExtraBrain?",
    th: 'ข้อโต้แย้งใดสามารถแก้ไขได้ดีที่สุดโดยเน้นหลักสูตร Risk Management และ AI ExtraBrain ของ BrainTrade?',
    type: 'mcq',
    options: {
      en: [
        "'It's too expensive'",
        "'I don't have time'",
        "'I'm afraid of losing money'",
        "'I've tried courses before and they didn't work'",
      ],
      th: ["'แพงเกินไป'", "'ไม่มีเวลา'", "'กลัวขาดทุน'", "'เคยลองคอร์สอื่นแล้วไม่ได้ผล'"],
    },
    correctIdx: 2,
    explain: {
      en: 'Fear of losing money is addressed by explaining that BrainTrade teaches Risk Management first and that AI ExtraBrain helps clients make data-informed decisions — not emotional guesses.',
      th: 'ความกลัวการขาดทุนจะถูกแก้ไขโดยการอธิบายว่า BrainTrade สอน Risk Management ก่อนเป็นอันดับแรก และ AI ExtraBrain ช่วยลูกค้าตัดสินใจโดยใช้ข้อมูล — ไม่ใช่อารมณ์หรือการเดาสุ่ม',
    },
  },
];

// ─── Certification Quiz: Part 4 — Social Proof & FAQ ────────────────────────
const CERT_PART4: QuestionData[] = [
  {
    phase: 3,
    en: 'When using client testimonials during a sales call, what is the most effective strategy?',
    th: 'เมื่อใช้คำรับรองจากลูกค้าระหว่างการโทรขาย กลยุทธ์ใดมีประสิทธิภาพสูงสุด?',
    type: 'mcq',
    options: {
      en: [
        'Always use the same testimonial for every call to maintain consistency',
        "Match the testimonial to the client's profile — e.g., use a nurse's story for busy clients with a time objection",
        'Start with the most dramatic story regardless of relevance to the prospect',
        'Avoid testimonials entirely as they may seem fabricated to skeptical clients',
      ],
      th: [
        'ใช้คำรับรองเดิมทุกครั้งเพื่อความสม่ำเสมอ',
        'เลือกคำรับรองที่ตรงกับ Profile ของลูกค้า — เช่น ใช้เรื่องพยาบาลสำหรับคนที่ไม่มีเวลา',
        'เริ่มด้วยเรื่องที่น่าประทับใจที่สุดโดยไม่คำนึงถึงความเกี่ยวข้อง',
        'หลีกเลี่ยงการใช้คำรับรองเพราะลูกค้าอาจรู้สึกว่าเป็นเรื่องแต่ง',
      ],
    },
    correctIdx: 1,
    explain: {
      en: "Testimonials are most powerful when they mirror the client's situation. If a client says they have no time, share the story of the nurse who works shifts. If they've tried courses before, share the marketer who found BrainTrade different.",
      th: 'คำรับรองมีพลังสูงสุดเมื่อสะท้อนสถานการณ์ของลูกค้า หากลูกค้าบอกว่าไม่มีเวลา ให้เล่าเรื่องพยาบาลที่ทำงานกะ หากเคยลองคอร์สอื่นแล้ว ให้เล่าเรื่องนักการตลาดที่รู้สึกว่า BrainTrade แตกต่าง',
    },
  },
  {
    phase: 3,
    en: 'According to BrainTrade\'s testimonials, what was the outcome that a software engineer experienced after 2 months?',
    th: 'ตามคำรับรองของ BrainTrade วิศวกรซอฟต์แวร์ได้ผลลัพธ์อะไรหลังใช้ BrainTrade 2 เดือน?',
    type: 'mcq',
    options: {
      en: [
        'He doubled his trading account balance in the first month',
        'He started trading with a system and discipline rather than emotions',
        'He became a full-time professional trader within 60 days',
        'He received a trading certification accepted by international banks',
      ],
      th: [
        'เพิ่มมูลค่าพอร์ตการลงทุนได้สองเท่าในเดือนแรก',
        'เริ่มเทรดด้วยระบบและวินัย ไม่ใช่อารมณ์อีกต่อไป',
        'กลายเป็นนักเทรดเต็มเวลาภายใน 60 วัน',
        'ได้รับใบรับรองการเทรดที่ธนาคารนานาชาติรับรอง',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'Gavin W. (Software Engineer) stated that within 2 months, he started trading with a system rather than emotions — thanks to the real 1-on-1 mentor that sets BrainTrade apart.',
      th: 'กวิน วัฒนกิจ (วิศวกรซอฟต์แวร์) กล่าวว่าภายใน 2 เดือน เขาเริ่มเทรดด้วยระบบแทนที่จะใช้อารมณ์ — เพราะเมนเทอร์จริงๆ ที่ทำให้ BrainTrade แตกต่างจากที่อื่น',
    },
  },
  {
    phase: 3,
    en: "A client asks: 'What payment methods does BrainTrade accept?' Which answer is correct?",
    th: "ลูกค้าถามว่า 'BrainTrade รับการชำระเงินด้วยอะไรได้บ้าง?' — คำตอบใดถูกต้อง?",
    type: 'mcq',
    options: {
      en: [
        'Only credit cards — no bank transfers or digital wallets',
        'Cash payments only through authorized resellers in Thailand',
        'Visa, Mastercard, international bank transfers, and select e-wallets — all with bank-grade encryption',
        'Cryptocurrency payments only, including Bitcoin and Ethereum',
      ],
      th: [
        'เฉพาะบัตรเครดิตเท่านั้น — ไม่รับโอนธนาคารหรือกระเป๋าเงินออนไลน์',
        'ชำระเงินสดผ่านตัวแทนที่ได้รับอนุญาตในประเทศไทยเท่านั้น',
        'Visa, Mastercard, โอนธนาคารระหว่างประเทศ และ E-wallet ที่คัดเลือก ทั้งหมดด้วยการเข้ารหัสระดับธนาคาร',
        'เฉพาะสกุลเงินดิจิทัลเท่านั้น รวมถึง Bitcoin และ Ethereum',
      ],
    },
    correctIdx: 2,
    explain: {
      en: 'BrainTrade accepts major credit/debit cards (Visa, Mastercard, Maestro), international bank transfers, Skrill, and other select e-wallets. All payments use bank-grade encryption for security.',
      th: 'BrainTrade รับบัตรเครดิต/เดบิตหลัก (Visa, Mastercard, Maestro) โอนธนาคารระหว่างประเทศ Skrill และ E-wallet ที่คัดเลือก ทุกการชำระเงินใช้การเข้ารหัสระดับธนาคาร',
    },
  },
  {
    phase: 3,
    en: 'Why should a client consider upgrading to a higher package?',
    th: 'เหตุใดลูกค้าจึงควรพิจารณาอัปเกรดแพ็คเกจที่สูงขึ้น?',
    type: 'mcq',
    options: {
      en: [
        'Higher packages unlock different video courses not available in lower tiers',
        'Higher packages provide more time, a higher AI ExtraBrain quota, and longer coaching support — building greater confidence and skill',
        'Higher packages come with a guaranteed profitable trading strategy',
        'Higher packages include a physical textbook shipped to the client\'s address',
      ],
      th: [
        'แพ็คเกจสูงกว่ามีคอร์สวิดีโอพิเศษที่ไม่มีในแพ็คเกจต่ำกว่า',
        'แพ็คเกจสูงกว่าให้เวลามากขึ้น โควต้า AI ExtraBrain มากขึ้น และการสนับสนุนจากโค้ชนานขึ้น — สร้างความมั่นใจและทักษะมากขึ้น',
        'แพ็คเกจสูงกว่ามีกลยุทธ์การเทรดที่รับประกันกำไร',
        'แพ็คเกจสูงกว่ารวมหนังสือเรียนที่จัดส่งให้ถึงบ้าน',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'Upgrading gives: more coaching time (duration), a higher monthly AI ExtraBrain quota, and longer sustained support from the personal coach. The course content and signals are the same in all packages.',
      th: 'การอัปเกรดให้: เวลามากขึ้น + โควต้า AI ExtraBrain ต่อเดือนมากขึ้น + การสนับสนุนจากโค้ชยาวนานขึ้น — เนื้อหาคอร์สและสัญญาณตลาดเหมือนกันทุกแพ็คเกจ',
    },
  },
];

// ─── Certification Quiz: Part 5 — Demo & Ethics ─────────────────────────────
const CERT_PART5: QuestionData[] = [
  {
    phase: 4,
    en: 'What is the correct URL for the BrainTrade Demo Platform in Thai language?',
    th: 'URL ของ Demo Platform BrainTrade เป็นภาษาไทยที่ถูกต้องคือข้อใด?',
    type: 'mcq',
    options: {
      en: [
        'demo.thebraintrade.com/en',
        'demo.thebraintrade.com/?lang=th',
        'demo.braintrade.th',
        'preview.thebraintrade.com/thai',
      ],
      th: [
        'demo.thebraintrade.com/en',
        'demo.thebraintrade.com/?lang=th',
        'demo.braintrade.th',
        'preview.thebraintrade.com/thai',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'The official Demo Platform link for Thai-language clients is: demo.thebraintrade.com/?lang=th — send this to clients during or immediately after the call.',
      th: 'ลิงก์ Demo Platform ภาษาไทยที่เป็นทางการคือ: demo.thebraintrade.com/?lang=th — ส่งลิงก์นี้ให้ลูกค้าระหว่างหรือทันทีหลังการโทร',
    },
  },
  {
    phase: 4,
    en: 'Which of the following accurately describes the data shown inside the BrainTrade Demo Platform?',
    th: 'ข้อใดอธิบายข้อมูลที่แสดงใน Demo Platform BrainTrade ได้ถูกต้อง?',
    type: 'mcq',
    options: {
      en: [
        'Live real-time market prices pulled from major global exchanges',
        'Simulated data for demonstration purposes only — not for actual financial decisions',
        'Historical data from the past 5 years for backtesting purposes',
        'Aggregated data from the top 10 brokers the platform supports',
      ],
      th: [
        'ราคาตลาดจริงแบบ Real-time ดึงข้อมูลจากตลาดหลักทรัพย์สำคัญทั่วโลก',
        'ข้อมูลจำลองเพื่อสาธิตเท่านั้น — ไม่ควรนำไปใช้ตัดสินใจทางการเงินจริง',
        'ข้อมูลย้อนหลัง 5 ปีสำหรับทดสอบกลยุทธ์ (Backtesting)',
        'ข้อมูลรวมจากโบรกเกอร์ชั้นนำ 10 รายที่แพลตฟอร์มรองรับ',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'The Demo is a Showroom only. All market data is simulated and not real-time or accurate. Representatives must disclose this to every client — clients should not use Demo data for financial decisions.',
      th: 'Demo เป็นเพียง Showroom เท่านั้น ข้อมูลตลาดทั้งหมดเป็นการจำลอง ไม่ใช่แบบ Real-time หรือถูกต้องแม่นยำ ตัวแทนขายต้องแจ้งให้ลูกค้าทุกคนทราบ — ห้ามนำข้อมูล Demo ไปใช้ตัดสินใจทางการเงิน',
    },
  },
  {
    phase: 4,
    en: 'How many main menu sections are available in the BrainTrade Demo Platform?',
    th: 'Demo Platform BrainTrade มีเมนูหลักทั้งหมดกี่เมนู?',
    type: 'mcq',
    options: {
      en: ['4', '5', '6', '8'],
      th: ['4', '5', '6', '8'],
    },
    correctIdx: 2,
    explain: {
      en: 'The Demo Platform has 6 main menus: Academy, Market Analysis, Trade, Market Scanners, Tools, and Campus. Each section represents a different module of the full platform.',
      th: 'Demo Platform มี 6 เมนูหลัก: Academy, Market Analysis, Trade, Market Scanners, Tools และ Campus — แต่ละส่วนแสดงโมดูลที่แตกต่างกันของแพลตฟอร์มจริง',
    },
  },
  {
    phase: 4,
    en: 'Which of the following is STRICTLY PROHIBITED for BrainTrade telesales representatives?',
    th: "ข้อใดเป็นสิ่งที่ 'ห้ามทำเด็ดขาด' สำหรับพนักงานเทเลเซลล์ BrainTrade?",
    type: 'mcq',
    options: {
      en: [
        'Sending the Demo platform link to a client during the call',
        "Asking a qualifying question about the client's trading experience",
        'Guaranteeing the client that they will profit or get rich from trading',
        'Following up with a client within 24 hours of a missed close',
      ],
      th: [
        'ส่งลิงก์ Demo ให้ลูกค้าระหว่างการโทร',
        'ถามคำถามคัดกรองเกี่ยวกับประสบการณ์เทรดของลูกค้า',
        'รับประกันว่าลูกค้าจะได้กำไรหรือรวยจากการเทรด',
        'ติดตาม Follow-up ลูกค้าภายใน 24 ชั่วโมงหลังการโทร',
      ],
    },
    correctIdx: 2,
    explain: {
      en: 'Guaranteeing trading profits or wealth is strictly prohibited — ethically, legally, and by BrainTrade policy. Trading involves risk and no outcomes can be promised. Violating this undermines trust and may have legal consequences.',
      th: 'การรับประกันกำไรหรือความมั่งคั่งจากการเทรดเป็นสิ่งที่ต้องห้ามอย่างเด็ดขาด — ทั้งในแง่จริยธรรม กฎหมาย และนโยบายของ BrainTrade การเทรดมีความเสี่ยงและไม่สามารถรับประกันผลลัพธ์ได้',
    },
  },
  {
    phase: 4,
    en: 'According to the BrainTrade DOs, what is the recommended speaking ratio during a sales call?',
    th: 'ตาม DOs ของ BrainTrade สัดส่วนการพูดที่แนะนำระหว่างการโทรขายคือเท่าไหร่?',
    type: 'mcq',
    options: {
      en: [
        'Speak 80% of the time to control the conversation and pitch effectively',
        'Speak 40% of the time and listen 60% of the time',
        'Split evenly 50/50 to maintain a balanced dialogue',
        'Speak 70% of the time during the opening and 30% during the close',
      ],
      th: [
        'พูด 80% เพื่อควบคุมบทสนทนาและ Pitch ได้อย่างมีประสิทธิภาพ',
        'พูด 40% และฟัง 60%',
        'แบ่งเท่าๆ กัน 50/50 เพื่อรักษาการสนทนาสองทาง',
        'พูด 70% ในช่วงทักทายและ 30% ในช่วงปิดการขาย',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'The recommended ratio is 60% listening / 40% speaking. Listening more allows you to truly understand the client\'s Pain Points, making your pitch far more relevant and effective.',
      th: 'สัดส่วนที่แนะนำคือ ฟัง 60% / พูด 40% การฟังมากขึ้นช่วยให้เข้าใจ Pain Point ของลูกค้าอย่างแท้จริง ทำให้ Pitch มีความเกี่ยวข้องและมีประสิทธิภาพมากขึ้นอย่างมาก',
    },
  },
];


// ─── KYC Sales Training: Section 1 — KYC Fundamentals ─────────────────────────
const KYC_PART1: QuestionData[] = [
  {
    phase: 0,
    en: 'What does KYC stand for in the context of sales?',
    th: 'KYC ในบริบทของงานขายย่อมาจากอะไร?',
    type: 'mcq',
    options: {
      en: ['Keep Your Contacts', 'Know Your Customer', 'Know Your Competitors', 'Keep Your Conversion'],
      th: ['Keep Your Contacts (รักษาข้อมูลติดต่อ)', 'Know Your Customer (รู้จักลูกค้าของคุณ)', 'Know Your Competitors (รู้จักคู่แข่ง)', 'Keep Your Conversion (รักษาอัตราการปิดการขาย)'],
    },
    correctIdx: 1,
    explain: {
      en: 'KYC stands for Know Your Customer — the process of understanding a prospect\'s background, needs, and pain points before making a pitch.',
      th: 'KYC ย่อมาจาก Know Your Customer หมายถึงกระบวนการทำความเข้าใจภูมิหลัง ความต้องการ และ Pain Point ของลูกค้าก่อนที่จะนำเสนอสินค้า',
    },
  },
  {
    phase: 0,
    en: 'Which of the following best describes the purpose of KYC in trading course sales?',
    th: 'ข้อใดอธิบายวัตถุประสงค์ของ KYC ในการขายคอร์สเทรดได้ดีที่สุด?',
    type: 'mcq',
    options: {
      en: [
        'To collect personal data for compliance purposes',
        'To understand the customer\'s background so you can present the most relevant pitch',
        'To qualify whether the customer can legally trade',
        'To determine how much the customer is willing to spend',
      ],
      th: [
        'เก็บข้อมูลส่วนตัวเพื่อวัตถุประสงค์ด้านการปฏิบัติตามกฎหมาย',
        'ทำความเข้าใจลูกค้าให้ลึกพอที่จะนำเสนอในแบบที่ตรงใจเขาที่สุด',
        'ตรวจสอบว่าลูกค้ามีคุณสมบัติตามกฎหมายในการเทรดหรือไม่',
        'ประเมินว่าลูกค้ายินดีจ่ายเท่าไหร่',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'KYC in sales is about understanding the customer deeply so every part of your pitch feels personally relevant — not just legal or financial qualification.',
      th: 'KYC ในงานขายคือการทำความเข้าใจลูกค้าอย่างลึกซึ้ง เพื่อให้การนำเสนอทุกส่วนรู้สึกว่าตรงกับเขาโดยเฉพาะ ไม่ใช่แค่การตรวจสอบคุณสมบัติทางกฎหมายหรือการเงิน',
    },
  },
  {
    phase: 0,
    en: 'According to the KYC sales framework, what percentage of conversation time should be spent listening and asking questions?',
    th: 'ตาม KYC Sales Framework ควรใช้เวลากี่เปอร์เซ็นต์ของบทสนทนาในการฟังและถามคำถาม?',
    type: 'mcq',
    options: {
      en: ['30–40%', '40–50%', '60–70%', '80–90%'],
      th: ['30–40%', '40–50%', '60–70%', '80–90%'],
    },
    correctIdx: 2,
    explain: {
      en: 'Spend 60–70% of the conversation listening and asking. Customers who feel "heard" are 3x more likely to buy.',
      th: 'ใช้เวลา 60–70% ของบทสนทนาในการฟังและถามคำถาม ลูกค้าที่รู้สึกว่า "ถูกฟัง" มีโอกาสซื้อสูงกว่าถึง 3 เท่า',
    },
  },
  {
    phase: 0,
    en: 'What is the key psychological principle behind why KYC improves sales conversion?',
    th: 'หลักจิตวิทยาข้อใดอธิบายว่าทำไม KYC ถึงช่วยเพิ่ม Conversion Rate?',
    type: 'mcq',
    options: {
      en: [
        'People buy from people they have known for a long time',
        'People buy purely based on price and features',
        'People buy with emotion first, then justify with logic — KYC finds the emotional trigger',
        'People are more likely to buy when they receive a discount',
      ],
      th: [
        'คนซื้อจากคนที่รู้จักกันมานานเท่านั้น',
        'คนซื้อโดยพิจารณาจากราคาและคุณสมบัติเป็นหลัก',
        'คนซื้อด้วยอารมณ์ก่อน แล้วหาเหตุผลมาสนับสนุนทีหลัง — KYC ช่วยค้นหาปุ่มอารมณ์นั้น',
        'คนมีแนวโน้มซื้อมากขึ้นเมื่อได้รับส่วนลด',
      ],
    },
    correctIdx: 2,
    explain: {
      en: 'People buy on emotion and justify with logic. KYC is designed to find that emotional button before you ever pitch.',
      th: 'คนซื้อด้วยอารมณ์แล้วหาเหตุผลมาสนับสนุน KYC ถูกออกแบบมาเพื่อค้นหาปุ่มอารมณ์นั้นก่อนที่เซลล์จะนำเสนอ',
    },
  },
  {
    phase: 0,
    en: 'What is the FIRST step in the 3-phase KYC conversation flow?',
    th: 'ขั้นตอนแรกใน KYC Flow 3 ระยะคืออะไร?',
    type: 'mcq',
    options: {
      en: [
        'Immediately explain course features and pricing',
        'Ask deep financial questions about income and debt',
        'Segment the customer — determine if they have trading experience or not',
        'Present testimonials from other successful students',
      ],
      th: [
        'อธิบายคุณสมบัติคอร์สและราคาทันที',
        'ถามคำถามลึกเกี่ยวกับรายได้และหนี้สินของลูกค้า',
        'แบ่งกลุ่มลูกค้า — ตรวจสอบว่ามีประสบการณ์เทรดหรือไม่',
        'นำเสนอ Testimonial จากนักเรียนที่ประสบความสำเร็จ',
      ],
    },
    correctIdx: 2,
    explain: {
      en: 'Phase 1 is always Screening — determine which group the customer belongs to before choosing which set of opening questions to use.',
      th: 'ระยะที่ 1 คือการ Screening เสมอ — แบ่งกลุ่มลูกค้าก่อนเพื่อเลือกชุดคำถาม Opening ที่เหมาะสม',
    },
  },
];

// ─── KYC Sales Training: Section 2 — Customer Segmentation ───────────────────
const KYC_PART2: QuestionData[] = [
  {
    phase: 1,
    en: 'A sales agent receives a lead with no notes. What is the MOST effective way to segment the customer at the start of the call?',
    th: 'เซลล์ได้รับ Lead ที่ไม่มีข้อมูลประวัติ วิธีใดดีที่สุดในการแบ่งกลุ่มลูกค้าตั้งแต่ต้น?',
    type: 'mcq',
    options: {
      en: [
        'Ask directly: "Have you traded stocks before — yes or no?"',
        'Open with a soft Ice Breaker: "Have you ever heard about stock trading?"',
        'Jump straight into the course pitch to save time',
        'Ask about income first to see if they can afford the course',
      ],
      th: [
        'ถามตรงๆ ว่า "เคยเทรดหุ้นมาก่อนไหม — ใช่หรือไม่?"',
        'เปิดด้วย Ice Breaker เบาๆ ว่า "เคยได้ยินเรื่องการเทรดหุ้นบ้างไหมครับ?"',
        'ข้ามไป Pitch คอร์สทันทีเพื่อประหยัดเวลา',
        'ถามเรื่องรายได้ก่อนเพื่อดูว่าสามารถซื้อคอร์สได้หรือไม่',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'A gentle Ice Breaker like "Have you ever heard about stock trading?" opens the conversation without pressure and naturally reveals the customer\'s experience level.',
      th: 'Ice Breaker แบบเบาๆ เช่น "เคยได้ยินเรื่องการเทรดหุ้นบ้างไหม?" เปิดบทสนทนาโดยไม่สร้างแรงกดดัน และเผยให้เห็นระดับประสบการณ์ของลูกค้าอย่างเป็นธรรมชาติ',
    },
  },
  {
    phase: 1,
    en: 'Which opening question is MOST suitable for a customer with NO trading experience?',
    th: 'คำถาม Opening ข้อใดเหมาะกับลูกค้าที่ "ไม่มีประสบการณ์" เทรดมากที่สุด?',
    type: 'mcq',
    options: {
      en: [
        'What\'s your current portfolio size?',
        'How long have you been trading?',
        'Do you know anyone personally who trades stocks?',
        'Are you currently trading full-time or part-time?',
      ],
      th: [
        'ตอนนี้พอร์ตมูลค่าเท่าไหร่ครับ?',
        'เทรดมานานแค่ไหนแล้วครับ?',
        'เคยรู้จักใครที่เทรดหุ้นบ้างไหมครับ?',
        'ตอนนี้เทรด Full-time หรือ Part-time ครับ?',
      ],
    },
    correctIdx: 2,
    explain: {
      en: 'For no-experience customers, finding a social reference point reduces unfamiliarity bias and makes trading feel more accessible.',
      th: 'สำหรับลูกค้าไม่มีประสบการณ์ การหา Reference Point ทางสังคมช่วยลด Unfamiliarity Bias และทำให้การเทรดดูเข้าถึงได้มากขึ้น',
    },
  },
  {
    phase: 1,
    en: 'Which opening question is MOST suitable for a customer who already HAS trading experience?',
    th: 'คำถาม Opening ข้อใดเหมาะกับลูกค้าที่ "มีประสบการณ์" เทรดมากที่สุด?',
    type: 'mcq',
    options: {
      en: [
        'Have you ever seen anything about trading on TikTok?',
        'What have you traded so far — Thai stocks, international, or crypto?',
        'Does trading feel too complicated for you?',
        'Have you heard about stock markets on the news?',
      ],
      th: [
        'เคยเห็นอะไรเกี่ยวกับการเทรดใน TikTok บ้างไหมครับ?',
        'ที่ผ่านมาเทรดอะไรมาบ้างครับ? หุ้นไทย ต่างประเทศ หรือ Crypto?',
        'รู้สึกว่าการเทรดยากเกินไปไหมครับ?',
        'เคยได้ยินเรื่องหุ้นจากข่าวบ้างไหมครับ?',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'For experienced customers, asking what they\'ve traded lets them talk and demonstrates respect for their history — building rapport before asking deeper questions.',
      th: 'สำหรับลูกค้ามีประสบการณ์ การถามว่าเทรดอะไรมาบ้างทำให้เขาได้พูดถึงตัวเอง และแสดงว่าเราเคารพในประสบการณ์ของเขา ก่อนจะถามคำถามที่ลึกขึ้น',
    },
  },
  {
    phase: 1,
    en: 'Why should a sales agent show extra respect when speaking with an experienced trader?',
    th: 'ทำไมเซลล์ต้องแสดงความเคารพเป็นพิเศษเมื่อคุยกับลูกค้าที่เป็นนักเทรดมีประสบการณ์?',
    type: 'mcq',
    options: {
      en: [
        'Because experienced traders have more money to spend',
        'Because regulations require it',
        'Because experienced traders have higher ego investment and need to feel respected before opening up',
        'Because they are more likely to complain to management',
      ],
      th: [
        'เพราะนักเทรดมีประสบการณ์มีเงินมากกว่า',
        'เพราะกฎระเบียบกำหนดไว้',
        'เพราะนักเทรดมีประสบการณ์มี Ego สูง ต้องรู้สึกว่าถูกเคารพก่อนจึงจะเปิดใจ',
        'เพราะพวกเขามีแนวโน้มร้องเรียนต่อผู้บริหารมากกว่า',
      ],
    },
    correctIdx: 2,
    explain: {
      en: 'Experienced traders have ego investment in their knowledge. If you make them feel judged or talked down to, they\'ll disengage. Respect and curiosity come first.',
      th: 'นักเทรดมีประสบการณ์มี Ego ผูกพันกับความรู้ของตัวเอง ถ้ารู้สึกว่าถูกตัดสิน พวกเขาจะถอนตัวทันที ความเคารพและความอยากรู้อยากเห็นต้องมาก่อนเสมอ',
    },
  },
  {
    phase: 1,
    en: 'A customer says: "I\'ve been trading for 2 years but I\'m still losing money consistently." Which psychological effect does this create that a skilled agent can work with?',
    th: 'ลูกค้าบอกว่า "เทรดมา 2 ปีแล้วแต่ขาดทุนมาตลอด" ผลทางจิตวิทยาข้อใดที่เซลล์สามารถนำมาใช้ได้?',
    type: 'mcq',
    options: {
      en: ['Curiosity Gap Theory', 'Loss Aversion Bias', 'Sunk Cost Effect', 'Future Pacing Anchor'],
      th: ['Curiosity Gap Theory', 'Loss Aversion Bias', 'Sunk Cost Effect', 'Future Pacing Anchor'],
    },
    correctIdx: 2,
    explain: {
      en: 'The Sunk Cost Effect means the customer feels compelled to "win back" what they\'ve already lost. This creates genuine urgency — use it carefully and ethically.',
      th: 'Sunk Cost Effect ทำให้ลูกค้ารู้สึกว่าต้อง "เอาคืน" สิ่งที่เสียไปแล้ว สภาวะนี้สร้าง Urgency ที่แท้จริง — ใช้อย่างระมัดระวังและมีจริยธรรม',
    },
  },
];

// ─── KYC Sales Training: Section 3 — Deep KYC: 5 Dimensions ───────────────────
const KYC_PART3: QuestionData[] = [
  {
    phase: 2,
    en: 'A prospect tells you they are 16 years old and very eager to start trading. What is the CORRECT action?',
    th: 'ลูกค้าบอกว่าอายุ 16 ปีและอยากเริ่มเทรดมาก เซลล์ควรทำอย่างไรที่ถูกต้องที่สุด?',
    type: 'mcq',
    options: {
      en: [
        'Enroll them in the course immediately — age doesn\'t matter for learning',
        'Recommend a free trial instead',
        'Inform them they cannot legally open a brokerage account yet, but can start learning now and be ready when they turn 18',
        'Transfer them to a manager',
      ],
      th: [
        'ลงทะเบียนให้เลย — อายุไม่สำคัญสำหรับการเรียนรู้',
        'แนะนำให้ลองใช้งาน Trial ฟรีก่อน',
        'แจ้งว่ายังไม่สามารถเปิดบัญชีเทรดได้ตามกฎหมาย แต่สามารถเรียนรู้ไว้ก่อนเพื่อพร้อมทันทีเมื่ออายุครบ 18 ปี',
        'โอนสายให้ผู้จัดการ',
      ],
    },
    correctIdx: 2,
    explain: {
      en: 'Under 18 means no legal brokerage account. Acknowledge their enthusiasm, explain the rule, and position the course as preparation for when they\'re eligible.',
      th: 'ต่ำกว่า 18 ปีเปิดบัญชีเทรดตามกฎหมายไม่ได้ สิ่งที่ถูกต้องคือชื่นชมความกระตือรือร้น อธิบายกฎ และวางตำแหน่งคอร์สว่าเป็นการเตรียมตัวให้พร้อมเมื่อถึงอายุที่มีสิทธิ์',
    },
  },
  {
    phase: 2,
    en: 'When a customer says they are currently unemployed, what is the MOST important thing a sales agent must be aware of?',
    th: 'เมื่อลูกค้าบอกว่าตอนนี้ว่างงาน สิ่งที่สำคัญที่สุดที่เซลล์ต้องระวังคืออะไร?',
    type: 'mcq',
    options: {
      en: [
        'They are not a valid lead — move on',
        'They likely have the most free time and should enroll in all courses',
        'They may have High Urgency but Limited Budget — don\'t push expensive packages immediately',
        'They need to be referred to a financial advisor first',
      ],
      th: [
        'ลูกค้ากลุ่มนี้ไม่ใช่ Lead ที่ดี — ข้ามไปได้เลย',
        'น่าจะมีเวลาว่างมากที่สุด ควรลงทะเบียนทุกคอร์ส',
        'อาจมี Urgency สูงแต่ Budget จำกัด — อย่าเสนอแพ็กเกจราคาแพงทันที',
        'ต้องส่งต่อให้ที่ปรึกษาทางการเงินก่อน',
      ],
    },
    correctIdx: 2,
    explain: {
      en: 'Unemployed customers often have the highest urgency but the most constrained budget. Read the situation carefully and uncover their actual pain before presenting pricing.',
      th: 'ลูกค้าที่ว่างงานมักมี Urgency สูงสุด (ต้องการรายได้) แต่งบประมาณจำกัดที่สุด อ่านสถานการณ์ให้ออกและค้นหา Pain Point ที่แท้จริงก่อนพูดเรื่องราคา',
    },
  },
  {
    phase: 2,
    en: 'Which of the following is the BEST way to ask about a customer\'s age without sounding intrusive?',
    th: 'วิธีใดดีที่สุดในการถามเรื่องอายุโดยไม่ให้รู้สึกเหมือนถูกสอบสวน?',
    type: 'mcq',
    options: {
      en: [
        '"How old are you exactly?"',
        '"Are you already working, or still studying?"',
        '"Can you send me a copy of your ID?"',
        '"Are you over 18? I need to verify this."',
      ],
      th: [
        '"อายุเท่าไหร่ครับ?"',
        '"ตอนนี้ทำงานแล้วหรือยังเรียนอยู่ครับ?"',
        '"ช่วยส่งสำเนาบัตรประชาชนให้หน่อยได้ไหมครับ?"',
        '"อายุเกิน 18 ปีแล้วใช่ไหม? ต้องตรวจสอบก่อนนะครับ"',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'This question naturally reveals whether someone is likely to be of legal age without feeling like an interrogation.',
      th: 'คำถามนี้เผยให้เห็นอายุโดยประมาณอย่างเป็นธรรมชาติโดยไม่ทำให้รู้สึกว่าถูกสอบสวน',
    },
  },
  {
    phase: 2,
    en: 'A customer says: "I\'m scared of losing money." What is the BEST immediate response from the sales agent?',
    th: 'ลูกค้าพูดว่า "กลัวเสียเงิน" เซลล์ควรตอบสนองอย่างไรดีที่สุด?',
    type: 'mcq',
    options: {
      en: [
        'Tell them trading has guaranteed returns if they follow the course',
        'Dismiss the fear and move on to course features',
        'Validate the fear, then explain that most losses come from lack of knowledge — and that\'s exactly what the course addresses',
        'Ask them to reconsider calling back when they feel more confident',
      ],
      th: [
        'บอกว่าถ้าเรียนคอร์สนี้รับประกันว่าได้กำไร',
        'ละเลยความกลัวและพูดถึงคุณสมบัติคอร์สต่อ',
        'รับรู้ความกลัวและอธิบายว่าคนส่วนใหญ่ที่เสียเงินคือคนที่เริ่มโดยไม่มีความรู้ — และนั่นคือสิ่งที่คอร์สนี้แก้ปัญหา',
        'แนะนำให้โทรกลับเมื่อรู้สึกมั่นใจมากขึ้น',
      ],
    },
    correctIdx: 2,
    explain: {
      en: 'Never dismiss fear. Validate it ("That\'s completely understandable"), then reframe: "Most people who lose go in without knowledge. This course changes that."',
      th: 'อย่าเพิกเฉยต่อความกลัว ให้ Validate ก่อน ("เข้าใจเลยครับ") แล้วค่อย Reframe ว่า "ส่วนใหญ่ที่เสียเงินคือคนที่เข้ามาโดยไม่มีความรู้ คอร์สนี้เปลี่ยนตรงนั้นครับ"',
    },
  },
  {
    phase: 2,
    en: 'When a customer says "Stocks are just like gambling," what should a sales agent do FIRST?',
    th: 'เมื่อลูกค้าพูดว่า "หุ้นก็เหมือนการพนัน" เซลล์ควรทำอะไรเป็นอันดับแรก?',
    type: 'mcq',
    options: {
      en: [
        'Immediately argue with statistics to prove them wrong',
        'Agree with them to avoid conflict',
        'Acknowledge the misconception calmly, then walk them through the key differences between gambling and systematic trading',
        'Skip the topic and redirect to pricing',
      ],
      th: [
        'โต้แย้งทันทีด้วยสถิติเพื่อพิสูจน์ว่าเขาผิด',
        'เห็นด้วยเพื่อหลีกเลี่ยงการขัดแย้ง',
        'รับรู้ความเข้าใจผิดอย่างสงบ แล้วค่อยอธิบายความแตกต่างระหว่างการพนันกับการเทรดอย่างมีระบบ',
        'ข้ามหัวข้อนี้และพูดเรื่องราคาเลย',
      ],
    },
    correctIdx: 2,
    explain: {
      en: 'Never argue head-on. Acknowledge it — "I hear that a lot" — then educate: "In systematic trading, you can put the edge in your favor. Gambling never offers that."',
      th: 'อย่าโต้แย้งตรงๆ ให้รับรู้ก่อน — "ได้ยินบ่อยเลยครับ" — แล้วค่อยให้ความรู้ว่า "ในการเทรดอย่างมีระบบ คุณสามารถสร้าง Edge ให้อยู่กับคุณได้ครับ"',
    },
  },
  {
    phase: 2,
    en: 'What is the PRIMARY difference between gambling and systematic trading?',
    th: 'ความแตกต่างหลักระหว่างการพนันและการเทรดอย่างมีระบบคืออะไร?',
    type: 'mcq',
    options: {
      en: [
        'Systematic trading is only legal, while gambling is illegal',
        'Gambling has higher potential returns than trading',
        'Systematic trading uses data, risk management, and backtested systems to create a positive expected value over time',
        'Trading requires less capital than gambling',
      ],
      th: [
        'การเทรดถูกกฎหมาย ส่วนการพนันผิดกฎหมาย',
        'การพนันมีโอกาสได้กำไรสูงกว่าการเทรด',
        'การเทรดอย่างมีระบบใช้ข้อมูล Risk Management และระบบที่ Backtest ได้ ทำให้มี Expected Value เป็นบวกในระยะยาว',
        'การเทรดต้องการเงินทุนน้อยกว่าการพนัน',
      ],
    },
    correctIdx: 2,
    explain: {
      en: 'Gambling is purely random with a negative expected value. Systematic trading applies data, technical/fundamental analysis, and risk rules — producing a positive expected value when done correctly.',
      th: 'การพนันสุ่มสี่สุ่มห้าและมี Expected Value ติดลบ การเทรดอย่างมีระบบใช้ข้อมูลและกฎ Risk Management ทำให้มี Expected Value เป็นบวกเมื่อทำอย่างถูกต้อง',
    },
  },
];

// ─── KYC Sales Training: Section 4 — Pain Point Discovery ─────────────────────
const KYC_PART4: QuestionData[] = [
  {
    phase: 3,
    en: 'Which of the following is the MOST powerful type of Pain Point to uncover for closing a trading course sale?',
    th: 'Pain Point ประเภทใดทรงพลังที่สุดสำหรับการปิดการขายคอร์สเทรด?',
    type: 'mcq',
    options: {
      en: [
        'A general wish to be wealthy one day',
        'A specific financial problem that needs money to solve within 1–3 months',
        'A desire to learn something new as a hobby',
        'A preference for working from home',
      ],
      th: [
        'ความต้องการทั่วไปที่อยากร่ำรวยสักวัน',
        'ปัญหาทางการเงินที่เป็นรูปธรรมและต้องการเงินแก้ไขภายใน 1–3 เดือน',
        'ความต้องการเรียนรู้สิ่งใหม่เป็นงานอดิเรก',
        'ความต้องการทำงานจากที่บ้าน',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'The most compelling Pain Point is urgent, specific, and financial — something pressing within 1–3 months that real income could solve. This creates genuine motivation to act now.',
      th: 'Pain Point ที่ทรงพลังที่สุดต้องเร่งด่วน เป็นรูปธรรม และเกี่ยวกับการเงิน — สิ่งที่กดดันใน 1–3 เดือน ที่รายได้จริงจะช่วยแก้ได้ สิ่งนี้สร้างแรงจูงใจที่แท้จริง',
    },
  },
  {
    phase: 3,
    en: 'Which question best uses the "Future Pacing" technique?',
    th: 'คำถามใดใช้เทคนิค "Future Pacing" ได้ดีที่สุด?',
    type: 'mcq',
    options: {
      en: [
        '"Why haven\'t you started investing yet?"',
        '"What courses have you taken before?"',
        '"If you had an extra 20,000 THB per month, what would you do with it first?"',
        '"How much are you willing to invest in a course?"',
      ],
      th: [
        '"ทำไมถึงยังไม่เริ่มลงทุนสักที?"',
        '"ที่ผ่านมาเคยเรียนคอร์สอะไรมาบ้าง?"',
        '"ถ้ามีรายได้เพิ่มสัก 20,000 บาทต่อเดือน จะเอาไปทำอะไรก่อนเลยครับ?"',
        '"ยินดีจ่ายค่าคอร์สเท่าไหร่ครับ?"',
      ],
    },
    correctIdx: 2,
    explain: {
      en: 'Future Pacing asks the customer to mentally experience the outcome. This creates emotional attachment to the result before the pitch.',
      th: 'Future Pacing ให้ลูกค้าจินตนาการผลลัพธ์ล่วงหน้า สร้าง Emotional Attachment กับผลลัพธ์ก่อนที่จะ Pitch',
    },
  },
  {
    phase: 3,
    en: 'Which question is an example of the "Cost of Inaction" technique?',
    th: 'คำถามใดเป็นตัวอย่างของเทคนิค "Cost of Inaction"?',
    type: 'mcq',
    options: {
      en: [
        '"What trading platform do you use?"',
        '"Have you heard of our course\'s track record?"',
        '"If you don\'t start learning now, do you think your situation will be different in 1 year?"',
        '"Would you prefer a monthly or annual payment plan?"',
      ],
      th: [
        '"ใช้แพลตฟอร์มเทรดอะไรอยู่ครับ?"',
        '"เคยได้ยินเรื่อง Track Record ของคอร์สเราบ้างไหม?"',
        '"ถ้าไม่ได้เริ่มเรียนตอนนี้ คิดว่าในอีก 1 ปีสถานการณ์จะเปลี่ยนไปไหมครับ?"',
        '"ต้องการจ่ายแบบรายเดือนหรือรายปีครับ?"',
      ],
    },
    correctIdx: 2,
    explain: {
      en: 'Cost of Inaction makes the customer confront what staying the same will cost them. If they say "probably not," that\'s the Pain Point — use it to drive urgency.',
      th: 'Cost of Inaction ให้ลูกค้าเผชิญกับต้นทุนของการไม่เปลี่ยนแปลง ถ้าตอบว่า "คงไม่" นั่นแหละคือ Pain Point — ใช้ตรงนี้สร้าง Urgency',
    },
  },
  {
    phase: 3,
    en: 'A customer says they want extra income to "send money back to their family." Which Pain Point category does this fall under?',
    th: 'ลูกค้าบอกว่าต้องการรายได้เพิ่มเพื่อ "ส่งเงินให้ครอบครัว" Pain Point นี้อยู่ในหมวดใด?',
    type: 'mcq',
    options: {
      en: ['Financial Pain Point', 'Career & Time Pain Point', 'Goals & Dreams Pain Point', 'Risk Tolerance Pain Point'],
      th: ['Pain Point ทางการเงิน', 'Pain Point ด้านอาชีพและเวลา', 'Pain Point ด้านเป้าหมายและความฝัน', 'Pain Point ด้านความยอมรับความเสี่ยง'],
    },
    correctIdx: 2,
    explain: {
      en: 'Supporting family financially is emotionally driven by purpose and responsibility. These are often the most powerful motivators.',
      th: 'การช่วยเหลือครอบครัวทางการเงินคือ Pain Point ด้านเป้าหมายและความฝัน ขับเคลื่อนด้วยอารมณ์จากความรับผิดชอบและความรัก แรงจูงใจประเภทนี้มักทรงพลังที่สุด',
    },
  },
  {
    phase: 3,
    en: 'When should a sales agent introduce the course and its pricing?',
    th: 'เซลล์ควรเริ่มแนะนำคอร์สและราคาเมื่อใด?',
    type: 'mcq',
    options: {
      en: [
        'As early as possible to anchor the customer\'s expectations',
        'Only after running the full KYC process and connecting course benefits to the customer\'s specific Pain Points',
        'Immediately after the customer confirms they are over 18',
        'During the first 2 minutes of the call to set the agenda',
      ],
      th: [
        'เร็วที่สุดเท่าที่จะทำได้เพื่อ Anchor ความคาดหวัง',
        'หลังจาก KYC ครบถ้วนและเชื่อมประโยชน์คอร์สกับ Pain Point ของลูกค้าแล้วเท่านั้น',
        'ทันทีที่ลูกค้ายืนยันว่าอายุเกิน 18 ปี',
        'ใน 2 นาทีแรกของการโทรเพื่อวางแผนการสนทนา',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'Price should never come before value. Only after you\'ve uncovered Pain Points and shown how the course solves them will the customer feel the price is justified.',
      th: 'ราคาต้องไม่มาก่อน Value เสมอ ลูกค้าจะรู้สึกว่าราคาสมเหตุสมผลก็ต่อเมื่อเขาเข้าใจแล้วว่าคอร์สแก้ปัญหาของเขาได้อย่างไร',
    },
  },
  {
    phase: 3,
    en: 'A customer says: "I\'ve tried freelancing and a second job but nothing has worked out." What is the BEST way to use this information?',
    th: 'ลูกค้าบอกว่า "ลองทำ Freelance และงานพิเศษแล้วแต่ไม่ได้ผล" เซลล์ควรใช้ข้อมูลนี้อย่างไรดีที่สุด?',
    type: 'mcq',
    options: {
      en: [
        'Suggest they try harder at their current job',
        'Acknowledge their effort and position the course as a structured, proven path — different from what they\'ve tried before',
        'Tell them trading is also risky and might not work',
        'Recommend they save more money before enrolling',
      ],
      th: [
        'แนะนำให้พยายามกับงานปัจจุบันมากขึ้น',
        'ยอมรับความพยายามของเขาและวางตำแหน่งคอร์สว่าเป็นเส้นทางที่มีโครงสร้างและพิสูจน์แล้ว — แตกต่างจากสิ่งที่เคยลองมา',
        'บอกว่าการเทรดก็เสี่ยงและอาจไม่ได้ผลเช่นกัน',
        'แนะนำให้เก็บเงินเพิ่มก่อนลงทะเบียน',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'Past failed attempts show urgency and openness to new solutions. Use it: "You\'ve already shown you want more — what\'s different about trading is that it\'s a skill with a system behind it."',
      th: 'การลองแล้วล้มเหลวแสดงถึง Urgency และความเปิดรับวิธีการใหม่ ใช้ตรงนี้ได้เลย: "คุณแสดงให้เห็นแล้วว่าต้องการมากกว่านี้ สิ่งที่ต่างในการเทรดคือมันเป็นทักษะที่มีระบบรองรับครับ"',
    },
  },
];

// ─── KYC Sales Training: Section 5 — Sales Psychology ─────────────────────────
const KYC_PART5: QuestionData[] = [
  {
    phase: 4,
    en: 'What does "Curiosity Gap Theory" suggest about effective sales questioning?',
    th: '"Curiosity Gap Theory" บอกอะไรเกี่ยวกับการถามคำถามในงานขาย?',
    type: 'mcq',
    options: {
      en: [
        'Customers respond better to long, detailed product explanations',
        'Creating a gap between what a customer knows and what they want to know triggers an instinct to close that gap',
        'Sales agents should withhold pricing information to create mystery',
        'Customers are naturally curious and will research the product themselves',
      ],
      th: [
        'ลูกค้าตอบสนองดีกว่าต่อการอธิบายสินค้าที่ยาวและละเอียด',
        'การสร้างช่องว่างระหว่างสิ่งที่ลูกค้ารู้กับสิ่งที่อยากรู้ กระตุ้นสัญชาตญาณที่ต้องการปิดช่องว่างนั้น',
        'เซลล์ควรปิดบังข้อมูลราคาเพื่อสร้างความลึกลับ',
        'ลูกค้ามีความอยากรู้โดยธรรมชาติและจะค้นคว้าสินค้าเอง',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'Curiosity Gap Theory (Loewenstein) states that when humans perceive a gap between what they know and what they want to know, they\'re driven to close it. Good questions create this gap naturally.',
      th: 'Curiosity Gap Theory (Loewenstein) ระบุว่าเมื่อมนุษย์รับรู้ว่ามีช่องว่างระหว่างสิ่งที่รู้กับสิ่งที่อยากรู้ พวกเขาจะถูกผลักดันให้ปิดช่องว่างนั้น คำถามที่ดีสร้างช่องว่างนี้อย่างเป็นธรรมชาติ',
    },
  },
  {
    phase: 4,
    en: 'According to Loss Aversion (Kahneman), how much more strongly do people feel pain from a loss compared to pleasure from an equivalent gain?',
    th: 'ตามงานวิจัยของ Kahneman เรื่อง Loss Aversion มนุษย์รู้สึกเจ็บปวดจากการสูญเสียมากกว่าความสุขจากการได้รับที่เท่ากันกี่เท่า?',
    type: 'mcq',
    options: {
      en: ['Equal (1x)', '1.5x', '2x', '5x'],
      th: ['เท่ากัน (1×)', '1.5×', '2×', '5×'],
    },
    correctIdx: 2,
    explain: {
      en: 'Kahneman\'s research shows people feel the pain of a loss approximately twice as intensely as the pleasure of an equivalent gain. This is why framing around "cost of not acting" is so powerful.',
      th: 'งานวิจัยของ Kahneman พบว่ามนุษย์รู้สึกเจ็บปวดจากการสูญเสียประมาณ 2 เท่าของความสุขจากการได้รับที่เท่ากัน นี่คือเหตุผลที่การ Frame ด้วย "ต้นทุนของการไม่ลงมือทำ" มีพลังมาก',
    },
  },
  {
    phase: 4,
    en: 'Which statement BEST reflects proper use of the Sunk Cost Effect in trading course sales?',
    th: 'ข้อใดสะท้อนการใช้ Sunk Cost Effect ในการขายคอร์สเทรดอย่างถูกต้องที่สุด?',
    type: 'mcq',
    options: {
      en: [
        'Remind customers how much money they\'ve already wasted and pressure them to enroll before losing more',
        'Ignore their past losses and focus only on future gains',
        'Acknowledge their past losses with empathy, and position the course as the structured knowledge that was missing — creating ethical urgency to change the outcome',
        'Tell them their previous approach was completely wrong',
      ],
      th: [
        'เตือนลูกค้าว่าเสียเงินไปเท่าไหร่แล้วและกดดันให้ลงทะเบียนก่อนที่จะเสียเพิ่ม',
        'เพิกเฉยต่อการขาดทุนที่ผ่านมาและมุ่งเน้นเฉพาะกำไรในอนาคต',
        'รับรู้การขาดทุนด้วยความเห็นอกเห็นใจ และวางตำแหน่งคอร์สว่าคือความรู้ที่ขาดหายไป — สร้าง Urgency อย่างมีจริยธรรม',
        'บอกว่าวิธีที่เขาทำมาตลอดนั้นผิดทั้งหมด',
      ],
    },
    correctIdx: 2,
    explain: {
      en: 'Sunk Cost creates genuine urgency, but must be handled ethically. Acknowledge the pain, validate it, then pivot: "Most people who\'ve lost did so without a proper system — that\'s exactly what the course provides."',
      th: 'Sunk Cost สร้าง Urgency ที่แท้จริงแต่ต้องจัดการอย่างมีจริยธรรม รับรู้ความเจ็บปวด Validate แล้ว Pivot: "ส่วนใหญ่ที่ขาดทุนทำโดยไม่มีระบบที่ถูกต้อง — นั่นคือสิ่งที่คอร์สให้ครับ"',
    },
  },
  {
    phase: 4,
    en: 'A customer says: "I\'ll think about it and call you back." Which sales psychology technique should be used NEXT?',
    th: 'ลูกค้าพูดว่า "จะคิดดูก่อนแล้วจะโทรกลับ" ควรใช้เทคนิคใดต่อไป?',
    type: 'mcq',
    options: {
      en: [
        'Immediately offer a discount to close the deal',
        'Use Cost of Inaction: ask what happens to their situation if nothing changes in the next few months',
        'Thank them and wait for their call',
        'Send them a product brochure by email',
      ],
      th: [
        'เสนอส่วนลดทันทีเพื่อปิดการขาย',
        'ใช้ Cost of Inaction ถามว่าถ้าไม่มีอะไรเปลี่ยนแปลงในอีกไม่กี่เดือน สถานการณ์ของเขาจะเป็นอย่างไร',
        'ขอบคุณและรอรับสาย',
        'ส่งโบรชัวร์สินค้าทางอีเมล',
      ],
    },
    correctIdx: 1,
    explain: {
      en: '"I\'ll think about it" is often avoidance, not genuine deliberation. Reactivate urgency with: "Totally fair — if your situation stays the same in 3 months, how do you feel about that?"',
      th: '"คิดดูก่อน" มักเป็นการหลีกเลี่ยง ไม่ใช่การพิจารณาจริงๆ กระตุ้น Urgency ใหม่ด้วย: "โอเคเลยครับ แค่อยากถามนิดนึง ถ้าสถานการณ์ยังเหมือนเดิมในอีก 3 เดือน รู้สึกยังไงกับตรงนั้นครับ?"',
    },
  },
];

// ─── KYC Sales Training: Section 6 — Scripts, Do\'s & Don\'ts ──────────────────
const KYC_PART6: QuestionData[] = [
  {
    phase: 5,
    en: 'Which of the following is a violation of KYC Do\'s & Don\'ts?',
    th: 'ข้อใดเป็นการละเมิดกฎ Do\'s & Don\'ts ของ KYC?',
    type: 'mcq',
    options: {
      en: [
        'Validating the customer\'s fears before offering a solution',
        'Asking one question at a time',
        'Mentioning the course price within the first 2 minutes of the call',
        'Writing down key Pain Points during the conversation',
      ],
      th: [
        'รับรู้ความกลัวของลูกค้าก่อนเสนอวิธีแก้ไข',
        'ถามทีละคำถาม ไม่ถามรัวๆ',
        'พูดถึงราคาคอร์สภายใน 2 นาทีแรกของการโทร',
        'จด Pain Point ที่สำคัญระหว่างบทสนทนา',
      ],
    },
    correctIdx: 2,
    explain: {
      en: 'Mentioning price before establishing value is a fundamental Don\'t. Price only makes sense after the customer has understood how the course solves their specific problem.',
      th: 'การพูดเรื่องราคาก่อนสร้าง Value เป็นกฎห้ามพื้นฐาน ราคาจะสมเหตุสมผลในสายตาลูกค้าก็ต่อเมื่อเขาเข้าใจแล้วว่าคอร์สแก้ปัญหาเฉพาะของเขาได้อย่างไร',
    },
  },
  {
    phase: 5,
    en: 'A customer says they\'ve heard stocks are for rich people and not for "normal people like me." What is the BEST response?',
    th: 'ลูกค้าบอกว่าหุ้นเป็นเรื่องของคนรวยเท่านั้น ไม่ใช่สำหรับ "คนธรรมดาอย่างฉัน" ควรตอบอย่างไรดีที่สุด?',
    type: 'mcq',
    options: {
      en: [
        'Agree and tell them this course will make them rich',
        'Dismiss their concern and move on to course features',
        'Validate the misconception empathetically, then reframe: many successful traders started with small capital and a proper system — and that\'s exactly what the course is designed for',
        'Ask them how much money they currently have',
      ],
      th: [
        'เห็นด้วยและบอกว่าคอร์สนี้จะทำให้รวย',
        'เพิกเฉยต่อความกังวลนี้และพูดถึงคุณสมบัติคอร์สต่อ',
        'Validate ความเข้าใจผิดด้วยความเห็นอกเห็นใจแล้ว Reframe ว่านักเทรดที่ประสบความสำเร็จหลายคนเริ่มต้นด้วยเงินทุนน้อยและระบบที่ถูกต้อง — และคอร์สนี้ออกแบบมาสำหรับจุดนั้นพอดี',
        'ถามว่าตอนนี้มีเงินอยู่เท่าไหร่',
      ],
    },
    correctIdx: 2,
    explain: {
      en: 'Never dismiss beliefs — validate them first ("I hear that a lot"), then reframe with evidence and a connection to the course.',
      th: 'อย่าปฏิเสธความเชื่อตรงๆ — Validate ก่อน ("ได้ยินบ่อยเลยครับ") แล้วค่อย Reframe ด้วยหลักฐานและเชื่อมกับคอร์ส',
    },
  },
  {
    phase: 5,
    en: 'What is the Golden Rule of KYC-based selling?',
    th: 'กฎทองของการขายแบบ KYC คืออะไร?',
    type: 'mcq',
    options: {
      en: [
        'Always close the sale on the first call',
        'Customers who feel "understood" will buy — customers who feel "sold to" will leave',
        'Always offer the highest-priced package first',
        'Use urgency tactics on every call regardless of the customer\'s situation',
      ],
      th: [
        'ปิดการขายให้ได้ในการโทรครั้งแรกเสมอ',
        'ลูกค้าที่รู้สึกว่า "ถูกเข้าใจ" จะซื้อ — ลูกค้าที่รู้สึกว่า "ถูกขาย" จะหนี',
        'เสนอแพ็กเกจราคาแพงที่สุดก่อนเสมอ',
        'ใช้กลยุทธ์สร้าง Urgency ในทุกการโทรโดยไม่คำนึงถึงสถานการณ์',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'The Golden Rule: Understood = buy. Sold to = leave. Every KYC technique is designed to make the customer feel genuinely seen and heard — not targeted.',
      th: 'กฎทอง: เข้าใจ = ซื้อ, ถูกขาย = หนี ทุกเทคนิค KYC ถูกออกแบบมาเพื่อให้ลูกค้ารู้สึกว่าถูกมองเห็นและได้รับการฟังอย่างแท้จริง — ไม่ใช่ถูกเล็งเป็นเป้า',
    },
  },
  {
    phase: 5,
    en: 'Which of the following BEST describes the ideal conversation ratio during a KYC call?',
    th: 'สัดส่วนการสนทนาที่เหมาะสมที่สุดระหว่างการโทร KYC คืออะไร?',
    type: 'mcq',
    options: {
      en: ['Agent talks 70%, Customer talks 30%', 'Agent talks 50%, Customer talks 50%', 'Agent talks 30–40%, Customer talks 60–70%', 'Agent talks 90%, Customer talks 10%'],
      th: ['เซลล์พูด 70% / ลูกค้าพูด 30%', 'เซลล์พูด 50% / ลูกค้าพูด 50%', 'เซลล์พูด 30–40% / ลูกค้าพูด 60–70%', 'เซลล์พูด 90% / ลูกค้าพูด 10%'],
    },
    correctIdx: 2,
    explain: {
      en: 'In KYC-first selling, the customer should talk more than the agent. The agent\'s role is to guide with questions, not to lecture. A 30–40% / 60–70% split is the target.',
      th: 'ในการขายแบบ KYC-First ลูกค้าควรพูดมากกว่าเซลล์ บทบาทของเซลล์คือนำทางด้วยคำถาม ไม่ใช่บรรยาย เป้าหมายคือสัดส่วน 30–40% / 60–70%',
    },
  },
];

// ─── Foundation: Part 1 — หุ้นและตลาดการเงิน ─────────────────────────────────
const FOUND_PART1: QuestionData[] = [
  {
    phase: 0,
    en: 'What is a stock (share)?',
    th: 'หุ้น (Stock) คืออะไร?',
    type: 'mcq',
    options: {
      en: [
        'A loan agreement between a company and an investor',
        'A unit of ownership in a company',
        'A certificate of bank deposit',
        'A forward contract to purchase goods',
      ],
      th: [
        'สัญญากู้ยืมเงินระหว่างบริษัทและนักลงทุน',
        'ส่วนหนึ่งของความเป็นเจ้าของในบริษัท',
        'ใบรับรองการฝากเงินกับธนาคาร',
        'สัญญาซื้อขายสินค้าล่วงหน้า',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'A stock represents partial ownership in a company. Shareholders own a proportional share of the business.',
      th: 'หุ้นคือการแบ่งบริษัทออกเป็นชิ้นเล็กๆ เพื่อขายให้นักลงทุน ผู้ถือหุ้นจึงเป็นเจ้าของบริษัทในสัดส่วนที่ถือ',
    },
  },
  {
    phase: 0,
    en: 'Which of the following best describes all the benefits a shareholder receives?',
    th: 'ผู้ถือหุ้นได้รับสิทธิประโยชน์อะไรบ้าง? (เลือกคำตอบที่ครอบคลุมที่สุด)',
    type: 'mcq',
    options: {
      en: [
        'Monthly interest payments from the company',
        'Dividends, capital gains from rising share prices, and voting rights',
        'A guaranteed return of capital at maturity',
        'Free use of the company\'s products and services',
      ],
      th: [
        'รับดอกเบี้ยรายเดือนจากบริษัท',
        'ได้รับเงินปันผล กำไรจากราคาหุ้น และสิทธิ์ออกเสียง',
        'ได้รับประกันคืนเงินต้นเมื่อถึงกำหนด',
        'ได้ใช้สินค้าและบริการของบริษัทฟรี',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'Shareholders receive 3 key benefits: Dividends, Capital Gains (from rising stock prices), and Voting Rights.',
      th: 'ผู้ถือหุ้นได้รับ 3 สิ่งหลัก: เงินปันผล (Dividend), กำไรจากราคาหุ้นที่สูงขึ้น (Capital Gain) และสิทธิ์ออกเสียง (Voting Rights)',
    },
  },
  {
    phase: 0,
    en: 'Which two exchanges have the highest combined market capitalization in the world?',
    th: 'ตลาดหุ้นใดมีมูลค่าตลาด (Market Cap) รวมกันสูงที่สุดในโลก?',
    type: 'mcq',
    options: {
      en: ['SET and HKEX', 'LSE and Nikkei', 'NYSE and NASDAQ', 'SSE and TSE'],
      th: ['SET และ HKEX', 'LSE และ Nikkei', 'NYSE และ NASDAQ', 'SSE และ TSE'],
    },
    correctIdx: 2,
    explain: {
      en: 'NYSE and NASDAQ (USA) are the world\'s largest exchanges with a combined market cap exceeding $40 trillion.',
      th: 'NYSE และ NASDAQ ของสหรัฐอเมริกาเป็นตลาดที่ใหญ่ที่สุดในโลก มูลค่ารวมกันกว่า $40 ล้านล้าน',
    },
  },
  {
    phase: 0,
    en: 'What are the trading hours of the Stock Exchange of Thailand (SET) in ICT time?',
    th: 'ตลาดหุ้นไทย SET เปิดทำการตามเวลาใด?',
    type: 'mcq',
    options: {
      en: ['8:00 AM – 5:00 PM', '9:00 AM – 4:00 PM', '10:00 AM – 4:30 PM', '9:30 AM – 4:30 PM'],
      th: ['08:00 – 17:00 น.', '09:00 – 16:00 น.', '10:00 – 16:30 น.', '09:30 – 16:30 น.'],
    },
    correctIdx: 2,
    explain: {
      en: 'The Stock Exchange of Thailand (SET) operates from 10:00 – 16:30 Thai time (ICT).',
      th: 'ตลาดหลักทรัพย์แห่งประเทศไทย (SET) เปิดทำการ 10:00 – 16:30 น. ตามเวลาไทย (ICT)',
    },
  },
];

// ─── Foundation: Part 2 — การเทรดและสไตล์การลงทุน ────────────────────────────
const FOUND_PART2: QuestionData[] = [
  {
    phase: 1,
    en: 'How does trading differ from long-term investing?',
    th: 'การเทรด (Trading) แตกต่างจากการลงทุนระยะยาวอย่างไร?',
    type: 'mcq',
    options: {
      en: [
        'Trading buys stocks for dividends; investing buys to resell',
        'Trading uses Fundamental Analysis; investing uses Technical Analysis',
        'Trading aims to profit from short-term price movements; investing targets long-term growth',
        'Trading and investing are essentially the same thing',
      ],
      th: [
        'การเทรดซื้อเพื่อรับเงินปันผล ส่วนการลงทุนซื้อเพื่อขายต่อ',
        'การเทรดใช้ Fundamental Analysis ส่วนการลงทุนใช้ Technical Analysis',
        'การเทรดมุ่งกำไรจากส่วนต่างราคาในระยะสั้น ส่วนการลงทุนมุ่งการเติบโตระยะยาว',
        'การเทรดและการลงทุนไม่มีความแตกต่างกัน',
      ],
    },
    correctIdx: 2,
    explain: {
      en: 'Trading focuses on short-term price differences (seconds to days); long-term investing targets growth and dividends over months or years.',
      th: 'การเทรดเน้นกำไรจากส่วนต่างราคาในระยะสั้น (วินาที – หลายวัน) ส่วนการลงทุนระยะยาวมุ่งการเติบโตของมูลค่าและเงินปันผลในระยะเวลาหลายเดือนหรือหลายปี',
    },
  },
  {
    phase: 1,
    en: 'What is Day Trading?',
    th: 'Day Trade คืออะไร?',
    type: 'mcq',
    options: {
      en: [
        'Holding a stock position for exactly one full day',
        'Opening and closing all positions within the same trading day — no overnight holds',
        'Trading only during daytime hours',
        'Making exactly one trade per day',
      ],
      th: [
        'การซื้อหุ้นแล้วถือไว้ 1 วันเต็ม',
        'การเปิดและปิดสถานะซื้อขายภายในวันเดียวกัน ไม่ค้างข้ามคืน',
        'การเทรดได้เฉพาะช่วงกลางวันเท่านั้น',
        'การซื้อขายหุ้น 1 ครั้งต่อวัน',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'Day Trading means opening and closing all positions within the same trading day — no overnight positions, so no Swap fees.',
      th: 'Day Trade คือการเปิดและปิดสถานะทั้งหมดภายในวันเดียวกัน ไม่ค้างสถานะข้ามคืน จึงไม่เสียค่า Swap',
    },
  },
  {
    phase: 1,
    en: 'Which of the following is an essential rule every Day Trader must follow on every trade?',
    th: 'ข้อใดคือสิ่งที่ Day Trader ต้องมีและปฏิบัติทุกครั้ง?',
    type: 'mcq',
    options: {
      en: [
        'Always follow a friend\'s trade recommendations',
        'Set a Stop Loss on every order and close positions according to the plan — not emotion',
        'Keep the computer running 24 hours a day',
        'Always trade the same instrument every day',
      ],
      th: [
        'ซื้อหุ้นตามคำแนะนำของเพื่อนเสมอ',
        'ตั้ง Stop Loss ทุกออเดอร์และมีวินัยในการปิดตามแผน',
        'เปิดคอมพิวเตอร์ตลอด 24 ชั่วโมง',
        'ลงทุนในหุ้นเดิมซ้ำทุกวัน',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'Day Traders must be disciplined: set a Stop Loss on every order and close positions according to their plan, not emotions.',
      th: 'Day Trader ต้องมีวินัยเหล็ก ตั้ง Stop Loss ทุกออเดอร์ และปิดสถานะตามแผน ไม่ใช่ตามอารมณ์',
    },
  },
  {
    phase: 1,
    en: 'What most clearly distinguishes a Value Investor from a Day Trader?',
    th: 'Value Investor แตกต่างจาก Day Trader อย่างไรที่ชัดเจนที่สุด?',
    type: 'mcq',
    options: {
      en: [
        'Value Investors use higher leverage',
        'Value Investors trade far more frequently than Day Traders',
        'Value Investors hold for the long term, focusing on a business\'s true value and ignoring short-term price noise',
        'Value Investors only trade Forex markets',
      ],
      th: [
        'Value Investor ใช้ Leverage สูงกว่า',
        'Value Investor เทรดบ่อยกว่า Day Trader มาก',
        'Value Investor ถือหุ้นระยะยาว มองมูลค่าที่แท้จริงของธุรกิจ ไม่สนราคาระยะสั้น',
        'Value Investor ซื้อขายเฉพาะในตลาด Forex',
      ],
    },
    correctIdx: 2,
    explain: {
      en: 'Value Investors (like Warren Buffett) hold stocks long-term (months–decades), look for stocks priced below intrinsic value, and ignore daily volatility.',
      th: 'Value Investor แบบ Warren Buffett ถือหุ้นระยะยาว (เดือน – ทศวรรษ) มองหาหุ้นที่ราคาต่ำกว่า Intrinsic Value และไม่สนใจความผันผวนรายวัน',
    },
  },
  {
    phase: 1,
    en: 'In Value Investing, what does \'Margin of Safety\' mean?',
    th: 'Margin of Safety ในแนวคิด Value Investing หมายความว่าอะไร?',
    type: 'mcq',
    options: {
      en: [
        'Setting a Stop Loss on every trade',
        'Buying a stock at a price at least 30% below its Intrinsic Value',
        'Keeping at least 30% of the portfolio in cash',
        'Diversifying across at least 30 different stocks',
      ],
      th: [
        'การตั้ง Stop Loss ในทุกออเดอร์',
        'การซื้อหุ้นในราคาที่ต่ำกว่ามูลค่าที่แท้จริงอย่างน้อย 30%',
        'การเก็บเงินสดไว้อย่างน้อย 30% ของพอร์ต',
        'การกระจายความเสี่ยงในหุ้นอย่างน้อย 30 ตัว',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'Margin of Safety means buying stocks at a price significantly below their intrinsic value (at least 30%) to create a safety buffer.',
      th: 'Margin of Safety คือหลักการซื้อหุ้นในราคาที่ต่ำกว่า Intrinsic Value อย่างมีนัยสำคัญ (อย่างน้อย 30%) เพื่อสร้างส่วนต่างความปลอดภัย',
    },
  },
  {
    phase: 1,
    en: 'Which set of analytical tools does a Value Investor primarily rely on?',
    th: 'นักลงทุนแนว Value Investing ใช้เครื่องมือวิเคราะห์ใดเป็นหลัก?',
    type: 'mcq',
    options: {
      en: [
        'Candlestick charts and RSI',
        'Bollinger Bands and Moving Averages',
        'P/E Ratio, P/B Ratio, Dividend Yield, and Free Cash Flow',
        'Fibonacci Retracement and MACD',
      ],
      th: [
        'กราฟแท่งเทียน (Candlestick Chart) และ RSI',
        'Bollinger Band และ Moving Average',
        'P/E Ratio, P/B Ratio, Dividend Yield และ Free Cash Flow',
        'Fibonacci Retracement และ MACD',
      ],
    },
    correctIdx: 2,
    explain: {
      en: 'Value Investors use Fundamental Analysis: P/E Ratio, P/B Ratio, Dividend Yield, and Free Cash Flow — not technical chart tools.',
      th: 'Value Investor ใช้ Fundamental Analysis ได้แก่ P/E Ratio (ราคาต่อกำไร), P/B Ratio (ราคาต่อมูลค่าตามบัญชี), Dividend Yield และ Free Cash Flow',
    },
  },
];

// ─── Foundation: Part 3 — โบรกเกอร์ Pip Spread และ Swap ──────────────────────
const FOUND_PART3: QuestionData[] = [
  {
    phase: 2,
    en: 'Why should traders always choose a Regulated broker?',
    th: 'เหตุใดจึงต้องเลือกโบรกเกอร์ที่ Regulated เท่านั้น?',
    type: 'mcq',
    options: {
      en: [
        'Because Regulated brokers charge the lowest commissions',
        'Because Regulated brokers hold client funds in segregated accounts, have legal oversight, and provide complaint channels',
        'Because Regulated brokers offer the highest leverage',
        'Because only Regulated brokers have good trading platforms',
      ],
      th: [
        'เพราะโบรกเกอร์ที่ Regulated มีค่าคอมมิชชั่นต่ำที่สุด',
        'เพราะโบรกเกอร์ที่ Regulated เก็บเงินลูกค้าในบัญชีแยก มีกฎหมายคุ้มครอง และมีช่องทางร้องเรียน',
        'เพราะโบรกเกอร์ที่ Regulated ให้ Leverage สูงสุด',
        'เพราะโบรกเกอร์ที่ Regulated มีแพลตฟอร์มที่ดีที่สุดเท่านั้น',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'Regulated brokers (FCA, ASIC, CySEC) keep client funds in Segregated Accounts — your money is safe if the broker becomes insolvent, and you have a regulatory body to file complaints with.',
      th: 'โบรกเกอร์ที่ Regulated (FCA, ASIC, CySEC) เก็บเงินลูกค้าในบัญชีแยก (Segregated Account) ซึ่งหมายความว่าเงินของลูกค้าปลอดภัยหากโบรกเกอร์ล้มละลาย และมีหน่วยงานกำกับดูแลรับเรื่องร้องเรียน',
    },
  },
  {
    phase: 2,
    en: 'What does a Pip measure?',
    th: 'Pip คือหน่วยวัดอะไร?',
    type: 'mcq',
    options: {
      en: [
        'The volume of a trade',
        'The overnight interest rate on a position',
        'The smallest unit of price movement in Forex — the 4th decimal place',
        'The risk level of a portfolio',
      ],
      th: [
        'หน่วยวัดปริมาณการซื้อขาย (Volume)',
        'หน่วยวัดอัตราดอกเบี้ยค้างคืน',
        'หน่วยวัดการเปลี่ยนแปลงราคาที่เล็กที่สุดในตลาด Forex (ทศนิยมตำแหน่งที่ 4)',
        'หน่วยวัดความเสี่ยงของพอร์ต',
      ],
    },
    correctIdx: 2,
    explain: {
      en: 'A Pip (Percentage in Point) is the smallest price move in Forex. E.g., EUR/USD moves from 1.1050 to 1.1051 = 1 Pip (4th decimal). JPY pairs use the 2nd decimal.',
      th: 'Pip (Percentage in Point) คือหน่วยวัดการเปลี่ยนแปลงราคาขั้นต่ำในตลาด Forex เช่น EUR/USD เคลื่อนจาก 1.1050 ไป 1.1051 = 1 Pip (ทศนิยมตำแหน่งที่ 4) ยกเว้นคู่สกุลเงิน JPY ใช้ทศนิยมตำแหน่งที่ 2',
    },
  },
  {
    phase: 2,
    en: 'If you open a Buy on EUR/USD at 1 Standard Lot and the price rises 50 pips, what is your profit?',
    th: 'ถ้าเปิด Buy EUR/USD 1 Standard Lot แล้วราคาขึ้น 50 pip จะได้กำไรเท่าไร?',
    type: 'mcq',
    options: {
      en: ['$5', '$50', '$500', '$5,000'],
      th: ['$5', '$50', '$500', '$5,000'],
    },
    correctIdx: 2,
    explain: {
      en: 'For EUR/USD Standard Lot: 1 Pip = $10. So 50 pips × $10/pip × 1 Lot = $500.',
      th: 'Standard Lot EUR/USD มีมูลค่า 1 Pip = $10 ดังนั้น 50 pip × $10/pip × 1 Lot = $500',
    },
  },
  {
    phase: 2,
    en: 'What is the Spread in Forex trading?',
    th: 'Spread คืออะไร?',
    type: 'mcq',
    options: {
      en: [
        'The overnight interest charged on an open position',
        'The difference between the Ask (buy) price and the Bid (sell) price — the trader\'s entry cost',
        'The commission paid to the sales agent',
        'The leverage ratio applied to an order',
      ],
      th: [
        'ดอกเบี้ยที่เกิดขึ้นเมื่อถือสถานะข้ามคืน',
        'ส่วนต่างระหว่างราคาซื้อ (Ask) และราคาขาย (Bid) ซึ่งเป็นต้นทุนของนักเทรด',
        'ค่าคอมมิชชั่นที่จ่ายให้เอเจนต์',
        'อัตราการใช้ Leverage ของออเดอร์',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'Spread is the gap between the Ask price (what you pay to buy) and the Bid price (what you receive when selling) — it\'s a hidden transaction fee.',
      th: 'Spread คือความต่างระหว่างราคา Ask (ราคาที่เราต้องจ่ายเพื่อซื้อ) และ Bid (ราคาที่เราได้รับเมื่อขาย) เปรียบเหมือนค่าธรรมเนียมแฝงในการเทรด',
    },
  },
  {
    phase: 2,
    en: 'What is Swap in Forex trading?',
    th: 'Swap ในการเทรด Forex คืออะไร?',
    type: 'mcq',
    options: {
      en: [
        'Switching a position from Buy to Sell',
        'Interest charged when holding a position overnight — because Forex trading uses leverage, which means borrowing money',
        'A withdrawal fee charged by the broker',
        'The base currency exchange rate',
      ],
      th: [
        'การสลับสถานะจาก Buy เป็น Sell',
        'ดอกเบี้ยที่เกิดขึ้นเมื่อถือสถานะข้ามคืน เพราะการเทรด Forex ใช้ Leverage (ยืมเงิน)',
        'ค่าธรรมเนียมการถอนเงินจากโบรกเกอร์',
        'อัตราแลกเปลี่ยนสกุลเงินพื้นฐาน',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'Swap (Overnight Fee) is charged because Forex trading uses leverage — essentially borrowed money. Day Traders avoid Swap by closing all positions daily.',
      th: 'Swap หรือ Overnight Fee เกิดขึ้นเพราะการเทรด Forex ใช้ Leverage ซึ่งเท่ากับการยืมเงิน เมื่อถือสถานะข้ามคืนจึงเกิดดอกเบี้ย Day Trader ไม่เสีย Swap เพราะปิดสถานะทุกวัน',
    },
  },
  {
    phase: 2,
    en: 'Who is an Islamic Account (Swap-Free Account) designed for?',
    th: 'Islamic Account (Swap-Free Account) เหมาะกับใคร?',
    type: 'mcq',
    options: {
      en: [
        'Beginner traders with no prior experience',
        'Traders who want the maximum available leverage',
        'Traders who follow Islamic principles or do not wish to pay or receive interest',
        'Traders who exclusively trade Gold',
      ],
      th: [
        'นักเทรดที่เพิ่งเริ่มต้นและยังไม่มีประสบการณ์',
        'นักเทรดที่ต้องการ Leverage สูงสุด',
        'นักเทรดที่นับถือศาสนาอิสลามหรือไม่ต้องการจ่ายดอกเบี้ย',
        'นักเทรดที่เทรดเฉพาะทองคำ',
      ],
    },
    correctIdx: 2,
    explain: {
      en: 'Islamic Accounts (Swap-Free) are designed for Muslim traders whose religion prohibits paying or receiving interest (Riba).',
      th: 'Islamic Account หรือ Swap-Free Account ออกแบบมาสำหรับนักเทรดที่นับถือศาสนาอิสลาม ซึ่งหลักการศาสนาห้ามรับหรือจ่ายดอกเบี้ย',
    },
  },
];

// ─── Foundation: Part 4 — Forex Crypto และ CFD ───────────────────────────────
const FOUND_PART4: QuestionData[] = [
  {
    phase: 3,
    en: 'What is the average daily trading volume of the Forex market according to the BIS 2022 report?',
    th: 'ตลาด Forex มีปริมาณซื้อขายเฉลี่ยต่อวันเท่าไรตามข้อมูล BIS ปี 2022?',
    type: 'mcq',
    options: {
      en: ['$750 billion', '$7.5 trillion', '$750 million', '$75 trillion'],
      th: ['$750 พันล้าน', '$7.5 ล้านล้าน (Trillion)', '$750 ล้าน', '$75 ล้านล้าน'],
    },
    correctIdx: 1,
    explain: {
      en: 'The Forex market averages $7.5 Trillion in daily trading volume per BIS 2022 — making it the world\'s largest financial market.',
      th: 'ตลาด Forex มีปริมาณซื้อขายเฉลี่ยวันละ $7.5 Trillion ตามรายงาน BIS (Bank for International Settlements) ปี 2022 ทำให้เป็นตลาดการเงินที่ใหญ่ที่สุดในโลก',
    },
  },
  {
    phase: 3,
    en: 'Which session overlap offers the highest volatility and is considered the best time for Thai-based Forex traders?',
    th: 'ช่วงเวลาใดที่นักเทรด Forex ในไทยควรเทรดมากที่สุด เพราะความผันผวนสูงสุด?',
    type: 'mcq',
    options: {
      en: [
        '7:00 AM – 9:00 AM (Asian Session open)',
        '10:00 AM – 1:00 PM (Tokyo mid-session)',
        '9:30 PM – 12:00 AM (London–New York Overlap)',
        '3:00 AM – 5:00 AM (Late NY Session)',
      ],
      th: [
        '07:00 – 09:00 น. (Asian Session)',
        '10:00 – 13:00 น. (Tokyo Session)',
        '21:30 – 00:00 น. (London-NY Overlap)',
        '03:00 – 05:00 น. (Late NY Session)',
      ],
    },
    correctIdx: 2,
    explain: {
      en: 'The London–New York overlap (21:30 – 00:00 ICT) has the highest volume and volatility of the trading day — ideal for Thai Day Traders.',
      th: 'Overlap ระหว่าง London Session และ New York Session (21:30 – 00:00 ICT) คือช่วงที่มีความผันผวนและ Volume การซื้อขายสูงที่สุดในรอบวัน เหมาะที่สุดสำหรับ Day Trader ไทย',
    },
  },
  {
    phase: 3,
    en: 'What defines a Major Currency Pair in Forex?',
    th: 'Currency Pair ประเภท Major Pairs คืออะไร?',
    type: 'mcq',
    options: {
      en: [
        'Currency pairs that do not include USD, such as EUR/GBP or AUD/JPY',
        'Pairs that include USD as one currency, such as EUR/USD and GBP/USD — they have the lowest spreads and highest volume',
        'Pairs from emerging-market economies, such as USD/THB',
        'Only the highest-valued currency pairs in the market',
      ],
      th: [
        'คู่สกุลเงินที่ไม่มี USD เช่น EUR/GBP, AUD/JPY',
        'คู่สกุลเงินที่มี USD เป็นสกุลหนึ่ง เช่น EUR/USD, GBP/USD มี Spread ต่ำและ Volume สูง',
        'คู่สกุลเงินของประเทศเศรษฐกิจเกิดใหม่ เช่น USD/THB',
        'คู่สกุลเงินที่มีมูลค่าสูงที่สุดเท่านั้น',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'Major Pairs always include USD (e.g., EUR/USD, GBP/USD, USD/JPY) — they have consistent volatility, low spreads, and highest volume. Best for beginners.',
      th: 'Major Pairs คือคู่สกุลเงินที่มี USD เป็นสกุลหนึ่งเสมอ เช่น EUR/USD, GBP/USD, USD/JPY มีความผันผวนสม่ำเสมอ Spread ต่ำ และ Volume สูงสุด เหมาะสำหรับมือใหม่',
    },
  },
  {
    phase: 3,
    en: 'How does Cryptocurrency differ from Forex?',
    th: 'Cryptocurrency แตกต่างจาก Forex อย่างไร?',
    type: 'mcq',
    options: {
      en: [
        'Crypto trades only Monday to Friday, just like Forex',
        'Crypto trades 24/7 with no weekends, is far more volatile than Forex, and has no central bank controlling it',
        'Crypto is less volatile than Forex, making it safer',
        'Crypto can only be traded on US-based exchanges',
      ],
      th: [
        'Crypto เปิดซื้อขายเฉพาะวันจันทร์ – ศุกร์ เหมือน Forex',
        'Crypto เปิดซื้อขาย 24/7 ไม่มีวันหยุด ผันผวนสูงกว่า Forex มากและไม่มีธนาคารกลางควบคุม',
        'Crypto มีความผันผวนต่ำกว่า Forex ทำให้ปลอดภัยกว่า',
        'Crypto ซื้อขายได้เฉพาะในตลาดสหรัฐอเมริกา',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'Crypto is open 24/7 (Forex closes Sat–Sun), far more volatile (BTC can move 10–20% in a day), and is decentralized with no central bank control.',
      th: 'Crypto เปิด 24/7 (Forex ปิดเสาร์-อาทิตย์), ผันผวนสูงกว่ามาก (BTC อาจขึ้น-ลง 10-20% ต่อวัน) และเป็น Decentralized ไม่มีธนาคารกลางควบคุม',
    },
  },
  {
    phase: 3,
    en: 'What is a CFD (Contract for Difference)?',
    th: 'CFD (Contract for Difference) คืออะไร?',
    type: 'mcq',
    options: {
      en: [
        'Buying the actual underlying asset and receiving legal ownership',
        'A contract between a trader and a broker where profit or loss equals the price difference — no ownership of the real asset required',
        'Depositing money with a broker to earn interest',
        'An asset exchange agreement between two companies',
      ],
      th: [
        'การซื้อหุ้นจริงๆ และรับโอนกรรมสิทธิ์',
        'สัญญาระหว่างนักเทรดและโบรกเกอร์ที่ทำกำไร/ขาดทุนจากส่วนต่างราคา โดยไม่ต้องถือสินทรัพย์จริง',
        'การฝากเงินกับโบรกเกอร์เพื่อรับดอกเบี้ย',
        'การแลกเปลี่ยนสินทรัพย์ระหว่างสองบริษัท',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'CFD profits/losses come from the difference between open and close prices — you never own the actual asset. E.g., you can trade Apple\'s stock price without holding real Apple shares.',
      th: 'CFD คือสัญญาที่ทำกำไร/ขาดทุนจากส่วนต่างระหว่างราคาเปิดและปิดสถานะ โดยไม่ต้องซื้อสินทรัพย์จริง เช่น เทรดราคาหุ้น Apple โดยไม่ต้องมีบัญชีที่อเมริกาหรือถือหุ้น Apple จริง',
    },
  },
  {
    phase: 3,
    en: 'Which asset classes can be traded as CFDs?',
    th: 'สินทรัพย์ใดที่สามารถเทรดผ่าน CFD ได้บ้าง?',
    type: 'mcq',
    options: {
      en: [
        'Forex only',
        'Stocks and Gold only',
        'Forex, stocks, Gold, Oil, indices, and Crypto',
        'Commodities only',
      ],
      th: [
        'เฉพาะ Forex เท่านั้น',
        'เฉพาะหุ้นและทองคำ',
        'Forex หุ้น ทองคำ น้ำมัน ดัชนี และ Crypto',
        'เฉพาะสินค้าโภคภัณฑ์ (Commodities) เท่านั้น',
      ],
    },
    correctIdx: 2,
    explain: {
      en: 'CFDs cover a wide range: Forex (EUR/USD etc.), international stocks (AAPL, TSLA), Gold (XAU/USD), Oil (WTI, Brent), indices (S&P 500, NASDAQ), and Crypto (BTC, ETH).',
      th: 'CFD ครอบคลุมสินทรัพย์หลากหลาย: Forex (EUR/USD ฯลฯ), หุ้นต่างประเทศ (AAPL, TSLA), ทองคำ (XAU/USD), น้ำมัน (WTI, Brent), ดัชนี (S&P 500, NASDAQ) และ Crypto (BTC, ETH)',
    },
  },
];

// ─── Foundation: Part 5 — Sales Skill และการเริ่มต้น ──────────────────────────
const FOUND_PART5: QuestionData[] = [
  {
    phase: 4,
    en: 'Which of the following best describes the most common client Pain Points when selling a trading course?',
    th: 'ข้อใดคือ Pain Point ของลูกค้าที่พบบ่อยที่สุดในการขายคอร์สเทรด?',
    type: 'mcq',
    options: {
      en: [
        'Clients want an expensive laptop',
        'Clients live paycheck to paycheck, fear losing money, lack time, and want a second income stream',
        'Clients want to relocate abroad',
        'Clients want to start their own company',
      ],
      th: [
        'ลูกค้าอยากได้ Laptop ราคาแพง',
        'ลูกค้ามีเงินเดือนชนเดือน กลัวเสียเงิน ไม่มีเวลา และต้องการรายได้เสริม',
        'ลูกค้าอยากย้ายไปอยู่ต่างประเทศ',
        'ลูกค้าต้องการเปิดบริษัทของตัวเอง',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'Key pain points trading solves: paycheck-to-paycheck income, desire for location freedom, lack of time, stagnant savings, and fear of losing money (solved via Demo Account).',
      th: 'Pain Points หลักที่การเทรดแก้ได้: รายได้เดือนชนเดือน, ต้องการ Location Freedom, ไม่มีเวลา, เงินออมไม่โต และกลัวเสียเงิน (ซึ่งแก้ด้วย Demo Account)',
    },
  },
  {
    phase: 4,
    en: 'When a client says \'I\'m afraid of losing money,\' what is the best agent response?',
    th: 'เมื่อลูกค้าบอกว่า \'กลัวจะเสียเงิน\' เอเจนต์ควรตอบว่าอย่างไร?',
    type: 'mcq',
    options: {
      en: [
        '\'Don\'t worry, just try it — you\'ll get used to it\'',
        '\'We start on a Demo Account with virtual money first — zero real money at risk\'',
        '\'If you\'re scared, then trading probably isn\'t for you\'',
        '\'The market isn\'t really risky — it\'s easy money\'',
      ],
      th: [
        '\'ไม่เป็นไร ลองดูก่อนเลย เดี๋ยวก็ชิน\'',
        '\'เราฝึกบน Demo Account ก่อน ใช้เงินจำลอง ไม่เสียเงินจริงสักบาทเดียว\'',
        '\'ถ้ากลัวก็ไม่ต้องเทรดก็ได้\'',
        '\'ตลาดไม่เสี่ยงหรอก ซื้อขายสบายมาก\'',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'A Demo Account uses virtual funds (e.g., $10,000 simulated) so the customer can practice without risking any real money — the perfect answer to fear of losing.',
      th: 'Demo Account คือบัญชีจำลองที่ให้ฝึกด้วยเงิน Virtual (เช่น $10,000 จำลอง) โดยไม่เสียเงินจริงเลย เป็นคำตอบที่ดีที่สุดสำหรับข้อกังวลเรื่องความกลัว',
    },
  },
  {
    phase: 4,
    en: 'What is the correct sequence of steps for a complete beginner to follow?',
    th: 'ขั้นตอนที่ถูกต้องในการเริ่มต้นสำหรับมือใหม่คือข้อใด?',
    type: 'mcq',
    options: {
      en: [
        'Open a real account immediately → Deposit → Start trading',
        'Learn the fundamentals → Choose a Regulated broker → Open a Demo account → Practice 30 days → Open a real account',
        'Watch YouTube videos → Deposit → Trade immediately',
        'Open a Demo → Trade immediately → Learn later',
      ],
      th: [
        'เปิดบัญชีจริงทันที → Deposit → เทรด',
        'เรียนพื้นฐาน → เลือกโบรกเกอร์ Regulated → เปิด Demo → ฝึก 30 วัน → เปิดบัญชีจริง',
        'ดู YouTube → Deposit → เทรดทันที',
        'เปิด Demo → เทรดทันที → เรียนทีหลัง',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'Correct order: (1) Learn basics → (2) Choose a Regulated broker → (3) Open Demo Account → (4) Practice at least 30 days until consistently profitable 2+ weeks → (5) Open real account.',
      th: 'ลำดับที่ถูกต้อง: (1) เรียนพื้นฐาน (2) เลือกโบรกเกอร์ Regulated (3) เปิด Demo Account (4) ฝึกอย่างน้อย 30 วันจนกำไรสม่ำเสมอ 2+ สัปดาห์ (5) จึงเปิดบัญชีจริง',
    },
  },
  {
    phase: 4,
    en: 'Which trading platform is recommended first for a Forex beginner?',
    th: 'แพลตฟอร์มใดที่แนะนำสำหรับมือใหม่ที่ต้องการเทรด Forex เป็นอันดับแรก?',
    type: 'mcq',
    options: {
      en: ['TradingView', 'Bloomberg Terminal', 'MetaTrader 4 (MT4)', 'Microsoft Excel'],
      th: ['TradingView', 'Bloomberg Terminal', 'MetaTrader 4 (MT4)', 'Excel'],
    },
    correctIdx: 2,
    explain: {
      en: 'MetaTrader 4 (MT4) is the most recommended platform for beginners — easy to use, Forex-focused, has a Demo system, and is the industry standard.',
      th: 'MetaTrader 4 (MT4) คือแพลตฟอร์มที่แนะนำที่สุดสำหรับมือใหม่ เพราะใช้งานง่าย รองรับ Forex เป็นหลัก มีระบบ Demo และเป็นมาตรฐานอุตสาหกรรม',
    },
  },
  {
    phase: 4,
    en: 'What is the first Golden Rule that every trader must follow without exception?',
    th: 'Golden Rule ข้อแรกที่นักเทรดทุกคนต้องปฏิบัติคืออะไร?',
    type: 'mcq',
    options: {
      en: [
        'Make a profit on every single trade',
        'Set a Stop Loss on every order — no exceptions whatsoever',
        'Trade every day without fail',
        'Start with at least $10,000 in capital',
      ],
      th: [
        'ต้องทำกำไรทุกออเดอร์',
        'ต้องตั้ง Stop Loss ทุกออเดอร์โดยไม่มีข้อยกเว้น',
        'ต้องเทรดทุกวันอย่างสม่ำเสมอ',
        'ต้องลงทุนด้วยเงินอย่างน้อย $10,000',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'Golden Rule #1: Stop Loss on every order — no exceptions. A Stop Loss protects capital and prevents total loss of funds.',
      th: 'Golden Rule ข้อ 1: Stop Loss ทุกออเดอร์ ห้ามเทรดโดยไม่มี SL เด็ดขาด เพราะ Stop Loss คือเครื่องมือปกป้องทุน ป้องกันการขาดทุนจนเกินทุน',
    },
  },
  {
    phase: 4,
    en: 'Before presenting a Crypto product, what must an agent qualify about the client?',
    th: 'เอเจนต์ควร Qualify อะไรจากลูกค้าก่อนนำเสนอ Crypto?',
    type: 'mcq',
    options: {
      en: [
        'The client\'s age and height',
        'The client\'s risk tolerance — because Crypto is extremely volatile',
        'The number of social media followers the client has',
        'The brand of smartphone the client uses',
      ],
      th: [
        'อายุและส่วนสูงของลูกค้า',
        'ระดับความสามารถในการรับความเสี่ยงของลูกค้า เพราะ Crypto ผันผวนสูงมาก',
        'จำนวนเพื่อนใน Social Media ของลูกค้า',
        'ยี่ห้อโทรศัพท์ที่ลูกค้าใช้',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'Crypto is extremely volatile (BTC can move 10–20% in a day), so agents must assess the customer\'s risk tolerance before presenting it.',
      th: 'Crypto มีความผันผวนสูงมาก (BTC อาจขึ้น-ลง 10-20% ต่อวัน) ดังนั้นเอเจนต์ต้องประเมิน Risk Tolerance ของลูกค้าก่อนเสมอ ไม่เหมาะกับผู้ที่รับความเสี่ยงสูงไม่ได้',
    },
  },
  {
    phase: 4,
    en: 'What is the official tagline of BrainTrade Thailand?',
    th: 'ข้อใดคือ Tagline ของหลักสูตร BrainTrade Thailand?',
    type: 'mcq',
    options: {
      en: [
        'Trade Well, Profit Every Day',
        'Know It | Pitch It | Close It',
        'Invest Easy, Earn Fast',
        'Learn Free, Trade Safe',
      ],
      th: [
        'เทรดดี มีกำไร ทุกวัน',
        'รู้จริง แนะนำเป็น ปิดได้',
        'ลงทุนง่าย ได้เงินไว',
        'เรียนฟรี เทรดได้ ไม่เสียเงิน',
      ],
    },
    correctIdx: 1,
    explain: {
      en: "BrainTrade Thailand's tagline is 'Know It | Pitch It | Close It' (รู้จริง แนะนำเป็น ปิดได้) — meaning agents must truly know the material, advise confidently, and close the sale.",
      th: "Tagline ของ BrainTrade Thailand คือ 'รู้จริง แนะนำเป็น ปิดได้' หมายถึงเอเจนต์ต้องรู้จริงก่อน จึงจะแนะนำลูกค้าได้อย่างมั่นใจและปิดการขายได้",
    },
  },
  {
    phase: 4,
    en: 'Which regulatory bodies are considered the most credible for Forex broker licensing?',
    th: 'ข้อใดคือหน่วยงาน Regulator ที่น่าเชื่อถือสำหรับโบรกเกอร์ Forex?',
    type: 'mcq',
    options: {
      en: [
        'Thai SEC and the Office of the Securities and Exchange Commission',
        'FCA (UK), ASIC (Australia), and CySEC (Cyprus)',
        'The Bank of Thailand (BOT)',
        'The United States Treasury Department',
      ],
      th: [
        'SEC ไทย และ กลต.',
        'FCA (UK), ASIC (Australia) และ CySEC (Cyprus)',
        'ธนาคารแห่งประเทศไทย (BOT)',
        'กระทรวงการคลังสหรัฐอเมริกา',
      ],
    },
    correctIdx: 1,
    explain: {
      en: 'The most trusted international Forex regulators are FCA (UK Financial Conduct Authority), ASIC (Australian Securities and Investments Commission), and CySEC (Cyprus Securities and Exchange Commission).',
      th: 'หน่วยงาน Regulator ระดับนานาชาติที่ได้รับการยอมรับสูงสุดในวงการ Forex คือ FCA (Financial Conduct Authority ของ UK), ASIC (Australian Securities and Investments Commission) และ CySEC (Cyprus Securities and Exchange Commission)',
    },
  },
];

// ─── Module → Quiz mapping ───────────────────────────────────────────────────
export const MODULE_QUIZ_MAP: Record<string, QuizDefinition> = {
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
      { name: { en: 'Part 3: Broker, Pip, Spread & Swap', th: 'ส่วนที่ 3: โบรกเกอร์ Pip Spread และ Swap' }, color: '#BA7517', light: '#FAEEDA' },
      { name: { en: 'Part 4: Forex, Crypto & CFD', th: 'ส่วนที่ 4: Forex Crypto และ CFD' }, color: '#534AB7', light: '#EEEDFE' },
      { name: { en: 'Part 5: Sales Skills', th: 'ส่วนที่ 5: Sales Skill และการเริ่มต้น' }, color: '#993C1D', light: '#FAECE7' },
    ],
    uiOverrides: {
      feedbackHigh: { en: 'Excellent — ready to pitch customers!', th: 'ยอดเยี่ยม — พร้อม Pitch ลูกค้าได้เต็มรูปแบบ!' },
      feedbackMid:  { en: 'Passed — review the questions you missed.', th: 'ผ่าน — แนะนำทบทวนส่วนที่ผิด' },
      feedbackLow:  { en: 'Needs improvement — re-study the relevant slides, then retake.', th: 'ต้องปรับปรุง — เรียนซ้ำสไลด์ที่เกี่ยวข้อง แล้วสอบใหม่' },
    },
    questions: [...FOUND_PART1, ...FOUND_PART2, ...FOUND_PART3, ...FOUND_PART4, ...FOUND_PART5],
  },
  product: {
    id: 'certification-quiz',
    title: { en: 'Certification Quiz', th: 'แบบทดสอบรับรอง' },
    description: {
      en: 'Comprehensive 40-question quiz covering ecosystem, journey, features, and sales skills.',
      th: 'แบบทดสอบครอบคลุม 40 ข้อ ทั้งระบบนิเวศ เส้นทาง ฟีเจอร์ และทักษะการขาย',
    },
    passThreshold: 0.8,
    phases: [
      { name: { en: 'Part 1: Ecosystem & Journey', th: 'ส่วนที่ 1: ระบบนิเวศและเส้นทาง 60 วัน' }, color: '#0F6E56', light: '#E1F5EE' },
      { name: { en: 'Part 2: Features & Pricing', th: 'ส่วนที่ 2: ฟีเจอร์และแพ็คเกจราคา' }, color: '#185FA5', light: '#E6F1FB' },
      { name: { en: 'Part 3: Sales Process & Handling', th: 'ส่วนที่ 3: กระบวนการขายและการรับมือข้อโต้แย้ง' }, color: '#BA7517', light: '#FAEEDA' },
      { name: { en: 'Part 4: Social Proof & FAQ', th: 'ส่วนที่ 4: ความเชื่อมั่นและคำถามที่พบบ่อย' }, color: '#534AB7', light: '#EEEDFE' },
      { name: { en: 'Part 5: Demo & Ethics', th: 'ส่วนที่ 5: การสาธิตแพลตฟอร์มและจริยธรรม' }, color: '#993C1D', light: '#FAECE7' },
    ],
    questions: [...CERT_PART1, ...CERT_PART2, ...CERT_PART3, ...CERT_PART4, ...CERT_PART5],
  },
  process: {
    id: 'kyc-sales-training',
    title: { en: 'KYC Sales Training', th: 'KYC — การขายคอร์สเทรดหุ้น' },
    description: {
      en: '30 questions across 6 sections — Fundamentals, Segmentation, Deep KYC, Pain Points, Psychology, and Scripts.',
      th: '30 ข้อ ใน 6 หมวด — พื้นฐาน การแบ่งกลุ่มลูกค้า Deep KYC การค้นหา Pain Point จิตวิทยา และสคริปต์การขาย',
    },
    passThreshold: 0.8,
    phases: [
      { name: { en: 'Part 1: KYC Fundamentals', th: 'หมวดที่ 1 — พื้นฐาน KYC' }, color: '#D97706', light: '#FEF3C7' },
      { name: { en: 'Part 2: Segmentation', th: 'หมวดที่ 2 — การแบ่งกลุ่มลูกค้า' }, color: '#185FA5', light: '#E6F1FB' },
      { name: { en: 'Part 3: Deep KYC', th: 'หมวดที่ 3 — Deep KYC: 5 มิติสำคัญ' }, color: '#BA7517', light: '#FAEEDA' },
      { name: { en: 'Part 4: Pain Point Discovery', th: 'หมวดที่ 4 — การค้นหา Pain Point' }, color: '#534AB7', light: '#EEEDFE' },
      { name: { en: 'Part 5: Sales Psychology', th: 'หมวดที่ 5 — จิตวิทยาการขาย' }, color: '#993C1D', light: '#FAECE7' },
      { name: { en: 'Part 6: Scripts & Do\'s', th: 'หมวดที่ 6 — Script, สิ่งที่ต้องทำและไม่ควรทำ' }, color: '#DC2626', light: '#FEE2E2' },
    ],
    questions: [...KYC_PART1, ...KYC_PART2, ...KYC_PART3, ...KYC_PART4, ...KYC_PART5, ...KYC_PART6],
  },
  payment: {
    id: 'payment-training',
    title: { en: 'Payment & Packages', th: 'การชำระเงินและแพ็กเกจ' },
    description: {
      en: 'Questions covering BrainTrade subscription packages, pricing, payment methods, and handling payment objections.',
      th: 'ข้อสอบครอบคลุมแพ็กเกจ ราคา วิธีชำระเงินของ BrainTrade และการรับมือข้อโต้แย้งด้านราคา',
    },
    passThreshold: 0.8,
    questions: [], // loaded from Firestore at runtime
  },
};

export const PASS_THRESHOLD = 0.8; // 80%

export const UI_STRINGS = {
  en: {
    next: 'Next Question',
    prev: 'Previous',
    seeResults: 'See Results',
    explanation: 'Explanation',
  },
  th: {
    next: 'ถัดไป',
    prev: 'ย้อนกลับ',
    seeResults: 'ดูผลคะแนน',
    explanation: 'คำอธิบาย',
  }
};
