import { redirect } from 'next/navigation';
import PresentationViewer from '@/components/features/PresentationViewer';
import { getCourseModule } from '@/lib/courses-server';
import type { CourseLang } from '@/lib/courses';
import { getServerUser } from '@/lib/session';

export default async function LearnPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; module: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { locale, module } = await params;
  const { lang } = await searchParams;

  const course = await getCourseModule(module);
  if (!course) redirect('/dashboard');

  const user = await getServerUser();
  const initialLang: CourseLang = lang === 'en' ? 'en' : 'th';

  return (
    <PresentationViewer
      module={course}
      locale={locale}
      initialLang={initialLang}
      user={user}
    />
  );
}
