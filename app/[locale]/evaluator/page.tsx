import { getServerUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import EvaluatorDashboard from '@/components/features/EvaluatorDashboard';

export default async function EvaluatorPage() {
  const user = await getServerUser();
  if (!user || user.role !== 'evaluator') redirect('/login');

  return (
    <EvaluatorDashboard
      evaluatorId={user.uid}
      evaluatorName={user.name}
    />
  );
}
