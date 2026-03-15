import NavBar from '@/components/ui/NavBar';

export default function AiEvalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      <main>{children}</main>
    </>
  );
}
