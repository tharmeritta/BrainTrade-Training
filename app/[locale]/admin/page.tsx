import { requireAdminOrManager } from '@/lib/session';
import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/features/AdminDashboard';

export default async function AdminPage() {
  try {
    const user = await requireAdminOrManager();
    return <AdminDashboard role={user.role as 'admin' | 'manager'} />;
  } catch {
    redirect('/login');
  }
}
