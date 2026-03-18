import NavBar from '@/components/ui/NavBar';
import AgentAuthGuard from '@/components/features/AgentAuthGuard';

export default function PitchLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      <main>
        <AgentAuthGuard>{children}</AgentAuthGuard>
      </main>
    </>
  );
}
