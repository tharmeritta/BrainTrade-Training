import { getAdminDb } from './firebase-admin';
import { COURSE_MODULES, type CourseModule } from './courses';

export async function getCourseModules(): Promise<Record<string, CourseModule>> {
  try {
    const db = getAdminDb();
    const doc = await db.collection('module_config').doc('learn').get();
    if (doc.exists) {
      const data = doc.data();
      const modules = data?.modules as Record<string, CourseModule>;
      const order = data?.order as string[];

      if (modules && order && Array.isArray(order)) {
        const ordered: Record<string, CourseModule> = {};
        // First add modules in the specified order
        order.forEach(id => {
          if (modules[id]) ordered[id] = modules[id];
        });
        // Then add any modules that might be missing from the order array
        Object.keys(modules).forEach(id => {
          if (!ordered[id]) ordered[id] = modules[id];
        });
        return ordered;
      }
      
      if (modules) return modules;
    }
  } catch (err) {
    console.error('Failed to get course modules from DB:', err);
  }
  return COURSE_MODULES; // fallback to hardcoded
}

export async function getCourseModule(id: string): Promise<CourseModule | undefined> {
  const modules = await getCourseModules();
  return modules[id];
}
