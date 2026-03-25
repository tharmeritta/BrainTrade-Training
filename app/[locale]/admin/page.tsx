import { requireAdminManagerOrTrainer } from '@/lib/session';
import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/features/AdminDashboard';

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  try {
    const user = await requireAdminManagerOrTrainer();
    return (
      <AdminDashboard
        role={user.role as 'admin' | 'manager' | 'it' | 'trainer'}
        uid={user.uid}
        name={user.name}
        passwordChanged={user.passwordChanged}
      />
    );
  } catch {
    redirect(`/${locale}/login`);
  }
}
