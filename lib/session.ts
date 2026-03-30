import { cookies } from 'next/headers';
import type { UserRole, StaffAccount } from '@/types';
import { fsGet } from '@/lib/firestore-db';

// Session cookie format: `${SECRET}|${role}|${uid}|${encodeURIComponent(name)}`
// Legacy format (admin only): just `${SECRET}`

const DEFAULT_SECRET = 'fallback-secret-for-dev-only';

export async function getServerUser(): Promise<{ uid: string; name: string; role: UserRole; passwordChanged: boolean; interactiveAccessUntil?: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;

  const secret = process.env.SESSION_SECRET || DEFAULT_SECRET;
  if (!secret) return null;

  let role: UserRole | undefined;
  let uid: string | undefined;
  let name: string | undefined;
  let passwordChanged: boolean = false;

  // Format: secret|role|uid|passwordChanged|encodedName
  if (token.startsWith(secret + '|')) {
    const rest  = token.slice(secret.length + 1);
    const parts = rest.split('|');
    if (parts.length >= 4) {
      const [r, u, pwChanged, ...nameParts] = parts;
      role = r as UserRole;
      uid = u;
      passwordChanged = pwChanged === '1';
      name = decodeURIComponent(nameParts.join('|'));
    } else if (parts.length === 3) {
      const [r, u, nameEncoded] = parts;
      role = r as UserRole;
      uid = u;
      name = decodeURIComponent(nameEncoded);
    }
  }

  if (role && uid && name && ['admin', 'manager', 'it', 'evaluator', 'agent', 'trainer', 'hr'].includes(role)) {
    let interactiveAccessUntil: string | undefined;
    if (role === 'it' || role === 'manager' || role === 'hr') {
      const staff = await fsGet<StaffAccount>('staff_accounts', uid);
      interactiveAccessUntil = staff?.interactiveAccessUntil;
    }
    return { uid, name, role, passwordChanged, interactiveAccessUntil };
  }

  return null;
}

export function makeSessionToken(role: UserRole, uid: string, name: string, passwordChanged: boolean = false): string {
  const secret = process.env.SESSION_SECRET || DEFAULT_SECRET;
  return `${secret}|${role}|${uid}|${passwordChanged ? '1' : '0'}|${encodeURIComponent(name)}`;
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

export async function requireHR() {
  const user = await requireAuth();
  if (user.role !== 'admin' && user.role !== 'hr') throw new Error('Forbidden');
  return user;
}

export async function requireAdminOrIT() {
  const user = await requireAuth();
  if (user.role !== 'admin' && user.role !== 'it') throw new Error('Forbidden');
  return user;
}

export async function requireAdminOrManager() {
  const user = await requireAuth();
  if (user.role !== 'admin' && user.role !== 'manager' && user.role !== 'it' && user.role !== 'hr') throw new Error('Forbidden');
  return user;
}

export async function requireEvaluator() {
  const user = await requireAuth();
  if (user.role !== 'evaluator') throw new Error('Forbidden');
  return user;
}

export async function requireAdminManagerOrTrainer() {
  const user = await requireAuth();
  if (!['admin', 'manager', 'it', 'trainer', 'hr'].includes(user.role)) throw new Error('Forbidden');
  return user;
}

export async function requireTrainer() {
  const user = await requireAuth();
  if (!['admin', 'trainer'].includes(user.role)) throw new Error('Forbidden');
  return user;
}
