import { cookies } from 'next/headers';
import type { UserRole } from '@/types';

// Session cookie format: `${SECRET}|${role}|${uid}|${encodeURIComponent(name)}`
// Legacy format (admin only): just `${SECRET}`

const DEFAULT_SECRET = 'fallback-secret-for-dev-only';

export async function getServerUser(): Promise<{ uid: string; name: string; role: UserRole; passwordChanged: boolean } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;

  const secret = process.env.SESSION_SECRET || DEFAULT_SECRET;
  if (!secret) return null;

  // Format: secret|role|uid|passwordChanged|encodedName
  if (token.startsWith(secret + '|')) {
    const rest  = token.slice(secret.length + 1);
    const parts = rest.split('|');
    if (parts.length >= 4) {
      const [role, uid, pwChanged, ...nameParts] = parts;
      const name = decodeURIComponent(nameParts.join('|'));
      if (['admin', 'manager', 'it', 'evaluator', 'agent', 'trainer'].includes(role)) {
        return { uid, name, role: role as UserRole, passwordChanged: pwChanged === '1' };
      }
    }
    // Backward compatibility for tokens without pwChanged
    if (parts.length === 3) {
      const [role, uid, nameEncoded] = parts;
      const name = decodeURIComponent(nameEncoded);
      return { uid, name, role: role as UserRole, passwordChanged: false };
    }
  }

  return null;
}

export function makeSessionToken(role: UserRole, uid: string, name: string, passwordChanged: boolean = false): string {
  const secret = process.env.SESSION_SECRET || DEFAULT_SECRET;
  return `${secret}|${role}|${uid}|${passwordChanged ? '1' : '0'}|${encodeURIComponent(name)}`;
}

/** Client-side check for staff session presence */
export function hasStaffSession(): boolean {
  if (typeof document === 'undefined') return false;
  const cookie = document.cookie.split('; ').find(row => row.startsWith('session='));
  if (!cookie) return false;
  
  // Basic validation that it contains staff role (admin, manager, it, evaluator, trainer)
  const val = decodeURIComponent(cookie.split('=')[1]);
  return ['admin|', 'manager|', 'it|', 'evaluator|', 'trainer|'].some(r => val.includes(`|${r}`));
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

export async function requireAdminOrIT() {
  const user = await requireAuth();
  if (user.role !== 'admin' && user.role !== 'it') throw new Error('Forbidden');
  return user;
}

export async function requireAdminOrManager() {
  const user = await requireAuth();
  if (user.role !== 'admin' && user.role !== 'manager' && user.role !== 'it') throw new Error('Forbidden');
  return user;
}

export async function requireEvaluator() {
  const user = await requireAuth();
  if (user.role !== 'evaluator') throw new Error('Forbidden');
  return user;
}

export async function requireAdminManagerOrTrainer() {
  const user = await requireAuth();
  if (!['admin', 'manager', 'it', 'trainer'].includes(user.role)) throw new Error('Forbidden');
  return user;
}

export async function requireTrainer() {
  const user = await requireAuth();
  if (!['admin', 'manager', 'it', 'trainer'].includes(user.role)) throw new Error('Forbidden');
  return user;
}
