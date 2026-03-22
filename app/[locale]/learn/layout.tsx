import NavBar from '@/components/ui/NavBar';
import AgentAuthGuard from '@/components/features/AgentAuthGuard';
import { getServerUser } from '@/lib/session';

export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();
  const isStaff = user && ['admin', 'manager', 'trainer'].includes(user.role);

  return (
    <div className="flex flex-col min-h-dvh overflow-hidden">
      <NavBar />
      <main className="flex-1 min-h-0">
        <AgentAuthGuard allowStaff={!!isStaff}>{children}</AgentAuthGuard>
      </main>
    </div>
  );
}
