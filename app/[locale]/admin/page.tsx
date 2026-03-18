import { requireAdminManagerOrTrainer } from '@/lib/session';
import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/features/AdminDashboard';

export default async function AdminPage() {
  try {
    const user = await requireAdminManagerOrTrainer();
    return <AdminDashboard role={user.role as 'admin' | 'manager' | 'trainer'} />;
  } catch {
    redirect('/login');
  }
}
