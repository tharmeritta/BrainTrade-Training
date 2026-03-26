import { requireAdminManagerOrTrainer } from '@/lib/session';
import { redirect } from 'next/navigation';
import { fsGet } from '@/lib/firestore-db';
import type { StaffAccount } from '@/types';
import AdminDashboard from '@/components/features/AdminDashboard';

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  try {
    const user = await requireAdminManagerOrTrainer();
    
    let interactiveAccessUntil: string | undefined;
    if (user.role === 'it') {
      const staff = await fsGet<StaffAccount>('staff_accounts', user.uid);
      interactiveAccessUntil = staff?.interactiveAccessUntil;
    }

    return (
      <AdminDashboard
        role={user.role as 'admin' | 'manager' | 'it' | 'trainer'}
        uid={user.uid}
        name={user.name}
        passwordChanged={user.passwordChanged}
        interactiveAccessUntil={interactiveAccessUntil}
      />
    );
  } catch {
    redirect(`/${locale}/login`);
  }
}
