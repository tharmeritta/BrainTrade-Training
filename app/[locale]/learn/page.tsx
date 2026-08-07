import CourseHub from '@/components/features/courses/CourseHub';
import { getCourseModules } from '@/lib/server/courses';

export default async function LearnIndexPage() {
  const modules = await getCourseModules();
  return <CourseHub initialModules={Object.values(modules)} />;
}
