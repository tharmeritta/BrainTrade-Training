import { getServerUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import AiEvaluation from '@/components/features/AiEvaluation';

export default async function AiEvalPage() {
  const user = await getServerUser();
  if (!user) redirect('/login');

  return <AiEvaluation userId={user.uid} />;
}
