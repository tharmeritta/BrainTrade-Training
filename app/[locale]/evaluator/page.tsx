import { getServerUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import EvaluatorDashboard from '@/components/features/EvaluatorDashboard';
import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

async function EvaluatorPageContent({ locale }: { locale: string }) {
  const user = await getServerUser();
  if (!user || user.role !== 'evaluator') redirect(`/${locale}/login`);

  return (
    <EvaluatorDashboard
      evaluatorId={user.uid}
      evaluatorName={user.name}
      passwordChanged={user.passwordChanged}
    />
  );
}

export default async function EvaluatorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    }>
      <EvaluatorPageContent locale={locale} />
    </Suspense>
  );
}
