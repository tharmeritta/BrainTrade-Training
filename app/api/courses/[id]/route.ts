import { NextRequest, NextResponse } from 'next/server';
import { getCourseModule } from '@/lib/courses-server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const courseModule = await getCourseModule(id);
    
    if (!courseModule) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    return NextResponse.json(courseModule);
  } catch (error: any) {
    console.error('[API Course] GET error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
