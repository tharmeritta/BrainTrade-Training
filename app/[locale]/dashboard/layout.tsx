import NavBar from '@/components/ui/NavBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col" style={{ height: '100dvh' }}>
      <NavBar />
      <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
    </div>
  );
}
