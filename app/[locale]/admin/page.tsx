import { requireAdmin } from '@/lib/session';
import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/features/AdminDashboard';

export default async function AdminPage() {
  try {
    await requireAdmin();
    return <AdminDashboard />;
  } catch {
    redirect('/login');
  }
}
