import NavBar from '@/components/ui/NavBar';
import AgentAuthGuard from '@/components/features/AgentAuthGuard';

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-dvh overflow-hidden">
      <NavBar />
      <main className="flex-1 min-h-0">
        <AgentAuthGuard>{children}</AgentAuthGuard>
      </main>
    </div>
  );
}
