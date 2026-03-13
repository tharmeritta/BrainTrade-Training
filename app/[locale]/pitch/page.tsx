import { getServerUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import PitchSimulator from '@/components/features/PitchSimulator';

export default async function PitchPage() {
  const user = await getServerUser();
  if (!user) redirect('/login');

  return <PitchSimulator userId={user.uid} />;
}
