import { requireAdmin } from '@/lib/session';
import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/features/AdminDashboard';

export default async function AdminPage() {
  try {
    const user = await requireAdmin();
    return <AdminDashboard adminUid={user.uid} />;
  } catch {
    redirect('/dashboard');
  }
}
