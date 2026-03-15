export type Language = 'en' | 'th';
export type QuestionType = 'tf' | 'mcq' | 'fill';

export interface QuestionData {
  en: string;
  th: string;
  type: QuestionType;
  a?: string;
  options?: { en: string[]; th: string[] };
  correctIdx?: number;
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
  uiOverrides?: QuizUIOverrides;
}

export const UI_STRINGS: Record<Language, {
  qLabel: string; scoreLabel: string; finishTitle: string; finishSub: string;
  outOf: string; correct: string; incorrect: string; submit: string;
  placeholder: string; trueTxt: string; falseTxt: string;
  msgHigh: string; msgMed: string; msgLow: string; backToHome: string; hello: string;
  passed: string; failed: string; tryAgain: string; passThreshold: string;
}> = {
  en: {
    qLabel: 'Question', scoreLabel: 'Score', finishTitle: 'Assessment Completed',
    finishSub: 'Your Performance Results', outOf: 'out of', correct: 'Correct ✓',
    incorrect: 'Incorrect. The correct answer is:', submit: 'Submit Answer',
    placeholder: 'Enter your answer...', trueTxt: 'True', falseTxt: 'False',
    msgHigh: 'Outstanding! You demonstrate expert-level knowledge of The Brain Trade.',
    msgMed: 'Great job. You have a solid understanding of our system.',
    msgLow: 'Keep learning. We recommend reviewing The Brain Trade materials again.',
    backToHome: 'Return to Dashboard', hello: 'Hello',
    passed: 'PASSED', failed: 'NOT PASSED', tryAgain: 'Try Again',
    passThreshold: 'Passing score: 70%',
  },
  th: {
    qLabel: 'คำถามที่', scoreLabel: 'คะแนน', finishTitle: 'การประเมินเสร็จสมบูรณ์',
    finishSub: 'ผลลัพธ์ของคุณ', outOf: 'จาก', correct: 'ถูกต้อง ✓',
    incorrect: 'ไม่ถูกต้อง คำตอบที่ถูกคือ:', submit: 'ส่งคำตอบ',
    placeholder: 'กรุณาระบุคำตอบ...', trueTxt: 'จริง', falseTxt: 'เท็จ',
    msgHigh: 'ยอดเยี่ยม! คุณมีความรู้ความเข้าใจในระดับผู้เชี่ยวชาญเกี่ยวกับ The Brain Trade',
    msgMed: 'ทำได้ดีมาก คุณมีความเข้าใจระบบของเราเป็นอย่างดี',
    msgLow: 'ควรศึกษาเพิ่มเติม เราแนะนำให้ทบทวนข้อมูลของ The Brain Trade อีกครั้ง',
    backToHome: 'กลับสู่แดชบอร์ด', hello: 'สวัสดี',
    passed: 'ผ่าน', failed: 'ไม่ผ่าน', tryAgain: 'ทำใหม่อีกครั้ง',
    passThreshold: 'เกณฑ์ผ่าน: 70%',
  },
};

// ─── Quiz 1: System Understanding ────────────────────────────────────────────
const UNDERSTANDING_DATA: QuestionData[] = [
  {
    en: 'The parent company of The Brain Trade is headquartered in Bulgaria.',
    th: 'สำนักงานใหญ่ของบริษัทแม่ The Brain Trade ตั้งอยู่ที่ประเทศบัลแกเรีย',
    type: 'tf', a: 'true',
  },
  {
    en: 'Which trading platform application do clients use to execute trades?',
    th: 'ลูกค้าใช้งานแอปพลิเคชันแพลตฟอร์มใดในการดำเนินการซื้อขาย?',
    type: 'mcq',
    options: {
      en: ['MetaTrader 4', 'cTrader', 'Zenstox (via BrainTrade website)', 'TradingView'],
      th: ['MetaTrader 4', 'cTrader', 'Zenstox (ผ่านเว็บไซต์ BrainTrade)', 'TradingView'],
    },
    correctIdx: 2,
  },
  {
    en: 'Clients are restricted to learning about trading exclusively through The Brain Trade.',
    th: 'ลูกค้าถูกจำกัดให้เรียนรู้เกี่ยวกับการเทรดผ่าน The Brain Trade เท่านั้น',
    type: 'tf', a: 'true',
  },
  {
    en: 'Which communication channel does The Brain Trade\'s advisory team primarily use to contact clients?',
    th: 'ทีมที่ปรึกษาของ The Brain Trade ใช้ช่องทางใดเป็นหลักในการติดต่อลูกค้า?',
    type: 'mcq',
    options: {
      en: ['LINE', 'Facebook Messenger', 'Phone Call', 'Email'],
      th: ['LINE', 'Facebook Messenger', 'โทรศัพท์', 'อีเมล'],
    },
    correctIdx: 2,
  },
  {
    en: 'Following a client\'s deposit, within what timeframe will the advisory team initiate contact?',
    th: 'หลังจากลูกค้าดำเนินการฝากเงิน ทีมที่ปรึกษาจะติดต่อกลับภายในระยะเวลากี่ชั่วโมง?',
    type: 'mcq',
    options: {
      en: ['24 hours', '48 hours', '72 hours', '1 week'],
      th: ['24 ชั่วโมง', '48 ชั่วโมง', '72 ชั่วโมง', '1 สัปดาห์'],
    },
    correctIdx: 2,
  },
  {
    en: 'Clients must deposit a minimum of ______ USD to unlock the All-in-one Platform and receive a Free Trading Account.',
    th: 'ลูกค้าต้องฝากเงินขั้นต่ำ ______ USD เพื่อปลดล็อกแพลตฟอร์ม All-in-one และรับบัญชีเทรดฟรี',
    type: 'fill', a: '100',
  },
  {
    en: 'Clients are eligible to request a 100% refund within 48 hours of their deposit.',
    th: 'ลูกค้ามีสิทธิ์ขอคืนเงินเต็มจำนวน (100%) ภายใน 48 ชั่วโมงหลังจากทำรายการฝาก',
    type: 'tf', a: 'true',
  },
  {
    en: 'What are the maximum and minimum bonus percentages authorized for clients?',
    th: 'อัตราโบนัสสูงสุดและต่ำสุดที่ได้รับอนุญาตให้นำเสนอกับลูกค้าคือเท่าใด?',
    type: 'mcq',
    options: {
      en: ['Max 100% and Min 50%', 'Max 80% and Min 40%', 'Max 120% and Min 60%', 'Max 75% and Min 25%'],
      th: ['สูงสุด 100% และต่ำสุด 50%', 'สูงสุด 80% และต่ำสุด 40%', 'สูงสุด 120% และต่ำสุด 60%', 'สูงสุด 75% และต่ำสุด 25%'],
    },
    correctIdx: 0,
  },
];

// ─── Quiz 2: Sales Logic & Strategy ──────────────────────────────────────────
const SALES_DATA: QuestionData[] = [
  {
    en: 'Client: "I don\'t want to lose money on trading courses. I\'ve failed before." What is the most strategic response?',
    th: 'ลูกค้า: "ผมไม่อยากเสียเงินกับคอร์สเทรดอีก ผมเคยล้มเหลวมาก่อน" คำตอบเชิงกลยุทธ์ที่ดีที่สุดคือ?',
    type: 'mcq',
    options: {
      en: ['Our course is different from others.', 'Many people fail but eventually profit.', 'The initial amount isn\'t a fee; it becomes your own trading capital.', 'If you don\'t try, you will never succeed.'],
      th: ['คอร์สของเราแตกต่างจากที่อื่น', 'หลายคนเคยล้มเหลวแต่สุดท้ายก็ทำกำไรได้', 'เงินเริ่มต้นไม่ใช่ค่าธรรมเนียม แต่เป็นเงินทุนสำหรับเทรดของคุณเอง', 'ถ้าไม่ลอง คุณก็จะไม่มีวันประสบความสำเร็จ'],
    },
    correctIdx: 2,
  },
  {
    en: 'Client: "So, what is the total cost I need to pay?" Which response aligns with BrainTrade logic?',
    th: 'ลูกค้า: "สรุปแล้วผมต้องจ่ายทั้งหมดเท่าไหร่?" คำตอบใดสอดคล้องกับตรรกะของ BrainTrade?',
    type: 'mcq',
    options: {
      en: ['The package costs $500.', 'This is a bundle including a course and account.', 'It is $500 in starting capital, fully available for you to trade.', 'The price is very valuable.'],
      th: ['แพ็คเกจราคา 500 USD', 'นี่เป็นชุดรวมคอร์สและบัญชี', 'มันคือเงินทุนเริ่มต้น 500 USD ที่คุณนำไปเทรดได้เต็มจำนวน', 'ราคานี้คุ้มค่ามาก'],
    },
    correctIdx: 2,
  },
  {
    en: 'Client: "Sounds too good to be true. Are there hidden fees?" Best response to build trust?',
    th: 'ลูกค้า: "ฟังดูดีเกินจริง มีค่าใช้จ่ายแอบแฝงไหม?" คำตอบใดสร้างความเชื่อมั่นได้ดีที่สุด?',
    type: 'mcq',
    options: {
      en: ['No hidden fees, I promise.', 'We are an established company with many clients.', 'We do not charge you for education; our revenue is generated from broker commissions when you trade.', 'Every business requires profit.'],
      th: ['ไม่มีค่าใช้จ่ายแอบแฝงครับ ผมรับรอง', 'เราเป็นบริษัทที่มั่นคงและมีลูกค้ามากมาย', 'เราไม่คิดค่าสอนครับ รายได้ของเรามาจากค่าคอมมิชชั่นของโบรกเกอร์เมื่อคุณเทรด', 'ทุกธุรกิจต้องมีกำไรครับ'],
    },
    correctIdx: 2,
  },
  {
    en: 'Client: "I already have a trading account elsewhere. Can I use that instead?" Most strategic response?',
    th: 'ลูกค้า: "ผมมีบัญชีเทรดที่อื่นอยู่แล้ว ใช้บัญชีเดิมได้ไหม?" คำตอบเชิงกลยุทธ์ที่สุดคือ?',
    type: 'mcq',
    options: {
      en: ['Our platform is easier to use.', 'It doesn\'t matter where you trade.', 'Using our integrated ecosystem allows our Mentors to accurately guide your portfolio.', 'Other brokers don\'t support this.'],
      th: ['แพลตฟอร์มของเราใช้งานง่ายกว่า', 'เทรดที่ไหนก็เหมือนกันครับ', 'การใช้ระบบที่เชื่อมโยงกันจะช่วยให้ Mentor ของเราดูแลพอร์ตของคุณได้อย่างแม่นยำครับ', 'โบรกเกอร์อื่นไม่รองรับครับ'],
    },
    correctIdx: 2,
  },
  {
    en: 'Client: "I don\'t want to switch everything, it\'s too much hassle." Best response?',
    th: 'ลูกค้า: "ไม่อยากย้ายอะไรให้วุ่นวาย มันยุ่งยาก" คำตอบที่ดีที่สุดคือ?',
    type: 'mcq',
    options: {
      en: ['You don\'t have to switch.', 'Just move once and it\'s done.', 'I understand. Since capital is critical, we designed this ecosystem so Mentors can fully support your growth.', 'Most clients switch.'],
      th: ['ไม่จำเป็นต้องย้ายก็ได้ครับ', 'ย้ายแค่ครั้งเดียวก็จบครับ', 'เข้าใจครับ เพราะเงินทุนสำคัญ เราจึงออกแบบระบบนี้เพื่อให้ Mentor ดูแลคุณได้อย่างเต็มที่', 'ลูกค้าส่วนใหญ่ก็ย้ายกันครับ'],
    },
    correctIdx: 2,
  },
  {
    en: 'Client: "I\'ll just start with $100." Response according to logic?',
    th: 'ลูกค้า: "ขอเริ่มแค่ 100 USD ก่อนละกัน" คำตอบที่ตรงตามตรรกะคือ?',
    type: 'mcq',
    options: {
      en: ['Sure, start small first.', '$100 is low risk.', '$100 is the minimum, but the level of support and education differs significantly from the $500 tier.', 'Most people start at $100.'],
      th: ['ได้ครับ เริ่มเล็กๆ ก่อน', '100 USD ความเสี่ยงต่ำครับ', '100 USD คือขั้นต่ำครับ แต่ระดับการดูแลและความรู้ที่จะได้รับจะต่างจากระดับ 500 USD มากครับ', 'คนส่วนใหญ่ก็เริ่มที่ 100 USD ครับ'],
    },
    correctIdx: 2,
  },
  {
    en: 'Client: "What if I trade and lose? Is my money gone?" Most safety-focused response?',
    th: 'ลูกค้า: "ถ้าเทรดเสียล่ะ? เงินผมจะหายหมดไหม?" คำตอบที่เน้นความปลอดภัยมากที่สุด?',
    type: 'mcq',
    options: {
      en: ['Investment always carries risk.', 'We have an excellent course.', 'You will have a Mentor guiding you; you won\'t be making isolated decisions.', 'Everyone loses sometimes.'],
      th: ['การลงทุนมีความเสี่ยงเสมอครับ', 'เรามีคอร์สเรียนที่ดีเยี่ยม', 'คุณจะมี Mentor คอยแนะนำครับ คุณจะไม่ต้องตัดสินใจเพียงลำพัง', 'ใครๆ ก็เคยขาดทุนครับ'],
    },
    correctIdx: 2,
  },
  {
    en: 'Client: "What do you get out of me?" Best trust-building response?',
    th: 'ลูกค้า: "คุณได้อะไรจากผม?" คำตอบที่สร้างความเชื่อมั่นได้ดีที่สุด?',
    type: 'mcq',
    options: {
      en: ['We sell packages.', 'We earn from the course fees.', 'We earn commissions from the broker only when you trade and remain active in the system.', 'It\'s company business.'],
      th: ['เราขายแพ็คเกจครับ', 'เราได้รายได้จากค่าคอร์สครับ', 'เราได้รับค่าคอมมิชชั่นจากโบรกเกอร์ก็ต่อเมื่อคุณเทรดและยังอยู่ในระบบครับ', 'เป็นเรื่องธุรกิจของบริษัทครับ'],
    },
    correctIdx: 2,
  },
  {
    en: 'Client: "I\'m still not sure if I should start." Soft close with strategic logic?',
    th: 'ลูกค้า: "ยังไม่แน่ใจว่าจะเริ่มดีไหม" การปิดการขายแบบนุ่มนวลด้วยตรรกะเชิงกลยุทธ์?',
    type: 'mcq',
    options: {
      en: ['Decide quickly.', 'Opportunities don\'t come often.', 'You aren\'t spending money; you are simply allocating capital to invest in yourself with a professional support team.', 'If you don\'t start, you won\'t see results.'],
      th: ['รีบตัดสินใจนะครับ', 'โอกาสไม่ได้มีบ่อยๆ', 'คุณไม่ได้กำลังเสียเงินครับ คุณเพียงแค่จัดสรรเงินทุนเพื่อลงทุนในตัวเองโดยมีทีมงานมืออาชีพคอยดูแล', 'ถ้าไม่เริ่ม ก็ไม่เห็นผลลัพธ์ครับ'],
    },
    correctIdx: 2,
  },
  {
    en: 'Summary: How would you succinctly describe the business model?',
    th: 'สรุป: คุณจะอธิบายโมเดลธุรกิจนี้สั้นๆ ว่าอย่างไร?',
    type: 'mcq',
    options: {
      en: ['It\'s an all-in-one trading course.', 'It\'s a package deal with an account.', 'You utilize your own capital to invest, while we provide systemized education and mentorship guidance.', 'Our system is superior.'],
      th: ['เป็นคอร์สเทรดแบบครบวงจร', 'เป็นแพ็คเกจพร้อมบัญชี', 'คุณใช้เงินทุนของตัวเองในการลงทุน ส่วนเรามอบความรู้ที่เป็นระบบและคำแนะนำจาก Mentor', 'ระบบของเราดีที่สุด'],
    },
    correctIdx: 2,
  },
];

// ─── Quiz 3: Process Mastery ──────────────────────────────────────────────────
const PROCESS_DATA: QuestionData[] = [
  {
    en: 'As a new user, what is the mandatory first step to correctly initiate usage of BrainTrade?',
    th: 'ในฐานะผู้ใช้งานใหม่ ขั้นตอนแรกที่จำเป็นเพื่อเริ่มใช้งาน BrainTrade อย่างถูกต้องคืออะไร?',
    type: 'mcq',
    options: {
      en: ['Select a broker', 'Transfer funds to trading account', 'Register an account on the BrainTrade website', 'Contact support to request an account'],
      th: ['เลือกโบรกเกอร์', 'โอนเงินเข้าบัญชีเทรด', 'ลงทะเบียนบัญชีบนเว็บไซต์ BrainTrade', 'ติดต่อฝ่ายสนับสนุนเพื่อขอเปิดบัญชี'],
    },
    correctIdx: 2,
  },
  {
    en: 'Upon registration, why does the system restrict immediate trading access?',
    th: 'เมื่อลงทะเบียนแล้ว ทำไมระบบจึงยังจำกัดไม่ให้เข้าเทรดได้ทันที?',
    type: 'mcq',
    options: {
      en: ['A course package has not been selected yet', 'KYC identity verification is pending', 'Trading strategy configuration is missing', 'Market hours are closed'],
      th: ['ยังไม่ได้เลือกแพ็คเกจคอร์ส', 'รอการยืนยันตัวตน (KYC)', 'ยังไม่ได้กำหนดกลยุทธ์การเทรด', 'ตลาดปิดทำการ'],
    },
    correctIdx: 0,
  },
  {
    en: 'BrainTrade packages range from $100 to $2,000. What is the primary differentiator between these tiers?',
    th: 'แพ็คเกจ BrainTrade มีราคาตั้งแต่ 100 ถึง 2,000 USD ความแตกต่างหลักระหว่างระดับเหล่านี้คืออะไร?',
    type: 'mcq',
    options: {
      en: ['Withdrawal processing speed', 'Access to functions, tools, and usage rights', 'Internet connection speed for trading', 'Company advertising allocation'],
      th: ['ความเร็วในการถอนเงิน', 'การเข้าถึงฟังก์ชัน เครื่องมือ และสิทธิ์การใช้งาน', 'ความเร็วอินเทอร์เน็ตสำหรับการเทรด', 'งบโฆษณาของบริษัท'],
    },
    correctIdx: 1,
  },
  {
    en: 'If you purchase a $500 package, how is this capital utilized within the system?',
    th: 'หากคุณซื้อแพ็คเกจ 500 USD เงินทุนส่วนนี้จะถูกนำไปใช้ในระบบอย่างไร?',
    type: 'mcq',
    options: {
      en: ['Strictly as a tuition fee', 'As a monthly subscription fee', 'As accessible capital in your personal trading account', 'As a non-refundable security deposit'],
      th: ['เป็นค่าเล่าเรียนทั้งหมด', 'เป็นค่าสมาชิกรายเดือน', 'เป็นเงินทุนที่ใช้ได้จริงในบัญชีเทรดส่วนตัวของคุณ', 'เป็นเงินประกันที่ไม่สามารถขอคืนได้'],
    },
    correctIdx: 2,
  },
  {
    en: 'What occurs if the payment process is not fully completed?',
    th: 'จะเกิดอะไรขึ้นหากขั้นตอนการชำระเงินยังไม่เสร็จสมบูรณ์?',
    type: 'mcq',
    options: {
      en: ['The system generates a trading account automatically', 'Limited trading access is granted', 'Progression to trade account setup is blocked', 'Funds are credited via credit later'],
      th: ['ระบบจะสร้างบัญชีเทรดโดยอัตโนมัติ', 'สามารถเทรดได้ในวงจำกัด', 'ไม่สามารถดำเนินการตั้งค่าบัญชีเทรดต่อได้', 'เงินจะถูกเครดิตให้ในภายหลัง'],
    },
    correctIdx: 2,
  },
  {
    en: 'Which interface is displayed immediately following a successful payment?',
    th: 'หน้าจอใดจะปรากฏขึ้นทันทีหลังจากชำระเงินสำเร็จ?',
    type: 'mcq',
    options: {
      en: ['Broker selection interface', 'Payment Confirmation screen with a \'Done\' button', 'Trading Dashboard', 'Error log screen'],
      th: ['หน้าเลือกโบรกเกอร์', 'หน้าจอยืนยันการชำระเงินพร้อมปุ่ม \'Done\'', 'แดชบอร์ดการเทรด', 'หน้าบันทึกข้อผิดพลาด'],
    },
    correctIdx: 1,
  },
  {
    en: 'What is the critical function of the \'Done\' button on the confirmation screen?',
    th: 'ฟังก์ชันสำคัญของปุ่ม \'Done\' บนหน้าจอยืนยันคืออะไร?',
    type: 'mcq',
    options: {
      en: ['To initiate a refund', 'To revert to package selection', 'To advance to the trade account setup phase', 'To download the transaction receipt'],
      th: ['เพื่อทำเรื่องขอคืนเงิน', 'เพื่อกลับไปเลือกแพ็คเกจ', 'เพื่อเข้าสู่ขั้นตอนการตั้งค่าบัญชีเทรด', 'เพื่อดาวน์โหลดใบเสร็จรับเงิน'],
    },
    correctIdx: 2,
  },
  {
    en: 'After selecting \'Done\', the system redirects to the Trade page. What is the immediate next action?',
    th: 'หลังจากกด \'Done\' ระบบจะเปลี่ยนไปหน้า Trade สิ่งที่ต้องทำทันทีคืออะไร?',
    type: 'mcq',
    options: {
      en: ['Execute market orders immediately', 'Select the preferred broker to integrate', 'Configure withdrawal methods', 'Inject additional capital'],
      th: ['ส่งคำสั่งซื้อขายทันที', 'เลือกโบรกเกอร์ที่ต้องการเชื่อมต่อ', 'ตั้งค่าวิธีการถอนเงิน', 'เพิ่มเงินทุน'],
    },
    correctIdx: 1,
  },
  {
    en: 'Why is selecting a broker mandatory before a trading account is opened?',
    th: 'ทำไมจึงจำเป็นต้องเลือกโบรกเกอร์ก่อนเปิดบัญชีเทรด?',
    type: 'mcq',
    options: {
      en: ['To configure technical chart preferences', 'To establish the link between the trading account and the specific broker', 'To compute tax liabilities', 'To set the system language interface'],
      th: ['เพื่อตั้งค่ากราฟเทคนิค', 'เพื่อเชื่อมโยงบัญชีเทรดกับโบรกเกอร์ที่เลือก', 'เพื่อคำนวณภาษี', 'เพื่อตั้งค่าภาษาของระบบ'],
    },
    correctIdx: 1,
  },
  {
    en: 'What user action is required prior to clicking the \'Open Account\' button?',
    th: 'ผู้ใช้ต้องทำอะไรก่อนคลิกปุ่ม \'Open Account\' (เปิดบัญชี)?',
    type: 'mcq',
    options: {
      en: ['Fund the account with additional deposits', 'Acknowledge and accept the Terms & Conditions', 'Contact the Support Team', 'Upload identification documents'],
      th: ['ฝากเงินเพิ่มเข้าบัญชี', 'ยอมรับข้อกำหนดและเงื่อนไข', 'ติดต่อทีมสนับสนุน', 'อัปโหลดเอกสารยืนยันตัวตน'],
    },
    correctIdx: 1,
  },
  {
    en: 'Upon successful account creation, what is the primary metric to verify?',
    th: 'เมื่อสร้างบัญชีสำเร็จแล้ว ข้อมูลหลักที่ควรตรวจสอบคืออะไร?',
    type: 'mcq',
    options: {
      en: ['Total allowable trade volume', 'Current trading account balance', 'Historical withdrawal logs', 'Educational course progress'],
      th: ['ปริมาณการซื้อขายทั้งหมดที่อนุญาต', 'ยอดเงินคงเหลือในบัญชีเทรดปัจจุบัน', 'ประวัติการถอนเงิน', 'ความคืบหน้าของคอร์สเรียน'],
    },
    correctIdx: 1,
  },
  {
    en: 'If a $1,000 package was purchased and the account opened, what should the balance reflect?',
    th: 'หากซื้อแพ็คเกจ 1,000 USD และเปิดบัญชีแล้ว ยอดเงินควรแสดงเป็นเท่าไหร่?',
    type: 'mcq',
    options: {
      en: ['$0 USD', '$100 USD', '$1,000 USD', 'Zero balance pending first trade'],
      th: ['0 USD', '100 USD', '1,000 USD', 'ยอดเป็นศูนย์จนกว่าจะเริ่มเทรด'],
    },
    correctIdx: 2,
  },
  {
    en: 'Under which specific condition is immediate trading authorized?',
    th: 'ภายใต้เงื่อนไขใดที่อนุญาตให้เริ่มเทรดได้ทันที?',
    type: 'mcq',
    options: {
      en: ['Registration is finalized', 'Package selection is complete', 'Payment is made but account creation is pending', 'Account is successfully opened with visible balance'],
      th: ['ลงทะเบียนเสร็จสมบูรณ์', 'เลือกแพ็คเกจเรียบร้อย', 'ชำระเงินแล้วแต่ยังไม่ได้สร้างบัญชี', 'เปิดบัญชีสำเร็จและมียอดเงินแสดง'],
    },
    correctIdx: 3,
  },
  {
    en: 'True/False: Clients are permitted to commence trading without selecting a broker.',
    th: 'จริง/เท็จ: ลูกค้าได้รับอนุญาตให้เริ่มเทรดได้โดยไม่ต้องเลือกโบรกเกอร์',
    type: 'tf', a: 'false',
  },
  {
    en: 'True/False: Funds paid for the package are fully allocated as usable trading capital in the client\'s account.',
    th: 'จริง/เท็จ: เงินที่ชำระค่าแพ็คเกจจะถูกจัดสรรเป็นเงินทุนสำหรับเทรดในบัญชีของลูกค้าเต็มจำนวน',
    type: 'tf', a: 'true',
  },
];

// ─── Module → Quiz mapping ───────────────────────────────────────────────────
export const MODULE_QUIZ_MAP: Record<string, QuizDefinition> = {
  product: {
    id: 'understanding',
    title: { en: 'System Understanding', th: 'ความเข้าใจระบบ' },
    description: { en: 'Verify your comprehensive knowledge of The Brain Trade ecosystem.', th: 'ตรวจสอบความรู้ความเข้าใจเกี่ยวกับระบบนิเวศ The Brain Trade ของคุณ' },
    questions: UNDERSTANDING_DATA,
  },
  process: {
    id: 'process-mastery',
    title: { en: 'Process Mastery', th: 'ความเชี่ยวชาญในกระบวนการ' },
    description: { en: 'Validate your expertise in the 1-Click Process, from registration to active trading.', th: 'ตรวจสอบความเชี่ยวชาญของคุณในกระบวนการ 1-Click ตั้งแต่การลงทะเบียนจนถึงการเทรดจริง' },
    questions: PROCESS_DATA,
    uiOverrides: {
      finishTitle: { en: 'Proficiency Verified', th: 'ยืนยันความเชี่ยวชาญแล้ว' },
      finishSub: { en: 'Process Adherence Score', th: 'คะแนนการปฏิบัติตามกระบวนการ' },
      feedbackHigh: { en: 'Flawless. You have achieved total mastery of the operational workflow.', th: 'ไร้ที่ติ คุณมีความเชี่ยวชาญในขั้นตอนการทำงานอย่างสมบูรณ์' },
      feedbackMid: { en: 'Satisfactory. You grasp the majority of the workflow steps.', th: 'น่าพอใจ คุณเข้าใจขั้นตอนการทำงานส่วนใหญ่' },
      feedbackLow: { en: 'Review Necessary. Please re-examine the Standard Operating Procedures.', th: 'จำเป็นต้องทบทวน กรุณาตรวจสอบขั้นตอนการปฏิบัติงานมาตรฐานอีกครั้ง' },
    },
  },
  payment: {
    id: 'sales',
    title: { en: 'Sales Logic & Strategy', th: 'ตรรกะและกลยุทธ์การขาย' },
    description: { en: 'Advanced scenario-based evaluation focusing on strategic objection handling.', th: 'การประเมินตามสถานการณ์ขั้นสูง เน้นการจัดการข้อโต้แย้งเชิงกลยุทธ์' },
    questions: SALES_DATA,
    uiOverrides: {
      scoreLabel: { en: 'Strategic Precision', th: 'ความแม่นยำเชิงกลยุทธ์' },
      finishTitle: { en: 'Strategic Assessment Complete', th: 'การประเมินเชิงกลยุทธ์เสร็จสมบูรณ์' },
      finishSub: { en: 'Logic Analysis Results', th: 'ผลการวิเคราะห์ตรรกะ' },
      feedbackHigh: { en: 'Exceptional. You possess perfect command of system logic and objection handling.', th: 'ยอดเยี่ยม คุณมีความเชี่ยวชาญในตรรกะของระบบและการจัดการข้อโต้แย้งอย่างสมบูรณ์แบบ' },
      feedbackMid: { en: "Competent. You understand the core concepts, but ensure to emphasize capital ownership.", th: 'มีความสามารถ คุณเข้าใจแนวคิดหลัก แต่ควรเน้นย้ำเรื่องความเป็นเจ้าของเงินทุนให้ชัดเจน' },
      feedbackLow: { en: "Development Required. Focus on mastering the 'Self-funding' concept and revenue transparency.", th: "ต้องปรับปรุง มุ่งเน้นไปที่การทำความเข้าใจแนวคิด 'Self-funding' และความโปร่งใสของรายได้" },
    },
  },
};

export const PASS_THRESHOLD = 0.7; // 70%
