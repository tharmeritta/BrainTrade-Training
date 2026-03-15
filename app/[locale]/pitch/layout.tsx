import NavBar from '@/components/ui/NavBar';

export default function PitchLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      <main>{children}</main>
    </>
  );
}
