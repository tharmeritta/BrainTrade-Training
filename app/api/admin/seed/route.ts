/**
 * ONE-TIME seed endpoint — creates the initial admin account in Firestore.
 *
 * POST /api/admin/seed
 * Body: { bootstrapSecret, username, password, name }
 *
 * Guarded by BOOTSTRAP_SECRET env var. Safe to call multiple times — it
 * refuses to create a duplicate admin username.
 *
 * Once you have at least one admin in Firestore you can safely remove
 * ADMIN_USERNAME, ADMIN_PASSWORD, and BOOTSTRAP_SECRET from Cloud Run.
 */
import { NextRequest, NextResponse } from 'next/server';
import { fsGetAll, fsAdd } from '@/lib/firestore-db';
import type { StaffAccount } from '@/types';

export async function POST(req: NextRequest) {
  const bootstrapSecret = process.env.BOOTSTRAP_SECRET;
  if (!bootstrapSecret) {
    return NextResponse.json({ error: 'Seed endpoint disabled' }, { status: 403 });
  }

  const { bootstrapSecret: provided, username, password, name } = await req.json();

  if (provided !== bootstrapSecret) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!username?.trim() || !password?.trim() || !name?.trim()) {
    return NextResponse.json(
      { error: 'username, password, and name are required' },
      { status: 400 },
    );
  }

  const existing = await fsGetAll<StaffAccount>('staff_accounts');
  if (existing.some(s => s.username === username.trim())) {
    return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
  }

  const account = await fsAdd('staff_accounts', {
    username: username.trim(),
    password: password.trim(),
    name: name.trim(),
    role: 'admin' as const,
    active: true,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, id: account.id }, { status: 201 });
}
