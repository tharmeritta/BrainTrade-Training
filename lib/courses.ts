export type CourseLang = 'th' | 'en';

export interface CoursePresentation {
  presentationId: string;
  totalSlides: number;
  cacheKey?: string;
  /** Firebase Storage URLs for each slide (1-indexed, index 0 = slide 1). When present, used instead of /api/slide. */
  slideUrls?: string[];
}

export interface CourseModule {
  id: string;
  title: string;
  titleTh: string;
  description: string;
  descriptionTh: string;
  /** Tailwind gradient classes for the card header */
  gradient: string;
  presentations: Record<CourseLang, CoursePresentation>;
}

export const COURSE_MODULES: Record<string, CourseModule> = {
  product: {
    id: 'product',
    title: 'What is Stock?',
    titleTh: 'หุ้นคืออะไร?',
    description: 'Learn the fundamentals of stocks, equity, and how the stock market works.',
    descriptionTh: 'เรียนรู้พื้นฐานของหุ้น ส่วนของผู้ถือหุ้น และวิธีการทำงานของตลาดหลักทรัพย์',
    gradient: 'from-blue-600 to-indigo-700',
    presentations: {
      th: { presentationId: '1SNZxAJAZets0wMIGsLSoaVDtV2tTP21i', totalSlides: 16 },
      en: { presentationId: '1U0Vbd0NgJIfKfiTl17Q4c67ytl1GMtY-', totalSlides: 16 },
    },
  },
  kyc: {
    id: 'kyc',
    title: 'Know Your Customer (KYC)',
    titleTh: 'รู้จักลูกค้า (KYC)',
    description: 'Learn the KYC process, customer verification, and compliance requirements for financial services.',
    descriptionTh: 'เรียนรู้กระบวนการ KYC การตรวจสอบตัวตนลูกค้า และข้อกำหนดด้านการปฏิบัติตามกฎระเบียบสำหรับบริการทางการเงิน',
    gradient: 'from-emerald-600 to-teal-700',
    presentations: {
      th: { presentationId: '1DMs0-BZ1dI0KE6HYncMzeNjDUavdPOtA', totalSlides: 11 },
      en: { presentationId: '1SeHjETc4hrYlo4QAQREk5yzjOMznfdxm', totalSlides: 11 },
    },
  },
  website: {
    id: 'website',
    title: 'BrainTrade Website',
    titleTh: 'เว็บไซต์ BrainTrade',
    description: 'A walkthrough of the BrainTrade platform, its features, and how to navigate and use the website effectively.',
    descriptionTh: 'แนะนำแพลตฟอร์ม BrainTrade ฟีเจอร์ต่างๆ และวิธีการใช้งานเว็บไซต์อย่างมีประสิทธิภาพ',
    gradient: 'from-violet-600 to-purple-700',
    presentations: {
      th: { presentationId: '1DZvsOEv_0G4ZLm1hC6JQlxm2EpaLHqk6', totalSlides: 16 },
      en: { presentationId: '1FW-wC8qqlvHyTo8mhliCqoOC0kL7mYXK', totalSlides: 16 },
    },
  },
};
