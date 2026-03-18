import { cookies } from 'next/headers';
import type { UserRole } from '@/types';

// Session cookie format: `${SECRET}|${role}|${uid}|${encodeURIComponent(name)}`
// Legacy format (admin only): just `${SECRET}`

export async function getServerUser(): Promise<{ uid: string; name: string; role: UserRole } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;

  const secret = process.env.SESSION_SECRET!;

  // Format: secret|role|uid|encodedName
  if (token.startsWith(secret + '|')) {
    const rest  = token.slice(secret.length + 1);
    const parts = rest.split('|');
    if (parts.length >= 3) {
      const [role, uid, ...nameParts] = parts;
      const name = decodeURIComponent(nameParts.join('|'));
      if (['admin', 'manager', 'evaluator', 'agent', 'trainer'].includes(role)) {
        return { uid, name, role: role as UserRole };
      }
    }
  }

  return null;
}

export function makeSessionToken(role: UserRole, uid: string, name: string): string {
  const secret = process.env.SESSION_SECRET!;
  return `${secret}|${role}|${uid}|${encodeURIComponent(name)}`;
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

export async function requireAdminOrManager() {
  const user = await requireAuth();
  if (user.role !== 'admin' && user.role !== 'manager') throw new Error('Forbidden');
  return user;
}

export async function requireEvaluator() {
  const user = await requireAuth();
  if (user.role !== 'evaluator') throw new Error('Forbidden');
  return user;
}

export async function requireAdminManagerOrTrainer() {
  const user = await requireAuth();
  if (!['admin', 'manager', 'trainer'].includes(user.role)) throw new Error('Forbidden');
  return user;
}

export async function requireTrainer() {
  const user = await requireAuth();
  if (!['admin', 'manager', 'trainer'].includes(user.role)) throw new Error('Forbidden');
  return user;
}
