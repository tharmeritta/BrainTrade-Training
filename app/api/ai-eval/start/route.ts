// This route is deprecated and no longer in use.
// Session lifecycle is handled by POST /api/ai-eval.
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ error: 'Deprecated. Use POST /api/ai-eval instead.' }, { status: 410 });
}
