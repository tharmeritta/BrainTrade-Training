import { getServerUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import QuizSystem from '@/components/features/QuizSystem';

export default async function QuizPage({ params }: { params: Promise<{ module: string }> }) {
  const user = await getServerUser();
  if (!user) redirect('/login');

  const { module } = await params;
  return <QuizSystem moduleId={module} />;
}
