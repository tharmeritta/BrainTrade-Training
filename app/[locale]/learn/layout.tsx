import NavBar from '@/components/ui/NavBar';

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-dvh overflow-hidden">
      <NavBar />
      <main className="flex-1 min-h-0">{children}</main>
    </div>
  );
}
