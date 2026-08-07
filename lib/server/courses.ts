import { getAdminDb } from './firebase-admin';
import { COURSE_MODULES, type CourseModule } from '@/lib/courses';

export async function getCourseModules(): Promise<Record<string, CourseModule>> {
  try {
    const db = getAdminDb();
    const doc = await db.collection('module_config').doc('learn').get();
    const baseline = { ...COURSE_MODULES };

    if (doc.exists) {
      const data = doc.data();
      const firestoreModules = data?.modules as Record<string, CourseModule>;
      const order = data?.order as string[];

      if (firestoreModules && Object.keys(firestoreModules).length > 0) {
        const result: Record<string, CourseModule> = {};
        const idsToInclude = order && Array.isArray(order) && order.length > 0 
          ? order 
          : Object.keys(firestoreModules);

        idsToInclude.forEach(id => {
          if (firestoreModules[id]) {
            result[id] = {
              ...(baseline[id] || {}),
              ...firestoreModules[id]
            };
          }
        });

        return result;
      }
    }
    
    return baseline;
  } catch (err) {
    console.error('Failed to get course modules from DB, falling back to local config:', err);
    return COURSE_MODULES;
  }
}

export async function getCourseModule(id: string): Promise<CourseModule | undefined> {
  const modules = await getCourseModules();
  return modules[id];
}
