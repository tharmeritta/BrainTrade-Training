export type CourseLang = 'th' | 'en';

export interface CoursePresentation {
  presentationId: string;
  totalSlides: number;
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
  // Add future modules here — they will appear automatically as cards on the hub
};
