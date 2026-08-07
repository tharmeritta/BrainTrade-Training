import { redirect } from 'next/navigation';
import PresentationViewer from '@/components/features/presentation/PresentationViewer';
import { getCourseModule } from '@/lib/server/courses';
import type { CourseLang } from '@/lib/courses';
import { getServerUser } from '@/lib/session/server';
import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

async function LearnPageContent({ 
  locale, 
  moduleSlug, 
  lang 
}: { 
  locale: string; 
  moduleSlug: string; 
  lang?: string 
}) {
  const course = await getCourseModule(moduleSlug);
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

export default async function LearnPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; module: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { locale, module: moduleSlug } = await params;
  setRequestLocale(locale);
  const { lang } = await searchParams;

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    }>
      <LearnPageContent locale={locale} moduleSlug={moduleSlug} lang={lang} />
    </Suspense>
  );
}
