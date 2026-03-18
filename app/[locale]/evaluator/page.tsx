import { getServerUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import EvaluatorDashboard from '@/components/features/EvaluatorDashboard';

export default async function EvaluatorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getServerUser();
  if (!user || user.role !== 'evaluator') redirect(`/${locale}/login`);

  return (
    <EvaluatorDashboard
      evaluatorId={user.uid}
      evaluatorName={user.name}
    />
  );
}
