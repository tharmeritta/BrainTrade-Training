import { cookies } from 'next/headers';

export async function getServerUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token || token !== process.env.SESSION_SECRET) return null;
  return { uid: 'admin', role: 'admin' };
}

export async function requireAuth() {
  const user = await getServerUser();
  if (!user) throw new Error('Unauthorized');
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== 'admin') throw new Error('Forbidden');
  return user;
}
