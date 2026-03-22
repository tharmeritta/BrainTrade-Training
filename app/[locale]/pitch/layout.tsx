import NavBar from '@/components/ui/NavBar';
import AgentAuthGuard from '@/components/features/AgentAuthGuard';
import { getServerUser } from '@/lib/session';

export default async function PitchLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();
  const isStaff = user && ['admin', 'manager', 'trainer'].includes(user.role);

  return (
    <>
      <NavBar />
      <main>
        <AgentAuthGuard allowStaff={!!isStaff}>{children}</AgentAuthGuard>
      </main>
    </>
  );
}
