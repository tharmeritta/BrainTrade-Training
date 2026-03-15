import NavBar from '@/components/ui/NavBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      <main>{children}</main>
    </>
  );
}
