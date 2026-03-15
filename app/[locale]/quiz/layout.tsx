import NavBar from '@/components/ui/NavBar';

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      <main>{children}</main>
    </>
  );
}
