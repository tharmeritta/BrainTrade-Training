import { getServerUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import Dashboard from '@/components/features/Dashboard';

export default async function DashboardPage() {
  const user = await getServerUser();
  if (!user) redirect('/login');

  return <Dashboard />;
}
