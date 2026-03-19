import CourseHub from '@/components/features/CourseHub';
import { getCourseModules } from '@/lib/courses';

export default async function LearnIndexPage() {
  const modules = await getCourseModules();
  return <CourseHub initialModules={Object.values(modules)} />;
}
