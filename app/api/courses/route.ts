import { NextResponse } from 'next/server';
import { getCourseModules } from '@/lib/courses-server';

export async function GET() {
  try {
    const modules = await getCourseModules();
    // Convert Record<string, CourseModule> to an array
    const moduleList = Object.values(modules);
    return NextResponse.json({ modules: moduleList });
  } catch (error: any) {
    console.error('[API Courses] GET error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
