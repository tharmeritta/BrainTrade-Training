/** 
 * Client-side session utilities.
 * This file MUST NOT import 'next/headers' or any other server-only modules.
 */

export function hasStaffSession(): boolean {
  if (typeof document === 'undefined') return false;
  const cookie = document.cookie.split('; ').find(row => row.startsWith('session='));
  if (!cookie) return false;
  
  // Basic validation that it contains staff role (admin, manager, it, evaluator, trainer, hr)
  const val = decodeURIComponent(cookie.split('=')[1]);
  const staffRoles = ['admin', 'manager', 'it', 'evaluator', 'trainer', 'hr'];
  return staffRoles.some(r => val.includes(`|${r}|`) || val.includes(`|${r}`));
}
