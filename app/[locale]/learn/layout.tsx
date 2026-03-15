import NavBar from '@/components/ui/NavBar';

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      <main>{children}</main>
    </>
  );
}
