import { requireAdminManagerOrTrainer } from '@/lib/session/server';
import { redirect } from 'next/navigation';
import { fsGet } from '@/lib/server/db';
import type { StaffAccount } from '@/types';
import AdminDashboard from '@/components/features/AdminDashboard';
import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

async function AdminPageContent({ locale }: { locale: string }) {
  // 1. Authorization & Data Fetching (Logic Phase)
  let user;
  try {
    user = await requireAdminManagerOrTrainer();
  } catch {
    redirect(`/${locale}/login`);
  }
  
  let interactiveAccessUntil: string | undefined;
  if (user.role === 'it') {
    const staff = await fsGet<StaffAccount>('staff_accounts', user.uid);
    interactiveAccessUntil = staff?.interactiveAccessUntil;
  }

  // 2. Rendering (UI Phase) - Keep this outside of try/catch
  return (
    <AdminDashboard
      role={user.role as 'admin' | 'manager' | 'it' | 'trainer' | 'hr'}
      uid={user.uid}
      name={user.name}
      passwordChanged={user.passwordChanged}
      interactiveAccessUntil={interactiveAccessUntil}
    />
  );
}

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    }>
      <AdminPageContent locale={locale} />
    </Suspense>
  );
}
