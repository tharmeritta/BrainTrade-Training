import NavBar from '@/components/ui/NavBar';
import AgentAuthGuard from '@/components/features/AgentAuthGuard';

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      <main>
        <AgentAuthGuard>{children}</AgentAuthGuard>
      </main>
    </>
  );
}
