import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/session';
import { getAdminAuth } from '@/lib/firebase-admin';

export async function GET() {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const firebaseToken = await getAdminAuth().createCustomToken(user.uid, { role: user.role });
    return NextResponse.json({ firebaseToken });
  } catch (err: any) {
    console.error('Failed to create custom token:', err);
    return NextResponse.json({ error: 'Token generation failed' }, { status: 500 });
  }
}
