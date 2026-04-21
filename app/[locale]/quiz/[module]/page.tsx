import QuizSystem from '@/components/features/QuizSystem';
import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

async function QuizPageContent({ moduleId }: { moduleId: string }) {
  return <QuizSystem moduleId={moduleId} />;
}

export default async function QuizPage({ params }: { params: Promise<{ locale: string; module: string }> }) {
  const { locale, module: moduleId } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    }>
      <QuizPageContent moduleId={moduleId} />
    </Suspense>
  );
}
