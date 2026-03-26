import { NextResponse } from 'next/server';
import { fsGet } from '@/lib/firestore-db';

export async function GET() {
  try {
    const features = await fsGet<any>('module_config', 'features') || { allowMockupMode: true };
    return NextResponse.json({ features });
  } catch (err) {
    return NextResponse.json({ features: { allowMockupMode: true } });
  }
}
