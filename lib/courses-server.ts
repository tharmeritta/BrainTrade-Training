import { getAdminDb } from './firebase-admin';
import { COURSE_MODULES, type CourseModule } from './courses';

export async function getCourseModules(): Promise<Record<string, CourseModule>> {
  try {
    const db = getAdminDb();
    const doc = await db.collection('module_config').doc('learn').get();
    
    // Default baseline from code
    const baseline = { ...COURSE_MODULES };

    if (doc.exists) {
      const data = doc.data();
      const firestoreModules = data?.modules as Record<string, CourseModule>;
      const order = data?.order as string[];

      // If the admin has saved modules in Firestore, that set becomes the source of truth.
      // We merge baseline data INTO it so that any new hardcoded fields (like new presentationIds)
      // are available, but only for the modules the admin wants to keep.
      if (firestoreModules && Object.keys(firestoreModules).length > 0) {
        const merged: Record<string, CourseModule> = {};
        
        // Use order if it exists, otherwise use the keys of firestoreModules
        const idsToInclude = order && Array.isArray(order) && order.length > 0 
          ? order 
          : Object.keys(firestoreModules);

        idsToInclude.forEach(id => {
          if (firestoreModules[id]) {
            // Merge: baseline provides defaults, Firestore provides overrides
            merged[id] = {
              ...(baseline[id] || {}),
              ...firestoreModules[id]
            };
          } else if (baseline[id]) {
            // If it's in the order but not in Firestore modules (edge case),
            // we can still include the baseline version.
            merged[id] = baseline[id];
          }
        });

        return merged;
      }
    }
    
    // If no Firestore data exists at all, use the baseline
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
