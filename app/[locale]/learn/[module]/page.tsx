import { redirect } from 'next/navigation';
import PresentationViewer from '@/components/features/PresentationViewer';
import { COURSE_MODULES, type CourseLang } from '@/lib/courses';

export default async function LearnPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; module: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { locale, module } = await params;
  const { lang } = await searchParams;

  const course = COURSE_MODULES[module];
  if (!course) redirect('/dashboard');

  const initialLang: CourseLang = lang === 'en' ? 'en' : 'th';

  return <PresentationViewer module={course} locale={locale} initialLang={initialLang} />;
}
