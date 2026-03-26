import { getAdminDb } from './firebase-admin';
import { COURSE_MODULES, type CourseModule } from './courses';

export async function getCourseModules(): Promise<Record<string, CourseModule>> {
  try {
    const db = getAdminDb();
    const doc = await db.collection('module_config').doc('learn').get();
    
    // Always start with the hardcoded baseline
    let result: Record<string, CourseModule> = { ...COURSE_MODULES };

    if (doc.exists) {
      const data = doc.data();
      const modules = data?.modules as Record<string, CourseModule>;
      const order = data?.order as string[];

      if (modules) {
        // Merge Firestore modules on top of baseline
        Object.keys(modules).forEach(id => {
          result[id] = modules[id];
        });

        if (order && Array.isArray(order)) {
          const ordered: Record<string, CourseModule> = {};
          // First add modules in the specified order
          order.forEach(id => {
            if (result[id]) ordered[id] = result[id];
          });
          // Then add any modules that might be missing from the order array
          Object.keys(result).forEach(id => {
            if (!ordered[id]) ordered[id] = result[id];
          });
          return ordered;
        }
        return result;
      }
    }
    return result;
  } catch (err) {
    console.error('Failed to get course modules from DB, falling back to local config:', err);
    return COURSE_MODULES;
  }
}

export async function getCourseModule(id: string): Promise<CourseModule | undefined> {
  const modules = await getCourseModules();
  // Double check hardcoded baseline just in case
  return modules[id] || COURSE_MODULES[id];
}
